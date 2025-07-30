<?php
/**
 * Switch to Clean APIs Script
 * This will backup current APIs and switch to clean versions
 */

echo "<h1>Switching to Clean APIs</h1>";

$files_to_backup = [
    'api/auth/login.php' => 'api/auth/login_backup.php',
    'api/news/index.php' => 'api/news/index_backup.php',
    'api/events/index.php' => 'api/events/index_backup.php',
    'api/gallery/index.php' => 'api/gallery/index_backup.php'
];

$files_to_switch = [
    'api/auth/login_clean.php' => 'api/auth/login.php',
    'api/news/index_clean.php' => 'api/news/index.php',
    'api/events/index_clean.php' => 'api/events/index.php',
    'api/gallery/index_clean.php' => 'api/gallery/index.php'
];

echo "<h2>Step 1: Backing up current files</h2>";
foreach ($files_to_backup as $source => $backup) {
    if (file_exists($source)) {
        if (copy($source, $backup)) {
            echo "✅ Backed up {$source} to {$backup}<br>";
        } else {
            echo "❌ Failed to backup {$source}<br>";
        }
    } else {
        echo "⚠️ {$source} doesn't exist<br>";
    }
}

echo "<h2>Step 2: Switching to clean versions</h2>";
foreach ($files_to_switch as $source => $target) {
    if (file_exists($source)) {
        if (copy($source, $target)) {
            echo "✅ Switched {$target} to clean version<br>";
        } else {
            echo "❌ Failed to switch {$target}<br>";
        }
    } else {
        echo "❌ Clean file {$source} doesn't exist<br>";
    }
}

echo "<h2>Step 3: Creating test user</h2>";
try {
    $pdo = new PDO("mysql:host=localhost;dbname=digital_cad_atelier;charset=utf8mb4", "root", "");
    
    // Create users table if not exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` int(11) NOT NULL AUTO_INCREMENT,
        `username` varchar(50) NOT NULL UNIQUE,
        `password` varchar(255) NOT NULL,
        `email` varchar(100) DEFAULT NULL,
        `role` varchar(20) DEFAULT 'user',
        `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    // Create test user
    $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT IGNORE INTO users (username, password, email, role) VALUES (?, ?, ?, ?)");
    $result = $stmt->execute(['admin', $hashedPassword, 'admin@example.com', 'admin']);
    
    echo "✅ Test user created (username: admin, password: admin123)<br>";
    
} catch (Exception $e) {
    echo "❌ Database error: " . $e->getMessage() . "<br>";
}

echo "<h2>Step 4: Test Links</h2>";
echo '<p><strong>Test these URLs:</strong></p>';
echo '<ul>';
echo '<li><a href="/jewellery-designer/cad-art/api/auth/login_clean.php" target="_blank">Clean Login API</a></li>';
echo '<li><a href="/jewellery-designer/cad-art/api/news/index_clean.php" target="_blank">Clean News API</a></li>';
echo '<li><a href="/jewellery-designer/cad-art/api/events/index_clean.php" target="_blank">Clean Events API</a></li>';
echo '<li><a href="/jewellery-designer/cad-art/api/gallery/index_clean.php" target="_blank">Clean Gallery API</a></li>';
echo '<li><a href="/jewellery-designer/cad-art/admin.html" target="_blank">Admin Panel</a></li>';
echo '</ul>';

echo "<h2>✅ Switch Complete!</h2>";
echo "<p>Now try logging into the admin panel with:</p>";
echo "<ul><li>Username: <strong>admin</strong></li><li>Password: <strong>admin123</strong></li></ul>";

echo "<h2>If you want to switch back:</h2>";
echo "<p>Simply copy the *_backup.php files back to their original names.</p>";
?>