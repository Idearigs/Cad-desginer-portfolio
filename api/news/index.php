<?php
/**
 * Clean News API - No Dependencies
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
    $articleId = isset($_GET['id']) ? (int)$_GET['id'] : null;

    // Require auth for non-GET
    if ($method !== 'GET') {
        requireAuthClean();
    }

    switch ($method) {
        case 'GET':
            if ($articleId) {
                getArticleClean($pdo, $articleId);
            } else {
                getArticlesClean($pdo);
            }
            break;
            
        case 'POST':
            if (isset($_POST['action']) && $_POST['action'] === 'update') {
                updateArticleClean($pdo, (int)$_POST['id']);
            } else {
                createArticleClean($pdo);
            }
            break;
            
        case 'DELETE':
            deleteArticleClean($pdo, $articleId);
            break;
            
        default:
            jsonResponseClean(null, 405, 'Method not allowed');
    }

} catch (Exception $e) {
    jsonResponseClean(null, 500, 'Server error');
}

function getArticlesClean($pdo) {
    $stmt = $pdo->query("SELECT * FROM articles ORDER BY date DESC");
    $articles = $stmt->fetchAll();
    jsonResponseClean($articles, 200, 'Articles retrieved');
}

function getArticleClean($pdo, $id) {
    $stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ?");
    $stmt->execute([$id]);
    $article = $stmt->fetch();
    
    if (!$article) {
        jsonResponseClean(null, 404, 'Article not found');
    }
    
    jsonResponseClean($article, 200, 'Article retrieved');
}

function createArticleClean($pdo) {
    $title = $_POST['title'] ?? '';
    $content = $_POST['content'] ?? '';
    $author = $_POST['author'] ?? '';
    $publication = $_POST['publication'] ?? '';
    $date = $_POST['date'] ?? date('Y-m-d');

    if (empty($title) || empty($content)) {
        jsonResponseClean(null, 400, 'Title and content required');
    }

    // Handle image upload
    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../uploads/articles/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $fileName = time() . '_' . basename($_FILES['image']['name']);
        $targetPath = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            $imagePath = $fileName;
        }
    }

    $stmt = $pdo->prepare("INSERT INTO articles (title, author, publication, date, content, image, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
    $stmt->execute([$title, $author, $publication, $date, $content, $imagePath]);
    
    jsonResponseClean(['id' => $pdo->lastInsertId()], 201, 'Article created');
}

function updateArticleClean($pdo, $id) {
    $title = $_POST['title'] ?? '';
    $content = $_POST['content'] ?? '';
    $author = $_POST['author'] ?? '';
    $publication = $_POST['publication'] ?? '';
    $date = $_POST['date'] ?? '';

    if (empty($title) || empty($content)) {
        jsonResponseClean(null, 400, 'Title and content required');
    }

    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../uploads/articles/';
        $fileName = time() . '_' . basename($_FILES['image']['name']);
        $targetPath = $uploadDir . $fileName;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
            $imagePath = $fileName;
        }
    }

    if ($imagePath) {
        $stmt = $pdo->prepare("UPDATE articles SET title = ?, author = ?, publication = ?, date = ?, content = ?, image = ? WHERE id = ?");
        $stmt->execute([$title, $author, $publication, $date, $content, $imagePath, $id]);
    } else {
        $stmt = $pdo->prepare("UPDATE articles SET title = ?, author = ?, publication = ?, date = ?, content = ? WHERE id = ?");
        $stmt->execute([$title, $author, $publication, $date, $content, $id]);
    }

    jsonResponseClean(['id' => $id], 200, 'Article updated');
}

function deleteArticleClean($pdo, $id) {
    $stmt = $pdo->prepare("DELETE FROM articles WHERE id = ?");
    $stmt->execute([$id]);
    
    if ($stmt->rowCount() === 0) {
        jsonResponseClean(null, 404, 'Article not found');
    }
    
    jsonResponseClean(null, 200, 'Article deleted');
}

ob_end_flush();
?>