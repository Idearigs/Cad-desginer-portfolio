<?php
/**
 * Professional Logging System
 * PSR-3 compliant logger with file rotation and security
 */

class Logger {
    const EMERGENCY = 0;
    const ALERT = 1;
    const CRITICAL = 2;
    const ERROR = 3;
    const WARNING = 4;
    const NOTICE = 5;
    const INFO = 6;
    const DEBUG = 7;

    private static $levels = [
        0 => 'EMERGENCY',
        1 => 'ALERT',
        2 => 'CRITICAL',
        3 => 'ERROR',
        4 => 'WARNING',
        5 => 'NOTICE',
        6 => 'INFO',
        7 => 'DEBUG'
    ];

    private static $logDir = null;
    private static $maxFileSize = 10485760; // 10MB
    private static $maxFiles = 5;

    /**
     * Initialize logger
     */
    private static function init() {
        if (self::$logDir === null) {
            self::$logDir = __DIR__ . '/../logs';
            
            // Create logs directory if it doesn't exist
            if (!is_dir(self::$logDir)) {
                mkdir(self::$logDir, 0755, true);
                
                // Create .htaccess to prevent web access
                file_put_contents(self::$logDir . '/.htaccess', "Deny from all\n");
            }
        }
    }

    /**
     * Log a message at emergency level
     */
    public static function emergency($message, array $context = []) {
        self::log(self::EMERGENCY, $message, $context);
    }

    /**
     * Log a message at alert level
     */
    public static function alert($message, array $context = []) {
        self::log(self::ALERT, $message, $context);
    }

    /**
     * Log a message at critical level
     */
    public static function critical($message, array $context = []) {
        self::log(self::CRITICAL, $message, $context);
    }

    /**
     * Log a message at error level
     */
    public static function error($message, array $context = []) {
        self::log(self::ERROR, $message, $context);
    }

    /**
     * Log a message at warning level
     */
    public static function warning($message, array $context = []) {
        self::log(self::WARNING, $message, $context);
    }

    /**
     * Log a message at notice level
     */
    public static function notice($message, array $context = []) {
        self::log(self::NOTICE, $message, $context);
    }

    /**
     * Log a message at info level
     */
    public static function info($message, array $context = []) {
        self::log(self::INFO, $message, $context);
    }

    /**
     * Log a message at debug level
     */
    public static function debug($message, array $context = []) {
        self::log(self::DEBUG, $message, $context);
    }

    /**
     * Log a message at the specified level
     */
    public static function log($level, $message, array $context = []) {
        self::init();

        // Check if we should log this level
        $configLevel = self::getConfigLevel();
        if ($level > $configLevel) {
            return;
        }

        // Prepare log entry
        $timestamp = date('Y-m-d H:i:s');
        $levelName = self::$levels[$level] ?? 'UNKNOWN';
        $processId = getmypid();
        $requestId = self::getRequestId();
        
        // Add context information
        $contextStr = '';
        if (!empty($context)) {
            $contextStr = ' | Context: ' . json_encode($context, JSON_UNESCAPED_SLASHES);
        }

        // Add request information for web requests
        $requestInfo = self::getRequestInfo();
        
        // Format log message
        $logMessage = sprintf(
            "[%s] %s.%s: %s | PID: %s | Request: %s%s%s\n",
            $timestamp,
            $levelName,
            $requestId,
            $message,
            $processId,
            $requestInfo,
            $contextStr,
            PHP_EOL
        );

        // Write to file
        self::writeToFile($logMessage, $level);

        // Send critical errors to system log as well
        if ($level <= self::CRITICAL) {
            error_log("DCAA Critical: $message");
        }
    }

    /**
     * Get configuration log level
     */
    private static function getConfigLevel() {
        if (!class_exists('EnvLoader')) {
            return self::INFO; // Default level
        }

        $levelName = strtoupper(EnvLoader::get('LOG_LEVEL', 'info'));
        $levelMap = [
            'EMERGENCY' => self::EMERGENCY,
            'ALERT' => self::ALERT,
            'CRITICAL' => self::CRITICAL,
            'ERROR' => self::ERROR,
            'WARNING' => self::WARNING,
            'NOTICE' => self::NOTICE,
            'INFO' => self::INFO,
            'DEBUG' => self::DEBUG
        ];

        return $levelMap[$levelName] ?? self::INFO;
    }

