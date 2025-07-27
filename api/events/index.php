<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

/**
 * Events API
 * 
 * Handles CRUD operations for event banners
 */

// Include required files
require_once '../../includes/config.php';
require_once '../../includes/db.php';

// Get request method and event ID if provided
$method = $_SERVER['REQUEST_METHOD'];
$eventId = isset($_GET['id']) ? (int)$_GET['id'] : null;

// For GET requests, we'll allow public access
// For other methods (POST, PUT, DELETE), we'll require authentication
if ($method !== 'GET') {
    requireAuth();
}

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        if ($eventId) {
            // Get a specific event by ID
            getEvent($eventId);
        } else {
            getEvents();
        }
        break;
        
    case 'POST':
        // Check if this is an update operation
        if (isset($_POST['action']) && $_POST['action'] === 'update' && isset($_GET['id'])) {
            updateEvent($_GET['id']);
        } else {
            createEvent();
        }
        break;
        
    case 'PUT':
        if (isset($_GET['id'])) {
            updateEvent($_GET['id']);
        } else {
            jsonResponse(null, 400, 'Event ID is required');
        }
        break;
        
    case 'DELETE':
        // Delete an event
        if (!$eventId) {
            jsonResponse(null, 400, 'Event ID is required for deletion');
        }
        deleteEvent($eventId);
        break;
        
    default:
        jsonResponse(null, 405, 'Method not allowed');
}

/**
 * Get all events
 */
function getEvents() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT * FROM events ORDER BY created_at DESC");
        $events = $stmt->fetchAll();
        
        // Format the events
        $formattedEvents = [];
        foreach ($events as $event) {
            $formattedEvents[] = formatEvent($event);
        }
        
        jsonResponse($formattedEvents, 200, 'Events retrieved successfully');
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Failed to retrieve events');
    }
}

/**
 * Get a specific event by ID
 * 
 * @param int $id Event ID
 */
function getEvent($id) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
        $stmt->execute([$id]);
        $event = $stmt->fetch();
        
        if (!$event) {
            jsonResponse(null, 404, 'Event not found');
            return;
        }
        
        jsonResponse(formatEvent($event), 200, 'Event retrieved successfully');
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Failed to retrieve event');
    }
}

/**
 * Create a new event
 */
function createEvent() {
    global $pdo;
    
    // Get event data from request
    $title = $_POST['title'] ?? '';
    $date = $_POST['date'] ?? date('Y-m-d');
    $time = $_POST['time'] ?? null;
    $location = $_POST['location'] ?? '';
    $description = $_POST['description'] ?? '';
    
    // Validate required fields
    if (empty($title)) {
        jsonResponse(null, 400, 'Title is required');
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Handle image upload if present
        $imagePath = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $imagePath = handleImageUpload($_FILES['image'], 'events');
        }
        
        // Insert the event using the existing table structure
        $stmt = $pdo->prepare("INSERT INTO events (title, date, time, location, description, image, created_at, updated_at) 
                             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())");
        $stmt->execute([$title, $date, $time, $location, $description, $imagePath]);
        $eventId = $pdo->lastInsertId();
        
        $pdo->commit();
        
        // Get the newly created event
        getEvent($eventId);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Failed to create event');
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Error: " . $e->getMessage());
        jsonResponse(null, 500, $e->getMessage());
    }
}

/**
 * Update an existing event
 * 
 * @param int $id Event ID
 */
