<?php
/**
 * Simple API Debug Tool
 * Tests API endpoints and shows detailed error information
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

function debugResponse($data, $status = 200, $message = '') {
    http_response_code($status);
    echo json_encode([
        'status' => $status < 400 ? 'success' : 'error',
        'message' => $message,
        'data' => $data,
        'debug_info' => [
            'timestamp' => date('Y-m-d H:i:s'),
            'php_version' => phpversion(),
            'memory_usage' => memory_get_usage(true),
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'
        ]
    ], JSON_PRETTY_PRINT);
    exit;
}

try {
    $endpoint = $_GET['test'] ?? 'info';
    
    switch ($endpoint) {
        case 'info':
            debugResponse([
                'server_info' => [
                    'php_version' => phpversion(),
                    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
                    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
                    'script_name' => $_SERVER['SCRIPT_NAME'] ?? 'Unknown',
                    'http_host' => $_SERVER['HTTP_HOST'] ?? 'Unknown',
                ],
                'extensions' => [
                    'pdo' => extension_loaded('pdo'),
                    'pdo_mysql' => extension_loaded('pdo_mysql'),
                    'json' => extension_loaded('json'),
                    'curl' => extension_loaded('curl'),
                    'mbstring' => extension_loaded('mbstring'),
                    'openssl' => extension_loaded('openssl')
                ],
                'file_checks' => [
                    'env_file' => file_exists(__DIR__ . '/.env'),
                    'config_file' => file_exists(__DIR__ . '/includes/config.php'),
                    'env_loader' => file_exists(__DIR__ . '/includes/env.php'),
                    'news_api' => file_exists(__DIR__ . '/api/news/index.php'),
                    'login_api' => file_exists(__DIR__ . '/api/auth/login.php')
                ]
            ], 200, 'System information retrieved');
            break;
            
        case 'db':
            // Test database connection
            $connectionAttempts = [];
            
            // Method 1: Try with env loader
            try {
                require_once __DIR__ . '/includes/env.php';
                $host = EnvLoader::get('DB_HOST', 'localhost');
                $dbname = EnvLoader::get('DB_NAME', 'digital_cad_atelier');
                $username = EnvLoader::get('DB_USER', 'root');
                $password = EnvLoader::get('DB_PASS', '');
                
                $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_TIMEOUT => 10
                ]);
                
                $connectionAttempts['env_config'] = [
                    'status' => 'success',
                    'host' => $host,
                    'dbname' => $dbname,
                    'username' => $username,
                    'connection_test' => $pdo->query('SELECT 1')->fetchColumn() === 1
                ];
                
            } catch (Exception $e) {
                $connectionAttempts['env_config'] = [
                    'status' => 'failed',
                    'error' => $e->getMessage()
                ];
            }
            
            // Method 2: Try with hardcoded localhost
            try {
                $pdo2 = new PDO("mysql:host=localhost;dbname=digital_cad_atelier;charset=utf8mb4", "root", "", [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_TIMEOUT => 10
                ]);
                
                $connectionAttempts['localhost_root'] = [
                    'status' => 'success',
                    'connection_test' => $pdo2->query('SELECT 1')->fetchColumn() === 1
                ];
                
            } catch (Exception $e) {
                $connectionAttempts['localhost_root'] = [
                    'status' => 'failed',
                    'error' => $e->getMessage()
                ];
            }
            
            debugResponse($connectionAttempts, 200, 'Database connection tests completed');
            break;
            
        case 'news':
            // Test news API directly
            $newsFile = __DIR__ . '/api/news/index.php';
            if (!file_exists($newsFile)) {
                debugResponse(null, 404, 'News API file not found');
            }
            
            // Capture output from news API
            ob_start();
            $error = null;
            try {
                // Set up environment for the API call
                $_SERVER['REQUEST_METHOD'] = 'GET';
                include $newsFile;
            } catch (Exception $e) {
                $error = $e->getMessage();
            } catch (Throwable $t) {
                $error = $t->getMessage();
            }
            $output = ob_get_clean();
            
            debugResponse([
                'api_file' => $newsFile,
                'file_exists' => file_exists($newsFile),
                'file_readable' => is_readable($newsFile),
                'file_size' => filesize($newsFile),
                'output' => $output,
                'error' => $error
            ], $error ? 500 : 200, $error ? 'News API test failed' : 'News API test completed');
            break;
            
        case 'login':
            // Test login API
            $loginFile = __DIR__ . '/api/auth/login.php';
            if (!file_exists($loginFile)) {
                debugResponse(null, 404, 'Login API file not found');
            }
            
            debugResponse([
                'api_file' => $loginFile,
                'file_exists' => file_exists($loginFile),
                'file_readable' => is_readable($loginFile),
                'file_size' => filesize($loginFile),
                'request_method' => $_SERVER['REQUEST_METHOD'],
                'post_data' => $_POST
            ], 200, 'Login API file check completed');
            break;
            
        default:
            debugResponse([
                'available_tests' => [
                    'info' => 'System information',
                    'db' => 'Database connection test',
                    'news' => 'News API test',
                    'login' => 'Login API test'
                ],
                'usage' => 'Add ?test=<test_name> to URL'
            ], 200, 'API Debug Tool');
    }
    
} catch (Exception $e) {
    debugResponse([
        'exception' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ], 500, 'Debug tool error');
} catch (Throwable $t) {
    debugResponse([
        'error' => $t->getMessage(),
        'file' => $t->getFile(),
        'line' => $t->getLine()
    ], 500, 'Fatal error in debug tool');
}
?>