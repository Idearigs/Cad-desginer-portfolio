<?php
/**
 * Clean Gallery API - No Dependencies
 */

// Prevent output
ob_start();

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Disable errors
error_reporting(0);
ini_set('display_errors', 0);

// Clean output
ob_clean();

// Include clean config
require_once '../config_clean.php';

try {
    // Database connection
    $pdo = new PDO("mysql:host=localhost;dbname=digital_cad_atelier;charset=utf8mb4", "root", "", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $method = $_SERVER['REQUEST_METHOD'];
    $imageId = isset($_GET['id']) ? (int)$_GET['id'] : null;

    // Require auth for non-GET
    if ($method !== 'GET') {
        requireAuthClean();
    }

    switch ($method) {
        case 'GET':
            if ($imageId) {
                getGalleryImageClean($pdo, $imageId);
            } else {
                getGalleryImagesClean($pdo);
            }
            break;
            
        case 'POST':
            if (isset($_GET['action']) && $_GET['action'] === 'update') {
                updateGalleryImageClean($pdo, $imageId);
            } else {
                createGalleryImageClean($pdo);
            }
            break;
            
        case 'DELETE':
            deleteGalleryImageClean($pdo, $imageId);
            break;
            
        default:
            jsonResponseClean(null, 405, 'Method not allowed');
    }

} catch (Exception $e) {
    jsonResponseClean(null, 500, 'Server error');
}

function getGalleryImagesClean($pdo) {
    $stmt = $pdo->query("SELECT * FROM gallery_images ORDER BY created_at DESC");
    $images = $stmt->fetchAll();
    
    // Format images with proper URLs
    foreach ($images as &$image) {
        if ($image['url']) {
            $image['image_url'] = '/jewellery-designer/cad-art/' . $image['url'];
        }
    }
    
    jsonResponseClean($images, 200, 'Gallery images retrieved');
}

function getGalleryImageClean($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM gallery_images WHERE id = ?");
    $stmt->execute([$id]);
    $image = $stmt->fetch();
    
    if (!$image) {
        jsonResponseClean(null, 404, 'Image not found');
    }
    
    if ($image['url']) {
        $image['image_url'] = '/jewellery-designer/cad-art/' . $image['url'];
    }
    
    jsonResponseClean($image, 200, 'Image retrieved');
}

function createGalleryImageClean($pdo) {
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';

    if (empty($title)) {
        jsonResponseClean(null, 400, 'Title is required');
    }

    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        jsonResponseClean(null, 400, 'Image is required');
    }

    // Handle image upload
    $uploadDir = '../../uploads/gallery/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
    $targetPath = $uploadDir . $fileName;
    
    if (!move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
        jsonResponseClean(null, 500, 'Failed to upload image');
    }

    $imagePath = 'uploads/gallery/' . $fileName;

    $stmt = $pdo->prepare("INSERT INTO gallery_images (title, description, url, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())");
    $stmt->execute([$title, $description, $imagePath]);
    
    jsonResponseClean(['id' => $pdo->lastInsertId()], 201, 'Image uploaded');
}

function updateGalleryImageClean($pdo, $id) {
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';

    if (empty($title)) {
        jsonResponseClean(null, 400, 'Title is required');
    }

    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../uploads/gallery/';
        $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
        $targetPath = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            $imagePath = 'uploads/gallery/' . $fileName;
        }
    }

    if ($imagePath) {
        $stmt = $pdo->prepare("UPDATE gallery_images SET title = ?, description = ?, url = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$title, $description, $imagePath, $id]);
    } else {
        $stmt = $pdo->prepare("UPDATE gallery_images SET title = ?, description = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$title, $description, $id]);
    }

    jsonResponseClean(['id' => $id], 200, 'Image updated');
}

function deleteGalleryImageClean($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM gallery_images WHERE id = ?");
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponseClean(null, 404, 'Image not found');
    }
    
    jsonResponseClean(null, 200, 'Image deleted');
}

ob_end_flush();
?>