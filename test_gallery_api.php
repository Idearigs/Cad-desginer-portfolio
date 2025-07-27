<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing Gallery API directly...\n";

// Simulate GET request to gallery API
$_SERVER['REQUEST_METHOD'] = 'GET';

try {
    // Include the gallery API
    include 'api/gallery/index.php';
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>
