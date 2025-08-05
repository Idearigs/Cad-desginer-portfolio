<?php
/**
 * Database Connection Test
 * Test file to diagnose database connection issues on hosted environment
 * Access via: domain.com/test-db-connection.php
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$results = [
    'timestamp' => date('Y-m-d H:i:s'),
    'server_info' => [],
    'database_tests' => [],
    'php_info' => []
];

// Test 1: Basic PHP and server info
$results['server_info'] = [
    'php_version' => phpversion(),
    'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
    'current_directory' => __DIR__,
    'mysql_extension_loaded' => extension_loaded('mysql'),
    'mysqli_extension_loaded' => extension_loaded('mysqli'),
    'pdo_extension_loaded' => extension_loaded('pdo'),
    'pdo_mysql_available' => extension_loaded('pdo_mysql')
];

// Test 2: Environment file check
$envPath = __DIR__ . '/includes/env.php';
$results['environment'] = [
    'env_file_exists' => file_exists($envPath),
    'includes_directory_exists' => is_dir(__DIR__ . '/includes')
];

// Test 3: Database connection attempts with different configurations
$dbConfigs = [
    // Config 1: Production hosting credentials
    [
        'name' => 'Production Hosting Config',
        'host' => 'server119.web-hosting.com',
        'dbname' => 'chamodio_caddb',
        'username' => 'chamodio_root',
        'password' => '#Chamalcaddb#2025'
    ],
    // Config 2: IP address connection
    [
        'name' => 'Production IP Config',
        'host' => '198.54.116.108',
        'dbname' => 'chamodio_caddb',
        'username' => 'chamodio_root',
        'password' => '#Chamalcaddb#2025'
    ],
    // Config 3: Local dev (fallback)
    [
        'name' => 'Local Development Config',
        'host' => 'localhost',
        'dbname' => 'digital_cad_atelier',
        'username' => 'root',
        'password' => ''
    ]
];

foreach ($dbConfigs as $config) {
    $testResult = [
        'config_name' => $config['name'],
        'host' => $config['host'],
        'database' => $config['dbname'],
        'username' => $config['username'],
        'connection_successful' => false,
        'error_message' => null,
        'tables_found' => []
    ];
    
    try {
        $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8mb4";
        $pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 10
        ]);
        
        $testResult['connection_successful'] = true;
        
        // Test if we can query tables
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $testResult['tables_found'] = $tables;
        
        // Check if users table exists and has data
        if (in_array('users', $tables)) {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
            $count = $stmt->fetch();
            $testResult['users_table_count'] = $count['count'];
            
            // Get sample user (without password)
            $stmt = $pdo->query("SELECT id, username, email, role FROM users LIMIT 1");
            $sampleUser = $stmt->fetch();
            $testResult['sample_user'] = $sampleUser;
        }
        
    } catch (PDOException $e) {
        $testResult['error_message'] = $e->getMessage();
        $testResult['error_code'] = $e->getCode();
    }
    
    $results['database_tests'][] = $testResult;
}

// Test 4: File permissions and directory structure
$results['file_system'] = [
    'api_directory_exists' => is_dir(__DIR__ . '/api'),
    'api_auth_directory_exists' => is_dir(__DIR__ . '/api/auth'),
    'login_php_exists' => file_exists(__DIR__ . '/api/auth/login.php'),
    'includes_readable' => is_readable(__DIR__ . '/includes'),
    'logs_directory_exists' => is_dir(__DIR__ . '/logs'),
    'logs_directory_writable' => is_writable(__DIR__ . '/logs'),
    'uploads_directory_exists' => is_dir(__DIR__ . '/uploads'),
    'uploads_directory_writable' => is_writable(__DIR__ . '/uploads')
];

// Test 5: Session functionality
session_start();
$results['session_test'] = [
    'session_started' => session_status() === PHP_SESSION_ACTIVE,
    'session_id' => session_id(),
    'session_save_path' => session_save_path(),
    'session_cookie_params' => session_get_cookie_params()
];

// Output results
echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>