<?php
/**
 * Comprehensive Hosting Debug Tool
 * Tests all critical system components to identify hosting issues
 */

// Start output buffering to control output
ob_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hosting Debug Tool - Digital CAD Atelier</title>
    <style>
        body { font-family: monospace; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background: #d4edda; border-color: #c3e6cb; color: #155724; }
        .error { background: #f8d7da; border-color: #f5c6cb; color: #721c24; }
        .warning { background: #fff3cd; border-color: #ffeaa7; color: #856404; }
        .info { background: #d1ecf1; border-color: #bee5eb; color: #0c5460; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
        .btn { padding: 8px 16px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; text-decoration: none; display: inline-block; }
        .btn-primary { background: #007bff; color: white; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-success { background: #28a745; color: white; }
        h1, h2 { color: #333; }
        .status { font-weight: bold; padding: 2px 8px; border-radius: 3px; }
        .status.pass { background: #28a745; color: white; }
        .status.fail { background: #dc3545; color: white; }
        .status.warn { background: #ffc107; color: #212529; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Hosting Debug Tool</h1>
        <p>This tool will test all critical system components to identify hosting issues.</p>
        
        <?php
        $testResults = [];
        
        // Test 1: PHP Environment
        echo '<div class="test-section">';
        echo '<h2>1. PHP Environment</h2>';
        
        $phpVersion = phpversion();
        $requiredVersion = '7.4';
        $phpOk = version_compare($phpVersion, $requiredVersion, '>=');
        
        echo '<p><strong>PHP Version:</strong> ' . $phpVersion . ' ';
        echo '<span class="status ' . ($phpOk ? 'pass' : 'fail') . '">' . ($phpOk ? 'PASS' : 'FAIL') . '</span></p>';
        
        $requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'curl', 'mbstring', 'openssl'];
        $missingExtensions = [];
        
        foreach ($requiredExtensions as $ext) {
            if (!extension_loaded($ext)) {
                $missingExtensions[] = $ext;
            }
        }
        
        if (empty($missingExtensions)) {
            echo '<p><strong>Required Extensions:</strong> <span class="status pass">ALL LOADED</span></p>';
        } else {
            echo '<p><strong>Missing Extensions:</strong> <span class="status fail">' . implode(', ', $missingExtensions) . '</span></p>';
        }
        
        echo '<p><strong>Error Reporting:</strong> ' . (error_reporting() ? 'Enabled' : 'Disabled') . '</p>';
        echo '<p><strong>Display Errors:</strong> ' . (ini_get('display_errors') ? 'On' : 'Off') . '</p>';
        echo '<p><strong>Log Errors:</strong> ' . (ini_get('log_errors') ? 'On' : 'Off') . '</p>';
        echo '<p><strong>Error Log:</strong> ' . (ini_get('error_log') ?: 'Default') . '</p>';
        echo '</div>';
        
        // Test 2: File System Permissions
        echo '<div class="test-section">';
        echo '<h2>2. File System Permissions</h2>';
        
        $directories = [
            __DIR__ . '/logs' => 'Logs Directory',
            __DIR__ . '/uploads' => 'Uploads Directory', 
            __DIR__ . '/storage' => 'Storage Directory',
            __DIR__ . '/api' => 'API Directory',
            __DIR__ . '/includes' => 'Includes Directory'
        ];
        
        foreach ($directories as $dir => $name) {
            if (file_exists($dir)) {
                $writable = is_writable($dir);
                $readable = is_readable($dir);
                $perms = substr(sprintf('%o', fileperms($dir)), -4);
                
                echo '<p><strong>' . $name . ':</strong> ';
                echo 'Readable: ' . ($readable ? '✓' : '✗') . ' | ';
                echo 'Writable: ' . ($writable ? '✓' : '✗') . ' | ';
                echo 'Permissions: ' . $perms . ' ';
                
                if ($readable && $writable) {
                    echo '<span class="status pass">OK</span>';
                } else {
                    echo '<span class="status fail">ISSUE</span>';
                }
                echo '</p>';
            } else {
                echo '<p><strong>' . $name . ':</strong> <span class="status fail">NOT FOUND</span></p>';
            }
        }
        echo '</div>';
        
        // Test 3: Environment Configuration
        echo '<div class="test-section">';
        echo '<h2>3. Environment Configuration</h2>';
        
        $envFile = __DIR__ . '/.env';
        if (file_exists($envFile)) {
            echo '<p><strong>.env file:</strong> <span class="status pass">EXISTS</span></p>';
            
            try {
                require_once __DIR__ . '/includes/env.php';
                echo '<p><strong>EnvLoader:</strong> <span class="status pass">LOADED</span></p>';
                
                $dbHost = EnvLoader::get('DB_HOST', 'not-set');
                $dbName = EnvLoader::get('DB_NAME', 'not-set');
                $dbUser = EnvLoader::get('DB_USER', 'not-set');
                $appEnv = EnvLoader::get('APP_ENV', 'not-set');
                
                echo '<p><strong>DB_HOST:</strong> ' . ($dbHost !== 'not-set' ? $dbHost : '<span class="status warn">NOT SET</span>') . '</p>';
                echo '<p><strong>DB_NAME:</strong> ' . ($dbName !== 'not-set' ? $dbName : '<span class="status warn">NOT SET</span>') . '</p>';
                echo '<p><strong>DB_USER:</strong> ' . ($dbUser !== 'not-set' ? $dbUser : '<span class="status warn">NOT SET</span>') . '</p>';
                echo '<p><strong>APP_ENV:</strong> ' . ($appEnv !== 'not-set' ? $appEnv : '<span class="status warn">NOT SET</span>') . '</p>';
                
            } catch (Exception $e) {
                echo '<p><strong>EnvLoader Error:</strong> <span class="status fail">' . htmlspecialchars($e->getMessage()) . '</span></p>';
            }
        } else {
            echo '<p><strong>.env file:</strong> <span class="status fail">MISSING</span></p>';
            echo '<p class="warning">Create .env file with database configuration</p>';
        }
        echo '</div>';
        
        // Test 4: Database Connection
        echo '<div class="test-section">';
        echo '<h2>4. Database Connection</h2>';
        
        try {
            // Try different connection methods
            $connectionMethods = [
                'env_config' => function() {
                    require_once __DIR__ . '/includes/env.php';
                    $host = EnvLoader::get('DB_HOST', 'localhost');
                    $dbname = EnvLoader::get('DB_NAME', 'digital_cad_atelier');
                    $username = EnvLoader::get('DB_USER', 'root');
                    $password = EnvLoader::get('DB_PASS', '');
                    return new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_TIMEOUT => 10
                    ]);
                },
                'hardcoded_localhost' => function() {
                    return new PDO("mysql:host=localhost;dbname=digital_cad_atelier;charset=utf8mb4", "root", "", [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_TIMEOUT => 10
                    ]);
                },
                'cpanel_standard' => function() {
                    // Common cPanel hosting setup
                    $host = 'localhost';
                    $dbname = 'digital_cad_atelier';
                    $username = $_SERVER['USER'] ?? 'root'; // Often matches hosting username
                    $password = '';
                    return new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_TIMEOUT => 10
                    ]);
                }
            ];
            
            $connectionSuccess = false;
            $workingConnection = null;
            
            foreach ($connectionMethods as $method => $connectionFunc) {
                try {
                    echo '<p><strong>Testing ' . $method . ':</strong> ';
                    $pdo = $connectionFunc();
                    $pdo->query('SELECT 1');
                    echo '<span class="status pass">SUCCESS</span></p>';
                    $connectionSuccess = true;
                    $workingConnection = $pdo;
                    break;
                } catch (Exception $e) {
                    echo '<span class="status fail">FAILED - ' . htmlspecialchars($e->getMessage()) . '</span></p>';
                }
            }
            
            if ($connectionSuccess && $workingConnection) {
                // Test database tables
                echo '<h3>Database Tables:</h3>';
                $tables = ['users', 'articles', 'events', 'gallery'];
                
                foreach ($tables as $table) {
                    try {
                        $stmt = $workingConnection->query("SHOW TABLES LIKE '$table'");
                        $exists = $stmt->rowCount() > 0;
                        echo '<p><strong>' . $table . ' table:</strong> ';
                        
                        if ($exists) {
                            $count = $workingConnection->query("SELECT COUNT(*) FROM $table")->fetchColumn();
                            echo '<span class="status pass">EXISTS (' . $count . ' records)</span>';
                        } else {
                            echo '<span class="status fail">MISSING</span>';
                        }
                        echo '</p>';
                    } catch (Exception $e) {
                        echo '<p><strong>' . $table . ' table:</strong> <span class="status fail">ERROR - ' . htmlspecialchars($e->getMessage()) . '</span></p>';
                    }
                }
            }
            
        } catch (Exception $e) {
            echo '<p><strong>Database Connection:</strong> <span class="status fail">FAILED - ' . htmlspecialchars($e->getMessage()) . '</span></p>';
        }
        echo '</div>';
        
        // Test 5: API Endpoints Internal Test
        echo '<div class="test-section">';
        echo '<h2>5. API Endpoints (Internal Test)</h2>';
        
        $apiTests = [
            'news/index.php' => 'News API',
            'auth/login.php' => 'Login API',
            'events/index.php' => 'Events API',
            'gallery/index.php' => 'Gallery API'
        ];
        
        foreach ($apiTests as $endpoint => $name) {
            $apiFile = __DIR__ . '/api/' . $endpoint;
            echo '<p><strong>' . $name . ':</strong> ';
            
            if (file_exists($apiFile)) {
                echo 'File exists ✓ | ';
                echo 'Readable: ' . (is_readable($apiFile) ? '✓' : '✗') . ' | ';
                echo 'Size: ' . filesize($apiFile) . ' bytes ';
                echo '<span class="status pass">OK</span>';
            } else {
                echo '<span class="status fail">FILE NOT FOUND</span>';
            }
            echo '</p>';
        }
        echo '</div>';
        
        // Test 6: Server Configuration
        echo '<div class="test-section">';
        echo '<h2>6. Server Configuration</h2>';
        
        $serverInfo = [
            'Server Software' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
            'Document Root' => $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown',
            'Script Name' => $_SERVER['SCRIPT_NAME'] ?? 'Unknown',
            'HTTP Host' => $_SERVER['HTTP_HOST'] ?? 'Unknown',
            'Request URI' => $_SERVER['REQUEST_URI'] ?? 'Unknown',
            'User Agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
        ];
        
        foreach ($serverInfo as $key => $value) {
            echo '<p><strong>' . $key . ':</strong> ' . htmlspecialchars($value) . '</p>';
        }
        
        // Check mod_rewrite
        if (function_exists('apache_get_modules')) {
            $modules = apache_get_modules();
            $modRewrite = in_array('mod_rewrite', $modules);
            echo '<p><strong>mod_rewrite:</strong> <span class="status ' . ($modRewrite ? 'pass' : 'warn') . '">' . ($modRewrite ? 'ENABLED' : 'NOT DETECTED') . '</span></p>';
        } else {
            echo '<p><strong>mod_rewrite:</strong> <span class="status warn">CANNOT DETECT</span></p>';
        }
        echo '</div>';
        
        // Test 7: Error Logs
        echo '<div class="test-section">';
        echo '<h2>7. Recent Error Logs</h2>';
        
        $logFiles = [
            __DIR__ . '/php_errors.log' => 'PHP Errors',
            __DIR__ . '/logs/' . date('Y-m-d') . '.log' => 'Application Log (Today)',
            ini_get('error_log') => 'System Error Log'
        ];
        
        foreach ($logFiles as $logFile => $logName) {
            if ($logFile && file_exists($logFile)) {
                echo '<h4>' . $logName . ':</h4>';
                $logContent = file_get_contents($logFile);
                $recentLines = array_slice(explode("\n", $logContent), -10);
                echo '<pre>' . htmlspecialchars(implode("\n", $recentLines)) . '</pre>';
            } else {
                echo '<p><strong>' . $logName . ':</strong> <span class="status info">NO FILE</span></p>';
            }
        }
        echo '</div>';
        
        // Test 8: Memory and Performance
        echo '<div class="test-section">';
        echo '<h2>8. Memory & Performance</h2>';
        
        echo '<p><strong>Memory Limit:</strong> ' . ini_get('memory_limit') . '</p>';
        echo '<p><strong>Max Execution Time:</strong> ' . ini_get('max_execution_time') . 's</p>';
        echo '<p><strong>Upload Max Filesize:</strong> ' . ini_get('upload_max_filesize') . '</p>';
        echo '<p><strong>Post Max Size:</strong> ' . ini_get('post_max_size') . '</p>';
        echo '<p><strong>Current Memory Usage:</strong> ' . round(memory_get_usage(true) / 1024 / 1024, 2) . ' MB</p>';
        echo '<p><strong>Peak Memory Usage:</strong> ' . round(memory_get_peak_usage(true) / 1024 / 1024, 2) . ' MB</p>';
        echo '</div>';
        
        ?>
        
        <!-- Quick Actions -->
        <div class="test-section">
            <h2>9. Quick Actions</h2>
            <a href="<?php echo $_SERVER['PHP_SELF']; ?>" class="btn btn-primary">🔄 Refresh Tests</a>
            <a href="test-db-connection.php" class="btn btn-success">🔗 Test DB Connection</a>
            <a href="test-complete-system.php" class="btn btn-success">🧪 Full System Test</a>
            <a href="api/news/index.php" class="btn btn-primary" target="_blank">📰 Test News API</a>
            <a href="admin.html" class="btn btn-primary">👤 Admin Panel</a>
        </div>
        
        <!-- API Test Form -->
        <div class="test-section">
            <h2>10. Live API Test</h2>
            <div id="api-test-results"></div>
            <button onclick="testAPIs()" class="btn btn-primary">🚀 Test APIs Now</button>
        </div>
    </div>

    <script>
    async function testAPIs() {
        const resultsDiv = document.getElementById('api-test-results');
        resultsDiv.innerHTML = '<p>Testing APIs...</p>';
        
        const apis = [
            { url: 'api/news/index.php', name: 'News API' },
            { url: 'api/events/index.php', name: 'Events API' },
            { url: 'api/gallery/index.php', name: 'Gallery API' },
            { url: 'api/health/index.php', name: 'Health Check' }
        ];
        
        let results = '<h3>API Test Results:</h3>';
        
        for (const api of apis) {
            try {
                const response = await fetch(api.url);
                const status = response.status;
                const statusText = response.statusText;
                const data = await response.text();
                
                results += `
                    <div class="test-section ${status === 200 ? 'success' : 'error'}">
                        <strong>${api.name}:</strong> ${status} ${statusText}<br>
                        <pre>${data.substring(0, 500)}${data.length > 500 ? '...' : ''}</pre>
                    </div>
                `;
            } catch (error) {
                results += `
                    <div class="test-section error">
                        <strong>${api.name}:</strong> Network Error<br>
                        <pre>${error.message}</pre>
                    </div>
                `;
            }
        }
        
        resultsDiv.innerHTML = results;
    }
    
    // Auto-test APIs on page load
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(testAPIs, 1000);
    });
    </script>
</body>
</html>

<?php
// Flush output buffer
ob_end_flush();
?>