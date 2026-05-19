<?php
session_start();

// --------------- 1. Solo admite POST ---------------
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: contacto.php');
    exit;
}

// --------------- 2. Verificar CSRF ---------------
if (!hash_equals($_SESSION['csrf_token'] ?? '', $_POST['csrf_token'] ?? '')) {
    die('Token de seguridad inválido.');
}

// --------------- 3. Saneamiento ---------------
$nombreProyecto = trim($_POST['nombre_proyecto'] ?? '');
$sector          = $_POST['sector'] ?? '';
$nombreContacto  = trim($_POST['nombre_contacto'] ?? '');
$email           = trim($_POST['email'] ?? '');
$telefono        = trim($_POST['telefono'] ?? '');
$pais            = trim($_POST['pais'] ?? '');
$descripcion     = trim($_POST['descripcion'] ?? '');
$terminos        = isset($_POST['terminos']); // checkbox

// --------------- 4. Validación ---------------
$errores = [];

// Campos obligatorios
if ($nombreProyecto === '') $errores['nombre_proyecto'] = 'El nombre del proyecto es obligatorio.';
if ($sector === '' || !in_array($sector, ['seguridad','tecnologia','apoyo-empresarial','construcciones','salud','agroindustria','medicina-alternativa','transatlantico','hoteleria-turismo','gastronomia','industria','servicios-financieros','otro'])) {
    $errores['sector'] = 'Selecciona un sector válido.';
}
if ($nombreContacto === '') $errores['nombre_contacto'] = 'El nombre del contacto es obligatorio.';
if ($email === '') {
    $errores['email'] = 'El correo electrónico es obligatorio.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errores['email'] = 'El formato del correo no es válido (RFC 5322).';
}
if ($telefono === '') $errores['telefono'] = 'El teléfono es obligatorio.';
if ($descripcion === '') $errores['descripcion'] = 'La descripción breve es obligatoria.';
if (!$terminos) $errores['terminos'] = 'Debes aceptar la política de privacidad.';

// Longitudes máximas (previene abusos)
if (mb_strlen($nombreProyecto) > 150) $errores['nombre_proyecto'] = 'Máximo 150 caracteres.';
if (mb_strlen($nombreContacto) > 100) $errores['nombre_contacto'] = 'Máximo 100 caracteres.';
if (mb_strlen($telefono) > 30) $errores['telefono'] = 'Máximo 30 caracteres.';
if (mb_strlen($descripcion) > 2000) $errores['descripcion'] = 'Máximo 2000 caracteres.';

// --------------- 5. Si hay errores, volver al formulario ---------------
if (!empty($errores)) {
    $_SESSION['errores'] = $errores;
    $_SESSION['old'] = $_POST;               // conserva todos los campos
    header('Location: contacto.php');
    exit;
}

// --------------- 6. Enviar correo de notificación ---------------
$asunto = "Nueva postulación: $nombreProyecto";
$cuerpo = "Se ha recibido una nueva postulación:\n\n"
        . "Proyecto/Empresa: $nombreProyecto\n"
        . "Sector: $sector\n"
        . "Contacto: $nombreContacto\n"
        . "Email: $email\n"
        . "Teléfono: $telefono\n"
        . "País: $pais\n"
        . "Descripción:\n$descripcion\n\n"
        . "Aceptó términos: Sí";

// Cabeceras básicas (en producción usa PHPMailer o similar)
$cabeceras = "From: no-reply@tudominio.com\r\n"
           . "Reply-To: $email\r\n"
           . "Content-type: text/plain; charset=UTF-8";

mail('inversiones@pfhghealth.com', $asunto, $cuerpo, $cabeceras);

// --------------- 7. Redirigir a página de éxito ---------------
header('Location: gracias.php');
exit;