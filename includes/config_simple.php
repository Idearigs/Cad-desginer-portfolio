<?php
/**
 * Simple Configuration (Fallback)
 * Basic configuration for troubleshooting
 */

// Disable error output
error_reporting(0);
ini_set('display_errors', 0);

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Site configuration
define('SITE_NAME', 'Digital CAD Atelier');
define('SITE_URL', '/jewellery-designer/cad-art');
define('API_URL', '/jewellery-designer/cad-art/api');
define('UPLOAD_DIR', __DIR__ . '/../uploads');

// Ensure upload directories exist
$uploadDirs = [
    UPLOAD_DIR,
    UPLOAD_DIR . '/articles',
    UPLOAD_DIR . '/events',
    UPLOAD_DIR . '/gallery'
];

foreach ($uploadDirs as $dir) {
    if (!file_exists($dir)) {
        @mkdir($dir, 0755, true);
    }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

/**
 * Require authentication for protected pages
 */
function requireAuth() {
    if (!isAuthenticated()) {
        http_response_code(401);
        header('Content-Type: application/json');
        echo json_encode([
            'status' => 'error',
            'message' => 'Authentication required',
            'data' => null
        ]);
        exit;
    }
}

/**
 * Send JSON response
 */
function jsonResponse($data, $status, $message) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => $status < 400 ? 'success' : 'error',
        'message' => $message,
        'data' => $data
    ]);
    exit;
}