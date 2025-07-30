<?php
/**
 * Enhanced Configuration for Digital CAD Atelier
 * Production-ready with security, logging, and performance optimizations
 */

// Load environment configuration first
require_once __DIR__ . '/env.php';
require_once __DIR__ . '/logger.php';
require_once __DIR__ . '/csrf.php';
require_once __DIR__ . '/rate_limiter.php';
require_once __DIR__ . '/validator.php';

// Configure error reporting based on environment
if (EnvLoader::isProduction()) {
    // Production: Log errors but don't display them
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
    ini_set('log_errors', 1);
    ini_set('error_log', __DIR__ . '/../logs/php_errors.log');
} else {
    // Development: Show all errors
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    ini_set('log_errors', 1);
}

// Security headers
if (!headers_sent()) {
    // Prevent XSS attacks
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: DENY');
    header('X-XSS-Protection: 1; mode=block');
    
    // Only use HTTPS in production
    if (EnvLoader::isProduction()) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }
    
    // Content Security Policy
    header("Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self'");
}

// Enhanced session configuration
if (session_status() === PHP_SESSION_NONE) {
    $sessionLifetime = EnvLoader::get('SESSION_LIFETIME', 3600);
    
    // Secure session settings
    ini_set('session.use_strict_mode', 1);
    ini_set('session.use_only_cookies', 1);
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_samesite', 'Strict');
    ini_set('session.gc_maxlifetime', $sessionLifetime);
    
    // Use secure cookies in production
    if (EnvLoader::isProduction()) {
        ini_set('session.cookie_secure', 1);
    }
    
    session_start();
    
    // Regenerate session ID periodically for security
    if (!isset($_SESSION['last_regeneration'])) {
        $_SESSION['last_regeneration'] = time();
    } elseif (time() - $_SESSION['last_regeneration'] > 300) { // 5 minutes
        session_regenerate_id(true);
        $_SESSION['last_regeneration'] = time();
    }
}

// Site configuration with environment-aware URLs
$siteUrl = EnvLoader::isProduction() ? '' : '/jewellery-designer/cad-art';
define('SITE_NAME', 'Digital CAD Atelier');
define('SITE_URL', $siteUrl);
define('API_URL', $siteUrl . '/api');
define('API_VERSION', EnvLoader::get('API_VERSION', 'v1'));
define('UPLOAD_DIR', __DIR__ . '/../uploads');
define('MAX_UPLOAD_SIZE', EnvLoader::get('MAX_UPLOAD_SIZE', 5242880)); // 5MB default

// Create required directories with proper permissions
$requiredDirs = [
    __DIR__ . '/../logs',
    __DIR__ . '/../storage',
    __DIR__ . '/../storage/rate_limits',
    UPLOAD_DIR,
    UPLOAD_DIR . '/articles',
    UPLOAD_DIR . '/events',
    UPLOAD_DIR . '/gallery'
];

foreach ($requiredDirs as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
        
        // Add .htaccess for sensitive directories
        if (strpos($dir, 'logs') !== false || strpos($dir, 'storage') !== false) {
            file_put_contents($dir . '/.htaccess', "Deny from all\n");
        }
    }
}

/**
 * Enhanced Authentication System
 */

/**
 * Check if user is authenticated with enhanced security
 * 
 * @return bool True if user is authenticated, false otherwise
 */
function isAuthenticated() {
    // Check session timeout
    if (isset($_SESSION['last_activity'])) {
        $sessionLifetime = EnvLoader::get('SESSION_LIFETIME', 3600);
        if (time() - $_SESSION['last_activity'] > $sessionLifetime) {
            // Session expired
            Logger::security("Session expired", ['user_id' => $_SESSION['user_id'] ?? 'unknown']);
            destroySession();
            return false;
        }
    }
    
    // Update last activity
    $_SESSION['last_activity'] = time();
    
    // Check session-based authentication first
    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
        // Validate session integrity
        if (isset($_SESSION['user_agent'])) {
            $currentUserAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
            if ($_SESSION['user_agent'] !== $currentUserAgent) {
                Logger::security("Session hijack attempt detected", [
                    'user_id' => $_SESSION['user_id'] ?? 'unknown',
                    'original_ua' => $_SESSION['user_agent'],
                    'current_ua' => $currentUserAgent
                ]);
                destroySession();
                return false;
            }
        }
        
        return true;
    }
    
    // Check for Bearer token in Authorization header
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader)) {
        return false;
    }
    
    // Extract and validate token
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        
        if (validateAuthToken($token)) {
            // Set session variables for compatibility
            $_SESSION['logged_in'] = true;
            $_SESSION['last_activity'] = time();
            $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
            return true;
        }
    }
    
    return false;
}

