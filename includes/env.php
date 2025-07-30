<?php
/**
 * Environment Configuration Loader
 * Loads environment variables from .env file securely
 */

class EnvLoader {
    private static $loaded = false;
    private static $env = [];

    /**
     * Load environment variables from .env file
     */
    public static function load($path = null) {
        if (self::$loaded) {
            return;
        }

        if ($path === null) {
            $path = __DIR__ . '/../.env';
        }

        if (!file_exists($path)) {
            throw new Exception('.env file not found. Please copy .env.example to .env and configure it.');
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }

            // Parse key=value pairs
            if (strpos($line, '=') !== false) {
                list($key, $value) = explode('=', $line, 2);
                $key = trim($key);
                $value = trim($value);
                
                // Remove quotes if present
                if (preg_match('/^(["\'])(.*)\1$/', $value, $matches)) {
                    $value = $matches[2];
                }
                
                self::$env[$key] = $value;
                
                // Set as environment variable if not already set
                if (!isset($_ENV[$key])) {
                    $_ENV[$key] = $value;
                }
                
                // Set as PHP environment variable
                if (!getenv($key)) {
                    putenv("$key=$value");
                }
            }
        }

        self::$loaded = true;
    }

    /**
     * Get environment variable
     */
    public static function get($key, $default = null) {
        if (!self::$loaded) {
            self::load();
        }

        // Check environment variables first
        $value = getenv($key);
        if ($value !== false) {
            return self::parseValue($value);
        }

        // Check $_ENV
        if (isset($_ENV[$key])) {
            return self::parseValue($_ENV[$key]);
        }

        // Check loaded .env values
        if (isset(self::$env[$key])) {
            return self::parseValue(self::$env[$key]);
        }

        return $default;
    }

    /**
     * Parse environment value (convert string booleans, etc.)
     */
    private static function parseValue($value) {
        // Convert string booleans
        if (strtolower($value) === 'true') return true;
        if (strtolower($value) === 'false') return false;
        
        // Convert string null
        if (strtolower($value) === 'null') return null;
        
        // Return as-is
        return $value;
    }

    /**
     * Check if environment is production
     */
    public static function isProduction() {
        return self::get('APP_ENV', 'development') === 'production';
    }

    /**
     * Check if debug mode is enabled
     */
    public static function isDebug() {
        return self::get('APP_DEBUG', false) === true;
    }
}

// Auto-load environment on include
EnvLoader::load();