<?php
/**
 * Health Check API v1
 * 
 * Provides system health and status information
 */

// Set headers first
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Try to include enhanced configuration, but handle errors gracefully
try {
    require_once '../../includes/env.php';
    $useEnhancedConfig = true;
} catch (Exception $e) {
    $useEnhancedConfig = false;
}

// Start request timing
$startTime = microtime(true);

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method Not Allowed']);
    exit;
}

try {
    $healthStatus = [
        'status' => 'healthy',
        'timestamp' => date('c'),
        'version' => '1.0',
        'environment' => $useEnhancedConfig ? EnvLoader::get('APP_ENV', 'production') : 'production',
        'checks' => []
    ];

    $allHealthy = true;

    // Database connectivity check
    try {
        $pdo = new PDO("mysql:host=server119.web-hosting.com;dbname=chamodio_caddb;charset=utf8mb4", "chamodio_root", "#Chamalcaddb#2025", [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5
        ]);
        
        $dbStartTime = microtime(true);
        $stmt = $pdo->query('SELECT 1');
        $stmt->fetch();
        $dbEndTime = microtime(true);
        
        $healthStatus['checks']['database'] = [
            'status' => 'healthy',
            'response_time_ms' => round(($dbEndTime - $dbStartTime) * 1000, 2)
        ];
        
    } catch (Exception $e) {
        $healthStatus['checks']['database'] = [
            'status' => 'unhealthy',
            'error' => 'Database connection failed'
        ];
        $allHealthy = false;
    }

    // File system checks
    try {
        $requiredDirs = [
            'uploads' => __DIR__ . '/../../uploads',
            'logs' => __DIR__ . '/../../logs',
            'storage' => __DIR__ . '/../../storage'
        ];

        foreach ($requiredDirs as $name => $dir) {
            if (is_dir($dir) && is_writable($dir)) {
                $healthStatus['checks']["filesystem_{$name}"] = [
                    'status' => 'healthy',
                    'path' => $dir,
                    'writable' => true
                ];
            } else {
                $healthStatus['checks']["filesystem_{$name}"] = [
                    'status' => 'unhealthy',
                    'path' => $dir,
                    'writable' => false,
                    'exists' => is_dir($dir)
                ];
                $allHealthy = false;
            }
        }
    } catch (Exception $e) {
        $healthStatus['checks']['filesystem'] = [
            'status' => 'unhealthy',
            'error' => 'Filesystem check failed'
        ];
        $allHealthy = false;
    }

    // PHP configuration checks
    $healthStatus['checks']['php'] = [
        'status' => 'healthy',
        'version' => PHP_VERSION,
        'memory_limit' => ini_get('memory_limit'),
        'max_execution_time' => ini_get('max_execution_time'),
        'upload_max_filesize' => ini_get('upload_max_filesize'),
        'post_max_size' => ini_get('post_max_size')
    ];

    // Memory usage check
    $memoryUsage = memory_get_usage(true);
    $memoryLimit = ini_get('memory_limit');
    $memoryLimitBytes = parseMemoryLimit($memoryLimit);
    $memoryUsagePercent = $memoryLimitBytes > 0 ? ($memoryUsage / $memoryLimitBytes) * 100 : 0;

    $healthStatus['checks']['memory'] = [
        'status' => $memoryUsagePercent < 80 ? 'healthy' : 'warning',
        'usage_bytes' => $memoryUsage,
        'usage_mb' => round($memoryUsage / 1024 / 1024, 2),
        'limit' => $memoryLimit,
        'usage_percent' => round($memoryUsagePercent, 2)
    ];

    if ($memoryUsagePercent >= 90) {
        $healthStatus['checks']['memory']['status'] = 'unhealthy';
        $allHealthy = false;
    }

    // Disk space check for upload directory
    try {
        $uploadDir = __DIR__ . '/../../uploads';
        $uploadDirSpace = disk_free_space($uploadDir);
        $uploadDirTotal = disk_total_space($uploadDir);
        $uploadDirUsed = $uploadDirTotal - $uploadDirSpace;
        $uploadDirUsedPercent = ($uploadDirUsed / $uploadDirTotal) * 100;

        $healthStatus['checks']['disk_space'] = [
            'status' => $uploadDirUsedPercent < 80 ? 'healthy' : 'warning',
            'free_bytes' => $uploadDirSpace,
            'free_mb' => round($uploadDirSpace / 1024 / 1024, 2),
            'used_percent' => round($uploadDirUsedPercent, 2),
            'path' => $uploadDir
        ];

        if ($uploadDirUsedPercent >= 90) {
            $healthStatus['checks']['disk_space']['status'] = 'unhealthy';
            $allHealthy = false;
        }
    } catch (Exception $e) {
        $healthStatus['checks']['disk_space'] = [
            'status' => 'warning',
            'error' => 'Could not check disk space'
        ];
    }

    // API endpoints health check
    $apiEndpoints = [
        'news' => '../../api/news/index.php',
        'events' => '../../api/events/index.php',
        'gallery' => '../../api/gallery/index.php'
    ];

    foreach ($apiEndpoints as $name => $endpoint) {
        $healthStatus['checks']["api_{$name}"] = [
            'status' => file_exists($endpoint) ? 'healthy' : 'unhealthy',
            'exists' => file_exists($endpoint)
        ];

        if (!file_exists($endpoint)) {
            $allHealthy = false;
        }
    }

    // Set overall status
    $healthStatus['status'] = $allHealthy ? 'healthy' : 'unhealthy';

    // Calculate total response time
    $endTime = microtime(true);
    $healthStatus['response_time_ms'] = round(($endTime - $startTime) * 1000, 2);

    // Return appropriate HTTP status code
    $httpStatus = $allHealthy ? 200 : 503;
    
    // Add caching headers for health checks
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: ' . gmdate('D, d M Y H:i:s \G\M\T', time() - 3600));
    
    http_response_code($httpStatus);
    echo json_encode([
        'status' => $allHealthy ? 'success' : 'error',
        'message' => $allHealthy ? 'System is healthy' : 'System has issues',
        'data' => $healthStatus
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Health check failed',
        'data' => [
            'status' => 'error',
            'timestamp' => date('c'),
            'error' => 'Health check failed'
        ]
    ]);
}

/**
 * Parse memory limit string to bytes
 */
function parseMemoryLimit($limit) {
    if ($limit == -1) return PHP_INT_MAX;
    
    $unit = strtolower(substr($limit, -1));
    $value = (int) $limit;
    
    switch ($unit) {
        case 'g':
            $value *= 1024;
        case 'm':
            $value *= 1024;
        case 'k':
            $value *= 1024;
    }
    
    return $value;
}