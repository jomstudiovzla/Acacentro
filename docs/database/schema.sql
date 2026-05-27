-- ============================================================
--  ACACENTRO Creative Academy — Esquema de Base de Datos
--  Motor: PostgreSQL 16
--  Archivo: docs/database/schema.sql
--  Versión: 1.0.0
--  Fecha: 2026-05-26
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- Genera UUIDs v4
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Para bcrypt desde SQL (opcional)

-- ============================================================
-- TIPOS ENUM
-- ============================================================

-- Roles del sistema de usuarios
CREATE TYPE user_role AS ENUM (
    'student',    -- Estudiante inscrito
    'teacher',    -- Profesor / docente
    'director',   -- Director académico
    'owner'       -- Dueño / superadmin
);

-- Categorías de cursos
CREATE TYPE course_category AS ENUM (
    'technology',     -- Cursos tecnológicos (Pocket IA, Backend, etc.)
    'bachillerato',   -- Programa de bachillerato
    'design',         -- Diseño UI/UX
    'backend'         -- Backend y APIs
);

-- Estados de una inscripción
CREATE TYPE enrollment_status AS ENUM (
    'active',     -- Inscripción vigente
    'expired',    -- Expiró (sin renovación)
    'refunded'    -- Reembolsada
);

-- Estados del pre-registro de bachillerato
CREATE TYPE preinscripcion_status AS ENUM (
    'pending',    -- Pendiente de revisión
    'contacted',  -- Ya contactado por un asesor
    'enrolled',   -- Inscrito formalmente
    'rejected'    -- No pudo inscribirse
);

