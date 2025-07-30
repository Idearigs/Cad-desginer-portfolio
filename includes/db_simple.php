<?php
/**
 * Simple Database Connection (Fallback)
 * Basic connection for troubleshooting
 */

// Disable error output
error_reporting(0);
ini_set('display_errors', 0);

// Simple database configuration
$db_host = 'localhost';
$db_name = 'digital_cad_atelier';
$db_user = 'root';
$db_pass = '';

// PDO connection options
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false
];

// Create PDO instance
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, $options);
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'data' => null
    ]);
    exit;
}