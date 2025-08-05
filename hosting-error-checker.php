<?php
/**
 * Hosting Error Checker
 * Specifically designed to identify and fix 500 Internal Server Errors
 */

// Enable all error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Set content type
header('Content-Type: text/html; charset=utf-8');

echo "<!DOCTYPE html>
<html>
<head>
    <title>Hosting Error Checker</title>
    <style>
        body { font-family: monospace; margin: 20px; }
        .error { color: red; background: #ffe6e6; padding: 10px; margin: 10px 0; }
        .success { color: green; background: #e6ffe6; padding: 10px; margin: 10px 0; }
        .warning { color: orange; background: #fff3e0; padding: 10px; margin: 10px 0; }
        .info { color: blue; background: #e6f3ff; padding: 10px; margin: 10px 0; }
        .code { background: #f5f5f5; padding: 10px; margin: 10px 0; border-left: 3px solid #ccc; }
    </style>
</head>
<body>";

echo "<h1>🔍 Hosting Error Checker</h1>";

// 1. Check PHP configuration
echo "<h2>1. PHP Configuration Issues</h2>";

$issues = [];

// Check PHP version
$phpVersion = phpversion();
if (version_compare($phpVersion, '7.4', '<')) {
    $issues[] = "PHP version is too old: $phpVersion (requires 7.4+)";
}

// Check required extensions
$requiredExtensions = ['pdo', 'pdo_mysql', 'json', 'mbstring'];
foreach ($requiredExtensions as $ext) {
    if (!extension_loaded($ext)) {
        $issues[] = "Missing PHP extension: $ext";
    }
}

// Check file permissions
$criticalFiles = [
    __DIR__ . '/api/news/index.php',
    __DIR__ . '/api/auth/login.php',
    __DIR__ . '/includes/env.php',
    __DIR__ . '/includes/config.php'
];

foreach ($criticalFiles as $file) {
    if (!file_exists($file)) {
        $issues[] = "Missing critical file: " . basename($file);
    } elseif (!is_readable($file)) {
        $issues[] = "Cannot read file: " . basename($file);
    }
}

if (empty($issues)) {
    echo "<div class='success'>✓ No PHP configuration issues detected</div>";
} else {
    foreach ($issues as $issue) {
        echo "<div class='error'>✗ $issue</div>";
    }
}

// 2. Test database connection with different methods
echo "<h2>2. Database Connection Test</h2>";

$dbConnected = false;
$dbMethods = [
    'Method 1: Environment Config' => function() {
        if (file_exists(__DIR__ . '/includes/env.php')) {
            require_once __DIR__ . '/includes/env.php';
            $host = EnvLoader::get('DB_HOST', 'localhost');
            $dbname = EnvLoader::get('DB_NAME', 'digital_cad_atelier');
            $username = EnvLoader::get('DB_USER', 'root');
            $password = EnvLoader::get('DB_PASS', '');
        } else {
            throw new Exception('.env file not found');
        }
        return new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    },
    'Method 2: Localhost/Root' => function() {
        return new PDO("mysql:host=localhost;dbname=digital_cad_atelier;charset=utf8mb4", "root", "");
    },
    'Method 3: 127.0.0.1/Root' => function() {
        return new PDO("mysql:host=127.0.0.1;dbname=digital_cad_atelier;charset=utf8mb4", "root", "");
    }
];

foreach ($dbMethods as $methodName => $connectionFunc) {
    try {
        $pdo = $connectionFunc();
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $result = $pdo->query('SELECT 1')->fetchColumn();
        if ($result == 1) {
            echo "<div class='success'>✓ $methodName: Connected successfully</div>";
            $dbConnected = true;
            
            // Test table existence
            $tables = ['users', 'articles', 'events', 'gallery'];
            foreach ($tables as $table) {
                try {
                    $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
                    if ($stmt->rowCount() > 0) {
                        $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
                        echo "<div class='info'>  → Table '$table' exists with $count records</div>";
                    } else {
                        echo "<div class='warning'>  → Table '$table' is missing</div>";
                    }
                } catch (Exception $e) {
                    echo "<div class='error'>  → Error checking table '$table': " . $e->getMessage() . "</div>";
                }
            }
            break;
        }
    } catch (Exception $e) {
        echo "<div class='error'>✗ $methodName: " . $e->getMessage() . "</div>";
    }
}

if (!$dbConnected) {
    echo "<div class='error'>❌ No database connection method worked</div>";
    echo "<div class='code'>
    <strong>Possible solutions:</strong><br>
    1. Check if MySQL service is running<br>
    2. Verify database name 'digital_cad_atelier' exists<br>
    3. Check database user permissions<br>
    4. For shared hosting, database name might be prefixed (e.g., username_digital_cad_atelier)
    </div>";
}

// 3. Test API endpoints directly
echo "<h2>3. API Endpoint Testing</h2>";

$apiTests = [
    'News API' => __DIR__ . '/api/news/index.php',
    'Login API' => __DIR__ . '/api/auth/login.php',
    'Events API' => __DIR__ . '/api/events/index.php',
    'Gallery API' => __DIR__ . '/api/gallery/index.php'
];

foreach ($apiTests as $name => $file) {
    echo "<h3>Testing $name</h3>";
    
    if (!file_exists($file)) {
        echo "<div class='error'>✗ File not found: $file</div>";
        continue;
    }
    
    // Test by including the file and capturing errors
    ob_start();
    $error = null;
    $oldErrorReporting = error_reporting(E_ALL);
    
    try {
        // Set up minimal environment
        $_SERVER['REQUEST_METHOD'] = 'GET';
        $_GET = [];
        $_POST = [];
        
        // Capture any output
        include $file;
        
    } catch (ParseError $e) {
        $error = "Parse Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine();
    } catch (Error $e) {
        $error = "Fatal Error: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine();
    } catch (Exception $e) {
        $error = "Exception: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine();
    }
    
    $output = ob_get_clean();
    error_reporting($oldErrorReporting);
    
    if ($error) {
        echo "<div class='error'>✗ Error in $name: $error</div>";
    } elseif (empty($output)) {
        echo "<div class='warning'>⚠ $name produced no output (might be normal for some APIs)</div>";
    } else {
        // Check if output looks like valid JSON
        $decoded = json_decode($output, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo "<div class='success'>✓ $name returned valid JSON</div>";
            if (isset($decoded['status'])) {
                echo "<div class='info'>  → Status: " . $decoded['status'] . "</div>";
                if (isset($decoded['message'])) {
                    echo "<div class='info'>  → Message: " . $decoded['message'] . "</div>";
                }
            }
        } else {
            echo "<div class='warning'>⚠ $name output is not valid JSON</div>";
            echo "<div class='code'>Output: " . htmlspecialchars(substr($output, 0, 200)) . "...</div>";
        }
    }
}

// 4. Check .htaccess and server configuration
echo "<h2>4. Server Configuration</h2>";

$htaccessFile = __DIR__ . '/.htaccess';
if (file_exists($htaccessFile)) {
    echo "<div class='info'>ℹ .htaccess file exists</div>";
    $htaccessContent = file_get_contents($htaccessFile);
    if (strpos($htaccessContent, 'RewriteEngine') !== false) {
        echo "<div class='warning'>⚠ .htaccess contains rewrite rules - might cause issues on some hosts</div>";
    }
} else {
    echo "<div class='info'>ℹ No .htaccess file found</div>";
}

// Check if running on Apache
$serverSoftware = $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown';
echo "<div class='info'>Server Software: $serverSoftware</div>";

// 5. Environment file check
echo "<h2>5. Environment Configuration</h2>";

$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    echo "<div class='success'>✓ .env file exists</div>";
    $envContent = file_get_contents($envFile);
    $lines = explode("\n", $envContent);
    $envVars = [];
    
    foreach ($lines as $line) {
        $line = trim($line);
        if (!empty($line) && strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $envVars[trim($key)] = trim($value);
        }
    }
    
    $requiredVars = ['DB_HOST', 'DB_NAME', 'DB_USER'];
    foreach ($requiredVars as $var) {
        if (isset($envVars[$var]) && !empty($envVars[$var])) {
            echo "<div class='info'>  → $var: " . $envVars[$var] . "</div>";
        } else {
            echo "<div class='warning'>  → $var: Not set or empty</div>";
        }
    }
} else {
    echo "<div class='error'>✗ .env file missing</div>";
    echo "<div class='code'>
    <strong>Create .env file with:</strong><br>
    DB_HOST=localhost<br>
    DB_NAME=digital_cad_atelier<br>
    DB_USER=root<br>
    DB_PASS=<br>
    APP_ENV=production
    </div>";
}

// 6. Generate fix suggestions
echo "<h2>6. Fix Suggestions</h2>";

echo "<div class='info'>
<strong>Based on the tests above, here are the most likely fixes:</strong><br><br>

<strong>For Database Connection Issues:</strong><br>
1. Check if your hosting provider uses a different database host (not 'localhost')<br>
2. Verify the database name - shared hosting often prefixes it with your username<br>
3. Make sure the database user has proper permissions<br>
4. Create the .env file with correct database credentials<br><br>

<strong>For 500 Internal Server Errors:</strong><br>
1. Check PHP error logs on your hosting control panel<br>
2. Ensure all required PHP extensions are enabled<br>
3. Verify file permissions (files should be 644, directories 755)<br>
4. Remove or modify .htaccess if it contains problematic rules<br><br>

<strong>For API Endpoints:</strong><br>
1. Test APIs individually using the debug URLs above<br>
2. Check if your hosting provider blocks certain functions<br>
3. Verify that PHP short tags are enabled if used<br>
4. Make sure sessions can be started properly
</div>";

// 7. Quick test links
echo "<h2>7. Quick Test Links</h2>";
$baseUrl = '//' . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']);

echo "<div class='code'>
<strong>Test these URLs directly:</strong><br>
<a href='{$baseUrl}/api-debug.php?test=info' target='_blank'>System Info Test</a><br>
<a href='{$baseUrl}/api-debug.php?test=db' target='_blank'>Database Test</a><br>
<a href='{$baseUrl}/api-debug.php?test=news' target='_blank'>News API Test</a><br>
<a href='{$baseUrl}/debug-hosting.php' target='_blank'>Full Hosting Debug</a><br>
<a href='{$baseUrl}/api/news/index.php' target='_blank'>Direct News API</a><br>
<a href='{$baseUrl}/api/auth/login.php' target='_blank'>Direct Login API</a>
</div>";

echo "</body></html>";

?>