    /**
     * Generate unique request ID
     */
    private static function getRequestId() {
        static $requestId = null;
        
        if ($requestId === null) {
            $requestId = substr(uniqid(), -8);
        }
        
        return $requestId;
    }

    /**
     * Get request information for web requests
     */
    private static function getRequestInfo() {
        if (php_sapi_name() === 'cli') {
            return 'CLI';
        }

        $method = $_SERVER['REQUEST_METHOD'] ?? 'UNKNOWN';
        $uri = $_SERVER['REQUEST_URI'] ?? 'unknown';
        $ip = self::getClientIp();
        
        return "$method $uri from $ip";
    }

    /**
     * Get client IP address
     */
    private static function getClientIp() {
        // Check for various headers that might contain the real IP
        $headers = [
            'HTTP_CF_CONNECTING_IP',     // Cloudflare
            'HTTP_X_FORWARDED_FOR',      // Load balancer/proxy
            'HTTP_X_FORWARDED',          // Proxy
            'HTTP_X_CLUSTER_CLIENT_IP',  // Cluster
            'HTTP_FORWARDED_FOR',        // Proxy
            'HTTP_FORWARDED',            // Proxy
            'REMOTE_ADDR'                // Standard
        ];

        foreach ($headers as $header) {
            if (!empty($_SERVER[$header])) {
                $ips = explode(',', $_SERVER[$header]);
                $ip = trim($ips[0]);
                
                // Validate IP
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }

        return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    }

    /**
     * Write log message to file with rotation
     */
    private static function writeToFile($message, $level) {
        $filename = date('Y-m-d') . '.log';
        $filepath = self::$logDir . '/' . $filename;

        // Check if file needs rotation
        if (file_exists($filepath) && filesize($filepath) > self::$maxFileSize) {
            self::rotateLogFile($filepath);
        }

        // Write to file
        file_put_contents($filepath, $message, FILE_APPEND | LOCK_EX);

        // Set proper permissions
        if (file_exists($filepath)) {
            chmod($filepath, 0644);
        }
    }

    /**
     * Rotate log file when it gets too large
     */
    private static function rotateLogFile($filepath) {
        $basename = pathinfo($filepath, PATHINFO_FILENAME);
        $extension = pathinfo($filepath, PATHINFO_EXTENSION);
        $dir = dirname($filepath);

        // Shift existing rotated files
        for ($i = self::$maxFiles - 1; $i >= 1; $i--) {
            $oldFile = "$dir/$basename.$i.$extension";
            $newFile = "$dir/$basename." . ($i + 1) . ".$extension";
            
            if (file_exists($oldFile)) {
                if ($i == self::$maxFiles - 1) {
                    unlink($oldFile); // Delete oldest file
                } else {
                    rename($oldFile, $newFile);
                }
            }
        }

        // Rename current file to .1
        if (file_exists($filepath)) {
            rename($filepath, "$dir/$basename.1.$extension");
        }
    }

    /**
     * Security log for authentication and access events
     */
    public static function security($event, array $details = []) {
        $context = array_merge([
            'event_type' => 'security',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'ip_address' => self::getClientIp(),
            'session_id' => session_id() ?: 'none'
        ], $details);

        self::warning("Security Event: $event", $context);
    }

    /**
     * API access log
     */
    public static function apiAccess($endpoint, $method, $responseCode, $duration = null) {
        $context = [
            'event_type' => 'api_access',
            'endpoint' => $endpoint,
            'method' => $method,
            'response_code' => $responseCode,
            'ip_address' => self::getClientIp(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ];

        if ($duration !== null) {
            $context['duration_ms'] = $duration;
        }

        self::info("API Access: $method $endpoint", $context);
    }
}

// Initialize logger silently to avoid early output
try {
    if (!is_dir(__DIR__ . '/../logs')) {
        mkdir(__DIR__ . '/../logs', 0755, true);
    }
} catch (Exception $e) {
    // Silently handle directory creation errors
}