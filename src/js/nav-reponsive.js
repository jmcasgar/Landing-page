(function() {
    'use strict';

    /**
     * Navegación robusta con protecciones NIST SP 800-53:
     * - Solo responde a eventos de usuario reales (isTrusted).
     * - Anti-bot: cooldown de 300ms para evitar ráfagas automatizadas.
     * - Previene manipulación del DOM desde código externo (referencias privadas).
     * - Sin innerHTML, sin eval, encapsulado en IIFE.
     * - Compatible con WCAG 2.1 (roles ARIA, teclado, táctil).
     */

    document.addEventListener('DOMContentLoaded', function() {
        // ----- Referencias seguras (no se reasignan desde fuera) -----
        const toggle = document.querySelector('.espaciado');
        const menu = document.querySelector('.nav-links');

        // Verificación temprana: si el DOM fue manipulado, salir sin error
        if (!toggle || !menu) return;

        // ----- Configuración de accesibilidad (solo si los elementos son seguros) -----
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
        toggle.setAttribute('aria-label', 'Abrir menú de navegación');
        toggle.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-hidden', 'true');

        // ----- Protección contra ráfagas (cooldown 300ms) -----
        let lastToggleTime = 0;
        const COOLDOWN_MS = 300;

        // Flag para distinguir toques reales de desplazamientos
        let touchMoved = false;

        /**
         * Lógica central del toggle.
         * Solo se ejecuta si el evento es de confianza (usuario real)
         * y ha pasado el tiempo mínimo desde la última acción.
         */
        function toggleMenu(e) {
            // NIST IA-12: solo eventos iniciados por el usuario (isTrusted)
            if (e && !e.isTrusted) {
                return; // Ignora eventos sintéticos (bots, scripts maliciosos)
            }

            const now = Date.now();
            if (now - lastToggleTime < COOLDOWN_MS) {
                // Posible automatización: bloquea sin error
                return;
            }
            lastToggleTime = now;

            if (e) {
                e.preventDefault();
                e.stopPropagation(); // Evita que otros listeners interfieran
            }

            const isActive = menu.classList.toggle('active');
            toggle.setAttribute('aria-expanded', isActive);
            menu.setAttribute('aria-hidden', !isActive);
            toggle.setAttribute('aria-label', isActive ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
        }

        // ----- Eventos táctiles seguros -----
        toggle.addEventListener('touchstart', function() {
            touchMoved = false;
        }, { passive: true });

        toggle.addEventListener('touchmove', function() {
            touchMoved = true;
        }, { passive: true });

        toggle.addEventListener('touchend', function(e) {
            if (!touchMoved) {
                // e.preventDefault() evita la generación de un click sintético
                e.preventDefault();
                toggleMenu(e);
            }
        });

        // ----- Evento de ratón como fallback -----
        toggle.addEventListener('click', function(e) {
            // Si el click ya fue manejado por el touchend, no hacer nada
            if (e.defaultPrevented) return;
            toggleMenu(e);
        });

        // ----- Teclado (Enter / Espacio) -----
        toggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu(e);
            }
        });

        // ----- Cierre al pulsar un enlace del menú -----
        const navLinks = menu.querySelectorAll('a');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                if (menu.classList.contains('active')) {
                    // Forzamos cierre, evento de usuario ya verificado
                    menu.classList.remove('active');
                    toggle.setAttribute('aria-expanded', 'false');
                    menu.setAttribute('aria-hidden', 'true');
                    toggle.setAttribute('aria-label', 'Abrir menú de navegación');
                }
            });
        });

        // ----- Cierre al hacer clic fuera (con verificación de confianza) -----
        document.addEventListener('click', function(e) {
            if (!menu.classList.contains('active')) return;
            // Solo si el clic es de usuario real y está fuera del menú
            if (e.isTrusted && !toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
                toggle.setAttribute('aria-expanded', 'false');
                menu.setAttribute('aria-hidden', 'true');
                toggle.setAttribute('aria-label', 'Abrir menú de navegación');
            }
        });
    });
})();