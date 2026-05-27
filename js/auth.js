/* ==========================================================================
   ACACENTRO Creative Academy — Módulo: Autenticación (Login + Registro)
   Archivo: js/auth.js
   Almacenamiento: localStorage simulando base de datos
   Exportación: CSV descargable con todos los registros
   ========================================================================== */

(function () {
  'use strict';

  /* ══════════════════════════════════════════
     CONSTANTES DE ALMACENAMIENTO LOCAL
  ══════════════════════════════════════════ */
  const STORAGE_USERS_KEY   = 'acacentro_users_db';       // Array de usuarios registrados
  const STORAGE_SESSION_KEY = 'acacentro_session';         // Sesión activa actual

  /* ══════════════════════════════════════════
     HELPERS DE ALMACENAMIENTO
  ══════════════════════════════════════════ */

  /** Devuelve el array de todos los usuarios registrados */
  function getUsers() {
    try {
      let list = JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || '[]');
      let updated = false;
      
      // 1. Gestionar a Jom (Admin)
      let jom = list.find(u => u.id === 'USR-ADMIN-JOM' || u.email.toLowerCase() === 'jom@acacentro.com');
      if (!jom) {
        jom = {
          id: 'USR-ADMIN-JOM',
          name: 'Jom',
          email: 'jom@acacentro.com',
          phone: '+58 412-0000000',
          role: 'owner',
          passwordHash: simpleHash('studio'), // Contraseña: studio
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: null
        };
        list.push(jom);
        updated = true;
      } else {
        if (jom.passwordHash !== simpleHash('studio')) {
          jom.passwordHash = simpleHash('studio');
          updated = true;
        }
      }

      // 2. Gestionar a Edu (Admin)
      let edu = list.find(u => u.id === 'USR-ADMIN-EDU' || u.email.toLowerCase() === 'edu@acacentro.com');
      if (!edu) {
        edu = {
          id: 'USR-ADMIN-EDU',
          name: 'Edu',
          email: 'edu@acacentro.com',
          phone: '+58 412-0000001',
          role: 'owner',
          passwordHash: simpleHash('diseño'), // Contraseña: diseño
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLoginAt: null
        };
        list.push(edu);
        updated = true;
      } else {
        if (edu.passwordHash !== simpleHash('diseño')) {
          edu.passwordHash = simpleHash('diseño');
          updated = true;
        }
      }

      if (updated) {
        localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(list));
      }
      return list;
    } catch {
      return [];
    }
  }

  /** Guarda el array de usuarios actualizado */
  function saveUsers(users) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  }

  /** Busca un usuario por email (insensible a mayúsculas) */
  function findUserByEmail(email) {
    return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  /** Hash simple (no criptográfico) para simular almacenamiento seguro en frontend */
  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'HASH_' + Math.abs(hash).toString(16).toUpperCase();
  }

  /* ══════════════════════════════════════════
     GESTIÓN DE SESIÓN
  ══════════════════════════════════════════ */

  /** Guarda la sesión actual en localStorage */
  function setSession(user) {
    const session = {
      id        : user.id,
      name      : user.name,
      email     : user.email,
      role      : user.role,
      loggedAt  : new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
  }

  /** Devuelve la sesión activa o null si no hay sesión */
  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_SESSION_KEY) || 'null');
    } catch {
      return null;
    }
  }

  /** Cierra la sesión */
  function logout() {
    localStorage.removeItem(STORAGE_SESSION_KEY);
    window.location.href = 'login.html';
  }

  // Exponer logout globalmente para usar desde otros scripts
  window.acacentroLogout = logout;
  window.acacentroGetSession = getSession;

  /* ══════════════════════════════════════════
     EXPORTAR USUARIOS A CSV (HOJA DE CÁLCULO)
  ══════════════════════════════════════════ */

  /**
   * Genera y descarga el CSV de todos los usuarios registrados.
   * Puede llamarse desde el dashboard del owner: acacentroExportUsersCSV()
   */
  function exportUsersToCSV() {
    const users = getUsers();

    if (users.length === 0) {
      alert('No hay usuarios registrados todavía.');
      return;
    }

    const headers = [
      'ID', 'Nombre', 'Email', 'Teléfono', 'Rol',
      'Activo', 'Fecha_Registro', 'Ultimo_Login'
    ];

    const rows = users.map(u => [
      u.id,
      `"${u.name}"`,
      u.email,
      u.phone || '',
      u.role,
      u.isActive ? 'SI' : 'NO',
      u.createdAt,
      u.lastLoginAt || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `acacentro_usuarios_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Exponer globalmente
  window.acacentroExportUsersCSV = exportUsersToCSV;

  /* ══════════════════════════════════════════
     INDICADOR DE FORTALEZA DE CONTRASEÑA
  ══════════════════════════════════════════ */

  function checkPasswordStrength(pw) {
    let score = 0;
    if (pw.length >= 8)                    score++;
    if (pw.length >= 12)                   score++;
    if (/[A-Z]/.test(pw))                  score++;
    if (/[0-9]/.test(pw))                  score++;
    if (/[^A-Za-z0-9]/.test(pw))          score++;

    const levels = [
      { label: 'Muy débil', color: '#FF2C6D', width: '20%' },
      { label: 'Débil',     color: '#FF6B35', width: '40%' },
      { label: 'Regular',   color: '#FFE600', width: '60%' },
      { label: 'Fuerte',    color: '#11CAA0', width: '80%' },
      { label: 'Muy fuerte',color: '#005088', width: '100%' },
    ];

    return levels[Math.min(score, 4)];
  }

  /* ══════════════════════════════════════════
     HELPERS DE UI (ERRORES / ALERTAS)
  ══════════════════════════════════════════ */

  function showFieldError(errId, inputEl) {
    const errEl = document.getElementById(errId);
    if (errEl) errEl.classList.add('visible');
    if (inputEl) inputEl.classList.add('input-error');
  }

  function clearFieldError(errId, inputEl) {
    const errEl = document.getElementById(errId);
    if (errEl) errEl.classList.remove('visible');
    if (inputEl) inputEl.classList.remove('input-error');
  }

  function showAlert(alertId, message, type = 'error') {
    const el = document.getElementById(alertId);
    if (!el) return;
    el.textContent = message;
    el.className = `auth-alert alert-${type} visible`;
  }

  function hideAlert(alertId) {
    const el = document.getElementById(alertId);
    if (el) el.classList.remove('visible');
  }

  /* ══════════════════════════════════════════
     LÓGICA: REGISTRO
  ══════════════════════════════════════════ */

  const formRegister = document.getElementById('form-register');

  if (formRegister) {
    /* Indicador de fortaleza de contraseña en tiempo real */
    const pwInput   = document.getElementById('reg-password');
    const fillEl    = document.getElementById('pw-strength-fill');
    const labelEl   = document.getElementById('pw-strength-label');

    if (pwInput && fillEl && labelEl) {
      pwInput.addEventListener('input', () => {
        const result = checkPasswordStrength(pwInput.value);
        fillEl.style.width           = pwInput.value ? result.width : '0%';
        fillEl.style.backgroundColor = result.color;
        labelEl.textContent          = pwInput.value ? result.label : 'Escribe una contraseña';
        labelEl.style.color          = result.color;
      });
    }

    formRegister.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Limpiar errores previos */
      hideAlert('register-alert-error');
      hideAlert('register-alert-success');
      ['reg-name','reg-email','reg-password','reg-password-confirm'].forEach(id => {
        const input = document.getElementById(id);
        const errId = 'err-' + id.replace('reg-', 'reg-');
        clearFieldError(errId, input);
      });

      /* Recoger valores */
      const role          = document.querySelector('input[name="reg-role"]:checked')?.value || 'student';
      const name          = document.getElementById('reg-name').value.trim();
      const email         = document.getElementById('reg-email').value.trim();
      const phone         = document.getElementById('reg-phone').value.trim();
      const password      = document.getElementById('reg-password').value;
      const passwordConf  = document.getElementById('reg-password-confirm').value;

      /* Validaciones */
      let hasError = false;

      if (!name) {
        showFieldError('err-reg-name', document.getElementById('reg-name'));
        hasError = true;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError('err-reg-email', document.getElementById('reg-email'));
        hasError = true;
      }
      if (password.length < 8) {
        showFieldError('err-reg-password', document.getElementById('reg-password'));
        hasError = true;
      }
      if (password !== passwordConf) {
        showFieldError('err-reg-confirm', document.getElementById('reg-password-confirm'));
        hasError = true;
      }

      if (hasError) return;

      /* Verificar email duplicado */
      if (findUserByEmail(email)) {
        showAlert('register-alert-error', '⚠️ Ya existe una cuenta con este correo electrónico.');
        return;
      }

      /* Crear el objeto usuario */
      const newUser = {
        id          : 'USR-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
        name        : name,
        email       : email,
        phone       : phone,
        role        : role,
        passwordHash: simpleHash(password),   // Solo para demo frontend; en producción → bcrypt en backend
        isActive    : true,
        createdAt   : new Date().toISOString(),
        lastLoginAt : null,
      };

      /* Guardar en localStorage (base de datos local) */
      const users = getUsers();
      users.push(newUser);
      saveUsers(users);

      /* Mostrar éxito */
      showAlert(
        'register-alert-success',
        `✅ ¡Cuenta creada! Bienvenido/a, ${name}. Ahora puedes iniciar sesión.`,
        'success'
      );

      /* Limpiar formulario */
      formRegister.reset();
      document.getElementById('pw-strength-fill').style.width = '0%';
      document.getElementById('pw-strength-label').textContent = 'Escribe una contraseña';

      /* Auto-redirigir al tab de login después de 2 segundos */
      setTimeout(() => {
        if (typeof switchTab === 'function') switchTab('login');
        document.getElementById('login-email').value = email;
      }, 2000);
    });
  }

  /* ══════════════════════════════════════════
     LÓGICA: LOGIN
  ══════════════════════════════════════════ */

  const formLogin = document.getElementById('form-login');

  if (formLogin) {
    formLogin.addEventListener('submit', function (e) {
      e.preventDefault();

      hideAlert('login-alert-error');
      hideAlert('login-alert-success');
      clearFieldError('err-login-email',    document.getElementById('login-email'));
      clearFieldError('err-login-password', document.getElementById('login-password'));

      const email    = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      /* Validación básica */
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFieldError('err-login-email', document.getElementById('login-email'));
        return;
      }
      if (!password) {
        showFieldError('err-login-password', document.getElementById('login-password'));
        return;
      }

      /* Buscar usuario */
      const user = findUserByEmail(email);

      if (!user) {
        showAlert('login-alert-error', '⚠️ No existe una cuenta con este correo.');
        return;
      }

      if (!user.isActive) {
        showAlert('login-alert-error', '🔒 Tu cuenta está desactivada. Contacta al administrador.');
        return;
      }

      /* Verificar contraseña */
      if (user.passwordHash !== simpleHash(password)) {
        showAlert('login-alert-error', '❌ Contraseña incorrecta. Verifica e intenta de nuevo.');
        return;
      }

      /* Login exitoso: actualizar lastLoginAt */
      const users = getUsers();
      const idx   = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx].lastLoginAt = new Date().toISOString();
        saveUsers(users);
      }

      /* Crear sesión */
      setSession({ ...user, lastLoginAt: new Date().toISOString() });

      showAlert('login-alert-success', `✅ ¡Hola, ${user.name}! Redirigiendo…`, 'success');

      /* Redirigir según rol (Aula Virtual oculta temporalmente) o URL pendiente */
      setTimeout(() => {
        const pendingRedirect = sessionStorage.getItem('acacentro_redirect_after_login');
        if (pendingRedirect && user.role !== 'owner') {
          sessionStorage.removeItem('acacentro_redirect_after_login');
          window.location.href = pendingRedirect;
          return;
        }

        const redirect = {
          student  : 'index.html',
          teacher  : 'index.html',
          director : 'index.html',
          owner    : 'admin/index.html',
        };
        window.location.href = redirect[user.role] || 'index.html';
      }, 1200);
    });
  }

  /* ══════════════════════════════════════════
     LÓGICA: GOOGLE SIGN-IN & ENFORCER
  ══════════════════════════════════════════ */

  // Variable temporal para guardar la info del perfil de Google mientras se solicita el teléfono
  let pendingGoogleProfile = null;

  /**
   * Decodifica un token JWT (como el devuelto por Google Sign-In) de forma segura en cliente.
   */
  function decodeJWT(token) {
    try {
      let base64Url = token.split(".")[1];
      let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      let jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("Error decodificando JWT:", e);
      return null;
    }
  }

  /**
   * Manejador global para la credencial oficial devuelta por la librería de Google.
   */
  window.handleGoogleCredentialResponse = function(response) {
    if (!response || !response.credential) {
      console.error("Respuesta de Google inválida");
      return;
    }

    const payload = decodeJWT(response.credential);
    if (!payload) {
      alert("No se pudo verificar el token de Google.");
      return;
    }

    // Adaptar estructura estándar del JWT de Google
    const profile = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };

    processGoogleAuth(profile);
  };

  /**
   * Manejador para el login simulado (Demo Google Sign-In).
   */
  window.handleMockGoogleLogin = function(profile) {
    // Generar un ID de Google simulado para el demo
    profile.id = 'GGL-' + simpleHash(profile.email);
    processGoogleAuth(profile);
  };

  /**
   * Procesa la información del perfil obtenido mediante Google (oficial o simulación).
   */
  function processGoogleAuth(profile) {
    // Buscar si el usuario ya existe en nuestra base de datos local
    let user = findUserByEmail(profile.email);

    if (user) {
      // Caso 1: El usuario existe y tiene teléfono -> Loguea directo
      if (user.phone) {
        completeGoogleLogin(user);
      } else {
        // Caso 2: El usuario existe pero NO tiene teléfono -> Pedir teléfono
        pendingGoogleProfile = { ...profile, existingUser: user };
        if (typeof window.openGooglePhoneEnforcerModal === 'function') {
          window.openGooglePhoneEnforcerModal(profile.name, profile.email, profile.picture);
        }
      }
    } else {
      // Caso 3: El usuario NO existe en absoluto -> Registrar y pedir teléfono obligatorio
      pendingGoogleProfile = { ...profile, isNew: true };
      if (typeof window.openGooglePhoneEnforcerModal === 'function') {
        window.openGooglePhoneEnforcerModal(profile.name, profile.email, profile.picture);
      }
    }
  }

  /**
   * Completa el inicio de sesión y redirige al usuario.
   */
  function completeGoogleLogin(user) {
    // Actualizar último login
    const users = getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      users[idx].lastLoginAt = new Date().toISOString();
      saveUsers(users);
    }

    // Guardar sesión activa
    setSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      picture: user.picture || null, // Guardar avatar de perfil
      loggedAt: new Date().toISOString()
    });

    // Notificar éxito en pantalla
    const loginAlert = document.getElementById('login-alert-success');
    if (loginAlert) {
      loginAlert.textContent = `✅ ¡Hola, ${user.name}! Iniciaste sesión con Google.`;
      loginAlert.className = "auth-alert alert-success visible";
    }
    const regAlert = document.getElementById('register-alert-success');
    if (regAlert) {
      regAlert.textContent = `✅ ¡Hola, ${user.name}! Iniciaste sesión con Google.`;
      regAlert.className = "auth-alert alert-success visible";
    }

    // Redirección post-login
    setTimeout(() => {
      const pendingRedirect = sessionStorage.getItem('acacentro_redirect_after_login');
      if (pendingRedirect && user.role !== 'owner') {
        sessionStorage.removeItem('acacentro_redirect_after_login');
        window.location.href = pendingRedirect;
        return;
      }

      const redirect = {
        student: 'index.html',
        teacher: 'index.html',
        director: 'index.html',
        owner: 'admin/index.html',
      };
      window.location.href = redirect[user.role] || 'index.html';
    }, 1200);
  }

  /**
   * Callback ejecutado desde el modal del teléfono en login.html
   */
  window.submitGooglePhoneRegister = function(phoneVal) {
    if (!pendingGoogleProfile) return;

    const profile = pendingGoogleProfile;
    let user = null;

    if (profile.existingUser) {
      // Actualizar teléfono de usuario existente
      const users = getUsers();
      const idx = users.findIndex(u => u.id === profile.existingUser.id);
      if (idx !== -1) {
        users[idx].phone = phoneVal;
        users[idx].picture = profile.picture; // Actualizar/Guardar foto
        saveUsers(users);
        user = users[idx];
      }
    } else {
      // Crear un nuevo estudiante
      const users = getUsers();
      user = {
        id: 'USR-GGL-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(),
        name: profile.name,
        email: profile.email,
        phone: phoneVal,
        role: 'student',
        picture: profile.picture,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        passwordHash: simpleHash('GOOGLE_AUTH_MOCK_' + Math.random()) // Sin contraseña local necesaria
      };
      users.push(user);
      saveUsers(users);
    }

    // Cerrar modal de enforcer
    if (typeof window.closeGooglePhoneEnforcerModal === 'function') {
      window.closeGooglePhoneEnforcerModal();
    }

    // Resetear perfil pendiente
    pendingGoogleProfile = null;

    // Completar el login
    completeGoogleLogin(user);
  };

  /* ══════════════════════════════════════════
     PROTECCIÓN DE PÁGINAS (llamar desde otras páginas)
     Uso: acacentroRequireAuth(['student', 'teacher'])
  ══════════════════════════════════════════ */
  window.acacentroRequireAuth = function (allowedRoles) {
    const session = getSession();
    if (!session) {
      sessionStorage.setItem('acacentro_redirect_after_login', window.location.href);
      window.location.href = 'login.html';
      return null;
    }
    if (allowedRoles && !allowedRoles.includes(session.role)) {
      window.location.href = 'login.html?error=forbidden';
      return null;
    }
    return session;
  };

  /* ══════════════════════════════════════════
     AUTO-DETECCIÓN DE REDIRECCIÓN DE GOOGLE
  ══════════════════════════════════════════ */
  window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('google_mock_login') === 'true') {
      const name = urlParams.get('name');
      const email = urlParams.get('email');
      const picture = urlParams.get('picture');
      
      if (name && email) {
        // Limpiar la URL de parámetros para mantener la barra de direcciones limpia
        const cleanUrl = window.location.pathname + (window.location.hash || '');
        window.history.replaceState({}, document.title, cleanUrl);
        
        // Iniciar flujo de procesamiento
        const mockProfile = {
          id: 'GGL-' + simpleHash(email),
          name: name,
          email: email,
          picture: picture
        };
        processGoogleAuth(mockProfile);
      }
    }
  });

})();
