/* ==========================================================================
   ACACENTRO — Módulo: Mini menú de Bachillerato (hover + teclado accesible)
   ========================================================================== */

(function () {
  'use strict';

  const navItem   = document.getElementById('nav-bachillerato-item');
  const trigger   = document.getElementById('nav-bachillerato-trigger');
  const miniMenu  = document.getElementById('bachillerato-mini-menu');

  if (!navItem || !trigger || !miniMenu) return; // Solo ejecuta si los elementos existen

  let closeTimer = null;

  /* ---- Abrir menú ---- */
  function openMenu() {
    clearTimeout(closeTimer);
    miniMenu.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
  }

  /* ---- Cerrar menú con delay (permite hover en el menú sin que se cierre) ---- */
  function scheduleClose() {
    closeTimer = setTimeout(() => {
      miniMenu.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }, 120);
  }

  /* ---- Eventos de hover ---- */
  navItem.addEventListener('mouseenter', openMenu);
  navItem.addEventListener('mouseleave', scheduleClose);
  miniMenu.addEventListener('mouseenter', openMenu);   // Cancelar cierre al entrar al menú
  miniMenu.addEventListener('mouseleave', scheduleClose);

  /* ---- Eventos de teclado (accesibilidad) ---- */
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const isOpen = miniMenu.classList.contains('is-open');
      isOpen ? scheduleClose() : openMenu();
    }
    if (e.key === 'Escape') {
      miniMenu.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }
  });

  /* ---- Cerrar al hacer clic fuera ---- */
  document.addEventListener('click', (e) => {
    if (!navItem.contains(e.target)) {
      miniMenu.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---- Cerrar con Escape global ---- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && miniMenu.classList.contains('is-open')) {
      miniMenu.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    }
  });

})();
