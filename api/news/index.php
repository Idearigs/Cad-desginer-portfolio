<?php
// Disable direct error output to ensure proper JSON responses
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../php_errors.log');

/**
 * News API
 * 
 * Handles CRUD operations for news articles
 */

// Include required files
require_once '../../includes/config.php';
require_once '../../includes/db.php';


// Get request method and article ID if provided
$method = $_SERVER['REQUEST_METHOD'];
$articleId = isset($_GET['id']) ? (int)$_GET['id'] : null;

// For GET requests, we'll allow public access
// For other methods (POST, PUT, DELETE), we'll require authentication
if ($method !== 'GET') {
    requireAuth();
}

// Handle different HTTP methods
switch ($method) {
    case 'GET':
        if (isset($_GET['session_check'])) {
            // Used by checkAuthStatus() in admin.js
            jsonResponse(['status' => 'authenticated'], 200, 'Authentication valid');
        } elseif ($articleId) {
            // Get a specific article by ID
            getArticle($articleId);
        } else {
            // Get all articles, optionally filtered by tag
            $tag = isset($_GET['tag']) ? $_GET['tag'] : null;
            getArticles($tag);
        }
        break;
        
    case 'POST':
        // Check if it's an update or create operation
        if (isset($_POST['action']) && $_POST['action'] === 'update') {
            $articleId = (int)($_POST['id'] ?? 0);
            if (!$articleId) {
                jsonResponse(null, 400, 'Article ID is required for updates');
            }
            updateArticle($articleId);
        } else {
            // Create a new article
            createArticle();
        }
        break;
        
    case 'PUT':
        // Update an existing article
        if (!$articleId) {
            jsonResponse(null, 400, 'Article ID is required for updates');
        }
        updateArticle($articleId);
        break;
        
    case 'DELETE':
        // Delete an article
        if (!$articleId) {
            jsonResponse(null, 400, 'Article ID is required for deletion');
        }
        deleteArticle($articleId);
        break;
        
    default:
        jsonResponse(null, 405, 'Method not allowed');
}

/**
 * Get all articles
 * 
 * @param string|null $tag Optional tag to filter by
 */
function getArticles($tag = null) {
    global $pdo;
    
    try {
        // Check if tags table exists
        $tagsTableExists = false;
        try {
            $checkStmt = $pdo->query("SHOW TABLES LIKE 'tags'");
            $tagsTableExists = $checkStmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error checking tags table: " . $e->getMessage());
            $tagsTableExists = false;
        }
        
        // Check if article_tags table exists
        $articleTagsTableExists = false;
        try {
            $checkStmt = $pdo->query("SHOW TABLES LIKE 'article_tags'");
            $articleTagsTableExists = $checkStmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("Error checking article_tags table: " . $e->getMessage());
            $articleTagsTableExists = false;
        }
        
        if ($tag) {
            // If we have a tag filter and tags table exists
            if ($tagsTableExists && $articleTagsTableExists) {
                $sql = "SELECT a.* FROM articles a 
                        LEFT JOIN article_tags at ON a.id = at.article_id 
                        LEFT JOIN tags t ON at.tag_id = t.id 
                        WHERE t.name = :tag 
                        GROUP BY a.id 
                        ORDER BY a.date DESC";
                
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(":tag", $tag);
                $stmt->execute();
                $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } else {
                // If tags table doesn't exist, return empty array
                $articles = [];
            }
        } else {
            // No tag filter, get all articles
            $sql = "SELECT * FROM articles ORDER BY date DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Add tags to each article if tables exist
            if ($tagsTableExists && $articleTagsTableExists) {
                foreach ($articles as &$article) {
                    $article['tags'] = getArticleTags($article['id']);
                }
            }
        }
        
        // Return articles directly without formatArticle
        jsonResponse($articles, 200, 'Articles retrieved successfully');
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        jsonResponse([], 500, 'Database error occurred');
    }
}

