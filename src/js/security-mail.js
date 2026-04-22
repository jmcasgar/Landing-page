(function() {
    "use strict";

    // ------------------------------------------------------------------------
    // CONFIGURACIÓN DE SEGURIDAD (NIST SP 800-53 CM-6)
    // ------------------------------------------------------------------------
    const CONFIG = Object.freeze({
        // Selectores de navegación
        selectors: {
            hamburger: '.espaciado',
            navLinks: '.nav-links',
            navbar: '.navbar',
            statsSection: '.stats',
            statItems: '.stat-item h3',
            contactForm: '.contact-form',
            honeypotField: '.contact-form input[name="website"]'
        },
        // Protección de correo
        SELECTOR: '.email-webmail-link',
        ENCRYPTED_DATA_ATTR: 'data-encrypted-href',
        PLACEHOLDER_HREF: '#',
        ALLOWED_WEBMAIL_DOMAINS: Object.freeze([
            'mail.google.com',
            'outlook.live.com',
            'compose.mail.yahoo.com'
        ]),
        ALLOWED_EMAIL: 'inversiones@pfhghealth.com',
        
        // Criptografía
        PBKDF2_ITERATIONS: 210000,
        PBKDF2_HASH: 'SHA-256',
        ENCRYPTION_ALGO: 'AES-GCM',
        KEY_LENGTH: 256,
        IV_LENGTH: 12,
        SALT_STORAGE_KEY: 'pfhg_sec_salt_v1',
        
        // Rendimiento
        scrollThrottleMs: 16,
        statsAnimationDuration: 2000,
        
        // Validación
        validation: {
            nameMaxLength: 50,
            emailMaxLength: 254,
            messageMaxLength: 2000
        },
        
        // Mensajes seguros
        messages: {
            formSuccess: 'Gracias por tu mensaje. Te contactaremos pronto.',
            sending: 'Enviando...',
            popupBlocked: 'Tu navegador bloqueó ventanas emergentes. Permite ventanas emergentes para este sitio.'
        },
        
        minSubmitIntervalMs: 5000
    });

    // ------------------------------------------------------------------------
    // ESTADO GLOBAL
    // ------------------------------------------------------------------------
    let cryptoKey = null;
    let webCryptoSupported = true;
    let dynamicSalt = null;

    // ------------------------------------------------------------------------
    // DETECCIÓN DE ENTORNO SEGURO
    // ------------------------------------------------------------------------
    const isSecureContext = () => window.isSecureContext && window.crypto && window.crypto.subtle;
    if (!isSecureContext()) {
        console.warn('⚠️ Contexto no seguro. Algunas funciones de seguridad limitadas.');
    }

    // ------------------------------------------------------------------------
    // PREVENCIÓN DE CLICKJACKING
    // ------------------------------------------------------------------------
    if (window.top !== window.self) {
        try {
            window.top.location = window.self.location;
        } catch (e) {
            document.body.innerHTML = '<h1>Acceso denegado</h1><p>Esta página no puede ser mostrada en un marco.</p>';
            throw new Error('Clickjacking attempt blocked');
        }
    }

    // ------------------------------------------------------------------------
    // UTILIDADES SEGURAS DE DOM
    // ------------------------------------------------------------------------
    const getElement = (selector, context = document) => {
        try {
            return context.querySelector(selector);
        } catch (e) {
            return null;
        }
    };

    const getAllElements = (selector, context = document) => {
        try {
            return [...context.querySelectorAll(selector)];
        } catch (e) {
            return [];
        }
    };

    const createSecureElement = (tag, className, textContent) => {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (textContent) el.textContent = textContent;
        return el;
    };

    // ------------------------------------------------------------------------
    // THROTTLE
    // ------------------------------------------------------------------------
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

    // ------------------------------------------------------------------------
    // CRIPTOGRAFÍA (Web Crypto API)
    // ------------------------------------------------------------------------
    function isWebCryptoAvailable() {
        return window.crypto && window.crypto.subtle && window.TextEncoder;
    }

    function getOrCreateDynamicSalt() {
        if (dynamicSalt) return dynamicSalt;
        const storedSalt = sessionStorage.getItem(CONFIG.SALT_STORAGE_KEY);
        if (storedSalt) {
            dynamicSalt = storedSalt;
            return dynamicSalt;
        }
        const randomSalt = new Uint8Array(16);
        crypto.getRandomValues(randomSalt);
        dynamicSalt = btoa(String.fromCharCode.apply(null, randomSalt));
        sessionStorage.setItem(CONFIG.SALT_STORAGE_KEY, dynamicSalt);
        return dynamicSalt;
    }

    async function getCryptoKey() {
        if (cryptoKey) return cryptoKey;
        if (!isWebCryptoAvailable()) {
            webCryptoSupported = false;
            throw new Error('WebCrypto no soportado');
        }
        const encoder = new TextEncoder();
        const saltStr = getOrCreateDynamicSalt();
        const passwordStr = window.location.hostname + ':' + saltStr;
        const passwordData = encoder.encode(passwordStr);
        const baseKey = await crypto.subtle.importKey('raw', passwordData, { name: 'PBKDF2' }, false, ['deriveKey']);
        const saltBytes = encoder.encode(saltStr);
        cryptoKey = await crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: saltBytes, iterations: CONFIG.PBKDF2_ITERATIONS, hash: CONFIG.PBKDF2_HASH },
            baseKey,
            { name: CONFIG.ENCRYPTION_ALGO, length: CONFIG.KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        );
        return cryptoKey;
    }

    async function encryptUrl(plaintext) {
        const key = await getCryptoKey();
        const iv = crypto.getRandomValues(new Uint8Array(CONFIG.IV_LENGTH));
        const encoder = new TextEncoder();
        const ciphertext = await crypto.subtle.encrypt({ name: CONFIG.ENCRYPTION_ALGO, iv }, key, encoder.encode(plaintext));
        const combined = new Uint8Array(iv.length + ciphertext.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(ciphertext), iv.length);
        return btoa(String.fromCharCode.apply(null, combined));
    }

    async function decryptUrl(encryptedBase64) {
        const key = await getCryptoKey();
        const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
        const iv = combined.slice(0, CONFIG.IV_LENGTH);
        const ciphertext = combined.slice(CONFIG.IV_LENGTH);
        const decrypted = await crypto.subtle.decrypt({ name: CONFIG.ENCRYPTION_ALGO, iv }, key, ciphertext);
        return new TextDecoder().decode(decrypted);
    }

    function isValidWebmailUrl(urlString) {
        try {
            const url = new URL(urlString);
            if (url.protocol !== 'https:') return false;
            if (!CONFIG.ALLOWED_WEBMAIL_DOMAINS.includes(url.hostname)) return false;
            if (!url.searchParams.has('to')) return false;
            const email = url.searchParams.get('to');
            return email === CONFIG.ALLOWED_EMAIL;
        } catch (e) {
            return false;
        }
    }

    async function protectEmailLinks() {
        if (!webCryptoSupported) return;
        const links = getAllElements(CONFIG.SELECTOR);
        if (links.length === 0) return;
        try {
            await getCryptoKey();
            for (const link of links) {
                const originalHref = link.getAttribute('href');
                if (!originalHref || originalHref === CONFIG.PLACEHOLDER_HREF) continue;
                if (!isValidWebmailUrl(originalHref)) continue;
                const encrypted = await encryptUrl(originalHref);
                link.setAttribute(CONFIG.ENCRYPTED_DATA_ATTR, encrypted);
                link.setAttribute('href', CONFIG.PLACEHOLDER_HREF);
            }
        } catch (e) {
            webCryptoSupported = false;
        }
    }

    async function handleEmailLinkClick(e) {
        const link = e.target.closest(CONFIG.SELECTOR);
        if (!link) return;
        const encrypted = link.getAttribute(CONFIG.ENCRYPTED_DATA_ATTR);
        if (!encrypted) return;
        e.preventDefault();
        try {
            const realUrl = await decryptUrl(encrypted);
            const newWindow = window.open(realUrl, '_blank', 'noopener,noreferrer');
            if (!newWindow) {
                alert(CONFIG.messages.popupBlocked);
            }
        } catch (error) {
            alert('Error de seguridad al procesar el enlace. Recarga la página.');
        }
    }

    // ------------------------------------------------------------------------
    // NAVEGACIÓN MÓVIL ACCESIBLE
    // ------------------------------------------------------------------------
    function initMobileNav() {
        const hamburger = getElement(CONFIG.selectors.hamburger);
        const navLinks = getElement(CONFIG.selectors.navLinks);
        if (!hamburger || !navLinks) return;

        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Menú de navegación');
        hamburger.setAttribute('role', 'button');
        hamburger.setAttribute('tabindex', '0');

        const toggleMenu = () => {
            const isActive = navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive);
        };

        hamburger.addEventListener('click', toggleMenu);
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMenu();
            }
        });
    }

    // ------------------------------------------------------------------------
    // SCROLL SUAVE PARA ENLACES INTERNOS
    // ------------------------------------------------------------------------
    function initSmoothScroll() {
        const navLinks = getElement(CONFIG.selectors.navLinks);
        const hamburger = getElement(CONFIG.selectors.hamburger);

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (!link) return;
            const href = link.getAttribute('href');
            if (href === '#' || href === '#0') return;
            const targetId = href.slice(1);
            const targetElement = document.getElementById(targetId);
            if (!targetElement) return;

            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Cerrar menú móvil si está abierto
            if (navLinks) navLinks.classList.remove('active');
            if (hamburger) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ------------------------------------------------------------------------
    // NAVBAR EN SCROLL
    // ------------------------------------------------------------------------
    function initNavbarScroll() {
        const navbar = getElement(CONFIG.selectors.navbar);
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
    }

    // ------------------------------------------------------------------------
    // INICIALIZACIÓN GENERAL
    // ------------------------------------------------------------------------
    async function initialize() {
        try {
            // Protección de correos
            await protectEmailLinks();
            document.addEventListener('click', handleEmailLinkClick);
            
            // Navegación
            initMobileNav();
            initSmoothScroll();
            initNavbarScroll();
            
            // Efectos hover (puedes mover a CSS)
            document.addEventListener('mouseover', (e) => {
                const card = e.target.closest('.service-card, .case-study-card, .solution-card');
                if (card) card.style.transform = 'translateY(-10px)';
            });
            document.addEventListener('mouseout', (e) => {
                const card = e.target.closest('.service-card, .case-study-card, .solution-card');
                if (card) card.style.transform = '';
            });
        } catch (error) {
            console.error('Error en inicialización:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