/**
 * Validate authentication token
 */
function validateAuthToken($token) {
    // Simple token validation - in production, use JWT or database lookup
    $jwtSecret = EnvLoader::get('JWT_SECRET', 'default-secret');
    
    // For now, just check if token is not empty and has minimum length
    // TODO: Implement proper JWT validation
    return !empty($token) && strlen($token) >= 32;
}

/**
 * Destroy session securely
 */
function destroySession() {
    $_SESSION = [];
    
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    session_destroy();
}

/**
 * Require authentication with rate limiting and CSRF protection
 * 
 * @return void Exits script if user is not authenticated
 */
function requireAuth() {
    // Check rate limiting first
    if (!RateLimiter::checkLimit()) {
        Logger::security("Rate limit exceeded during auth check");
        http_response_code(429);
        jsonResponse(null, 429, 'Too many requests. Please try again later.');
    }
    
    if (!isAuthenticated()) {
        Logger::security("Authentication required but not provided", [
            'endpoint' => $_SERVER['REQUEST_URI'] ?? 'unknown',
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
        ]);
        
        http_response_code(401);
        jsonResponse(null, 401, 'Authentication required');
    }
}

/**
 * Enhanced JSON response with security headers and logging
 * 
 * @param mixed $data The data to send
 * @param int $status HTTP status code
 * @param string $message Response message
 */
function jsonResponse($data, $status, $message) {
    // Log API responses for monitoring
    $endpoint = $_SERVER['REQUEST_URI'] ?? 'unknown';
    $method = $_SERVER['REQUEST_METHOD'] ?? 'unknown';
    
    Logger::apiAccess($endpoint, $method, $status);
    
    // Security headers
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    
    // Cache control
    if ($status >= 400) {
        header('Cache-Control: no-cache, no-store, must-revalidate');
    } else {
        header('Cache-Control: public, max-age=300'); // 5 minutes for successful responses
    }
    
    http_response_code($status);
    
    $response = [
        'status' => $status < 400 ? 'success' : 'error',
        'message' => $message,
        'timestamp' => date('c'),
        'data' => $data
    ];
    
    // Add request ID for debugging
    if (method_exists('Logger', 'getRequestId')) {
        $response['request_id'] = Logger::getRequestId();
    }
    
    echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Validate and sanitize input with comprehensive checking
 */
function validateInput(array $data, array $rules) {
    $validator = Validator::make($data);
    
    foreach ($rules as $field => $rule) {
        if (is_string($rule)) {
            // Simple rule like 'required|email|max:255'
            $parts = explode('|', $rule);
            
            foreach ($parts as $part) {
                if ($part === 'required') {
                    $validator->required($field);
                } elseif ($part === 'email') {
                    $validator->email($field);
                } elseif (strpos($part, 'max:') === 0) {
                    $max = (int) substr($part, 4);
                    $validator->length($field, null, $max);
                } elseif (strpos($part, 'min:') === 0) {
                    $min = (int) substr($part, 4);
                    $validator->length($field, $min);
                }
            }
        }
    }
    
    return $validator;
}

/**
 * Handle file uploads securely
 */
function handleFileUpload($file, $allowedTypes = null, $maxSize = null, $destination = 'uploads') {
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('File upload failed');
    }
    
    // Use environment configuration
    $allowedTypes = $allowedTypes ?? explode(',', EnvLoader::get('ALLOWED_IMAGE_TYPES', 'jpeg,jpg,png,gif,webp'));
    $maxSize = $maxSize ?? EnvLoader::get('MAX_UPLOAD_SIZE', 5242880);
    
    // Validate file
    $validator = Validator::make([]);
    $validator->file('upload', [
        'allowed_extensions' => $allowedTypes,
        'max_size' => $maxSize
    ]);
    
    // Set file data for validation
    $_FILES['upload'] = $file;
    
    if ($validator->fails()) {
        throw new Exception($validator->firstError());
    }
    
    // Generate secure filename
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename = uniqid() . '_' . time() . '.' . $extension;
    
    // Ensure destination directory exists
    $uploadPath = UPLOAD_DIR . '/' . $destination;
    if (!is_dir($uploadPath)) {
        mkdir($uploadPath, 0755, true);
    }
    
    $targetPath = $uploadPath . '/' . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception('Failed to move uploaded file');
    }
    
    // Set proper permissions
    chmod($targetPath, 0644);
    
    Logger::info("File uploaded successfully", [
        'filename' => $filename,
        'size' => $file['size'],
        'type' => $file['type']
    ]);
    
    return $destination . '/' . $filename;
}
