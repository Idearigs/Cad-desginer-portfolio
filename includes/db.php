<?php
/**
 * Database connection file for Digital CAD Atelier
 */

// Database configuration
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
    // Log error and display friendly message
    error_log("Database connection failed: " . $e->getMessage());
    die("Sorry, there was a problem connecting to the database. Please try again later.");
}
