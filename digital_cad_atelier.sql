-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 26, 2025 at 05:56 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `digital_cad_atelier`
--

-- --------------------------------------------------------

--
-- Table structure for table `articles`
--

CREATE TABLE `articles` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `publication` varchar(100) DEFAULT NULL,
  `date` date NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `articles`
--

INSERT INTO `articles` (`id`, `title`, `content`, `image`, `image_url`, `author`, `publication`, `date`, `tags`, `created_at`, `updated_at`) VALUES
(4, 'tset', 'fasdf', '/digital-cad-atelier/BACKEND-PHP/uploads/articles/68794a93ea87a_Screenshot_2025-07-17_140357.png', NULL, 'dfasdfasd', 'asdfas', '2025-07-15', NULL, '2025-07-17 19:10:11', '2025-07-17 19:10:36'),
(5, 'ggggg', 'fsdfsd', '/digital-cad-atelier/BACKEND-PHP/uploads/articles/68794abf868b1_Screenshot_2025-07-17_140357.png', NULL, 'sdfsd', 'sdfsdf', '2025-07-09', NULL, '2025-07-17 19:10:55', '2025-07-17 19:11:13'),
(6, 'asdf', 'asd', '/digital-cad-atelier/BACKEND-PHP/uploads/articles/68794af24828a_Screenshot_2025-07-17_000424.png', NULL, 'asdf', 'asdfasdf', '2025-07-12', NULL, '2025-07-17 19:11:46', '2025-07-17 19:11:46');

-- --------------------------------------------------------

--
-- Table structure for table `article_tags`
--

CREATE TABLE `article_tags` (
  `id` int(11) NOT NULL,
  `article_id` int(11) NOT NULL,
  `tag` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `article_tags`
--

INSERT INTO `article_tags` (`id`, `article_id`, `tag`) VALUES
(14, 4, 'asdfasd'),
(16, 5, 'fsdfsdf'),
(17, 6, 'dfasdf');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `time` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `title`, `date`, `time`, `location`, `description`, `image`, `created_at`, `updated_at`) VALUES
(9, 'test test555', '2025-07-05', '18:13:00', 'testes', 'testset', '/digital-cad-atelier/BACKEND-PHP/uploads/events/687b9270680fe_Screenshot_2025-07-19_162026.png', '2025-07-19 12:41:20', '2025-07-19 12:42:18'),
(10, 'sdfsdf', '2025-07-17', '18:27:00', 'sdfsdf', 'sdfsdf', '/digital-cad-atelier/BACKEND-PHP/uploads/events/687b959140fe1_Screenshot_2025-07-19_174657.png', '2025-07-19 12:54:41', '2025-07-19 12:54:41'),
(14, 'test ttttt', '2025-07-03', '18:35:00', 'tt', 'ttttt', '/digital-cad-atelier/BACKEND-PHP/uploads/events/687b976d5e1f2_Screenshot_2025-07-19_174657.png', '2025-07-19 13:02:37', '2025-07-19 13:02:37'),
(15, 'test333', '2025-07-17', '18:41:00', 'bnmbmnbmbk', 'jhkjgkjgj', '/digital-cad-atelier/BACKEND-PHP/uploads/events/687b98f53c04d_Screenshot_2025-07-19_162026.png', '2025-07-19 13:09:09', '2025-07-19 13:09:09');

-- --------------------------------------------------------

--
-- Table structure for table `event_photos`
--

