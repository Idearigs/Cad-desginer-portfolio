<?php
/**
 * API Rate Limiting System
 * Prevents abuse and ensures fair usage
 */

class RateLimiter {
    private static $storageDir = null;
    private static $defaultLimit = 100;
    private static $defaultWindow = 3600; // 1 hour
    private static $cleanupProbability = 0.01; // 1% chance to run cleanup

    /**
     * Initialize rate limiter
     */
    private static function init() {
        if (self::$storageDir === null) {
            self::$storageDir = __DIR__ . '/../storage/rate_limits';
            
            if (!is_dir(self::$storageDir)) {
                mkdir(self::$storageDir, 0755, true);
                
                // Create .htaccess to prevent web access
                file_put_contents(dirname(self::$storageDir) . '/.htaccess', "Deny from all\n");
            }
        }
    }

    /**
     * Check if request should be rate limited
     */
    public static function checkLimit($identifier = null, $limit = null, $window = null) {
        self::init();

        // Get configuration
        $limit = $limit ?? EnvLoader::get('RATE_LIMIT_REQUESTS', self::$defaultLimit);
        $window = $window ?? EnvLoader::get('RATE_LIMIT_WINDOW', self::$defaultWindow);

        // Generate identifier if not provided
        if ($identifier === null) {
            $identifier = self::generateIdentifier();
        }

        // Cleanup old files occasionally
        if (rand(1, 100) <= (self::$cleanupProbability * 100)) {
            self::cleanup();
        }

        // Get current window
        $currentWindow = floor(time() / $window);
        $filename = self::getFilename($identifier, $currentWindow);

        // Get current count
        $currentCount = self::getCurrentCount($filename);
        
        // Check if limit exceeded
        if ($currentCount >= $limit) {
            Logger::warning("Rate limit exceeded", [
                'identifier' => $identifier,
                'count' => $currentCount,
                'limit' => $limit,
                'window' => $window
            ]);

            self::sendRateLimitHeaders($currentCount, $limit, $window, $currentWindow);
            return false;
        }

        // Increment counter
        self::incrementCounter($filename);
        
        // Send rate limit headers
        self::sendRateLimitHeaders($currentCount + 1, $limit, $window, $currentWindow);
        
        return true;
    }

    /**
     * Enforce rate limit (block request if exceeded)
     */
    public static function enforce($identifier = null, $limit = null, $window = null) {
        if (!self::checkLimit($identifier, $limit, $window)) {
            http_response_code(429);
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'error',
                'message' => 'Rate limit exceeded. Please try again later.',
                'error_code' => 'RATE_LIMIT_EXCEEDED'
            ]);
            exit;
        }
    }

    /**
     * Generate identifier for the request
     */
    private static function generateIdentifier() {
        // Use IP address as primary identifier
        $ip = self::getClientIp();
        
        // Add user ID if authenticated
        $userId = $_SESSION['user_id'] ?? null;
        if ($userId) {
            return "user_{$userId}_{$ip}";
        }

        // Use IP-based identifier
        return "ip_{$ip}";
    }

    /**
     * Get client IP address
     */
    private static function getClientIp() {
        $headers = [
            'HTTP_CF_CONNECTING_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR'
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                $ip = trim($ips[0]);
                
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return 'unknown';
    }

    /**
     * Generate filename for storing rate limit data
     */
    private static function getFilename($identifier, $window) {
        $hash = hash('sha256', $identifier);
        return self::$storageDir . '/' . $hash . '_' . $window . '.count';
    }

    /**
     * Get current count from file
     */
    private static function getCurrentCount($filename) {
        if (!file_exists($filename)) {
            return 0;
        }

        $content = file_get_contents($filename);
        return (int) $content;
    }

    /**
     * Increment counter in file
     */
    private static function incrementCounter($filename) {
        $count = self::getCurrentCount($filename) + 1;
        file_put_contents($filename, $count, LOCK_EX);
        
        // Set proper permissions
        chmod($filename, 0644);
    }

    /**
     * Send rate limiting headers
     */
    private static function sendRateLimitHeaders($current, $limit, $window, $currentWindow) {
        $remaining = max(0, $limit - $current);
        $resetTime = ($currentWindow + 1) * $window;

        header("X-RateLimit-Limit: $limit");
        header("X-RateLimit-Remaining: $remaining");
        header("X-RateLimit-Reset: $resetTime");
        header("X-RateLimit-Window: $window");
    }

    /**
     * Clean up old rate limit files
     */
    private static function cleanup() {
        if (!is_dir(self::$storageDir)) {
            return;
        }

        $files = glob(self::$storageDir . '/*.count');
        $currentTime = time();
        $maxAge = 7200; // 2 hours
        $cleanedCount = 0;

        foreach ($files as $file) {
            if (filemtime($file) < ($currentTime - $maxAge)) {
                unlink($file);
                $cleanedCount++;
            }
        }

        if ($cleanedCount > 0) {
            Logger::debug("Rate limiter cleanup: removed $cleanedCount old files");
        }
    }

    /**
     * Get rate limit status for identifier
     */
    public static function getStatus($identifier = null, $limit = null, $window = null) {
        self::init();

        $limit = $limit ?? EnvLoader::get('RATE_LIMIT_REQUESTS', self::$defaultLimit);
        $window = $window ?? EnvLoader::get('RATE_LIMIT_WINDOW', self::$defaultWindow);

        if ($identifier === null) {
            $identifier = self::generateIdentifier();
        }

        $currentWindow = floor(time() / $window);
        $filename = self::getFilename($identifier, $currentWindow);
        $currentCount = self::getCurrentCount($filename);

        return [
            'limit' => $limit,
            'remaining' => max(0, $limit - $currentCount),
            'reset_time' => ($currentWindow + 1) * $window,
            'window' => $window,
            'current_count' => $currentCount
        ];
    }

    /**
     * Reset rate limit for identifier
     */
    public static function reset($identifier = null) {
        self::init();

        if ($identifier === null) {
            $identifier = self::generateIdentifier();
        }

        $window = EnvLoader::get('RATE_LIMIT_WINDOW', self::$defaultWindow);
        $currentWindow = floor(time() / $window);
        $filename = self::getFilename($identifier, $currentWindow);

        if (file_exists($filename)) {
            unlink($filename);
            Logger::info("Rate limit reset for identifier", ['identifier' => $identifier]);
        }
    }
}

// Create storage directory
if (!is_dir(__DIR__ . '/../storage')) {
    mkdir(__DIR__ . '/../storage', 0755, true);
}