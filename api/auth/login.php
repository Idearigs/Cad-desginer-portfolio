<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * Simplified Login API
 * 
 * Handles user authentication with basic security
 */

// Include required files
require_once '../../includes/config.php';
require_once '../../includes/db.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(null, 405, 'Method Not Allowed');
    exit;
}

// Get username and password from request
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// Basic validation
if (empty($username) || empty($password)) {
    jsonResponse(null, 400, 'Username and password are required');
    exit;
}

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, username, password, email, role FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    // Verify user and password
    if ($user && password_verify($password, $user['password'])) {
        // Start session if not already started
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();
        
        // Log successful login
        $stmt = $pdo->prepare("INSERT INTO login_attempts (username, ip_address, success) VALUES (?, ?, 1)");
        $stmt->execute([$username, $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
        
        // Return success response
        jsonResponse([
            'user_id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ], 200, 'Login successful');
    } else {
        // Log failed login attempt
        $stmt = $pdo->prepare("INSERT INTO login_attempts (username, ip_address, success) VALUES (?, ?, 0)");
        $stmt->execute([$username, $_SERVER['REMOTE_ADDR'] ?? 'unknown']);
        
        jsonResponse(null, 401, 'Invalid username or password');
    }
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    jsonResponse(null, 500, 'An error occurred during login');
}

// Using jsonResponse function from config.php