function updateEvent($id) {
    global $pdo;
    
    // Handle both POST and PUT methods
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get data from POST
        $data = $_POST;
        
        // Handle image upload if present
        $hasImage = isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK;
    } else {
        // Get PUT data
        parse_str(file_get_contents("php://input"), $data);
        $hasImage = false;
    }
    
    // Get event data from request
    $title = $data['title'] ?? null;
    $date = $data['date'] ?? null;
    $time = $data['time'] ?? null;
    $location = $data['location'] ?? null;
    $description = $data['description'] ?? null;
    
    try {
        // Check if event exists
        $stmt = $pdo->prepare("SELECT id FROM events WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            jsonResponse(null, 404, 'Event not found');
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
        
        if ($date !== null) {
            $updateFields[] = "date = ?";
            $params[] = $date;
        }
        
        if ($time !== null) {
            $updateFields[] = "time = ?";
            $params[] = $time;
        }
        
        if ($location !== null) {
            $updateFields[] = "location = ?";
            $params[] = $location;
        }
        
        if ($description !== null) {
            $updateFields[] = "description = ?";
            $params[] = $description;
        }
        
        // Handle image upload if present
        if ($hasImage) {
            $imagePath = handleImageUpload($_FILES['image'], 'events');
            $updateFields[] = "image = ?";
            $params[] = $imagePath;
        }
        
        $updateFields[] = "updated_at = NOW()";
        
        // Add event ID to params
        $params[] = $id;
        
        // Update the event
        $stmt = $pdo->prepare("UPDATE events SET " . implode(", ", $updateFields) . " WHERE id = ?");
        $stmt->execute($params);
        
        $pdo->commit();
        
        // Get the updated event
        getEvent($id);
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Failed to update event');
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Error: " . $e->getMessage());
        jsonResponse(null, 500, $e->getMessage());
    }
}

/**
 * Delete an event
 * 
 * @param int $id Event ID
 */
function deleteEvent($id) {
    global $pdo;
    
    try {
        $pdo->beginTransaction();
        
        // Check if event exists and get image path
        $stmt = $pdo->prepare("SELECT image FROM events WHERE id = ?");
        $stmt->execute([$id]);
        $event = $stmt->fetch();
        
        if (!$event) {
            jsonResponse(null, 404, 'Event not found');
            return;
        }
        
        // Delete the event
        $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
        $stmt->execute([$id]);
        
        // Delete the image if it exists
        if ($event['image']) {
            $imagePath = __DIR__ . '/../../uploads/' . $event['image'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }
        
        $pdo->commit();
        
        jsonResponse(['id' => $id], 200, 'Event deleted successfully');
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Failed to delete event');
    } catch (Exception $e) {
        $pdo->rollBack();
        error_log("Error: " . $e->getMessage());
        jsonResponse(null, 500, $e->getMessage());
    }
}

/**
 * Reorder events
 * 
 * Expects a POST request with a 'order' parameter containing an array of event IDs in the desired order
 */
function reorderEvents() {
    global $pdo;
    
    // Get the order data
    $orderData = json_decode(file_get_contents('php://input'), true);
    $eventIds = $orderData['order'] ?? [];
    
    if (empty($eventIds) || !is_array($eventIds)) {
        jsonResponse(null, 400, 'Invalid order data');
        return;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Update the display order for each event
        foreach ($eventIds as $index => $eventId) {
            $displayOrder = $index + 1;
            $stmt = $pdo->prepare("UPDATE events SET display_order = ? WHERE id = ?");
            $stmt->execute([$displayOrder, $eventId]);
        }
        
        $pdo->commit();
        
        jsonResponse(['success' => true], 200, 'Events reordered successfully');
    } catch (PDOException $e) {
        $pdo->rollBack();
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Failed to reorder events');
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
    
    // Return relative path (without uploads/ prefix since it's added elsewhere)
    return $subdir . '/' . $filename;
}

/**
 * Format event data for response
 * 
 * @param array $event The event data from database
 * @return array Formatted event data
 */
function formatEvent($event) {
    $formatted = [
        'id' => (int)$event['id'],
        'title' => $event['title'],
        'date' => $event['date'],
        'time' => $event['time'],
        'location' => $event['location'],
        'description' => $event['description'],
        'created_at' => $event['created_at'],
        'updated_at' => $event['updated_at'],
    ];
    
    // Add image URL if available
    if (!empty($event['image'])) {
        $formatted['image_url'] = SITE_URL . '/uploads/' . $event['image'];
        $formatted['image'] = $event['image'];
    }
    
    return $formatted;
}
