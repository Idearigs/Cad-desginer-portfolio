<?php
/**
 * Configuration file for Digital CAD Atelier
 */

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
        mkdir($dir, 0755, true);
    }
}

/**
 * Check if user is authenticated
 * 
 * @return bool True if user is authenticated, false otherwise
 */
function isAuthenticated() {
    // Check session-based authentication first
    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
        return true;
    }
    
    // Check for Bearer token in Authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader)) {
        return false;
    }
    
    // Extract the token
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        
        // For simplicity, we'll just check if the token exists
        // In a real application, you would validate the token against a database
        // or use JWT verification
        if (!empty($token)) {
            // Set session variables to maintain compatibility with existing code
            $_SESSION['logged_in'] = true;
            return true;
        }
    }
    
    return false;
}

/**
 * Require authentication for protected pages
 * 
 * @return void Exits script if user is not authenticated
 */
function requireAuth() {
    if (!isAuthenticated()) {
        header('Content-Type: application/json');
        http_response_code(401);
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
 * 
 * @param mixed $data The data to send
 * @param int $status HTTP status code
 * @param string $message Response message
 */
function jsonResponse($data, $status, $message) {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode([
        'status' => $status < 400 ? 'success' : 'error',
        'message' => $message,
        'data' => $data
    ]);
    exit;
}