function getArticleTags($articleId) {
    global $pdo;
    
    try {
        // Check if tables exist first
        $stmt = $pdo->query("SHOW TABLES LIKE 'article_tags'");
        $articleTagsExists = $stmt->rowCount() > 0;
        
        $stmt = $pdo->query("SHOW TABLES LIKE 'tags'");
        $tagsExists = $stmt->rowCount() > 0;
        
        if (!$articleTagsExists || !$tagsExists) {
            return [];
        }
        
        // Get column names from article_tags table
        $stmt = $pdo->query("DESCRIBE article_tags");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        // If tag_id column doesn't exist, return empty array
        if (!in_array("tag_id", $columns)) {
            return [];
        }
        
        // Use a simple query without complex joins
        $sql = "SELECT t.name FROM tags t, article_tags a 
                WHERE a.article_id = :article_id 
                AND a.tag_id = t.id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(":article_id", $articleId, PDO::PARAM_INT);
        $stmt->execute();
        
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    } catch (PDOException $e) {
        error_log("Error getting article tags: " . $e->getMessage());
        return [];
    }
}

/**
 * Get a single article by ID
 */
function getArticle($articleId) {
    global $pdo;
    
    try {
        $sql = "SELECT * FROM articles WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $articleId, PDO::PARAM_INT);
        $stmt->execute();
        
        $article = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$article) {
            jsonResponse(null, 404, 'Article not found');
            return;
        }
        
        // Add tags to the article
        $article['tags'] = getArticleTags($articleId);
        
        jsonResponse($article, 200, 'Article retrieved successfully');
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Database error occurred');
    }
}

/**
 * Create a new article
 */
function createArticle() {
    global $pdo;
    
    try {
        // Get POST data
        $title = $_POST['title'] ?? '';
        $author = $_POST['author'] ?? '';
        $publication = $_POST['publication'] ?? '';
        $date = $_POST['date'] ?? date('Y-m-d');
        $content = $_POST['content'] ?? '';
        $tags = $_POST['tags'] ?? '';
        
        // Validate required fields
        if (empty($title) || empty($content)) {
            jsonResponse(null, 400, 'Title and content are required');
            return;
        }
        
        // Handle file upload if present
        $imagePath = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../../uploads/';
            $fileName = time() . '_' . basename($_FILES['image']['name']);
            $targetPath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                $imagePath = $fileName;
            }
        }
        
        // Insert article
        $sql = "INSERT INTO articles (title, author, publication, date, content, image, created_at) 
                VALUES (:title, :author, :publication, :date, :content, :image, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':author', $author);
        $stmt->bindParam(':publication', $publication);
        $stmt->bindParam(':date', $date);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':image', $imagePath);
        
        $stmt->execute();
        $articleId = $pdo->lastInsertId();
        
        // Handle tags if provided
        if (!empty($tags)) {
            $tagArray = array_map('trim', explode(',', $tags));
            foreach ($tagArray as $tagName) {
                if (!empty($tagName)) {
                    // Insert or get tag ID
                    $tagSql = "INSERT IGNORE INTO tags (name) VALUES (:name)";
                    $tagStmt = $pdo->prepare($tagSql);
                    $tagStmt->bindParam(':name', $tagName);
                    $tagStmt->execute();
                    
                    // Get tag ID
                    $getTagSql = "SELECT id FROM tags WHERE name = :name";
                    $getTagStmt = $pdo->prepare($getTagSql);
                    $getTagStmt->bindParam(':name', $tagName);
                    $getTagStmt->execute();
                    $tagId = $getTagStmt->fetchColumn();
                    
                    // Link article to tag
                    $linkSql = "INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (:article_id, :tag_id)";
                    $linkStmt = $pdo->prepare($linkSql);
                    $linkStmt->bindParam(':article_id', $articleId);
                    $linkStmt->bindParam(':tag_id', $tagId);
                    $linkStmt->execute();
                }
            }
        }
        
        jsonResponse(['id' => $articleId], 201, 'Article created successfully');
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Database error occurred');
    }
}

/**
 * Update an existing article
 */
