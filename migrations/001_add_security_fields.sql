-- Migration: Add Security Fields to Users Table
-- Version: 1.0
-- Date: 2025-01-30
-- Description: Adds security-related fields for enhanced authentication and account locking

-- Add security fields to users table
ALTER TABLE `users` 
ADD COLUMN `failed_attempts` INT(11) DEFAULT 0 COMMENT 'Number of failed login attempts',
ADD COLUMN `locked_until` DATETIME NULL COMMENT 'Account lock expiration time',
ADD COLUMN `last_login` DATETIME NULL COMMENT 'Last successful login timestamp',
ADD COLUMN `password_changed_at` DATETIME NULL COMMENT 'When password was last changed',
ADD COLUMN `email_verified` BOOLEAN DEFAULT FALSE COMMENT 'Whether email is verified',
ADD COLUMN `email_verified_at` DATETIME NULL COMMENT 'When email was verified',
ADD COLUMN `two_factor_enabled` BOOLEAN DEFAULT FALSE COMMENT 'Whether 2FA is enabled',
ADD COLUMN `two_factor_secret` VARCHAR(255) NULL COMMENT 'TOTP secret for 2FA',
ADD COLUMN `remember_token` VARCHAR(100) NULL COMMENT 'Remember me token',
ADD COLUMN `api_token` VARCHAR(255) NULL COMMENT 'API access token',
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Account creation time',
ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update time';

-- Enhance login_attempts table structure
ALTER TABLE `login_attempts` 
ADD COLUMN `user_id` INT(11) NULL COMMENT 'User ID if known',
ADD COLUMN `user_agent` TEXT NULL COMMENT 'Browser user agent',
ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Attempt timestamp',
ADD INDEX `idx_login_attempts_user_id` (`user_id`),
ADD INDEX `idx_login_attempts_ip` (`ip_address`),
ADD INDEX `idx_login_attempts_created` (`created_at`),
ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL;

-- Create sessions table for session management
CREATE TABLE IF NOT EXISTS `sessions` (
    `id` VARCHAR(128) NOT NULL PRIMARY KEY COMMENT 'Session ID',
    `user_id` INT(11) NULL COMMENT 'Associated user ID',
    `ip_address` VARCHAR(45) NULL COMMENT 'Client IP address',
    `user_agent` TEXT NULL COMMENT 'Client user agent',
    `payload` LONGTEXT NOT NULL COMMENT 'Session data',
    `last_activity` INT(11) NOT NULL COMMENT 'Last activity timestamp',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Session creation time',
    INDEX `idx_sessions_user_id` (`user_id`),
    INDEX `idx_sessions_last_activity` (`last_activity`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='User sessions';

-- Create API rate limiting table
CREATE TABLE IF NOT EXISTS `rate_limits` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `identifier` VARCHAR(255) NOT NULL COMMENT 'Rate limit identifier (IP, user, etc.)',
    `endpoint` VARCHAR(255) NULL COMMENT 'API endpoint',
    `requests` INT(11) NOT NULL DEFAULT 1 COMMENT 'Number of requests',
    `window_start` INT(11) NOT NULL COMMENT 'Rate limit window start timestamp',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `unique_rate_limit` (`identifier`, `endpoint`, `window_start`),
    INDEX `idx_rate_limits_identifier` (`identifier`),
    INDEX `idx_rate_limits_window` (`window_start`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='API rate limiting records';

-- Create system logs table for centralized logging
CREATE TABLE IF NOT EXISTS `system_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `level` VARCHAR(20) NOT NULL COMMENT 'Log level (debug, info, warning, error, etc.)',
    `message` TEXT NOT NULL COMMENT 'Log message',
    `context` JSON NULL COMMENT 'Additional context data',
    `user_id` INT(11) NULL COMMENT 'Associated user ID',
    `ip_address` VARCHAR(45) NULL COMMENT 'Client IP address',
    `user_agent` TEXT NULL COMMENT 'Client user agent',
    `request_id` VARCHAR(36) NULL COMMENT 'Request ID for tracing',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_system_logs_level` (`level`),
    INDEX `idx_system_logs_user_id` (`user_id`),
    INDEX `idx_system_logs_created` (`created_at`),
    INDEX `idx_system_logs_request_id` (`request_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='System logs';

-- Create security events table
CREATE TABLE IF NOT EXISTS `security_events` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `event_type` VARCHAR(50) NOT NULL COMMENT 'Type of security event',
    `description` TEXT NOT NULL COMMENT 'Event description',
    `user_id` INT(11) NULL COMMENT 'Associated user ID',
    `ip_address` VARCHAR(45) NULL COMMENT 'Client IP address',
    `user_agent` TEXT NULL COMMENT 'Client user agent',
    `metadata` JSON NULL COMMENT 'Additional event metadata',
    `severity` ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' COMMENT 'Event severity',
    `resolved` BOOLEAN DEFAULT FALSE COMMENT 'Whether event has been resolved',
    `resolved_at` DATETIME NULL COMMENT 'When event was resolved',
    `resolved_by` INT(11) NULL COMMENT 'Who resolved the event',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_security_events_type` (`event_type`),
    INDEX `idx_security_events_user_id` (`user_id`),
    INDEX `idx_security_events_severity` (`severity`),
    INDEX `idx_security_events_resolved` (`resolved`),
    INDEX `idx_security_events_created` (`created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`resolved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Security events log';

-- Add indexes for better performance on existing tables
ALTER TABLE `articles` 
ADD INDEX `idx_articles_created_at` (`created_at`),
ADD INDEX `idx_articles_date` (`date`),
ADD INDEX `idx_articles_author` (`author`);

ALTER TABLE `events` 
ADD INDEX `idx_events_date` (`date`),
ADD INDEX `idx_events_created_at` (`created_at`);

ALTER TABLE `gallery_images` 
ADD INDEX `idx_gallery_created_at` (`created_at`),
ADD INDEX `idx_gallery_category` (`category`);

-- Create default admin user if not exists (password: admin123 - CHANGE IN PRODUCTION!)
INSERT IGNORE INTO `users` (`id`, `username`, `password`, `email`, `role`, `created_at`) 
VALUES (1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'admin', NOW());

-- Insert initial security event
INSERT INTO `security_events` (`event_type`, `description`, `severity`, `created_at`) 
VALUES ('system', 'Security migration completed successfully', 'low', NOW());

-- Migration completed
SELECT 'Security migration completed successfully' as status;