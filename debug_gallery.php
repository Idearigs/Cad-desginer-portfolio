<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Include required files
require_once 'includes/config.php';
require_once 'includes/db.php';

echo "Testing gallery database connection...\n";

try {
    // Test basic database connection
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM gallery_images");
    $result = $stmt->fetch();
    echo "Gallery images count: " . $result['count'] . "\n";
    
    // Test fetching all gallery images
    $stmt = $pdo->query("SELECT * FROM gallery_images ORDER BY created_at DESC");
    $images = $stmt->fetchAll();
    
    echo "Found " . count($images) . " gallery images:\n";
    foreach ($images as $image) {
        echo "- ID: " . $image['id'] . ", Title: " . $image['title'] . ", URL: " . $image['url'] . "\n";
    }
    
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
