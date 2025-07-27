<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * Gallery API
 * 
 * Handles CRUD operations for gallery images
 * Supports filtering by category
 * Special endpoint for retrieving all available categories
 */

// Include required files
require_once __DIR__ . '/../../includes/config.php';
require_once __DIR__ . '/../../includes/db.php';

// Get request method and image ID if provided
$method = $_SERVER['REQUEST_METHOD'];
$imageId = isset($_GET['id']) ? (int)$_GET['id'] : null;

// For GET requests, we'll allow public access
// For other methods (POST, PUT, DELETE), we'll require authentication
if ($method !== 'GET') {
    requireAuth();
}

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        if ($imageId) {
            // Get a specific gallery image by ID
            getGalleryImage($imageId);
        } else {
            // Get all gallery images, optionally filtered by category
            $category = isset($_GET['category']) ? $_GET['category'] : null;
            getGalleryImages($category);
        }
        break;
        
    case 'POST':
        // Check if this is an update request
        if (isset($_GET['action']) && $_GET['action'] === 'update' && $imageId) {
            updateGalleryImage($imageId);
        } else {
            // Create a new gallery image
            createGalleryImage();
        }
        break;
        
    case 'PUT':
        // Update an existing gallery image
        if (!$imageId) {
            jsonResponse(null, 400, 'Image ID is required for updates');
        }
        updateGalleryImage($imageId);
        break;
        
    case 'DELETE':
        // Delete a gallery image
        if (!$imageId) {
            jsonResponse(null, 400, 'Image ID is required for deletion');
        }
        deleteGalleryImage($imageId);
        break;
        
    default:
        jsonResponse(null, 405, 'Method not allowed');
}

/**
 * Get all gallery images
 * 
 * @param string|null $category Optional category to filter by
 */
function getGalleryImages($category = null) {
    global $pdo;
    
    try {
        $query = "SELECT * FROM gallery_images";
        $params = [];
        
        if ($category) {
            $query .= " WHERE category = ?";
            $params[] = $category;
        }
        
        $query .= " ORDER BY created_at DESC";
        
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $images = $stmt->fetchAll();
        
        // Format the images
        $formattedImages = [];
        foreach ($images as $image) {
            $formattedImages[] = formatGalleryImage($image);
        }
        
        jsonResponse($formattedImages, 200, 'Gallery images retrieved successfully');
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Failed to retrieve gallery images');
    }
}

/**
 * Get a specific gallery image by ID
 * 
 * @param int $id Image ID
 */
function getGalleryImage($id) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM gallery_images WHERE id = ?");
        $stmt->execute([$id]);
        $image = $stmt->fetch();
        
        if (!$image) {
            jsonResponse(null, 404, 'Gallery image not found');
            return;
        }
        
        jsonResponse(formatGalleryImage($image), 200, 'Gallery image retrieved successfully');
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Failed to retrieve gallery image');
    }
}

/**
 * Get all available categories
 */
function getCategories() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT id, name FROM categories ORDER BY name ASC");
        $categories = $stmt->fetchAll();
        
        jsonResponse($categories, 200, 'Categories retrieved successfully');
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Failed to retrieve categories');
    }
}

/**
 * Create a new gallery image
 */
function createGalleryImage() {
    global $pdo;
    
    // Get gallery image data from request
    $title = $_POST['title'] ?? '';
    $description = $_POST['description'] ?? '';
    $categoryId = isset($_POST['category_id']) ? (int)$_POST['category_id'] : null;
    
    // Validate required fields
    if (empty($title)) {
        jsonResponse(null, 400, 'Title is required');
        return;
    }
    
    // Validate that an image was uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        jsonResponse(null, 400, 'Image is required');
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Handle image upload
        $imagePath = handleImageUpload($_FILES['image'], 'gallery');
        
        // Insert the gallery image
        $stmt = $pdo->prepare("INSERT INTO gallery_images (title, description, url, category, created_at, updated_at) 
                             VALUES (?, ?, ?, ?, NOW(), NOW())");
        $stmt->execute([$title, $description, $imagePath, null]);
        $imageId = $pdo->lastInsertId();
        
        $pdo->commit();
        
        // Get the newly created gallery image
        getGalleryImage($imageId);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Failed to create gallery image');
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Error: " . $e->getMessage());
        jsonResponse(null, 500, $e->getMessage());
    }
}

/**
 * Update an existing gallery image
 * 
 * @param int $id Image ID
 */
