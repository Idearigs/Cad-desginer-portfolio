<?php
/**
 * Health Check API v1
 * 
 * Provides system health and status information
 */

// Include enhanced configuration
require_once '../../includes/config.php';
require_once '../../includes/db.php';

// Start request timing
$startTime = microtime(true);

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    jsonResponse(null, 405, 'Method Not Allowed');
}

// Apply basic rate limiting (more lenient for health checks)
RateLimiter::enforce(null, 1000, 3600); // 1000 requests per hour

try {
    $healthStatus = [
        'status' => 'healthy',
        'timestamp' => date('c'),
        'version' => API_VERSION,
        'environment' => EnvLoader::get('APP_ENV', 'unknown'),
        'checks' => []
    ];

    $allHealthy = true;

    // Database connectivity check
    try {
        $stmt = $pdo->query('SELECT 1');
        $healthStatus['checks']['database'] = [
            'status' => 'healthy',
            'response_time_ms' => 0 // Will be calculated
        ];
        
        $dbStartTime = microtime(true);
        $stmt->fetch();
        $dbEndTime = microtime(true);
        $healthStatus['checks']['database']['response_time_ms'] = round(($dbEndTime - $dbStartTime) * 1000, 2);
        
    } catch (Exception $e) {
        $healthStatus['checks']['database'] = [
            'status' => 'unhealthy',
            'error' => 'Database connection failed'
        ];
        $allHealthy = false;
        Logger::error("Health check: Database connection failed", ['error' => $e->getMessage()]);
    }

    // File system checks
    try {
        $requiredDirs = [
            'uploads' => UPLOAD_DIR,
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
        Logger::error("Health check: Filesystem check failed", ['error' => $e->getMessage()]);
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
        $uploadDirSpace = disk_free_space(UPLOAD_DIR);
        $uploadDirTotal = disk_total_space(UPLOAD_DIR);
        $uploadDirUsed = $uploadDirTotal - $uploadDirSpace;
        $uploadDirUsedPercent = ($uploadDirUsed / $uploadDirTotal) * 100;

        $healthStatus['checks']['disk_space'] = [
            'status' => $uploadDirUsedPercent < 80 ? 'healthy' : 'warning',
            'free_bytes' => $uploadDirSpace,
            'free_mb' => round($uploadDirSpace / 1024 / 1024, 2),
            'used_percent' => round($uploadDirUsedPercent, 2),
            'path' => UPLOAD_DIR
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

    // Log health check
    Logger::info("Health check performed", [
        'status' => $healthStatus['status'],
        'response_time_ms' => $healthStatus['response_time_ms'],
        'checks_count' => count($healthStatus['checks'])
    ]);

    // Return appropriate HTTP status code
    $httpStatus = $allHealthy ? 200 : 503;
    
    // Add caching headers for health checks
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: ' . gmdate('D, d M Y H:i:s \G\M\T', time() - 3600));
    
    jsonResponse($healthStatus, $httpStatus, $allHealthy ? 'System is healthy' : 'System has issues');

} catch (Exception $e) {
    Logger::error("Health check failed", ['error' => $e->getMessage()]);
    
    jsonResponse([
        'status' => 'error',
        'timestamp' => date('c'),
        'error' => 'Health check failed'
    ], 500, 'Health check failed');
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