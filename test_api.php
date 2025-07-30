<?php
/**
 * API Test and Diagnostic Script
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Digital CAD Atelier API Diagnostics</h1>";

// Test 1: Database Connection
echo "<h2>1. Database Connection Test</h2>";
try {
    $pdo = new PDO("mysql:host=localhost;dbname=digital_cad_atelier;charset=utf8mb4", "root", "");
    echo "✅ Database connection successful<br>";
    
    // Test users table
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    $userCount = $stmt->fetchColumn();
    echo "✅ Users table exists with {$userCount} users<br>";
    
    // Test articles table
    $stmt = $pdo->query("SELECT COUNT(*) FROM articles");
    $articleCount = $stmt->fetchColumn();
    echo "✅ Articles table exists with {$articleCount} articles<br>";
    
} catch (PDOException $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "<br>";
}

// Test 2: File Structure
echo "<h2>2. File Structure Test</h2>";
$requiredFiles = [
    'includes/config.php',
    'includes/config_simple.php',
    'includes/db.php',
    'includes/db_simple.php',
    'api/auth/login.php',
    'api/news/index.php',
    'api/events/index.php',
    'api/gallery/index.php'
];

foreach ($requiredFiles as $file) {
    if (file_exists($file)) {
        echo "✅ {$file} exists<br>";
    } else {
        echo "❌ {$file} missing<br>";
    }
}

// Test 3: Directories
echo "<h2>3. Directory Test</h2>";
$requiredDirs = [
    'uploads',
    'uploads/articles',
    'uploads/events',
    'uploads/gallery',
    'logs'
];

foreach ($requiredDirs as $dir) {
    if (is_dir($dir)) {
        $writable = is_writable($dir) ? "writable" : "not writable";
        echo "✅ {$dir} exists and is {$writable}<br>";
    } else {
        echo "❌ {$dir} missing<br>";
        @mkdir($dir, 0755, true);
        if (is_dir($dir)) {
            echo "✅ Created {$dir}<br>";
        }
    }
}

// Test 4: PHP Configuration
echo "<h2>4. PHP Configuration</h2>";
echo "PHP Version: " . PHP_VERSION . "<br>";
echo "Memory Limit: " . ini_get('memory_limit') . "<br>";
echo "Upload Max Filesize: " . ini_get('upload_max_filesize') . "<br>";
echo "Post Max Size: " . ini_get('post_max_size') . "<br>";

// Test 5: Environment File
echo "<h2>5. Environment Configuration</h2>";
if (file_exists('.env')) {
    echo "✅ .env file exists<br>";
} else {
    echo "❌ .env file missing<br>";
    if (file_exists('.env.example')) {
        echo "✅ .env.example exists (copy it to .env)<br>";
    }
}

// Test 6: Session Test
echo "<h2>6. Session Test</h2>";
session_start();
$_SESSION['test'] = 'working';
if (isset($_SESSION['test']) && $_SESSION['test'] === 'working') {
    echo "✅ Sessions are working<br>";
} else {
    echo "❌ Session issues<br>";
}

// Test 7: API Endpoints Test
echo "<h2>7. API Endpoints Test</h2>";
$apiEndpoints = [
    '/jewellery-designer/cad-art/api/news/index.php',
    '/jewellery-designer/cad-art/api/events/index.php',
    '/jewellery-designer/cad-art/api/gallery/index.php'
];

foreach ($apiEndpoints as $endpoint) {
    $url = "http://localhost" . $endpoint;
    echo "Testing: <a href='{$url}' target='_blank'>{$url}</a><br>";
}

echo "<h2>8. Manual Test Links</h2>";
echo '<a href="/jewellery-designer/cad-art/admin.html" target="_blank">Admin Panel</a><br>';
echo '<a href="/jewellery-designer/cad-art/api/news/index.php" target="_blank">News API</a><br>';
echo '<a href="/jewellery-designer/cad-art/api/health/index.php" target="_blank">Health Check</a><br>';

echo "<h2>9. Create Test User</h2>";
try {
    $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (username, password, email, role) VALUES (?, ?, ?, ?)");
    $result = $stmt->execute(['admin', $hashedPassword, 'admin@example.com', 'admin']);
    
    if ($result) {
        echo "✅ Test user 'admin' created/verified (password: admin123)<br>";
    }
} catch (Exception $e) {
    echo "❌ Failed to create test user: " . $e->getMessage() . "<br>";
}
?>