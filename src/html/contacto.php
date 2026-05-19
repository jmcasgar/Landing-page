<?php
session_start();
// Generar token CSRF una vez por sesión
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
$csrf_token = $_SESSION['csrf_token'];

// Cargar contenido dinámico para "¿Qué buscamos?" y "¿Qué ofrecemos?" (RF-OP-01)
$contenido = require __DIR__ . '/content/oportunidades.php';

// Recuperar errores y datos previos (sticky form)
$errores = $_SESSION['errores'] ?? [];
$old     = $_SESSION['old'] ?? [];
unset($_SESSION['errores'], $_SESSION['old']);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-Content-Type-Options" content="nosniff">
    <meta http-equiv="X-Frame-Options" content="DENY">
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
    <meta http-equiv="Permissions-Policy" content="camera=(), microphone=(), geolocation=()">
    <title>P.F.H.G. HEALTH S.S. A - Contacto</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/src/css/contacto.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-XXXXX-Y"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'UA-XXXXX-Y');
    </script>
    <script src="/src/js/security-mail.js" defer></script>
    <script src="/src/js/Corrector.js"></script>
    <script src="/src/js/script.js" defer></script>
</head>
<body>
    <!-- Navigation -->
    <nav aria-label="Navigation" class="navbar">
        <div class="container">
            <div class="logo">
                <a href="/src/html/index.php">
                    <img src="/src/Imagenes/logo.webp" alt="Company Logo">
                </a>
            </div>
            <ul class="nav-links">
                <li><a href="/src/html/index.php">Inicio</a></li>
                <li><a href="/src/html/Nosotros.php">Conocenos</a></li>
                <li><a href="/src/html/Lineasnegocio.php">Servicios</a></li>
                <li><a href="/src/html/contacto.php" aria-current="page">Contacto</a></li>
                <li><a href="/src/html/portafolio.php">Portafolio</a></li>
                <li><a href="/src/html/oportunidades.php">Oportunidades</a></li>
                <li><a href="/src/html/vision_estrategica.php">Estrategia Corporativa</a></li>
            </ul>
            <div class="espaciado">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>

    <!-- Secciones dinámicas: ¿Qué buscamos? / ¿Qué ofrecemos? (RF-OP-01) -->
    <section class="investor-info" style="max-width: 800px; margin: 3rem auto; padding: 0 1rem;">
        <div class="info-block">
            <h2>¿Qué buscamos?</h2>
            <ul>
                <?php foreach ($contenido['buscamos'] as $item): ?>
                    <li><?= htmlspecialchars($item) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
        <div class="info-block" style="margin-top: 2rem;">
            <h2>¿Qué ofrecemos?</h2>
            <ul>
                <?php foreach ($contenido['ofrecemos'] as $item): ?>
                    <li><?= htmlspecialchars($item) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
    </section>

    <!-- Formulario de Postulación -->
    <div class="application-form-container">
        <div class="form-header">
            <h3>Postula tu proyecto</h3>
            <p>
                Si cuentas con una empresa, emprendimiento o iniciativa con fundamentos sólidos 
                y proyección de crecimiento, queremos conocerte.
            </p>
        </div>

        <form id="proyecto-form" class="application-form" action="postulacion.php" method="POST">
            <!-- Token CSRF (dinámico) -->
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($csrf_token) ?>">

            <div class="form-row">
                <div class="form-group">
                    <label for="nombre-proyecto">Nombre del proyecto / empresa <span class="required">*</span></label>
                    <input type="text" id="nombre-proyecto" name="nombre_proyecto"
                           value="<?= htmlspecialchars($old['nombre_proyecto'] ?? '') ?>"
                           placeholder="Ej: TechSolutions S.A.S.">
                    <?php if (!empty($errores['nombre_proyecto'])): ?>
                        <span class="error"><?= htmlspecialchars($errores['nombre_proyecto']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="sector">Sector <span class="required">*</span></label>
                    <select id="sector" name="sector">
                        <option value="" disabled <?= empty($old['sector']) ? 'selected' : '' ?>>Selecciona un sector</option>
                        <?php
                        $sectores = [
                            'seguridad' => 'Seguridad VIP',
                            'tecnologia' => 'Tecnología',
                            'apoyo-empresarial' => 'Apoyo empresarial',
                            'construcciones' => 'Construcciones',
                            'salud' => 'Salud',
                            'agroindustria' => 'Agroindustria',
                            'medicina-alternativa' => 'Medicina Alternativa',
                            'transatlantico' => 'Transatlántico',
                            'hoteleria-turismo' => 'Hotelería y Turismo',
                            'gastronomia' => 'Gastronomía',
                            'industria' => 'Industria',
                            'servicios-financieros' => 'Servicios financieros',
                            'otro' => 'Otro'
                        ];
                        foreach ($sectores as $val => $label):
                            $sel = ($old['sector'] ?? '') === $val ? 'selected' : '';
                        ?>
                            <option value="<?= htmlspecialchars($val) ?>" <?= $sel ?>><?= htmlspecialchars($label) ?></option>
                        <?php endforeach; ?>
                    </select>
                    <?php if (!empty($errores['sector'])): ?>
                        <span class="error"><?= htmlspecialchars($errores['sector']) ?></span>
                    <?php endif; ?>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="nombre-contacto">Nombre del contacto <span class="required">*</span></label>
                    <input type="text" id="nombre-contacto" name="nombre_contacto"
                           value="<?= htmlspecialchars($old['nombre_contacto'] ?? '') ?>"
                           placeholder="Nombre completo">
                    <?php if (!empty($errores['nombre_contacto'])): ?>
                        <span class="error"><?= htmlspecialchars($errores['nombre_contacto']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="email">Correo electrónico <span class="required">*</span></label>
                    <input type="email" id="email" name="email"
                           value="<?= htmlspecialchars($old['email'] ?? '') ?>"
                           placeholder="contacto@empresa.com">
                    <?php if (!empty($errores['email'])): ?>
                        <span class="error"><?= htmlspecialchars($errores['email']) ?></span>
                    <?php endif; ?>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="telefono">Teléfono <span class="required">*</span></label>
                    <input type="tel" id="telefono" name="telefono"
                           value="<?= htmlspecialchars($old['telefono'] ?? '') ?>"
                           placeholder="+XX XXX XXX XXX">
                    <?php if (!empty($errores['telefono'])): ?>
                        <span class="error"><?= htmlspecialchars($errores['telefono']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="form-group">
                    <label for="pais">País de operación</label>
                    <input type="text" id="pais" name="pais"
                           value="<?= htmlspecialchars($old['pais'] ?? '') ?>"
                           placeholder="Ej: Colombia, México...">
                </div>
            </div>

            <div class="form-group full-width">
                <label for="descripcion">Descripción breve de la iniciativa <span class="required">*</span></label>
                <textarea id="descripcion" name="descripcion" rows="4"
                          placeholder="Cuéntanos sobre tu modelo de negocio, tracción actual y potencial de crecimiento..."><?= htmlspecialchars($old['descripcion'] ?? '') ?></textarea>
                <?php if (!empty($errores['descripcion'])): ?>
                    <span class="error"><?= htmlspecialchars($errores['descripcion']) ?></span>
                <?php endif; ?>
            </div>

            <div class="form-group full-width checkbox-group">
                <input type="checkbox" id="terminos" name="terminos" <?= isset($old['terminos']) ? 'checked' : '' ?>>
                <label for="terminos">
                    Acepto la <a href="/src/html/politica-privacidad.php">política de privacidad</a> y el tratamiento de mis datos 
                    para fines de evaluación del proyecto.
                </label>
                <?php if (!empty($errores['terminos'])): ?>
                    <span class="error"><?= htmlspecialchars($errores['terminos']) ?></span>
                <?php endif; ?>
            </div>

            <div class="form-actions">
                <button type="submit" class="btn-primary">Enviar postulación</button>
                <span class="form-note">* Campos obligatorios</span>
            </div>

            <div class="contact-alternative">
                <p>
                    ¿Prefieres un contacto directo? Escríbenos usando
                    <span class="email-webmail-options">
                        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=inversiones@pfhghealth.com" 
                           target="_blank" rel="noopener noreferrer" class="email-webmail-link" title="Abrir en Gmail">Gmail</a>
                        <span aria-hidden="true">·</span>
                        <a href="https://outlook.live.com/mail/0/deeplink/compose?to=inversiones@pfhghealth.com" 
                           target="_blank" rel="noopener noreferrer" class="email-webmail-link" title="Abrir en Outlook">Outlook</a>
                        <span aria-hidden="true">·</span>
                        <a href="https://compose.mail.yahoo.com/?to=inversiones@pfhghealth.com" 
                           target="_blank" rel="noopener noreferrer" class="email-webmail-link" title="Abrir en Yahoo Mail">Yahoo</a>
                        <noscript>
                            <a href="mailto:inversiones@pfhghealth.com">inversiones@pfhghealth.com</a>
                        </noscript>
                    </span>
                    o completa el formulario y nuestro equipo de evaluación te contactará en un máximo de 3 días hábiles.
                </p>
            </div>
        </form>
    </div>

    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Sobre nosotros</h3>
                    <p>Nos dedicamos a ayudar a las empresas a alcanzar su máximo potencial a través de soluciones innovadoras y consultoría estratégica.</p>
                    <p style="margin-top: 1rem;">Transformamos capital en poder corporativo con integridad y visión a largo plazo.</p>
                </div>
                <div class="footer-section">
                    <h3>Enlaces Rápidos</h3>
                    <ul>
                        <li><a href="/src/html/index.php">Inicio</a></li>
                        <li><a href="/src/html/Nosotros.php">Sobre nosotros</a></li>
                        <li><a href="/src/html/Lineasnegocio.php">Servicios</a></li>
                        <li><a href="/src/html/Corporativo.php">Corporativo</a></li>
                        <li><a href="/src/html/contacto.php">Contacto</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Servicios</h3>
                    <ul>
                        <li><a href="/src/html/Lineasnegocio.php">Transformación Digital</a></li>
                        <li><a href="/src/html/Lineasnegocio.php">Estrategia de Negocio</a></li>
                        <li><a href="/src/html/Lineasnegocio.php">Desarrollo Corporativo & Fusiones</a></li>
                        <li><a href="/src/html/Lineasnegocio.php">Expansión Internacional & Negocios Globales</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 . P.F.H.G. HEALTH S.S.A. todos los derechos reservados.</p>
            </div>
        </div>
    </footer>
</body>
</html>