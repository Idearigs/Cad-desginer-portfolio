<?php
/**
 * Complete System Diagnostic Test
 * Comprehensive test file to diagnose all system issues
 * Access via: domain.com/test-complete-system.php
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Diagnostic Test - Digital CAD Atelier</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; color: #155724; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; color: #721c24; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; color: #856404; }
        .info { background-color: #d1ecf1; border-color: #bee5eb; color: #0c5460; }
        pre { background: #f8f9fa; padding: 10px; border-radius: 3px; overflow-x: auto; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 5px; }
        button:hover { background: #0056b3; }
        .status { font-weight: bold; }
        .json-output { max-height: 300px; overflow-y: auto; }
        h1, h2 { color: #333; }
        .test-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media (max-width: 768px) { .test-grid { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 System Diagnostic Test</h1>
        <p><strong>Timestamp:</strong> <?php echo date('Y-m-d H:i:s'); ?></p>
        <p><strong>Domain:</strong> <?php echo $_SERVER['HTTP_HOST'] ?? 'Unknown'; ?></p>
        
        <div class="test-grid">
            <!-- Server Environment Test -->
            <div class="test-section info">
                <h2>🖥️ Server Environment</h2>
                <?php
                echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
                echo "<p><strong>Server Software:</strong> " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "</p>";
                echo "<p><strong>Document Root:</strong> " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . "</p>";
                echo "<p><strong>Current Directory:</strong> " . __DIR__ . "</p>";
                echo "<p><strong>MySQL Extensions:</strong><br>";
                echo "- mysql: " . (extension_loaded('mysql') ? '✅ Yes' : '❌ No') . "<br>";
                echo "- mysqli: " . (extension_loaded('mysqli') ? '✅ Yes' : '❌ No') . "<br>";
                echo "- pdo: " . (extension_loaded('pdo') ? '✅ Yes' : '❌ No') . "<br>";
                echo "- pdo_mysql: " . (extension_loaded('pdo_mysql') ? '✅ Yes' : '❌ No') . "</p>";
                ?>
            </div>

            <!-- Database Connection Test -->
            <div class="test-section">
                <h2>🗄️ Database Connection</h2>
                <?php
                $dbConfigs = [
                    ['name' => 'Production Hosting', 'host' => 'server119.web-hosting.com', 'db' => 'chamodio_caddb', 'user' => 'chamodio_root', 'pass' => '#Chamalcaddb#2025'],
                    ['name' => 'Production IP', 'host' => '198.54.116.108', 'db' => 'chamodio_caddb', 'user' => 'chamodio_root', 'pass' => '#Chamalcaddb#2025'],
                    ['name' => 'Local Dev Fallback', 'host' => 'localhost', 'db' => 'digital_cad_atelier', 'user' => 'root', 'pass' => '']
                ];

                $connected = false;
                foreach ($dbConfigs as $config) {
                    echo "<div class='test-section'>";
                    echo "<h4>{$config['name']}</h4>";
                    try {
                        $dsn = "mysql:host={$config['host']};dbname={$config['db']};charset=utf8mb4";
                        $pdo = new PDO($dsn, $config['user'], $config['pass'], [
                            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                            PDO::ATTR_TIMEOUT => 5
                        ]);
                        
                        echo "<div class='success'>";
                        echo "✅ <strong>Connection Successful!</strong><br>";
                        echo "Database: {$config['db']}<br>";
                        echo "User: {$config['user']}<br>";
                        
                        // Check tables
                        $stmt = $pdo->query("SHOW TABLES");
                        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
                        echo "Tables found: " . count($tables) . "<br>";
                        if (in_array('users', $tables)) {
                            $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
                            $count = $stmt->fetch();
                            echo "Users in database: {$count['count']}<br>";
                        }
                        echo "</div>";
                        $connected = true;
                        break;
                    } catch (PDOException $e) {
                        echo "<div class='error'>";
                        echo "❌ Connection Failed<br>";
                        echo "Error: " . $e->getMessage() . "<br>";
                        echo "</div>";
                    }
                    echo "</div>";
                }
                
                if (!$connected) {
                    echo "<div class='error'><strong>⚠️ No database connection successful. This is likely the main issue!</strong></div>";
                }
                ?>
            </div>
        </div>

        <!-- File System Test -->
        <div class="test-section">
            <h2>📁 File System Check</h2>
            <?php
            $files = [
                'API Login' => '/api/auth/login.php',
                'Database Config' => '/includes/db.php',
                'Main Config' => '/includes/config.php',
                'Environment' => '/includes/env.php',
                'Logger' => '/includes/logger.php'
            ];
            
            echo "<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;'>";
            foreach ($files as $name => $path) {
                $fullPath = __DIR__ . $path;
                $exists = file_exists($fullPath);
                $readable = $exists ? is_readable($fullPath) : false;
                $size = $exists ? filesize($fullPath) : 0;
                
                $class = $exists && $readable ? 'success' : 'error';
                echo "<div class='$class' style='padding: 10px; border-radius: 5px;'>";
                echo "<strong>$name</strong><br>";
                echo "Path: $path<br>";
                echo "Exists: " . ($exists ? '✅' : '❌') . "<br>";
                echo "Readable: " . ($readable ? '✅' : '❌') . "<br>";
                echo "Size: " . ($size > 0 ? number_format($size) . ' bytes' : '0') . "<br>";
                echo "</div>";
            }
            echo "</div>";
            ?>
        </div>

        <!-- API Test Section -->
        <div class="test-section">
            <h2>🔌 API Endpoint Tests</h2>
            <button onclick="testLoginAPI()">Test Login API</button>
            <button onclick="testAllAPIs()">Test All APIs</button>
            <div id="api-results"></div>
        </div>

        <!-- Live Error Log -->
        <div class="test-section">
            <h2>📋 Error Logs</h2>
            <?php
            $logFiles = [
                'PHP Errors' => '/php_errors.log',
                'Application Log' => '/logs/' . date('Y-m-d') . '.log'
            ];
            
            foreach ($logFiles as $name => $path) {
                $fullPath = __DIR__ . $path;
                echo "<h4>$name</h4>";
                if (file_exists($fullPath)) {
                    $lines = file($fullPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                    $lastLines = array_slice($lines, -10);
                    echo "<div class='info'>";
                    echo "<strong>Last 10 entries:</strong><br>";
                    echo "<pre style='max-height: 200px; overflow-y: auto;'>";
                    foreach ($lastLines as $line) {
                        echo htmlspecialchars($line) . "\n";
                    }
                    echo "</pre>";
                    echo "</div>";
                } else {
                    echo "<div class='warning'>Log file not found: $path</div>";
                }
            }
            ?>
        </div>

        <!-- Session Test -->
        <div class="test-section">
            <h2>🔐 Session Test</h2>
            <?php
            session_start();
            echo "<div class='info'>";
            echo "<p><strong>Session Status:</strong> " . (session_status() === PHP_SESSION_ACTIVE ? '✅ Active' : '❌ Inactive') . "</p>";
            echo "<p><strong>Session ID:</strong> " . session_id() . "</p>";
            echo "<p><strong>Session Save Path:</strong> " . session_save_path() . "</p>";
            echo "<p><strong>Session Name:</strong> " . session_name() . "</p>";
            
            $_SESSION['test_key'] = 'test_value_' . time();
            echo "<p><strong>Session Write Test:</strong> " . (isset($_SESSION['test_key']) ? '✅ Success' : '❌ Failed') . "</p>";
            echo "</div>";
            ?>
        </div>

        <!-- Quick Fixes Section -->
        <div class="test-section warning">
            <h2>🔧 Quick Diagnostic Summary</h2>
            <p><strong>Most Common Issues and Solutions:</strong></p>
            <ul>
                <li><strong>Database Connection:</strong> Check if your hosting provider uses different database credentials</li>
                <li><strong>File Permissions:</strong> Ensure PHP files have proper read permissions (644)</li>
                <li><strong>Missing Extensions:</strong> Verify PDO and PDO_MySQL are installed</li>
                <li><strong>Server Configuration:</strong> Check if .htaccess is interfering with API calls</li>
                <li><strong>Error Reporting:</strong> Enable error reporting to see detailed error messages</li>
            </ul>
        </div>
    </div>

    <script>
        async function testLoginAPI() {
            const resultsDiv = document.getElementById('api-results');
            resultsDiv.innerHTML = '<p>Testing login API...</p>';
            
            try {
                const response = await fetch('./api/auth/login.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: 'username=test&password=test'
                });
                
                const data = await response.text();
                resultsDiv.innerHTML = `
                    <div class="info">
                        <h4>Login API Test Results</h4>
                        <p><strong>Status:</strong> ${response.status} ${response.statusText}</p>
                        <p><strong>Response:</strong></p>
                        <pre class="json-output">${data}</pre>
                    </div>
                `;
            } catch (error) {
                resultsDiv.innerHTML = `
                    <div class="error">
                        <h4>Login API Test Error</h4>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
        
        async function testAllAPIs() {
            const resultsDiv = document.getElementById('api-results');
            resultsDiv.innerHTML = '<p>Testing all APIs...</p>';
            
            const endpoints = [
                './api/auth/login.php',
                './api/gallery/index.php',
                './api/news/index.php',
                './api/events/index.php',
                './api/health/index.php'
            ];
            
            let results = '<h4>API Endpoints Test Results</h4>';
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint);
                    const status = response.status;
                    const statusText = response.statusText;
                    
                    results += `
                        <div class="${status === 200 ? 'success' : 'error'}" style="margin: 10px 0; padding: 10px; border-radius: 5px;">
                            <strong>${endpoint}:</strong> ${status} ${statusText}
                        </div>
                    `;
                } catch (error) {
                    results += `
                        <div class="error" style="margin: 10px 0; padding: 10px; border-radius: 5px;">
                            <strong>${endpoint}:</strong> Error - ${error.message}
                        </div>
                    `;
                }
            }
            
            resultsDiv.innerHTML = results;
        }
    </script>
</body>
</html>