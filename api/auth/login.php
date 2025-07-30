<?php
/**
 * Enhanced Login API v1
 * 
 * Handles user authentication with enterprise-grade security
 */

// Set JSON header immediately to prevent HTML output
header('Content-Type: application/json');

// Disable error output completely
error_reporting(0);
ini_set('display_errors', 0);

// Include enhanced configuration - fallback to simple if issues
try {
    require_once '../../includes/config.php';
    require_once '../../includes/db.php';
} catch (Exception $e) {
    require_once '../../includes/config_simple.php';
    require_once '../../includes/db_simple.php';
}

// Start request timing
$startTime = microtime(true);

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Logger::security("Invalid login method attempted", [
        'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ]);
    jsonResponse(null, 405, 'Method Not Allowed');
}

// Apply aggressive rate limiting for login attempts
if (!RateLimiter::checkLimit(null, 5, 900)) { // 5 attempts per 15 minutes
    Logger::security("Login rate limit exceeded", [
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ]);
    jsonResponse(null, 429, 'Too many login attempts. Please try again later.');
}

// Validate input
$validator = Validator::make($_POST)
    ->required('username', 'Username is required')
    ->required('password', 'Password is required')
    ->length('username', 3, 50, 'Username must be between 3 and 50 characters')
    ->length('password', 6, 100, 'Password must be between 6 and 100 characters')
    ->sanitize('username', 'string');

if ($validator->fails()) {
    Logger::security("Login validation failed", [
        'errors' => $validator->errors(),
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
    ]);
    jsonResponse(null, 400, $validator->firstError());
}

$data = $validator->validated();
$username = $data['username'];
$password = $data['password'];

try {
    // Check if user exists with prepared statement
    $stmt = $pdo->prepare("SELECT id, username, password, email, role, failed_attempts, locked_until FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    // Check if user exists
    if (!$user) {
        // Log failed login attempt (user not found)
        Logger::security("Login attempt for non-existent user", [
            'username' => $username,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
        
        // Insert failed attempt record
        $stmt = $pdo->prepare("INSERT INTO login_attempts (username, ip_address, success, created_at) VALUES (?, ?, 0, NOW())");
        $stmt->execute([$username, $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
        
        // Use timing attack protection - same delay as successful login
        usleep(250000); // 250ms delay
        jsonResponse(null, 401, 'Invalid credentials');
    }
    
    // Check if account is locked
    if ($user['locked_until'] && strtotime($user['locked_until']) > time()) {
        Logger::security("Login attempt on locked account", [
            'user_id' => $user['id'],
            'username' => $username,
            'locked_until' => $user['locked_until']
        ]);
        jsonResponse(null, 423, 'Account is temporarily locked. Please try again later.');
    }
    
    // Verify password
    if (password_verify($password, $user['password'])) {
        // Successful login - reset failed attempts
        $stmt = $pdo->prepare("UPDATE users SET failed_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = ?");
        $stmt->execute([$user['id']]);
        
        // Enhanced session setup
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Set secure session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $_SESSION['ip_address'] = $_SERVER['REMOTE_ADDR'] ?? '';
        
        // Log successful login
        Logger::security("Successful login", [
            'user_id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ]);
        
        $stmt = $pdo->prepare("INSERT INTO login_attempts (username, ip_address, success, user_id, created_at) VALUES (?, ?, 1, ?, NOW())");
        $stmt->execute([$username, $_SERVER['REMOTE_ADDR'] ?? 'unknown', $user['id']]);
        
        // Generate CSRF token for future requests
        $csrfToken = CSRFProtection::generateToken();
        
        // Return success response with user data and CSRF token
        jsonResponse([
            'user' => [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
                'email' => $user['email']
            ],
            'csrf_token' => $csrfToken,
            'session_lifetime' => EnvLoader::get('SESSION_LIFETIME', 3600)
        ], 200, 'Login successful');
    } else {
        // Failed login - increment failed attempts
        $failedAttempts = ($user['failed_attempts'] ?? 0) + 1;
        $lockUntil = null;
        
        // Lock account after 5 failed attempts for 15 minutes
        if ($failedAttempts >= 5) {
            $lockUntil = date('Y-m-d H:i:s', time() + 900); // 15 minutes
            Logger::security("Account locked due to repeated failed login attempts", [
                'user_id' => $user['id'],
                'username' => $username,
                'failed_attempts' => $failedAttempts
            ]);
        }
        
        // Update failed attempts counter
        $stmt = $pdo->prepare("UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?");
        $stmt->execute([$failedAttempts, $lockUntil, $user['id']]);
        
        // Log failed login attempt
        Logger::security("Failed login attempt", [
            'user_id' => $user['id'],
            'username' => $username,
            'failed_attempts' => $failedAttempts,
            'locked' => ($lockUntil !== null)
        ]);
        
        $stmt = $pdo->prepare("INSERT INTO login_attempts (username, ip_address, success, user_id, created_at) VALUES (?, ?, 0, ?, NOW())");
        $stmt->execute([$username, $_SERVER['REMOTE_ADDR'] ?? 'unknown', $user['id']]);
        
        // Timing attack protection
        usleep(250000); // 250ms delay
        
        if ($lockUntil) {
            jsonResponse(null, 423, 'Account locked due to too many failed attempts. Please try again later.');
        } else {
            jsonResponse(null, 401, 'Invalid credentials');
        }
    }
} catch (PDOException $e) {
    Logger::error("Database error during login", [
        'error' => $e->getMessage(),
        'username' => $username
    ]);
    jsonResponse(null, 500, 'An error occurred during login');
}

// Log performance metrics
$endTime = microtime(true);
$duration = round(($endTime - $startTime) * 1000, 2);

Logger::info("Login API request completed", [
    'duration_ms' => $duration,
    'memory_peak' => memory_get_peak_usage(true)
]);

// Using jsonResponse function from config.php
