<?php
/**
 * Test Clean System - Verify all components are working
 */
?>
<!DOCTYPE html>
<html>
<head>
    <title>Clean System Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
        .success { color: green; }
        .error { color: red; }
        .test-link { display: inline-block; margin: 5px; padding: 8px 15px; background: #007cba; color: white; text-decoration: none; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>Clean System Test Results</h1>
    
    <div class="test-section">
        <h2>1. Database Connection Test</h2>
        <?php
        try {
            $pdo = new PDO("mysql:host=localhost;dbname=digital_cad_atelier;charset=utf8mb4", "root", "");
            echo '<p class="success">✅ Database connection successful</p>';
            
            // Check tables
            $tables = ['users', 'articles', 'events', 'gallery_images'];
            foreach ($tables as $table) {
                $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
                if ($stmt->rowCount() > 0) {
                    echo "<p class='success'>✅ Table '$table' exists</p>";
                } else {
                    echo "<p class='error'>❌ Table '$table' missing</p>";
                }
            }
            
        } catch (Exception $e) {
            echo '<p class="error">❌ Database connection failed: ' . $e->getMessage() . '</p>';
        }
        ?>
    </div>

    <div class="test-section">
        <h2>2. Clean API Files Test</h2>
        <?php
        $cleanFiles = [
            'api/config_clean.php',
            'api/auth/login_clean.php',
            'api/news/index_clean.php',
            'api/events/index_clean.php',
            'api/gallery/index_clean.php'
        ];
        
        foreach ($cleanFiles as $file) {
            if (file_exists($file)) {
                echo "<p class='success'>✅ $file exists</p>";
            } else {
                echo "<p class='error'>❌ $file missing</p>";
            }
        }
        ?>
    </div>

    <div class="test-section">
        <h2>3. Upload Directories Test</h2>
        <?php
        $uploadDirs = [
            'uploads/articles',
            'uploads/events', 
            'uploads/gallery'
        ];
        
        foreach ($uploadDirs as $dir) {
            if (is_dir($dir)) {
                echo "<p class='success'>✅ Directory '$dir' exists</p>";
            } else {
                if (mkdir($dir, 0755, true)) {
                    echo "<p class='success'>✅ Directory '$dir' created</p>";
                } else {
                    echo "<p class='error'>❌ Failed to create directory '$dir'</p>";
                }
            }
        }
        ?>
    </div>

    <div class="test-section">
        <h2>4. Test User Check</h2>
        <?php
        try {
            $stmt = $pdo->prepare("SELECT username, role FROM users WHERE username = 'admin'");
            $stmt->execute();
            $user = $stmt->fetch();
            
            if ($user) {
                echo "<p class='success'>✅ Test user 'admin' exists with role: {$user['role']}</p>";
            } else {
                echo "<p class='error'>❌ Test user 'admin' not found</p>";
                echo "<p>Creating test user...</p>";
                
                $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)");
                $result = $stmt->execute(['admin', $hashedPassword, 'admin@example.com', 'admin']);
                
                if ($result) {
                    echo "<p class='success'>✅ Test user created successfully</p>";
                } else {
                    echo "<p class='error'>❌ Failed to create test user</p>";
                }
            }
        } catch (Exception $e) {
            echo '<p class="error">❌ User check failed: ' . $e->getMessage() . '</p>';
        }
        ?>
    </div>

    <div class="test-section">
        <h2>5. Manual Testing Links</h2>
        <p>Test these URLs manually:</p>
        <div>
            <a href="/jewellery-designer/cad-art/api/auth/login_clean.php" class="test-link" target="_blank">Login API</a>
            <a href="/jewellery-designer/cad-art/api/news/index_clean.php" class="test-link" target="_blank">News API</a>
            <a href="/jewellery-designer/cad-art/api/events/index_clean.php" class="test-link" target="_blank">Events API</a>
            <a href="/jewellery-designer/cad-art/api/gallery/index_clean.php" class="test-link" target="_blank">Gallery API</a>
        </div>
        <div style="margin-top: 15px;">
            <a href="/jewellery-designer/cad-art/admin.html" class="test-link" target="_blank">Admin Panel</a>
            <a href="/jewellery-designer/cad-art/switch_to_clean.php" class="test-link" target="_blank">Switch to Clean APIs</a>
        </div>
    </div>

    <div class="test-section">
        <h2>6. Next Steps</h2>
        <ol>
            <li>If all tests above show ✅, the system is ready</li>
            <li>Run the <strong>Switch to Clean APIs</strong> script above</li>
            <li>Test login with: <strong>admin / admin123</strong></li>
            <li>If login works, test creating/editing news articles</li>
            <li>Report any remaining issues</li>
        </ol>
    </div>

</body>
</html>