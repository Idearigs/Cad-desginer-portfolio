<?php
/**
 * Test Hosting Database Connection
 * Simple test to verify hosting database credentials work
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Your hosting database credentials
    $host = 'server119.web-hosting.com';
    $dbname = 'chamodio_caddb';
    $username = 'chamodio_root';
    $password = '#Chamalcaddb#2025';
    
    // Test connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 30
    ]);
    
    // Test query
    $result = $pdo->query('SELECT 1 as test')->fetch();
    
    // Check tables
    $tables = [];
    $tableQuery = $pdo->query("SHOW TABLES");
    while ($table = $tableQuery->fetch(PDO::FETCH_NUM)) {
        $tableName = $table[0];
        $countQuery = $pdo->query("SELECT COUNT(*) as count FROM `$tableName`");
        $count = $countQuery->fetch()['count'];
        $tables[$tableName] = $count;
    }
    
    // Success response
    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful',
        'data' => [
            'host' => $host,
            'database' => $dbname,
            'user' => $username,
            'connection_test' => $result,
            'tables' => $tables,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    // Error response
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => $e->getMessage(),
        'credentials_used' => [
            'host' => $host ?? 'not-set',
            'database' => $dbname ?? 'not-set',
            'user' => $username ?? 'not-set'
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_PRETTY_PRINT);
}
?>