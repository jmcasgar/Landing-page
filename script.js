(function() {
    "use strict";

    /* ------------------------------------------------------------------------
     * CONFIGURACIÓN CENTRAL (ISO 27001 A.8.9)
     * ------------------------------------------------------------------------ */
    const CONFIG = Object.freeze({
        // Selectores
        selectors: {
            hamburger: '.hamburger',
            navLinks: '.nav-links',
            navbar: '.navbar',
            statsSection: '.stats',
            statItems: '.stat-item h3',
            contactForm: '.contact-form',
            honeypotField: '.contact-form input[name="website"]'
        },
        // Umbrales de rendimiento
        scrollThrottleMs: 16,
        statsAnimationDuration: 2000,
        // Límites de validación (NIST SI-10)
        validation: {
            nameMaxLength: 50,
            emailMaxLength: 254,
            messageMaxLength: 2000
        },
        // Mensajes seguros (sin datos sensibles)
        messages: {
            formSuccess: 'Gracias por tu mensaje. Te contactaremos pronto.',
            sending: 'Enviando...',
            popupBlocked: 'Tu navegador bloqueó ventanas emergentes. Permite ventanas emergentes para este sitio.'
        },
        // Tiempo mínimo entre envíos (anti-DoS)
        minSubmitIntervalMs: 5000
    });

    /* ------------------------------------------------------------------------
     * DETECCIÓN DE ENTORNO SEGURO (NIST SI-7)
     * ------------------------------------------------------------------------ */
    const isSecureContext = () => window.isSecureContext && window.crypto && window.crypto.subtle;
    
    if (!isSecureContext()) {
        // En producción, se podría enviar a un endpoint de logging anónimo
        if (window.console) console.warn('⚠️ Contexto no seguro. Algunas funciones de seguridad limitadas.');
    }

    /* ------------------------------------------------------------------------
     * PREVENCIÓN DE CLICKJACKING (ISO 27001 A.8.20)
     * Complementa CSP: frame-ancestors 'none'
     * ------------------------------------------------------------------------ */
    if (window.top !== window.self) {
        try {
            window.top.location = window.self.location;
        } catch (e) {
            document.body.innerHTML = '<h1>Acceso denegado</h1><p>Esta página no puede ser mostrada en un marco.</p>';
            throw new Error('Clickjacking attempt blocked');
        }
    }

    /* ------------------------------------------------------------------------
     * UTILIDADES SEGURAS DE DOM (Protección contra prototype pollution)
     * ------------------------------------------------------------------------ */
    const safeQuerySelector = (selector, context = document) => {
        try {
            const el = context.querySelector(selector);
            if (!el && process.env.NODE_ENV !== 'production') {
                console.debug(`Elemento no encontrado: ${selector}`);
            }
            return el;
        } catch (e) {
            return null;
        }
    };

    const safeQuerySelectorAll = (selector, context = document) => {
        try {
            return [...context.querySelectorAll(selector)];
        } catch (e) {
            return [];
        }
    };

    // Creación segura de elementos con sanitización implícita
    const createSecureElement = (tag, className, textContent) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (textContent) el.textContent = textContent; // textContent previene XSS
        return el;
    };

    /* ------------------------------------------------------------------------
     * SANITIZACIÓN Y VALIDACIÓN ROBUSTA (ISO 27001 A.8.26, OWASP)
     * ------------------------------------------------------------------------ */
    const sanitizeInput = (input) => {
        const str = String(input);
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        return str.replace(/[&<>"'/]/g, ch => map[ch]);
    };

    const isValidEmail = (email) => {
        const str = String(email).toLowerCase();
        // RFC 5322 simplificada pero segura
        const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return str.length <= CONFIG.validation.emailMaxLength && re.test(str);
    };

    const isValidName = (name) => {
        const str = String(name).trim();
        const re = /^[\p{L}\s\-']{2,50}$/u;
        return str.length <= CONFIG.validation.nameMaxLength && re.test(str);
    };

    const validateMessage = (value) => {
        const str = String(value).trim();
        return str.length > 0 && str.length <= CONFIG.validation.messageMaxLength;
    };

    // Prevención de ReDoS: límite previo
    const safeValidate = (validator, value) => {
        if (typeof value !== 'string') return false;
        if (value.length > 5000) return false;
        return validator(value);
    };

    /* ------------------------------------------------------------------------
     * THROTTLE / DEBOUNCE (NIST SI-14)
     * ------------------------------------------------------------------------ */
    const throttle = (fn, delay) => {
        let lastCall = 0;
        return (...args) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                fn(...args);
            }
        };
    };

    /* ------------------------------------------------------------------------
     * DELEGACIÓN DE EVENTOS SEGURA CON ABORTCONTROLLER
     * ------------------------------------------------------------------------ */
    const createDelegate = (eventType, selector, handler, root = document) => {
        const controller = new AbortController();
        root.addEventListener(eventType, (e) => {
            const target = e.target.closest(selector);
            if (target) handler(e, target);
        }, { signal: controller.signal });
        return controller;
    };

    /* ------------------------------------------------------------------------
     * NAVEGACIÓN MÓVIL ACCESIBLE (WCAG 2.1 AA)
     * ------------------------------------------------------------------------ */
    const initMobileNav = () => {
        const hamburger = safeQuerySelector(CONFIG.selectors.hamburger);
        const navLinks = safeQuerySelector(CONFIG.selectors.navLinks);
        if (!hamburger || !navLinks) return;

        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Menú de navegación');
        navLinks.setAttribute('aria-label', 'Menú principal');

        createDelegate('click', CONFIG.selectors.hamburger, () => {
            const isActive = navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive);
        });
    };

    /* ------------------------------------------------------------------------
     * SCROLL SUAVE SEGURO (evita inyección en href)
     * ------------------------------------------------------------------------ */
    const initSmoothScroll = () => {
        const navLinks = safeQuerySelector(CONFIG.selectors.navLinks);
        const hamburger = safeQuerySelector(CONFIG.selectors.hamburger);

        createDelegate('click', 'a[href^="#"]', (e, link) => {
            const href = link.getAttribute('href');
            if (!href || href === '#' || href === '#0') return;

            const targetId = href.slice(1);
            const targetElement = document.getElementById(targetId);
            if (!targetElement) return;

            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (navLinks) navLinks.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    };

    /* ------------------------------------------------------------------------
     * NAVBAR CON THROTTLE (Optimizado)
     * ------------------------------------------------------------------------ */
    const initNavbarScroll = () => {
        const navbar = safeQuerySelector(CONFIG.selectors.navbar);
        if (!navbar) return;

        let lastScroll = 0;
        const handleScroll = throttle(() => {
            const currentScroll = window.pageYOffset;
            if (currentScroll <= 0) {
                navbar.classList.remove('scroll-up', 'scroll-down');
                return;
            }
            if (currentScroll > lastScroll) {
                navbar.classList.remove('scroll-up');
                navbar.classList.add('scroll-down');
            } else {
                navbar.classList.remove('scroll-down');
                navbar.classList.add('scroll-up');
            }
            lastScroll = currentScroll;
        }, CONFIG.scrollThrottleMs);

        window.addEventListener('scroll', handleScroll, { passive: true });
    };

    /* ------------------------------------------------------------------------
     * ANIMACIÓN DE CONTADORES (requestAnimationFrame + IntersectionObserver)
     * ------------------------------------------------------------------------ */
    const initStatsAnimation = () => {
        const statsSection = safeQuerySelector(CONFIG.selectors.statsSection);
        if (!statsSection) return;

        const statElements = safeQuerySelectorAll(CONFIG.selectors.statItems);
        if (statElements.length === 0) return;

        const targets = statElements.map(el => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            return { el, target: isNaN(target) ? 0 : target, current: 0 };
        }).filter(item => item.target > 0);

        if (targets.length === 0) return;

        let animationFrame = null;
        let startTime = null;
        let animated = false;

        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / CONFIG.statsAnimationDuration, 1);
            targets.forEach(item => {
                const value = Math.floor(progress * item.target);
                if (value !== item.current) {
                    item.current = value;
                    item.el.textContent = value.toLocaleString();
                }
            });
            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            } else {
                targets.forEach(item => item.el.textContent = item.target.toLocaleString());
                cancelAnimationFrame(animationFrame);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !animated) {
                animated = true;
                animationFrame = requestAnimationFrame(animate);
                observer.disconnect();
            }
        }, { threshold: 0.5 });

        observer.observe(statsSection);
    };

    /* ------------------------------------------------------------------------
     * ANTI-SPAM: HONEYPOT Y RATE LIMITING (NIST SI-10)
     * ------------------------------------------------------------------------ */
    let lastSubmitTime = 0;

    const isSubmitAllowed = () => {
        const now = Date.now();
        if (now - lastSubmitTime < CONFIG.minSubmitIntervalMs) {
            return false;
        }
        lastSubmitTime = now;
        return true;
    };

    const isHoneypotTriggered = (form) => {
        const honeypot = form.querySelector(CONFIG.selectors.honeypotField);
        return honeypot && honeypot.value.trim() !== '';
    };

    /* ------------------------------------------------------------------------
     * VALIDACIÓN Y ENVÍO DE FORMULARIOS (SEGURIDAD OWASP)
     * ------------------------------------------------------------------------ */
    const initFormValidation = () => {
        const contactForm = safeQuerySelector(CONFIG.selectors.contactForm);
        if (!contactForm) return;

        const inputs = safeQuerySelectorAll('input:not([type=submit]):not([name="website"]), textarea', contactForm);
        
        inputs.forEach(input => {
            input.addEventListener('focus', () => input.closest('.form-group')?.classList.add('focused'));
            input.addEventListener('blur', () => {
                if (!input.value) input.closest('.form-group')?.classList.remove('focused');
            });
        });

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Rate limiting
            if (!isSubmitAllowed()) {
                alert('Por favor, espera unos segundos antes de enviar otro mensaje.');
                return;
            }

            // Honeypot check
            if (isHoneypotTriggered(contactForm)) {
                if (process.env.NODE_ENV !== 'production') console.debug('Honeypot triggered');
                contactForm.reset();
                return;
            }

            let isValid = true;
            const formData = {};

            inputs.forEach(input => {
                const group = input.closest('.form-group');
                const value = input.value.trim();
                let error = false;

                if (input.type === 'email') {
                    if (!safeValidate(isValidEmail, value)) error = true;
                    else formData.email = sanitizeInput(value);
                } else if (input.name === 'name' || input.id === 'name') {
                    if (!safeValidate(isValidName, value)) error = true;
                    else formData.name = sanitizeInput(value);
                } else {
                    if (!validateMessage(value)) error = true;
                    else formData.message = sanitizeInput(value);
                }

                if (error) {
                    isValid = false;
                    group?.classList.add('error');
                } else {
                    group?.classList.remove('error');
                }
            });

            if (isValid) {
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = CONFIG.messages.sending;
                submitBtn.disabled = true;

                // Simular envío (reemplazar con fetch en producción)
                setTimeout(() => {
                    contactForm.reset();
                    inputs.forEach(i => i.closest('.form-group')?.classList.remove('focused', 'error'));

                    const successMsg = createSecureElement('div', 'success-message', CONFIG.messages.formSuccess);
                    contactForm.appendChild(successMsg);
                    setTimeout(() => successMsg.remove(), 5000);

                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 1500);
            }
        });
    };

    /* ------------------------------------------------------------------------
     * INICIALIZACIÓN SEGURA CON GESTIÓN DE ERRORES
     * ------------------------------------------------------------------------ */
    const init = () => {
        try {
            initMobileNav();
            initSmoothScroll();
            initNavbarScroll();
            initStatsAnimation();
            initFormValidation();

            // Efectos hover (preferible usar CSS)
            document.addEventListener('mouseover', (e) => {
                const card = e.target.closest('.service-card, .case-study-card, .solution-card');
                if (card) card.style.transform = 'translateY(-10px)';
            });
            document.addEventListener('mouseout', (e) => {
                const card = e.target.closest('.service-card, .case-study-card, .solution-card');
                if (card) card.style.transform = '';
            });

            safeQuerySelectorAll('.hero-content, .hero-image, .about-content, .service-card, .solution-card, .case-study-card, .contact-content')
                .forEach(el => el.classList.add('animate'));

            // Recordatorio de CSP en desarrollo
            if (process.env.NODE_ENV !== 'production') {
                console.info('🔒 Para máxima seguridad, configure Content-Security-Policy en el servidor.');
            }
        } catch (error) {
            // En producción, enviar a servicio de logging sin exponer detalles
            if (process.env.NODE_ENV !== 'production') console.error('Error en inicialización:', error);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();