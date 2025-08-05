<?php
/**
 * Clean Events API - No Dependencies
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
    $pdo = new PDO("mysql:host=server119.web-hosting.com;dbname=chamodio_caddb;charset=utf8mb4", "chamodio_root", "#Chamalcaddb#2025", [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $method = $_SERVER['REQUEST_METHOD'];
    $eventId = isset($_GET['id']) ? (int)$_GET['id'] : null;

    // Require auth for non-GET
    if ($method !== 'GET') {
        requireAuthClean();
    }

    switch ($method) {
        case 'GET':
            if ($eventId) {
                getEventClean($pdo, $eventId);
            } else {
                getEventsClean($pdo);
            }
            break;
            
        case 'POST':
            if (isset($_POST['action']) && $_POST['action'] === 'update') {
                updateEventClean($pdo, (int)$_GET['id']);
            } else {
                createEventClean($pdo);
            }
            break;
            
        case 'DELETE':
            deleteEventClean($pdo, $eventId);
            break;
            
        default:
            jsonResponseClean(null, 405, 'Method not allowed');
    }

} catch (Exception $e) {
    jsonResponseClean(null, 500, 'Server error');
}

function getEventsClean($pdo) {
    $stmt = $pdo->query("SELECT * FROM events ORDER BY date DESC");
    $events = $stmt->fetchAll();
    
    // Format events with proper image URLs
    foreach ($events as &$event) {
        if ($event['image']) {
            $event['image_url'] = (EnvLoader::isProduction() ? '' : '/jewellery-designer/cad-art') . '/uploads/events/' . $event['image'];
        }
    }
    
    jsonResponseClean($events, 200, 'Events retrieved');
}

function getEventClean($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
    $stmt->execute([$id]);
    $event = $stmt->fetch();
    
    if (!$event) {
        jsonResponseClean(null, 404, 'Event not found');
    }
    
    if ($event['image']) {
        $event['image_url'] = (EnvLoader::isProduction() ? '' : '/jewellery-designer/cad-art') . '/uploads/events/' . $event['image'];
    }
    
    jsonResponseClean($event, 200, 'Event retrieved');
}

function createEventClean($pdo) {
    $title = $_POST['title'] ?? '';
    $date = $_POST['date'] ?? date('Y-m-d');
    $time = $_POST['time'] ?? null;
    $location = $_POST['location'] ?? '';
    $description = $_POST['description'] ?? '';

    if (empty($title)) {
        jsonResponseClean(null, 400, 'Title is required');
    }

    // Handle image upload
    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../uploads/events/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $fileName = time() . '_' . basename($_FILES['image']['name']);
        $targetPath = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            $imagePath = $fileName;
        }
    }

    $stmt = $pdo->prepare("INSERT INTO events (title, date, time, location, description, image, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())");
    $stmt->execute([$title, $date, $time, $location, $description, $imagePath]);
    
    jsonResponseClean(['id' => $pdo->lastInsertId()], 201, 'Event created');
}

function updateEventClean($pdo, $id) {
    $title = $_POST['title'] ?? '';
    $date = $_POST['date'] ?? '';
    $time = $_POST['time'] ?? null;
    $location = $_POST['location'] ?? '';
    $description = $_POST['description'] ?? '';

    if (empty($title)) {
        jsonResponseClean(null, 400, 'Title is required');
    }

    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../uploads/events/';
        $fileName = time() . '_' . basename($_FILES['image']['name']);
        $targetPath = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            $imagePath = $fileName;
        }
    }

    if ($imagePath) {
        $stmt = $pdo->prepare("UPDATE events SET title = ?, date = ?, time = ?, location = ?, description = ?, image = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$title, $date, $time, $location, $description, $imagePath, $id]);
    } else {
        $stmt = $pdo->prepare("UPDATE events SET title = ?, date = ?, time = ?, location = ?, description = ?, updated_at = NOW() WHERE id = ?");
        $stmt->execute([$title, $date, $time, $location, $description, $id]);
    }

    jsonResponseClean(['id' => $id], 200, 'Event updated');
}

function deleteEventClean($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponseClean(null, 404, 'Event not found');
    }
    
    jsonResponseClean(null, 200, 'Event deleted');
}

ob_end_flush();
?>