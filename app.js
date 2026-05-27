/* ==========================================================================
   ACACENTRO CREATIVE ACADEMY - Interactividad y Simulación de Webhooks
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- MÓDULO COMÚN: Detección de sesión y actualización de menú para Admin ---
    const session = (function() {
        try { return JSON.parse(localStorage.getItem('acacentro_session') || 'null'); }
        catch { return null; }
    })();

    if (session) {
        const loginLink = document.getElementById('nav-login-link');
        if (loginLink) {
            loginLink.textContent = `Mi Cuenta (${session.name})`;
            if (session.role === 'owner') {
                loginLink.href = 'admin/index.html';
            }
        }

        if (session.role === 'owner') {
            const navUl = document.querySelector('.academy-nav ul');
            if (navUl && !document.getElementById('nav-admin-db-link')) {
                const li = document.createElement('li');
                li.id = 'nav-admin-db-link';
                
                // Determinar prefijo según si estamos dentro de una subcarpeta
                const prefix = window.location.pathname.includes('/admin/') ? '' : 'admin/';
                
                li.innerHTML = `<a href="${prefix}index.html" class="academy-nav-link" style="background:var(--color-neon-yellow) !important; color:var(--color-black) !important; font-weight:800; border:var(--brutalist-border-thin) !important; padding:6px 12px; border-radius:2px; box-shadow: 2px 2px 0 var(--color-black); margin-right: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">📊 Ver Inscritos (Panel Admin)</a>`;
                
                if (loginLink && loginLink.parentElement) {
                    navUl.insertBefore(li, loginLink.parentElement);
                } else {
                    navUl.appendChild(li);
                }
            }
        }
    }

    // --- MÓDULO COMÚN: Detección de Página ---
    const isIndexPage = document.querySelector('.flagship-product-page') !== null;
    const isClassroomPage = document.querySelector('.classroom-layout') !== null;
    const isCheckoutPage = document.querySelector('.checkout-layout') !== null;

    // Componente de Notificaciones flotante (Toast Brutalista)
    function showBrutalToast(message, type = 'normal') {
        const toast = document.createElement('div');
        toast.className = 'toast-brutal';
        if (type === 'magenta') {
            toast.style.borderColor = 'var(--color-neon-magenta)';
            toast.style.color = 'var(--color-neon-magenta)';
        } else if (type === 'cyan') {
            toast.style.borderColor = 'var(--color-neon-cyan)';
            toast.style.color = 'var(--color-neon-blue)';
        }
        toast.textContent = message;
        document.body.appendChild(toast);

        // Animación de entrada
        toast.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    // --- 1. LÓGICA DE PÁGINA INICIAL / LANDING POCKET IA ---
    if (isIndexPage) {
        
        // Acordeón del Temario
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                const body = header.nextElementSibling;
                const icon = header.querySelector('.accordion-icon');

                // Cerrar otros
                accordionHeaders.forEach(otherHeader => {
                    if (otherHeader !== header) {
                        otherHeader.setAttribute('aria-expanded', 'false');
                        otherHeader.nextElementSibling.style.display = 'none';
                        otherHeader.querySelector('.accordion-icon').textContent = '+';
                    }
                });

                // Toggle actual
                if (!isExpanded) {
                    header.setAttribute('aria-expanded', 'true');
                    body.style.display = 'block';
                    icon.textContent = '−';
                } else {
                    header.setAttribute('aria-expanded', 'false');
                    body.style.display = 'none';
                    icon.textContent = '+';
                }
            });
        });

        // Reproductor de Tráiler Seguro (Simulación)
        const btnPlayTrailer = document.getElementById('btn-play-trailer');
        const btnStopTrailer = document.getElementById('btn-stop-trailer');
        const trailerVideoPlaying = document.getElementById('trailer-video-playing');

        if (btnPlayTrailer) {
            btnPlayTrailer.addEventListener('click', () => {
                btnPlayTrailer.parentElement.style.display = 'none';
                trailerVideoPlaying.style.display = 'flex';
                showBrutalToast("🎥 Tráiler iniciado: Pocket IA Oficial", "cyan");
            });
        }

        if (btnStopTrailer) {
            btnStopTrailer.addEventListener('click', () => {
                trailerVideoPlaying.style.display = 'none';
                btnPlayTrailer.parentElement.style.display = 'flex';
            });
        }
    }

    // --- 2. LÓGICA DE AULA VIRTUAL (classroom.html) ---
    if (isClassroomPage) {
        
        // Base de Datos de Lecciones para el Aula
        const lessonsList = [
            {
                id: "1.1",
                title: "Lección 1.1: Introducción a la inferencia local (CPU vs GPU)",
                duration: "12:30 Min",
                desc: "En esta clase teórica daremos los primeros pasos para comprender cómo corre un modelo de lenguaje de inteligencia artificial de forma nativa en tu computadora. Analizaremos los cuellos de botella de memoria y por qué la velocidad del modelo depende directamente del ancho de banda de la memoria de tu GPU (VRAM) en comparación con tu memoria RAM (CPU)."
            },
            {
                id: "1.2",
                title: "Lección 1.2: El formato GGUF y arquitecturas de hardware",
                duration: "18:40 Min",
                desc: "Analizamos el formato GGUF (creado por Georgi Gerganov), el cual permite cargar y guardar modelos de redes neuronales optimizados para inferencia en CPU. Veremos cómo se configuran los hilos del procesador para obtener los mejores tiempos de respuesta."
            },
            {
                id: "2.1",
                title: "Lección 2.1: Qué es la cuantización de pesos (Q4 vs Q8)",
                duration: "22:15 Min",
                desc: "Descubre la magia matemática detrás de la compresión de modelos. Aprenderemos cómo reducir la precisión de los pesos del modelo de floats de 16 bits a enteros de 4 u 8 bits sin perder significativamente la coherencia del lenguaje."
            },
            {
                id: "2.2",
                title: "Lección 2.2: Ajuste de contexto y temperatura local",
                duration: "15:10 Min",
                desc: "Aprende a configurar los parámetros clave al inicializar tu modelo local. Veremos cómo influye la ventana de contexto (en tokens) y cómo calibrar la temperatura para que el modelo sea más preciso o más creativo según tu necesidad."
            },
            {
                id: "3.1",
                title: "Lección 3.1: Configuración de Ollama y Llama.cpp en NodeJS",
                duration: "26:45 Min",
                desc: "Módulo práctico en código. Instalaremos Ollama en nuestro sistema local, cargaremos modelos eficientes como Phi-3 y Llama-3, y levantaremos una API REST utilizando Express para consultarlo mediante peticiones POST locales."
            }
        ];

        let activeLessonId = "1.1";

        // Cambiar pestañas (Lecciones vs Recursos)
        const tabPlaylistBtn = document.getElementById('tab-playlist-btn');
        const tabResourcesBtn = document.getElementById('tab-resources-btn');
        const panePlaylist = document.getElementById('pane-playlist');
        const paneResources = document.getElementById('pane-resources');

        tabPlaylistBtn.addEventListener('click', () => {
            tabPlaylistBtn.classList.add('active-tab');
            tabResourcesBtn.classList.remove('active-tab');
            panePlaylist.style.display = 'block';
            paneResources.style.display = 'none';
        });

        tabResourcesBtn.addEventListener('click', () => {
            tabResourcesBtn.classList.add('active-tab');
            tabPlaylistBtn.classList.remove('active-tab');
            panePlaylist.style.display = 'none';
            paneResources.style.display = 'block';
        });

        // Simular inicio de reproductor seguro
        const btnStartClass = document.getElementById('btn-start-class');
        const playerInitialOverlay = document.getElementById('player-initial-overlay');
        const playerActiveVideo = document.getElementById('player-active-video');
        const playingLessonIndicator = document.getElementById('playing-lesson-indicator');

        btnStartClass.addEventListener('click', () => {
            playerInitialOverlay.style.display = 'none';
            playerActiveVideo.style.display = 'flex';
            showBrutalToast("🔒 Dominio validado. Streaming HD seguro activo.", "cyan");
        });

        // Renderizar Playlist interactiva de clases
        const playlistContainer = document.getElementById('classroom-playlist-container');
        
        function renderPlaylist() {
            playlistContainer.innerHTML = '';
            
            // Cargar estado de lecciones completadas de LocalStorage
            let completedLessons = JSON.parse(localStorage.getItem('creative_completed_lessons') || '[]');

            lessonsList.forEach(les => {
                const isCompleted = completedLessons.includes(les.id);
                const isActive = les.id === activeLessonId;
                
                const card = document.createElement('div');
                card.className = `playlist-item-card ${isActive ? 'active-item' : ''}`;
                
                card.innerHTML = `
                    <label class="check-container-brutal" onclick="event.stopPropagation()">
                        <input type="checkbox" class="lesson-check-input" data-id="${les.id}" ${isCompleted ? 'checked' : ''}>
                        <span class="checkmark-brutal"></span>
                    </label>
                    <div class="playlist-item-info">
                        <span class="playlist-item-title">${les.title}</span>
                        <span class="playlist-item-duration">⏱️ ${les.duration}</span>
                    </div>
                `;

                // Clic en la tarjeta cambia de clase
                card.addEventListener('click', () => {
                    activeLessonId = les.id;
                    updateActiveLesson(les);
                    renderPlaylist();
                });

                // Clic en el checkbox actualiza completados
                const checkbox = card.querySelector('.lesson-check-input');
                checkbox.addEventListener('change', (e) => {
                    const isChecked = e.target.checked;
                    let completed = JSON.parse(localStorage.getItem('creative_completed_lessons') || '[]');
                    
                    if (isChecked) {
                        if (!completed.includes(les.id)) completed.push(les.id);
                        showBrutalToast(`✅ ¡Lección ${les.id} marcada como completada!`, "cyan");
                    } else {
                        completed = completed.filter(id => id !== les.id);
                    }
                    
                    localStorage.setItem('creative_completed_lessons', JSON.stringify(completed));
                });

                playlistContainer.appendChild(card);
            });
        }

        function updateActiveLesson(lesson) {
            document.getElementById('active-classroom-title').textContent = lesson.title;
            document.getElementById('active-classroom-desc').textContent = lesson.desc;
            playingLessonIndicator.textContent = `Reproduciendo: ${lesson.title.split(':')[0]}`;
            
            // Si el video ya está reproduciéndose, avisar del cambio
            if (playerActiveVideo.style.display === 'flex') {
                showBrutalToast(`🔄 Cargando: ${lesson.title.split(':')[0]}`, "cyan");
            }
        }

        // Descarga de recursos
        document.querySelectorAll('.btn-resource-download').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const fn = btn.getAttribute('data-filename');
                showBrutalToast(`📥 Descargando recurso: ${fn}`, "cyan");
            });
        });

        // Inicializar playlist
        renderPlaylist();
    }

    // --- 3. LÓGICA DE PASARELA Y WEBHOOK CRM (checkout.html) ---
    if (isCheckoutPage) {
        
        // Alternar visualización del tipo de pago
        const payInputs = document.querySelectorAll('input[name="checkoutPay"]');
        const cardFields = document.getElementById('checkout-card-fields');

        payInputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.value === 'card') {
                    cardFields.style.display = 'block';
                    document.getElementById('ch-card-num').required = true;
                    document.getElementById('ch-card-date').required = true;
                    document.getElementById('ch-card-cvv').required = true;
                } else {
                    cardFields.style.display = 'none';
                    document.getElementById('ch-card-num').required = false;
                    document.getElementById('ch-card-date').required = false;
                    document.getElementById('ch-card-cvv').required = false;
                }
            });
        });

        // Procesar compra y disparar el Webhook de WooCommerce al CRM de la institución
        const formCheckout = document.getElementById('form-brutalist-checkout');
        const overlay = document.getElementById('checkout-webhook-overlay');
        const crmLog = document.getElementById('webhook-crm-log');
        const loadingState = document.getElementById('webhook-loading-state');
        const successState = document.getElementById('webhook-success-state');

        formCheckout.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const studentName = document.getElementById('checkout-name').value;
            const studentEmail = document.getElementById('checkout-email').value;
            const studentPhone = document.getElementById('checkout-phone').value;

            // Mostrar pantalla de carga brutalista
            overlay.style.display = 'flex';
            
            // Simulación paso a paso de Webhooks del ecosistema WooCommerce -> Zapier/Make -> CRM Salesforce/Moodle
            setTimeout(() => {
                crmLog.innerHTML = "💳 Pasarela WooCommerce: Procesando cobro seguro de $89.00 USD...";
                
                setTimeout(() => {
                    crmLog.innerHTML = "✅ Pago Exitoso. Capturando Webhook 'order.completed' en WooCommerce...";
                    
                    setTimeout(() => {
                        crmLog.innerHTML = `🚀 Despachando Webhook: POST https://crm.acacentro.edu.ve/api/webhook/register_student<br>
                                            <span style="color:#FF2C6D;">Payload: { email: "${studentEmail}", name: "${studentName}", course: "pocket-ia" }</span>`;
                        
                        setTimeout(() => {
                            crmLog.innerHTML = "💾 CRM: Estudiante registrado en base de datos escolar. Creando credenciales...";
                            
                            setTimeout(() => {
                                crmLog.innerHTML = "📧 Servidor SMTP: Enviando correo electrónico con credenciales a " + studentEmail;
                                
                                setTimeout(() => {
                                    // Cambiar a pantalla de éxito
                                    loadingState.style.display = 'none';
                                    successState.style.display = 'block';
                                    
                                    // Persistir compra en LocalStorage para que el aula sepa el nombre del estudiante
                                    localStorage.setItem('creative_student_enrolled', 'true');
                                    localStorage.setItem('creative_student_name', studentName);
                                    
                                    showBrutalToast("🎉 ¡Inscripción y Webhook CRM completados!", "cyan");
                                }, 1500);
                            }, 1200);
                        }, 1500);
                    }, 1500);
                }, 1200);
            }, 1000);

        });
    }

    // --- 3. CONÓCENOS: INTERACTIVE LOGO & POPOVER TABS ---
    if (isIndexPage) {
        const logoTrigger = document.getElementById('logo-trigger-area');
        const popoverWindow = document.getElementById('conocenos-popover');
        
        if (logoTrigger && popoverWindow) {
            let isLocked = false;
            
            function updateVisibility() {
                if (isLocked) {
                    popoverWindow.classList.add('window-active');
                    logoTrigger.classList.add('console-focused');
                    const badgeText = logoTrigger.querySelector('.console-overlay-badge');
                    if (badgeText) badgeText.innerHTML = '<span class="pulse-dot" style="background-color:var(--color-neon-magenta);"></span> ARCHIVO FIJADO';
                } else {
                    const isHoveringConsole = logoTrigger.matches(':hover');
                    const isHoveringPopover = popoverWindow.matches(':hover');
                    
                    if (isHoveringConsole || isHoveringPopover) {
                        popoverWindow.classList.add('window-active');
                        const badgeText = logoTrigger.querySelector('.console-overlay-badge');
                        if (badgeText) badgeText.innerHTML = '<span class="pulse-dot"></span> ESCANEAR LOGO';
                    } else {
                        popoverWindow.classList.remove('window-active');
                        const badgeText = logoTrigger.querySelector('.console-overlay-badge');
                        if (badgeText) badgeText.innerHTML = '<span class="pulse-dot"></span> ESCANEAR LOGO';
                    }
                    logoTrigger.classList.remove('console-focused');
                }
            }
            
            // Hover logic for both elements (so user can move cursor to the popover window smoothly)
            logoTrigger.addEventListener('mouseenter', updateVisibility);
            logoTrigger.addEventListener('mouseleave', () => {
                setTimeout(updateVisibility, 150); // Grace period
            });
            
            popoverWindow.addEventListener('mouseenter', updateVisibility);
            popoverWindow.addEventListener('mouseleave', () => {
                setTimeout(updateVisibility, 150); // Grace period
            });
            
            // Click to lock/unlock state
            logoTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                isLocked = !isLocked;
                updateVisibility();
                
                if (isLocked) {
                    showBrutalToast("🔒 ARCHIVO ACACENTRO FIJADO: Explora el menú", "magenta");
                } else {
                    showBrutalToast("🔓 Sincronizador en Proximidad", "cyan");
                }
            });
            
            // Make the close button in topbar release the lock and close
            const winCloseBtn = popoverWindow.querySelector('.win-close');
            if (winCloseBtn) {
                winCloseBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    isLocked = false;
                    updateVisibility();
                    showBrutalToast("🔓 Panel Cerrado", "cyan");
                });
            }
            
            // Tab switching logic inside the popover window
            const tabButtons = popoverWindow.querySelectorAll('.win-tab-btn');
            const tabContents = popoverWindow.querySelectorAll('.window-tab-content');
            
            tabButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const targetTabId = btn.getAttribute('data-tab');
                    
                    // Update active button
                    tabButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Update active content
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === `tab-${targetTabId}`) {
                            content.classList.add('active');
                        }
                    });
                    
                    // Feedback Toast
                    showBrutalToast(`Sincronizado: ${btn.textContent.trim().replace(/\d+\s*/, '')}`, 'cyan');
                });
            });
        }
    }

    // --- 4. CUSTOM CYBERPUNK CURSOR SYSTEM ---
    (function initCustomCursor() {
        // Detect desktop / hover capabilities
        if (!window.matchMedia('(hover: hover)').matches) return;

        // Create cursor container & elements
        const cursorContainer = document.createElement('div');
        cursorContainer.className = 'custom-cursor';
        
        const cursorDot = document.createElement('div');
        cursorDot.className = 'cursor-dot';
        
        const cursorRing = document.createElement('div');
        cursorRing.className = 'cursor-ring';
        
        cursorContainer.appendChild(cursorDot);
        cursorContainer.appendChild(cursorRing);
        document.body.appendChild(cursorContainer);
        
        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;
        
        // Spring physics factor
        const ringLerp = 0.16;
        let isMoving = false;
        
        window.addEventListener('mousemove', (e) => {
            // Unhide on first movement
            if (!isMoving) {
                isMoving = true;
                cursorContainer.style.display = 'block';
            }
            
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });
        
        // Smooth trailing animation loop
        function animateRing() {
            ringX += (mouseX - ringX) * ringLerp;
            ringY += (mouseY - ringY) * ringLerp;
            
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
            
            requestAnimationFrame(animateRing);
        }
        animateRing();
        
        // Active click states
        window.addEventListener('mousedown', () => {
            cursorContainer.classList.add('cursor-click');
        });
        
        window.addEventListener('mouseup', () => {
            cursorContainer.classList.remove('cursor-click');
        });
        
        // Track interactive hovering
        function updateHoverState() {
            const targets = document.querySelectorAll('a, button, input, select, textarea, [role="button"], .btn-brutalist, .logo-interactive-console, .win-tab-btn, .accordion-header, .btn-massive-cta, .nav-login-link, .academy-nav-link');
            
            targets.forEach(target => {
                // Ensure duplicate listeners are not bound
                target.removeEventListener('mouseenter', onMouseEnterInteractive);
                target.removeEventListener('mouseleave', onMouseLeaveInteractive);
                
                target.addEventListener('mouseenter', onMouseEnterInteractive);
                target.addEventListener('mouseleave', onMouseLeaveInteractive);
            });
        }
        
        function onMouseEnterInteractive() {
            cursorContainer.classList.add('cursor-hover');
        }
        
        function onMouseLeaveInteractive() {
            cursorContainer.classList.remove('cursor-hover');
        }
        
        updateHoverState();
        
        // Handle dynamically added nodes in DOM
        const observer = new MutationObserver(() => {
            updateHoverState();
        });
        observer.observe(document.body, { childList: true, subtree: true });
    })();

});
