<?php
/**
 * Clean Configuration - No Dependencies
 */

// Prevent output
ob_start();

// Disable errors
error_reporting(0);
ini_set('display_errors', 0);

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Clean output
ob_end_clean();

/**
 * Check authentication
 */
function isAuthenticatedClean() {
    return isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true;
}

/**
 * Require authentication
 */
function requireAuthClean() {
    if (!isAuthenticatedClean()) {
        header('Content-Type: application/json');
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Authentication required']);
        exit;
    }
}

/**
 * JSON response
 */
function jsonResponseClean($data, $status, $message) {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode([
        'status' => $status < 400 ? 'success' : 'error',
        'message' => $message,
        'data' => $data
    ]);
    exit;
}
?>