-- ============================================================
-- TABLA: users
-- ============================================================
CREATE TABLE users (
    id              UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
    name            VARCHAR(120)    NOT NULL,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    role            user_role       NOT NULL DEFAULT 'student',
    avatar_url      TEXT,
    phone           VARCHAR(25),
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Índices de users
CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_role     ON users (role);
CREATE INDEX idx_users_active   ON users (is_active);

-- ============================================================
-- TABLA: courses
-- ============================================================
CREATE TABLE courses (
    id              UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
    slug            VARCHAR(120)    NOT NULL UNIQUE,
    title           VARCHAR(200)    NOT NULL,
    subtitle        VARCHAR(300),
    description     TEXT,
    category        course_category NOT NULL,
    price_usd       NUMERIC(10,2)   NOT NULL DEFAULT 0.00,
    total_hours     INTEGER,
    total_modules   INTEGER,
    thumbnail_url   TEXT,
    trailer_url     TEXT,
    is_published    BOOLEAN         NOT NULL DEFAULT FALSE,
    created_by      UUID            REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Índices de courses
CREATE INDEX idx_courses_slug       ON courses (slug);
CREATE INDEX idx_courses_category   ON courses (category);
CREATE INDEX idx_courses_published  ON courses (is_published);

-- ============================================================
-- TABLA: modules  (módulos dentro de un curso)
-- ============================================================
CREATE TABLE modules (
    id              UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id       UUID            NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT,
    order_index     INTEGER         NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modules_course ON modules (course_id, order_index);

-- ============================================================
-- TABLA: lessons  (lecciones dentro de un módulo)
-- ============================================================
CREATE TABLE lessons (
    id                  UUID            DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id           UUID            NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title               VARCHAR(300)    NOT NULL,
    description         TEXT,
    order_index         INTEGER         NOT NULL DEFAULT 1,
    duration_seconds    INTEGER,
    video_url           TEXT,           -- URL interna segura (no pública)
    content_text        TEXT,           -- Texto/markdown complementario
    is_preview          BOOLEAN         NOT NULL DEFAULT FALSE,  -- ¿Es lección gratuita de muestra?
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_module ON lessons (module_id, order_index);

-- ============================================================
-- TABLA: enrollments  (inscripciones de estudiantes a cursos)
-- ============================================================
CREATE TABLE enrollments (
    id                  UUID                DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id             UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id           UUID                NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status              enrollment_status   NOT NULL DEFAULT 'active',
    payment_method      VARCHAR(60),        -- 'card', 'paypal', 'transfer', 'crypto'
    payment_amount      NUMERIC(10,2),
    payment_ref         VARCHAR(255),       -- Referencia del pago
    enrolled_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ,        -- NULL = acceso de por vida
    UNIQUE(user_id, course_id)             -- Un estudiante no se inscribe dos veces al mismo curso
);

CREATE INDEX idx_enrollments_user    ON enrollments (user_id);
CREATE INDEX idx_enrollments_course  ON enrollments (course_id);
CREATE INDEX idx_enrollments_status  ON enrollments (status);

-- ============================================================
-- TABLA: lesson_progress  (progreso de cada lección por estudiante)
-- ============================================================
CREATE TABLE lesson_progress (
    id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id       UUID        NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed       BOOLEAN     NOT NULL DEFAULT FALSE,
    completed_at    TIMESTAMPTZ,
    watch_seconds   INTEGER     NOT NULL DEFAULT 0,   -- Segundos vistos acumulados
    last_watched_at TIMESTAMPTZ,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_progress_user   ON lesson_progress (user_id);
CREATE INDEX idx_progress_lesson ON lesson_progress (lesson_id);

-- ============================================================
-- TABLA: certificates  (certificados digitales emitidos)
-- ============================================================
CREATE TABLE certificates (
    id                  UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id           UUID        NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    certificate_hash    VARCHAR(255) NOT NULL UNIQUE,  -- Hash SHA-256 para verificación pública
    pdf_url             TEXT,
    issued_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX idx_certs_hash ON certificates (certificate_hash);

-- ============================================================
-- TABLA: bachillerato_programs  (programas de bachillerato por año)
-- ============================================================
CREATE TABLE bachillerato_programs (
    id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    year        INTEGER     NOT NULL CHECK (year BETWEEN 1 AND 5),
    description TEXT,
    shift       VARCHAR(20) NOT NULL DEFAULT 'morning',  -- 'morning' | 'afternoon'
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: bachillerato_subjects  (materias de bachillerato)
-- ============================================================
CREATE TABLE bachillerato_subjects (
    id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    program_id      UUID        NOT NULL REFERENCES bachillerato_programs(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    teacher_id      UUID        REFERENCES users(id) ON DELETE SET NULL,  -- Debe tener rol 'teacher'
    hours_per_week  INTEGER,
    semester        INTEGER     CHECK (semester IN (1, 2)),
    is_tech         BOOLEAN     NOT NULL DEFAULT FALSE,   -- TRUE = materia técnica/digital
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subjects_program ON bachillerato_subjects (program_id);
CREATE INDEX idx_subjects_teacher ON bachillerato_subjects (teacher_id);

-- ============================================================
-- TABLA: bachillerato_preinscripciones  (formulario de pre-inscripción)
-- ============================================================
CREATE TABLE bachillerato_preinscripciones (
    id              UUID                    DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_name    VARCHAR(150)            NOT NULL,
    student_ci      VARCHAR(20)             NOT NULL,
    year_apply      INTEGER                 NOT NULL CHECK (year_apply BETWEEN 1 AND 5),
    rep_name        VARCHAR(150)            NOT NULL,
    rep_phone       VARCHAR(25)             NOT NULL,
    rep_email       VARCHAR(255)            NOT NULL,
    status          preinscripcion_status   NOT NULL DEFAULT 'pending',
    notes           TEXT,                   -- Notas internas del asesor
    attended_by     UUID                    REFERENCES users(id) ON DELETE SET NULL,  -- Director/Owner que gestionó
    created_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_preinsc_status ON bachillerato_preinscripciones (status);
CREATE INDEX idx_preinsc_email  ON bachillerato_preinscripciones (rep_email);

-- ============================================================
-- TABLA: refresh_tokens  (sesiones JWT de largo plazo)
-- ============================================================
CREATE TABLE refresh_tokens (
    id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL UNIQUE,   -- Hash del refresh token
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tokens_user    ON refresh_tokens (user_id);
CREATE INDEX idx_tokens_hash    ON refresh_tokens (token_hash);

-- ============================================================
-- TABLA: audit_log  (registro de acciones importantes)
-- ============================================================
CREATE TABLE audit_log (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
    action      VARCHAR(100) NOT NULL,   -- 'user.login', 'course.publish', 'enrollment.create'
    entity_type VARCHAR(50),             -- 'user', 'course', 'enrollment', etc.
    entity_id   UUID,
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    metadata    JSONB,                   -- Datos adicionales del evento
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user     ON audit_log (user_id);
CREATE INDEX idx_audit_action   ON audit_log (action);
CREATE INDEX idx_audit_created  ON audit_log (created_at);

-- ============================================================
-- FUNCIÓN: auto-actualizar updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_preinsc_updated_at
    BEFORE UPDATE ON bachillerato_preinscripciones
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- DATOS INICIALES (seed básico)
-- ============================================================

-- Usuario dueño del sistema (contraseña debe cambiarse en producción)
-- password: "AcaCentro2026!" → hash generado con bcrypt rounds=12
INSERT INTO users (name, email, password_hash, role) VALUES
(
    'Administrador ACACENTRO',
    'admin@acacentro.edu.ve',
    '$2b$12$PLACEHOLDER_HASH_REPLACE_IN_PRODUCTION',
    'owner'
);

-- Cursos iniciales
INSERT INTO courses (slug, title, subtitle, category, price_usd, total_hours, total_modules, is_published) VALUES
('pocket-ia',       'Pocket IA',          'Modelos locales de Inteligencia Artificial', 'technology',   89.00, 32, 8, TRUE),
('ui-ux-brutalismo','UI/UX Brutalismo',   'Diseño Web de Vanguardia',                  'design',       79.00, 24, 6, FALSE),
('backend-moderno', 'Backend Moderno',     'Node.js, Express y Seguridad',              'backend',      99.00, 40, 10, FALSE),
('bachillerato-tec','Bachillerato Tecnológico', 'Secundaria con enfoque digital',       'bachillerato',  0.00,  0,  0, TRUE);

-- Programas de bachillerato (5 años)
INSERT INTO bachillerato_programs (name, year, shift, description) VALUES
('Primer Año — Fundamentos',        1, 'morning', 'Introducción a las ciencias básicas y primeros pasos digitales'),
('Segundo Año — Expansión',         2, 'morning', 'Profundización en ciencias y humanidades con pensamiento computacional'),
('Tercer Año — Especialización',    3, 'morning', 'Inicio de programación real con Python y proyectos con impacto social'),
('Cuarto Año — Avanzado',           4, 'morning', 'Ciencias avanzadas, primer portafolio digital y trabajo en equipo'),
('Quinto Año — Proyecto Final',     5, 'morning', 'Proyecto de grado tecnológico y requisitos de graduación');