function updateGalleryImage($id) {
    global $pdo;
    
    // Get data from POST request
    $title = $_POST['title'] ?? null;
    $description = $_POST['description'] ?? null;
    $categoryId = isset($_POST['category_id']) ? (int)$_POST['category_id'] : null;
    
    try {
        // Check if gallery image exists
        $stmt = $pdo->prepare("SELECT id FROM gallery_images WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            jsonResponse(null, 404, 'Gallery image not found');
            return;
        }
        
        $pdo->beginTransaction();
        
        // Build update query
        $updateFields = [];
        $params = [];
        
        if ($title !== null) {
            $updateFields[] = "title = ?";
            $params[] = $title;
        }
        
        if ($description !== null) {
            $updateFields[] = "description = ?";
            $params[] = $description;
        }
        
        if ($categoryId !== null) {
            $updateFields[] = "category = ?";
            $params[] = $categoryId;
        }
        
        // Debug file upload information
        error_log('UPDATE: Files array: ' . print_r($_FILES, true));
        
        // Handle image upload if present
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            error_log('UPDATE: Processing image upload');
            $imagePath = handleImageUpload($_FILES['image'], 'gallery');
            $updateFields[] = "url = ?";
            $params[] = $imagePath;
            error_log('UPDATE: New image path: ' . $imagePath);
        } else if (isset($_FILES['image'])) {
            error_log('UPDATE: Image upload error: ' . $_FILES['image']['error']);
        } else {
            error_log('UPDATE: No image file found in request');
        }
        
        $updateFields[] = "updated_at = NOW()";
        
        // Add image ID to params
        $params[] = $id;
        
        // Update the gallery image
        $stmt = $pdo->prepare("UPDATE gallery_images SET " . implode(", ", $updateFields) . " WHERE id = ?");
        $stmt->execute($params);
        
        $pdo->commit();
        
        // Get the updated gallery image
        getGalleryImage($id);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Failed to update gallery image');
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Error: " . $e->getMessage());
        jsonResponse(null, 500, $e->getMessage());
    }
}

/**
 * Delete a gallery image
 * 
 * @param int $id Image ID
 */
function deleteGalleryImage($id) {
    global $pdo;
    
    try {
        $pdo->beginTransaction();
        
        // Check if gallery image exists and get image path
        $stmt = $pdo->prepare("SELECT image_path FROM gallery_images WHERE id = ?");
        $stmt->execute([$id]);
        $image = $stmt->fetch();
        
        if (!$image) {
            jsonResponse(null, 404, 'Gallery image not found');
            return;
        }
        
        // Delete the gallery image
        $stmt = $pdo->prepare("DELETE FROM gallery_images WHERE id = ?");
        $stmt->execute([$id]);
        
        // Delete the image file if it exists
        if ($image['url']) {
            $imagePath = __DIR__ . '/../../' . $image['url'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }
        
        $pdo->commit();
        
        jsonResponse(['id' => $id], 200, 'Gallery image deleted successfully');
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Failed to delete gallery image');
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Error: " . $e->getMessage());
        jsonResponse(null, 500, $e->getMessage());
    }
}

/**
 * Handle image upload
 * 
 * @param array $file The uploaded file data
 * @param string $subdir The subdirectory to store the image in
 * @return string The relative path to the uploaded image
 * @throws Exception If upload fails
 */
function handleImageUpload($file, $subdir) {
    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!in_array($file['type'], $allowedTypes)) {
        throw new Exception('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
    }
    
    // Create upload directory if it doesn't exist
    $uploadDir = UPLOAD_DIR . '/' . $subdir;
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    // Generate unique filename
    $filename = uniqid() . '_' . basename($file['name']);
    $targetPath = $uploadDir . '/' . $filename;
    
    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        throw new Exception('Failed to upload image');
    }
    
    // Return relative path
    return 'uploads/' . $subdir . '/' . $filename;
}

/**
 * Format gallery image data for response
 * 
 * @param array $image The gallery image data from database
 * @return array Formatted gallery image data
 */
function formatGalleryImage($image) {
    $formatted = [
        'id' => (int)$image['id'],
        'title' => $image['title'],
        'description' => $image['description'],
        'created_at' => $image['created_at'],
        'updated_at' => $image['updated_at'],
    ];
    
    // Add category info if available
    if (!empty($image['category'])) {
        $formatted['category'] = $image['category'];
    }
    
    // Add image URL if available
    if (!empty($image['url'])) {
        $formatted['image_url'] = SITE_URL . '/' . $image['url'];
    }
    
    return $formatted;
}
