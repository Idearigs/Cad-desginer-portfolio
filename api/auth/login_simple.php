<?php
/**
 * Simple Login API for Testing
 */

// Disable error output completely
error_reporting(0);
ini_set('display_errors', 0);

// Include simple configuration
require_once '../../includes/config_simple.php';
require_once '../../includes/db_simple.php';

// Set JSON header immediately
header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method Not Allowed',
        'data' => null
    ]);
    exit;
}

// Get username and password from request
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// Basic validation
if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Username and password are required',
        'data' => null
    ]);
    exit;
}

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id, username, password, email, role FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    // Verify user and password
    if ($user && password_verify($password, $user['password'])) {
        // Set session variables
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['logged_in'] = true;
        $_SESSION['login_time'] = time();
        
        // Return success response
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Login successful',
            'data' => [
                'user_id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
                'csrf_token' => 'test-token' // Simple token for testing
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid username or password',
            'data' => null
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred during login',
        'data' => null
    ]);
}