<?php
/**
 * CSRF Protection System
 * Prevents Cross-Site Request Forgery attacks
 */

class CSRFProtection {
    private static $tokenName = 'csrf_token';
    private static $sessionKey = 'csrf_tokens';
    private static $maxTokens = 10;
    private static $tokenLifetime = 1800; // 30 minutes

    /**
     * Generate a new CSRF token
     */
    public static function generateToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Generate random token
        $token = bin2hex(random_bytes(32));
        $timestamp = time();

        // Initialize session array if needed
        if (!isset($_SESSION[self::$sessionKey])) {
            $_SESSION[self::$sessionKey] = [];
        }

        // Clean up expired tokens
        self::cleanupExpiredTokens();

        // Store token with timestamp
        $_SESSION[self::$sessionKey][$token] = $timestamp;

        // Limit number of tokens to prevent memory issues
        if (count($_SESSION[self::$sessionKey]) > self::$maxTokens) {
            // Remove oldest token
            $oldest = array_keys($_SESSION[self::$sessionKey])[0];
            unset($_SESSION[self::$sessionKey][$oldest]);
        }

        Logger::debug("CSRF token generated", ['token_count' => count($_SESSION[self::$sessionKey])]);

        return $token;
    }

    /**
     * Validate CSRF token
     */
    public static function validateToken($token) {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        if (empty($token)) {
            Logger::security("CSRF validation failed: empty token");
            return false;
        }

        if (!isset($_SESSION[self::$sessionKey])) {
            Logger::security("CSRF validation failed: no tokens in session");
            return false;
        }

        // Clean up expired tokens first
        self::cleanupExpiredTokens();

        // Check if token exists and is valid
        if (!isset($_SESSION[self::$sessionKey][$token])) {
            Logger::security("CSRF validation failed: token not found", ['token' => substr($token, 0, 8) . '...']);
            return false;
        }

        $tokenTime = $_SESSION[self::$sessionKey][$token];
        $currentTime = time();

        // Check if token has expired
        if (($currentTime - $tokenTime) > self::$tokenLifetime) {
            unset($_SESSION[self::$sessionKey][$token]);
            Logger::security("CSRF validation failed: token expired", ['age' => $currentTime - $tokenTime]);
            return false;
        }

        // Token is valid - remove it for one-time use
        unset($_SESSION[self::$sessionKey][$token]);
        
        Logger::debug("CSRF token validated successfully");
        return true;
    }

    /**
     * Clean up expired tokens from session
     */
    private static function cleanupExpiredTokens() {
        if (!isset($_SESSION[self::$sessionKey])) {
            return;
        }

        $currentTime = time();
        $removedCount = 0;

        foreach ($_SESSION[self::$sessionKey] as $token => $timestamp) {
            if (($currentTime - $timestamp) > self::$tokenLifetime) {
                unset($_SESSION[self::$sessionKey][$token]);
                $removedCount++;
            }
        }

        if ($removedCount > 0) {
            Logger::debug("CSRF cleanup: removed $removedCount expired tokens");
        }
    }

    /**
     * Get token from request (POST, GET, or headers)
     */
    public static function getTokenFromRequest() {
        // Check POST first
        if (isset($_POST[self::$tokenName])) {
            return $_POST[self::$tokenName];
        }

        // Check GET
        if (isset($_GET[self::$tokenName])) {
            return $_GET[self::$tokenName];
        }

        // Check headers
        $headers = getallheaders();
        if ($headers) {
            // Check common header names
            $headerNames = ['X-CSRF-Token', 'X-XSRF-Token', 'CSRF-Token'];
            
            foreach ($headerNames as $headerName) {
                if (isset($headers[$headerName])) {
                    return $headers[$headerName];
                }
            }
        }

        return null;
    }

    /**
     * Require CSRF validation for the current request
     */
    public static function requireValidToken() {
        $token = self::getTokenFromRequest();
        
        if (!self::validateToken($token)) {
            Logger::security("CSRF validation required but failed", [
                'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
                'uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
                'referer' => $_SERVER['HTTP_REFERER'] ?? 'none'
            ]);

            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode([
                'status' => 'error',
                'message' => 'CSRF token validation failed',
                'error_code' => 'CSRF_INVALID'
            ]);
            exit;
        }
    }

    /**
     * Generate HTML hidden input for forms
     */
    public static function getHiddenInput() {
        $token = self::generateToken();
        return '<input type="hidden" name="' . self::$tokenName . '" value="' . htmlspecialchars($token) . '">';
    }

    /**
     * Generate token for JavaScript
     */
    public static function getTokenForJS() {
        return self::generateToken();
    }

    /**
     * Get token name for JavaScript
     */
    public static function getTokenName() {
        return self::$tokenName;
    }

    /**
     * Check if request method requires CSRF protection
     */
    public static function requiresProtection($method = null) {
        if ($method === null) {
            $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        }

        $protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
        return in_array(strtoupper($method), $protectedMethods);
    }

    /**
     * Automatically protect request if needed
     */
    public static function autoProtect() {
        if (self::requiresProtection()) {
            self::requireValidToken();
        }
    }
}