CREATE TABLE `event_photos` (
  `id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `photo_url` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `gallery_images`
--

CREATE TABLE `gallery_images` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

CREATE TABLE `images` (
  `id` int(11) NOT NULL,
  `entity_type` varchar(50) NOT NULL COMMENT 'Type of entity (article, event, gallery, etc.)',
  `entity_id` int(11) NOT NULL COMMENT 'ID of the related entity',
  `filename` varchar(255) NOT NULL COMMENT 'Filename only',
  `path` varchar(255) NOT NULL COMMENT 'Full path to the image file',
  `url` varchar(255) NOT NULL COMMENT 'URL for frontend use',
  `is_primary` tinyint(1) DEFAULT 0 COMMENT 'Whether this is the primary image',
  `title` varchar(255) DEFAULT NULL COMMENT 'Optional image title',
  `alt_text` varchar(255) DEFAULT NULL COMMENT 'Optional alt text for accessibility',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `images`
--

INSERT INTO `images` (`id`, `entity_type`, `entity_id`, `filename`, `path`, `url`, `is_primary`, `title`, `alt_text`, `created_at`, `updated_at`) VALUES
(5, 'article', 4, '68794a93ea87a_Screenshot_2025-07-17_140357.png', '/digital-cad-atelier/BACKEND-PHP/uploads/articles/68794a93ea87a_Screenshot_2025-07-17_140357.png', '/digital-cad-atelier/BACKEND-PHP/uploads/articles/68794a93ea87a_Screenshot_2025-07-17_140357.png', 1, NULL, NULL, '2025-07-17 19:10:11', '2025-07-17 19:10:11'),
(7, 'article', 6, '68794af24828a_Screenshot_2025-07-17_000424.png', '/digital-cad-atelier/BACKEND-PHP/uploads/articles/68794af24828a_Screenshot_2025-07-17_000424.png', '/digital-cad-atelier/BACKEND-PHP/uploads/articles/68794af24828a_Screenshot_2025-07-17_000424.png', 1, NULL, NULL, '2025-07-17 19:11:46', '2025-07-17 19:11:46');

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `attempt_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `success` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `username`, `ip_address`, `attempt_time`, `success`) VALUES
(1, 'admin', 'unknown', '2025-07-17 15:52:13', 1),
(2, 'admin', '::1', '2025-07-17 15:53:26', 1),
(3, 'admin', '::1', '2025-07-17 15:54:02', 1),
(4, 'admin', '::1', '2025-07-17 16:01:17', 0),
(5, 'admin', '::1', '2025-07-17 16:01:28', 1),
(6, 'admin', '::1', '2025-07-17 16:28:50', 0),
(7, 'admin', '::1', '2025-07-17 16:28:53', 0),
(8, 'admin', '::1', '2025-07-17 16:29:00', 1),
(9, 'admin', '::1', '2025-07-17 16:42:13', 1),
(10, 'admin', '::1', '2025-07-17 16:43:58', 1),
(11, 'admin', '::1', '2025-07-17 16:44:20', 1),
(12, 'admin', '::1', '2025-07-17 16:56:22', 0),
(13, 'admin', '::1', '2025-07-17 16:56:26', 1),
(14, 'admin', '::1', '2025-07-17 17:14:55', 1),
(15, 'admin', '::1', '2025-07-17 18:33:38', 0),
(16, 'admin', '::1', '2025-07-17 18:33:42', 0),
(17, 'admin', '::1', '2025-07-17 18:34:02', 1),
(18, 'admin', '::1', '2025-07-19 10:02:01', 1),
(19, 'admin@example.com', '::1', '2025-07-19 12:57:26', 1),
(20, 'admin', '::1', '2025-07-19 12:59:13', 1),
(21, 'admin', '::1', '2025-07-19 13:00:51', 1),
(22, 'admin', '::1', '2025-07-19 13:01:19', 1),
(23, 'admin', '::1', '2025-07-19 13:12:40', 1);

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_revoked` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token_hash`, `expires_at`, `is_revoked`, `created_at`) VALUES
(1, 1, '3863d83aaf40132bcaaf2cd11d47807afadf75a1ed0eeb0addfec320f2369345', '2025-08-16 21:22:13', 0, '2025-07-17 15:52:13'),
(2, 1, 'de137e58f143385ee86a5771dd6d2916df46752cbf7d2a43bdb795aa57361c82', '2025-08-16 21:23:26', 0, '2025-07-17 15:53:26'),
(3, 1, 'fdcd084dfe0106600dda2f8190cb852e75d9a5dd80c57051a9f8018dd055974a', '2025-08-16 21:24:02', 0, '2025-07-17 15:54:02'),
(4, 1, 'e020a8573ed688f8c3be5891d1ebd25a3d460e37cb5f89689dfbba2d4970d378', '2025-08-16 21:31:28', 0, '2025-07-17 16:01:28'),
(5, 1, '6a1ccfb9298fea29a445a13c555e959ef0aa07f45cba7615fc535a7c5446a716', '2025-08-16 21:59:00', 0, '2025-07-17 16:29:00'),
(6, 1, 'b9bd1592cfff11817e745785c818c305b844c0e37f6c531b43c8ca4f6e4a5493', '2025-08-16 22:12:13', 0, '2025-07-17 16:42:13'),
(7, 1, '7b10f53f53eb5edd8c3121dad4602826212a04e3815f0687b4bdc20ec807fbbb', '2025-08-16 22:13:58', 0, '2025-07-17 16:43:58'),
(8, 1, '4ce4ff721bddcdfd69869d5fd33b9edf366daca6a22067cf78e1a4b576ea857f', '2025-08-16 22:14:20', 0, '2025-07-17 16:44:20'),
(9, 1, '05702d3380c3d8eca1bac661ea978cf676aabe7831f12b09656d5ab864497fed', '2025-08-16 22:26:26', 0, '2025-07-17 16:56:26'),
(10, 1, '5f4e712e68e09103e3b6bd48fe3c55823e84afab05b66231882faf0e2bda01e6', '2025-08-16 22:44:55', 0, '2025-07-17 17:14:55'),
(11, 1, '2ff1cd982b95029f49790e14efc316aca232a1e1d82539682ce985828443fefc', '2025-08-17 00:04:02', 0, '2025-07-17 18:34:02'),
(12, 1, 'e182c733a7294511a36237d48df9114e1dfab54b1b73ee820aa477058b117a7a', '2025-08-18 15:32:01', 0, '2025-07-19 10:02:01'),
(13, 1, '22dee1d017eb7f25dcecac606f10dd13006e64585f32b74962a35ba80bbd3e58', '2025-08-18 18:27:26', 0, '2025-07-19 12:57:26'),
(14, 1, '17ad0b20e0c7a8d4f83b0146d12add681cb35203a5b8e292f415b7bbf8879632', '2025-08-18 18:29:13', 0, '2025-07-19 12:59:13'),
(15, 1, '4418f13c8113c36284dc756c4fa9834ad27f02721df4da0dc6fcafb2b0801ba4', '2025-08-18 18:30:51', 0, '2025-07-19 13:00:51'),
(16, 1, 'bfb06c2e77ba9208fa8309506d1e9f11c11d3f24de5fc1b7b66c46cabaaab9d7', '2025-08-18 18:31:19', 0, '2025-07-19 13:01:19'),
(17, 1, '0a7fbe49be0790487fa4fc296c9a2fdd68109754c189586348b6da9617f76a19', '2025-08-18 18:42:40', 0, '2025-07-19 13:12:40');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` varchar(20) DEFAULT 'text',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `created_at`, `updated_at`) VALUES
(1, 'site_title', 'Digital CAD Atelier', 'text', '2025-07-17 15:40:16', '2025-07-17 15:40:16'),
(2, 'site_description', 'A platform for digital design and architecture', 'textarea', '2025-07-17 15:40:16', '2025-07-17 15:40:16'),
(3, 'contact_email', 'contact@example.com', 'email', '2025-07-17 15:40:16', '2025-07-17 15:40:16'),
(4, 'contact_phone', '+1234567890', 'text', '2025-07-17 15:40:16', '2025-07-17 15:40:16'),
(5, 'contact_address', '123 Design Street, Creative City, DC 12345', 'textarea', '2025-07-17 15:40:16', '2025-07-17 15:40:16'),
(6, 'social_facebook', 'https://facebook.com/digitalcadatelier', 'url', '2025-07-17 15:40:16', '2025-07-17 15:40:16'),
(7, 'social_instagram', 'https://instagram.com/digitalcadatelier', 'url', '2025-07-17 15:40:16', '2025-07-17 15:40:16'),
(8, 'social_twitter', 'https://twitter.com/digitalcadatelier', 'url', '2025-07-17 15:40:16', '2025-07-17 15:40:16'),
(9, 'homepage_hero_title', 'Welcome to Digital CAD Atelier', 'text', '2025-07-17 15:40:16', '2025-07-17 15:40:16'),
(10, 'homepage_hero_subtitle', 'Where design meets innovation', 'text', '2025-07-17 15:40:16', '2025-07-17 15:40:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `role` varchar(20) NOT NULL DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `email`, `role`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2y$12$GB5hWxErVbWefcPXzRonWegKXwxAGW9Z/PJxgc.tERXvo2zg0zgGm', 'admin@example.com', 'admin', '2025-07-17 15:40:16', '2025-07-17 15:52:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `articles`
--
ALTER TABLE `articles`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `article_tags`
--
ALTER TABLE `article_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `article_id` (`article_id`,`tag`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `event_photos`
--
ALTER TABLE `event_photos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `gallery_images`
--
ALTER TABLE `gallery_images`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `entity_type` (`entity_type`,`entity_id`),
  ADD KEY `is_primary` (`is_primary`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `articles`
--
ALTER TABLE `articles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `article_tags`
--
ALTER TABLE `article_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `event_photos`
--
ALTER TABLE `event_photos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `gallery_images`
--
ALTER TABLE `gallery_images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `article_tags`
--
ALTER TABLE `article_tags`
  ADD CONSTRAINT `article_tags_ibfk_1` FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_photos`
--
ALTER TABLE `event_photos`
  ADD CONSTRAINT `event_photos_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