function updateArticle($articleId) {
    global $pdo;
    
    try {
        // Get POST data (now using POST for updates too)
        $title = $_POST['title'] ?? '';
        $author = $_POST['author'] ?? '';
        $publication = $_POST['publication'] ?? '';
        $date = $_POST['date'] ?? '';
        $content = $_POST['content'] ?? '';
        $tags = $_POST['tags'] ?? '';
        
        // Validate required fields
        if (empty($title) || empty($content)) {
            jsonResponse(null, 400, 'Title and content are required');
            return;
        }
        
        // Handle file upload if present
        $imageSQL = '';
        $imagePath = null;
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../../uploads/';
            $fileName = time() . '_' . basename($_FILES['image']['name']);
            $targetPath = $uploadDir . $fileName;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetPath)) {
                $imagePath = $fileName;
                $imageSQL = ', image = :image';
            }
        }
        
        // Update article
        $sql = "UPDATE articles SET title = :title, author = :author, publication = :publication, 
                date = :date, content = :content" . $imageSQL . " WHERE id = :id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':author', $author);
        $stmt->bindParam(':publication', $publication);
        $stmt->bindParam(':date', $date);
        $stmt->bindParam(':content', $content);
        if ($imagePath) {
            $stmt->bindParam(':image', $imagePath);
        }
        $stmt->bindParam(':id', $articleId, PDO::PARAM_INT);
        
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            jsonResponse(null, 404, 'Article not found');
            return;
        }
        
        // Handle tags update
        if (isset($_POST['tags'])) {
            // Remove existing tags
            $deleteSql = "DELETE FROM article_tags WHERE article_id = :article_id";
            $deleteStmt = $pdo->prepare($deleteSql);
            $deleteStmt->bindParam(':article_id', $articleId);
            $deleteStmt->execute();
            
            // Add new tags
            if (!empty($tags)) {
                $tagArray = array_map('trim', explode(',', $tags));
                foreach ($tagArray as $tagName) {
                    if (!empty($tagName)) {
                        // Insert or get tag ID
                        $tagSql = "INSERT IGNORE INTO tags (name) VALUES (:name)";
                        $tagStmt = $pdo->prepare($tagSql);
                        $tagStmt->bindParam(':name', $tagName);
                        $tagStmt->execute();
                        
                        // Get tag ID
                        $getTagSql = "SELECT id FROM tags WHERE name = :name";
                        $getTagStmt = $pdo->prepare($getTagSql);
                        $getTagStmt->bindParam(':name', $tagName);
                        $getTagStmt->execute();
                        $tagId = $getTagStmt->fetchColumn();
                        
                        // Link article to tag
                        $linkSql = "INSERT IGNORE INTO article_tags (article_id, tag_id) VALUES (:article_id, :tag_id)";
                        $linkStmt = $pdo->prepare($linkSql);
                        $linkStmt->bindParam(':article_id', $articleId);
                        $linkStmt->bindParam(':tag_id', $tagId);
                        $linkStmt->execute();
                    }
                }
            }
        }
        
        jsonResponse(['id' => $articleId], 200, 'Article updated successfully');
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Database error occurred');
    }
}

/**
 * Delete an article
 */
function deleteArticle($articleId) {
    global $pdo;
    
    try {
        // First, delete associated tags
        $deleteTagsSql = "DELETE FROM article_tags WHERE article_id = :article_id";
        $deleteTagsStmt = $pdo->prepare($deleteTagsSql);
        $deleteTagsStmt->bindParam(':article_id', $articleId);
        $deleteTagsStmt->execute();
        
        // Then delete the article
        $sql = "DELETE FROM articles WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':id', $articleId, PDO::PARAM_INT);
        $stmt->execute();
        
        if ($stmt->rowCount() === 0) {
            jsonResponse(null, 404, 'Article not found');
            return;
        }
        
        jsonResponse(null, 200, 'Article deleted successfully');
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        jsonResponse(null, 500, 'Database error occurred');
    }
}
