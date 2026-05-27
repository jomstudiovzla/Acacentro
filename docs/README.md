# ACACENTRO — Índice de Documentación Técnica

> Versión 1.0.0 | Creative Academy Platform

---

## Archivos en `docs/database/`

| Archivo | Tipo | Descripción |
|---|---|---|
| [schema.sql](./database/schema.sql) | SQL | Esquema completo de PostgreSQL: 11 tablas, tipos ENUM, índices, triggers y datos semilla |
| [tablas_base_de_datos.csv](./database/tablas_base_de_datos.csv) | CSV / Hoja de cálculo | Todas las tablas con campos, tipos, restricciones y descripciones (importar en Excel/Sheets) |
| [roles_y_permisos.sql](./database/roles_y_permisos.sql) | SQL comentado | Definición detallada de los 4 roles con reglas de negocio y ejemplos de middleware |
| [roles_y_permisos.csv](./database/roles_y_permisos.csv) | CSV / Hoja de cálculo | Matriz completa de permisos por rol, endpoints de API y rutas de frontend (importar en Excel/Sheets) |

---

## Cómo importar los CSV en Google Sheets / Excel

1. Abrir Google Sheets o Excel
2. `Archivo → Importar → Subir archivo`
3. Seleccionar el archivo `.csv`
4. Delimitador: **Coma** (`,`)
5. Clic en `Importar datos`

> El CSV de `roles_y_permisos.csv` tiene 4 secciones separadas por una línea en blanco.
> Al importar, puedes crear pestañas separadas para cada sección cortando y pegando.

---

## Resumen de la Base de Datos

### Tablas del sistema (11 en total)

| # | Tabla | Registros principales | Propósito |
|---|---|---|---|
| 1 | `users` | Todos los usuarios | Autenticación y perfil |
| 2 | `courses` | Catálogo de cursos | Información de cada curso |
| 3 | `modules` | Módulos de cursos | Organización del contenido |
| 4 | `lessons` | Lecciones de módulos | Unidad mínima de aprendizaje |
| 5 | `enrollments` | Inscripciones | Relación estudiante ↔ curso |
| 6 | `lesson_progress` | Progreso de estudiantes | Seguimiento de avance |
| 7 | `certificates` | Certificados emitidos | Verificación de aprobación |
| 8 | `bachillerato_programs` | Años de bachillerato (1-5) | Organización del bachillerato |
| 9 | `bachillerato_subjects` | Materias por año | Contenido académico |
| 10 | `bachillerato_preinscripciones` | Solicitudes recibidas | Gestión de admisión |
| 11 | `refresh_tokens` | Sesiones activas | Seguridad de autenticación |
| 12 | `audit_log` | Historial de acciones | Trazabilidad del sistema |

### Roles del sistema (4 niveles)

| Rol | Nivel | Color UI | Descripción |
|---|---|---|---|
| `student` | 1 | Azul `#005088` | Estudiante inscrito |
| `teacher` | 2 | Verde `#11CAA0` | Docente / Profesor |
| `director` | 3 | Amarillo `#FFE600` | Director académico |
| `owner` | 4 | Magenta `#FF2C6D` | Dueño / Superadmin |

---

## Cómo crear la base de datos

```bash
# 1. Tener PostgreSQL 16 instalado
# 2. Crear la base de datos
createdb acacentro_db

# 3. Ejecutar el esquema
psql -d acacentro_db -f docs/database/schema.sql

# 4. Verificar las tablas creadas
psql -d acacentro_db -c "\dt"
```

---

*Generado automáticamente por ACACENTRO Dev Team — 2026*
