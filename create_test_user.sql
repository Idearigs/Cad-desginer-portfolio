-- Create test user for Digital CAD Atelier
-- This should be run only once to create a test admin user

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS `users` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(50) NOT NULL UNIQUE,
    `password` varchar(255) NOT NULL,
    `email` varchar(100) DEFAULT NULL,
    `role` varchar(20) DEFAULT 'user',
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert test admin user
-- Username: admin
-- Password: admin123
INSERT IGNORE INTO `users` (`id`, `username`, `password`, `email`, `role`) 
VALUES (1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@example.com', 'admin');

-- Verify the user was created
SELECT id, username, email, role FROM users WHERE username = 'admin';