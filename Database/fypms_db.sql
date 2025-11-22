-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 04, 2025 at 10:36 PM
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
-- Database: `fypms_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `archived_projects`
--

CREATE TABLE `archived_projects` (
  `id` int(11) NOT NULL,
  `title` varchar(500) NOT NULL,
  `year` year(4) NOT NULL,
  `abstract` text NOT NULL,
  `department` varchar(100) NOT NULL,
  `supervisor_name` varchar(200) NOT NULL,
  `supervisor_id` int(11) DEFAULT NULL,
  `technology_type` varchar(200) DEFAULT NULL,
  `final_grade` varchar(10) DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `student_names` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `archived_projects`
--

INSERT INTO `archived_projects` (`id`, `title`, `year`, `abstract`, `department`, `supervisor_name`, `supervisor_id`, `technology_type`, `final_grade`, `keywords`, `student_names`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'AI-Powered Healthcare Diagnosis System', '2024', 'This project develops an artificial intelligence system for automated disease diagnosis using deep learning and medical imaging. The system achieves 95% accuracy in detecting common diseases from X-ray and MRI scans.', 'Computer Science', 'Dr. Sarah Johnson', NULL, 'Artificial Intelligence, Deep Learning', 'A+', 'AI, Healthcare, Deep Learning, Medical Imaging, Computer Vision', 'Ahmed Ali, Fatima Khan', 1, '2025-11-01 12:43:38', '2025-11-01 12:43:38'),
(2, 'Smart Campus IoT Infrastructure', '2024', 'Implementation of a comprehensive IoT infrastructure for smart campus management including energy monitoring, security systems, and automated classroom management.', 'Computer Engineering', 'Prof. Michael Chen', NULL, 'Internet of Things', 'A', 'IoT, Smart Campus, Energy Management, Automation', 'Hassan Raza, Ayesha Malik', 1, '2025-11-01 12:43:38', '2025-11-01 12:43:38'),
(3, 'Blockchain-Based Supply Chain Management', '2023', 'A decentralized supply chain tracking system using blockchain technology to ensure transparency and authenticity in product logistics.', 'Software Engineering', 'Dr. Emily Wilson', NULL, 'Blockchain', 'A', 'Blockchain, Supply Chain, Smart Contracts, Ethereum', 'Usman Ahmed, Zainab Hussain', 1, '2025-11-01 12:43:38', '2025-11-01 12:43:38'),
(4, 'Mobile Learning Platform for Rural Education', '2023', 'Development of an offline-capable mobile application for delivering educational content to students in areas with limited internet connectivity.', 'Computer Science', 'Dr. Robert Brown', NULL, 'Mobile Development', 'B+', 'Mobile App, Education, React Native, Offline-First', 'Bilal Khan, Mariam Ali', 1, '2025-11-01 12:43:38', '2025-11-01 12:43:38'),
(5, 'Renewable Energy Optimization System', '2022', 'Machine learning-based system for optimizing solar panel placement and energy distribution in smart grids.', 'Electrical Engineering', 'Prof. Jennifer Lee', NULL, 'Machine Learning, Renewable Energy', 'A+', 'Machine Learning, Solar Energy, Optimization, Smart Grid', 'Omar Farooq, Sana Ahmed', 1, '2025-11-01 12:43:38', '2025-11-01 12:43:38'),
(9, 'rqrwerwerqet', '2025', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur elementum ornare sem, nec aliquet magna sollicitudin et. Integer bibendum, orci nec gravida varius, ipsum lacus ultrices arcu, sit amet posuere justo metus ac lacus. Vestibulum vulputate erat vitae massa euismod, sit amet scelerisque risus fermentum. Fusce ut libero vel leo suscipit accumsan non id eros. Sed nec ex nec sapien dignissim porttitor. Donec non eros quis elit maximus aliquam. Proin dictum lorem ac efficitur iaculis. Vivamus nec dui ac ex mattis hendrerit. Suspendisse potenti. Integer porttitor massa id mi venenatis dictum. Etiam convallis ultricies dignissim. Aenean sit amet volutpat erat, nec tincidunt justo.\n\nUt ut cursus magna. Quisque pretium urna ac velit vulputate, nec commodo mi dictum. Suspendisse potenti. Phasellus non augue nec ligula pulvinar convallis. Morbi tempus orci et justo aliquam, ut fringilla nulla consequat. Vivamus vitae tristique nisi, nec ornare libero. Donec convallis magna nec augue mattis, eget dictum lorem blandit. Integer euismod lectus non ligula eleifend ultrices. Sed id enim ac lacus pretium imperdiet. Pellentesque a libero vitae elit pulvinar ullamcorper.\n\nPraesent lacinia, elit ut accumsan tincidunt, odio magna cursus nulla, sit amet luctus magna ex sed nunc. Donec sagittis lacinia magna, ac dictum purus tincidunt in. Mauris ut suscipit elit. Sed maximus tempor mauris, sed hendrerit erat luctus vel. Nam fermentum arcu in purus facilisis facilisis. Nulla ut nisl sed risus eleifend vestibulum. Vestibulum nec nunc sit amet eros efficitur ultrices vitae ac nunc. Sed elementum posuere magna, sit amet sodales mi facilisis sed. Integer ornare dui vel lacus tempus, sit amet tempor nisl tristique.', 'Software Engineering', 'abuzhar', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-04 21:21:20', '2025-11-04 21:21:20'),
(10, 'AI-Powered Healthcare System', '2024', 'This project develops an AI system for medical diagnosis using deep learning', 'Computer Science', 'Dr. Sarah Johnson', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-04 21:22:42', '2025-11-04 21:22:42'),
(11, 'Smart Campus IoT', '2024', 'Implementation of IoT infrastructure for smart campus management', 'Computer Engineering', 'Prof. Michael Chen', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-04 21:22:42', '2025-11-04 21:22:42'),
(12, 'Is', '2023', 'Implementation of IoT infrastructure for smart campus management', 'Cyber', 'Abu Zhar', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-04 21:22:42', '2025-11-04 21:22:42'),
(13, 'am', '2022', 'Implementation of IoT infrastructure for smart campus management', 'FC', 'Awais', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-04 21:22:42', '2025-11-04 21:22:42'),
(14, 'Are', '2021', 'Implementation of IoT infrastructure for smart campus management', 'SE', 'SHEHROZ', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-04 21:22:42', '2025-11-04 21:22:42'),
(15, 'AI-Powered Healthcare System', '2024', 'This project develops an AI system for medical diagnosis using deep learning', 'Computer Science', 'Dr. Sarah Johnson', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-04 21:24:30', '2025-11-04 21:24:30'),
(16, 'Smart Campus IoT', '2024', 'Implementation of IoT infrastructure for smart campus management', 'Computer Engineering', 'Prof. Michael Chen', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-04 21:24:30', '2025-11-04 21:24:30'),
(17, 'Is', '2023', 'Implementation of IoT infrastructure for smart campus management', 'Cyber', 'Abu Zhar', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-04 21:24:30', '2025-11-04 21:24:30'),
(18, 'am', '2022', 'Implementation of IoT infrastructure for smart campus management', 'FC', 'Awais', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-04 21:24:31', '2025-11-04 21:24:31'),
(19, 'Are', '2021', 'Implementation of IoT infrastructure for smart campus management', 'SE', 'SHEHROZ', NULL, NULL, NULL, NULL, NULL, 1, '2025-11-04 21:24:31', '2025-11-04 21:24:31');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `admin_id`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `created_at`) VALUES
(1, 1, NULL, 'LOGIN_FAILED', NULL, NULL, '{\"username\":\"admin@fyp.com\",\"reason\":\"Invalid password\"}', '::1', '2025-10-18 17:36:17'),
(2, 1, NULL, 'LOGIN_FAILED', NULL, NULL, '{\"username\":\"admin@fyp.com\",\"reason\":\"Invalid password\"}', '::1', '2025-10-18 17:37:03'),
(3, 1, NULL, 'LOGIN_FAILED', NULL, NULL, '{\"username\":\"admin@fyp.com\",\"reason\":\"Invalid password\"}', '::1', '2025-10-18 17:38:20'),
(4, 1, NULL, 'PASSWORD_RESET_REQUESTED', NULL, NULL, '{\"email\":\"custmail8@gmail.com\"}', '::1', '2025-10-18 17:41:47'),
(5, 1, NULL, 'PASSWORD_RESET_COMPLETED', NULL, NULL, '{\"method\":\"email\",\"username\":\"admin\"}', '::1', '2025-10-18 17:43:10'),
(6, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-18 17:43:28'),
(7, 1, 1, 'ADMIN_PASSWORD_RESET_INITIATED', 'user', 1, '{\"username\":\"admin\",\"method\":\"email\"}', '::1', '2025-10-18 17:44:10'),
(8, NULL, 1, 'USER_CREATED', 'user', 2, '{\"username\":\"hamza_123\",\"email\":\"hk9349881@gmail.com\",\"role\":\"Student\"}', '::1', '2025-10-18 17:46:06'),
(9, NULL, NULL, 'LOGIN_FAILED', NULL, NULL, '{\"username\":\"hk9349881@gmail.com\",\"reason\":\"Invalid password\"}', '::1', '2025-10-18 17:56:16'),
(10, NULL, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-18 17:56:44'),
(11, NULL, NULL, 'PASSWORD_CHANGED', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-18 17:57:55'),
(12, NULL, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza_123\"}', '::ffff:127.0.0.1', '2025-10-18 18:00:06'),
(13, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 14:03:28'),
(14, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 14:18:04'),
(15, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 14:22:33'),
(16, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 14:23:13'),
(17, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 14:27:04'),
(18, NULL, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-19 14:27:21'),
(19, NULL, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-19 14:27:48'),
(20, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 14:28:56'),
(21, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 14:32:10'),
(22, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 14:33:27'),
(23, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 14:33:54'),
(24, NULL, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-19 14:34:03'),
(25, NULL, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-19 14:34:25'),
(26, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 14:40:46'),
(27, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 14:42:51'),
(28, NULL, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-19 14:43:05'),
(29, NULL, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-19 14:47:49'),
(30, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 14:56:12'),
(31, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-19 15:10:10'),
(32, NULL, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-19 15:10:20'),
(33, NULL, NULL, 'PASSWORD_CHANGED', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-19 15:11:17'),
(34, NULL, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-19 15:11:27'),
(35, NULL, NULL, 'PASSWORD_RESET_REQUESTED', NULL, NULL, '{\"email\":\"hk9349881@gmail.com\"}', '::1', '2025-10-19 15:11:41'),
(36, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-21 17:13:08'),
(37, NULL, 1, 'USER_CREATED', 'user', 3, '{\"username\":\"28585\",\"email\":\"shayanraza804@gmail.com\",\"role\":\"Teacher\"}', '::1', '2025-10-21 17:15:20'),
(38, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-21 17:15:54'),
(39, NULL, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"28585\"}', '::1', '2025-10-21 17:16:50'),
(40, NULL, NULL, 'PASSWORD_CHANGED', NULL, NULL, '{\"username\":\"28585\"}', '::1', '2025-10-21 17:17:51'),
(41, NULL, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"28585\"}', '::1', '2025-10-21 17:18:02'),
(42, NULL, NULL, 'PASSWORD_RESET_REQUESTED', NULL, NULL, '{\"email\":\"hk9349881@gmail.com\"}', '::1', '2025-10-21 17:18:22'),
(43, NULL, NULL, 'PASSWORD_RESET_COMPLETED', NULL, NULL, '{\"method\":\"email\",\"username\":\"hamza_123\"}', '::1', '2025-10-21 17:19:37'),
(44, NULL, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-21 17:19:53'),
(45, NULL, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hamza_123\"}', '::1', '2025-10-21 17:28:45'),
(46, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-21 17:52:17'),
(47, 4, 1, 'USER_CREATED', 'user', 4, '{\"username\":\"Shayan_Ahmed\",\"email\":\"shayanraza804@gmail.com\",\"role\":\"Administrator\"}', '::1', '2025-10-21 17:53:18'),
(48, NULL, 1, 'USER_DELETED', 'user', 2, '{\"username\":\"hamza_123\",\"email\":\"hk9349881@gmail.com\"}', '::1', '2025-10-21 17:53:51'),
(49, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-30 20:00:18'),
(50, 1, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"filename\":\"profile_1_1761854444576-125887117.webp\"}', '::1', '2025-10-30 20:00:44'),
(51, 1, NULL, 'PROFILE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"changes\":{\"phone\":\"0324635832\",\"department\":\"Software Engineering\"}}', '::1', '2025-10-30 20:00:58'),
(52, 1, NULL, 'PROFILE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"changes\":{\"phone\":\"0324635832\",\"department\":\"Software Engineering\"}}', '::1', '2025-10-30 20:01:19'),
(53, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-30 20:03:13'),
(54, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-30 20:05:43'),
(55, 1, NULL, 'PROFILE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"changes\":{\"phone\":\"0324635832\",\"department\":\"Software Engineering\"}}', '::1', '2025-10-30 20:06:02'),
(56, 1, NULL, 'PROFILE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"changes\":{\"phone\":\"46346235\",\"department\":\"Software Engineering\"}}', '::1', '2025-10-30 20:06:24'),
(57, 5, 1, 'USER_CREATED', 'user', 5, '{\"username\":\"hamza\",\"email\":\"upcomp28@gmail.com\",\"role\":\"Student\"}', '::1', '2025-10-30 20:07:01'),
(58, 6, 1, 'USER_CREATED', 'user', 6, '{\"username\":\"hassan\",\"email\":\"hamza.ali@riphah.edu.pk\",\"role\":\"Teacher\"}', '::1', '2025-10-30 20:07:21'),
(59, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-30 20:07:30'),
(60, 5, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza\"}', '::1', '2025-10-30 20:07:57'),
(61, 5, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 5, '{\"username\":\"hamza\",\"filename\":\"profile_5_1761854903668-294741334.webp\"}', '::1', '2025-10-30 20:08:23'),
(62, 5, NULL, 'PROFILE_UPDATED', 'user', 5, '{\"username\":\"hamza\",\"changes\":{\"phone\":\"\",\"department\":\"\"}}', '::1', '2025-10-30 20:08:29'),
(63, 5, NULL, 'PROFILE_UPDATED', 'user', 5, '{\"username\":\"hamza\",\"changes\":{\"phone\":\"234242342525\",\"department\":\"Computer Science\"}}', '::1', '2025-10-30 20:08:37'),
(64, 5, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hamza\"}', '::1', '2025-10-30 20:08:57'),
(65, 6, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-10-30 20:09:49'),
(66, 6, NULL, 'PROFILE_UPDATED', 'user', 6, '{\"username\":\"hassan\",\"changes\":{\"phone\":\"9230002485235\",\"department\":\"Cyber Security\",\"research_areas\":\"adfwe\",\"expertise\":\"wegweg\",\"availability_status\":\"Busy\"}}', '::1', '2025-10-30 20:10:37'),
(67, 6, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 6, '{\"username\":\"hassan\",\"filename\":\"profile_6_1761855048787-204662596.jpg\"}', '::1', '2025-10-30 20:10:48'),
(68, 6, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-10-30 20:11:12'),
(69, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-30 20:11:18'),
(70, 1, NULL, 'PROFILE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"changes\":{\"phone\":\"46346235\",\"department\":\"Software Engineering\"}}', '::1', '2025-10-30 20:11:45'),
(71, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-10-30 20:11:56'),
(72, 6, NULL, 'LOGIN_FAILED', NULL, NULL, '{\"username\":\"hamza.ali@riphah.edu.pk\",\"reason\":\"Invalid password\"}', '::1', '2025-10-30 20:12:00'),
(73, 6, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-10-30 20:12:12'),
(74, 6, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-10-30 20:12:52'),
(75, 5, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza\"}', '::1', '2025-10-30 20:13:04'),
(76, 5, NULL, 'PROFILE_PICTURE_DELETED', 'user', 5, '{\"username\":\"hamza\"}', '::1', '2025-10-30 20:18:52'),
(77, 5, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 5, '{\"username\":\"hamza\",\"filename\":\"profile_5_1761855973407-838876665.jpg\"}', '::1', '2025-10-30 20:26:13'),
(78, 5, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 5, '{\"username\":\"hamza\",\"filename\":\"profile_5_1761855990528-404075464.webp\"}', '::1', '2025-10-30 20:26:30'),
(79, 5, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 5, '{\"username\":\"hamza\",\"filename\":\"profile_5_1761856026825-885064998.webp\"}', '::1', '2025-10-30 20:27:06'),
(80, 5, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hamza\"}', '::1', '2025-10-30 20:28:02'),
(81, 6, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-10-30 20:28:12'),
(82, 6, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 6, '{\"username\":\"hassan\",\"filename\":\"profile_6_1761909108092-327956299.jpg\"}', '::1', '2025-10-31 11:11:48'),
(83, 6, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-10-31 11:12:02'),
(84, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-01 08:14:44'),
(85, 1, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"filename\":\"profile_1_1761984921419-554870039.jpg\"}', '::1', '2025-11-01 08:15:21'),
(86, 1, NULL, 'PROFILE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"changes\":{\"phone\":\"46346235234\",\"department\":\"Software Engineering\"}}', '::1', '2025-11-01 08:15:32'),
(87, 1, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"filename\":\"profile_1_1761984970016-280090642.jpg\"}', '::1', '2025-11-01 08:16:10'),
(88, 1, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"filename\":\"profile_1_1761984982675-129640330.jpg\"}', '::1', '2025-11-01 08:16:22'),
(89, 1, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"filename\":\"profile_1_1761986999664-97259866.jpg\"}', '::1', '2025-11-01 08:49:59'),
(90, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-01 08:50:48'),
(91, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-01 08:50:54'),
(92, 1, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"filename\":\"profile_1_1761987090764-646205906.jpg\"}', '::1', '2025-11-01 08:51:30'),
(93, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-01 09:28:17'),
(94, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-01 09:28:21'),
(95, 1, NULL, 'PROFILE_PICTURE_DELETED', 'user', 1, '{\"username\":\"admin\"}', '::1', '2025-11-01 09:28:51'),
(96, 1, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"filename\":\"profile_1_1761989345035-693297863.jpg\"}', '::1', '2025-11-01 09:29:05'),
(97, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-01 09:30:01'),
(98, 6, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-11-01 09:31:28'),
(99, 6, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 6, '{\"username\":\"hassan\",\"filename\":\"profile_6_1761989508892-78579752.webp\"}', '::1', '2025-11-01 09:31:49'),
(100, 6, NULL, 'PROFILE_PICTURE_DELETED', 'user', 6, '{\"username\":\"hassan\"}', '::1', '2025-11-01 10:29:10'),
(101, 6, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 6, '{\"username\":\"hassan\",\"filename\":\"profile_6_1761992958060-92467630.jpg\"}', '::1', '2025-11-01 10:29:19'),
(102, 6, NULL, 'PROFILE_UPDATED', 'user', 6, '{\"username\":\"hassan\",\"changes\":{\"phone\":\"9230002485235\",\"department\":\"Cyber Security\",\"research_areas\":\"adfwe\",\"expertise\":\"wegweg\",\"availability_status\":\"Busy\"}}', '::1', '2025-11-01 10:33:14'),
(103, 6, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-11-01 13:05:10'),
(104, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-01 13:05:21'),
(105, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-01 13:08:35'),
(106, 5, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza\"}', '::1', '2025-11-01 13:09:11'),
(107, 5, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 5, '{\"username\":\"hamza\",\"filename\":\"profile_5_1762002578665-805842813.jpg\"}', '::1', '2025-11-01 13:09:38'),
(108, 5, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hamza\"}', '::1', '2025-11-01 13:28:46'),
(109, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-01 13:28:54'),
(110, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-01 13:34:36'),
(111, 6, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-11-01 13:34:42'),
(112, 6, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-11-01 14:15:09'),
(113, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-01 14:15:15'),
(114, 1, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"filename\":\"profile_1_1762011979922-327850293.png\"}', '::1', '2025-11-01 15:46:19'),
(115, 1, NULL, 'PROFILE_PICTURE_DELETED', 'user', 1, '{\"username\":\"admin\"}', '::1', '2025-11-01 15:57:45'),
(116, 1, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"filename\":\"profile_1_1762012672728-807258091.jpg\"}', '::1', '2025-11-01 15:57:52'),
(117, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-01 17:30:37'),
(118, 6, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-11-01 17:30:48'),
(119, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-03 04:53:38'),
(120, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-03 04:55:23'),
(121, 6, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-11-03 04:55:37'),
(122, 6, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-11-03 04:55:49'),
(123, 5, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza\"}', '::1', '2025-11-03 04:56:13'),
(124, 5, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hamza\"}', '::1', '2025-11-03 05:01:40'),
(125, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-03 05:01:43'),
(126, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-03 11:11:27'),
(127, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-04 16:20:41'),
(128, 1, NULL, 'PROFILE_PICTURE_DELETED', 'user', 1, '{\"username\":\"admin\"}', '::1', '2025-11-04 16:21:46'),
(129, 1, NULL, 'PROFILE_PICTURE_UPDATED', 'user', 1, '{\"username\":\"admin\",\"filename\":\"profile_1_1762273317013-362814769.jpg\"}', '::1', '2025-11-04 16:21:57'),
(130, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-04 16:22:40'),
(131, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-04 16:22:42'),
(132, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-04 16:27:52'),
(133, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-04 16:27:55'),
(134, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-04 16:29:32'),
(135, 6, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-11-04 16:30:35'),
(136, 6, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hassan\"}', '::1', '2025-11-04 16:32:52'),
(137, 5, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza\"}', '::1', '2025-11-04 16:33:32'),
(138, 5, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hamza\"}', '::1', '2025-11-04 16:35:06'),
(139, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-04 16:35:11'),
(140, 1, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-04 20:10:45'),
(141, 5, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"hamza\"}', '::1', '2025-11-04 20:11:30'),
(142, 5, NULL, 'LOGOUT', NULL, NULL, '{\"username\":\"hamza\"}', '::1', '2025-11-04 20:15:31'),
(143, 1, NULL, 'LOGIN_SUCCESS', NULL, NULL, '{\"username\":\"admin\"}', '::1', '2025-11-04 20:15:35'),
(144, 1, NULL, 'CREATE_PROJECT', 'archived_projects', 9, '{\"newData\":{\"title\":\"rqrwerwerqet\",\"year\":2025,\"department\":\"Software Engineering\"}}', NULL, '2025-11-04 21:21:20'),
(145, 1, NULL, 'BULK_IMPORT_PROJECTS', 'archived_projects', NULL, '{\"newData\":{\"total\":5,\"successful\":5,\"failed\":0,\"errors\":[]}}', NULL, '2025-11-04 21:22:42'),
(146, 1, NULL, 'BULK_IMPORT_PROJECTS', 'archived_projects', NULL, '{\"newData\":{\"total\":5,\"successful\":5,\"failed\":0,\"errors\":[]}}', NULL, '2025-11-04 21:24:31');

-- --------------------------------------------------------

--
-- Table structure for table `failed_login_attempts`
--

CREATE TABLE `failed_login_attempts` (
  `id` int(11) NOT NULL,
  `identifier` varchar(255) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `attempted_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `password_reset_tokens`
--

INSERT INTO `password_reset_tokens` (`id`, `user_id`, `token`, `expires_at`, `used`, `created_at`) VALUES
(1, 1, '3aec9bfee4e9bf0c697a3eced6737748fc18d3637c3cfccbe96136529974ca5d', '2025-10-18 17:43:10', 1, '2025-10-18 17:41:44'),
(2, 1, 'dfef6bb093f763908bda1e26a097db797468fd1aa8276d265d8b109eef256645', '2025-10-18 18:44:07', 0, '2025-10-18 17:44:07');

-- --------------------------------------------------------

--
-- Table structure for table `security_questions`
--

CREATE TABLE `security_questions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `question` varchar(255) NOT NULL,
  `answer_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `security_questions`
--

INSERT INTO `security_questions` (`id`, `user_id`, `question`, `answer_hash`, `created_at`) VALUES
(1, 1, 'What is your favorite color?', '$2a$10$rQ3vXZGmY7qYfBxZ8YJ5V.8hKp5nZ0sBmWQx1pB9nV3nP5xO1nP5O', '2025-10-18 13:46:30');

-- --------------------------------------------------------

--
-- Table structure for table `security_question_challenges`
--

CREATE TABLE `security_question_challenges` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `status` enum('pending','verified','failed','expired') DEFAULT 'pending',
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `token`, `expires_at`, `created_at`, `ip_address`, `user_agent`) VALUES
(17, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoiY3VzdG1haWw4QGdtYWlsLmNvbSIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIiwiaWF0IjoxNzYxMDY5MTM3LCJleHAiOjE3NjExNTU1Mzd9.lSlpqmvHeEP810pUZlINyzZ0ui-xyuKNxYfMtNEy0yA', '2025-10-22 17:52:17', '2025-10-21 17:52:17', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36'),
(35, 6, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwidXNlcm5hbWUiOiJoYXNzYW4iLCJlbWFpbCI6ImhhbXphLmFsaUByaXBoYWguZWR1LnBrIiwicm9sZSI6IlRlYWNoZXIiLCJpYXQiOjE3NjIwMTgyNDgsImV4cCI6MTc2MjEwNDY0OH0.CsQ9fJwfIpJcWl4_AaeMVynM5G1QmwhQSHz1X9Srb2I', '2025-11-02 17:30:48', '2025-11-01 17:30:48', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(39, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoiY3VzdG1haWw4QGdtYWlsLmNvbSIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIiwiaWF0IjoxNzYyMTQ2MTAzLCJleHAiOjE3NjIyMzI1MDN9.yZqa545Ih171eZbqjL-7K-MUrczs5wTcRmussFQsMzk', '2025-11-04 05:01:43', '2025-11-03 05:01:43', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(40, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoiY3VzdG1haWw4QGdtYWlsLmNvbSIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIiwiaWF0IjoxNzYyMTY4Mjg3LCJleHAiOjE3NjIyNTQ2ODd9.OBtTseXpfmv-SPc09DprppleFTxXwPeyhcrXXRhpIM8', '2025-11-04 11:11:27', '2025-11-03 11:11:27', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36'),
(48, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoiY3VzdG1haWw4QGdtYWlsLmNvbSIsInJvbGUiOiJBZG1pbmlzdHJhdG9yIiwiaWF0IjoxNzYyMjg3MzM1LCJleHAiOjE3NjIzNzM3MzV9.AVsS3sxJPeidEQxdzsR5KWHEWfqr04Es8g6zFpTUZR4', '2025-11-05 20:15:35', '2025-11-04 20:15:35', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `research_areas` text DEFAULT NULL,
  `expertise` text DEFAULT NULL,
  `availability_status` enum('Available','Busy','Unavailable') DEFAULT 'Available',
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Student','Teacher','Committee','Administrator') NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `profile_picture`, `phone`, `department`, `research_areas`, `expertise`, `availability_status`, `password_hash`, `role`, `is_active`, `created_at`, `updated_at`, `created_by`, `last_login`) VALUES
(1, 'admin', 'custmail8@gmail.com', 'profile_1_1762273317013-362814769.jpg', '46346235234', 'Software Engineering', NULL, NULL, 'Available', '$2b$10$CQINwP0vQTozFq2kICyHjObtOog1GhDzTZKVtePlNXd93Ht8tZgee', 'Administrator', 1, '2025-10-18 13:46:10', '2025-11-04 20:15:35', NULL, '2025-11-04 20:15:35'),
(4, 'Shayan_Ahmed', 'shayanraza804@gmail.com', NULL, NULL, NULL, NULL, NULL, 'Available', '$2b$10$2lVf6/bWEQ6c3GKN.Ohn9ORn1mJMAwlX8dr31jaPYZ/P55BGzVMWm', 'Administrator', 1, '2025-10-21 17:53:18', '2025-10-21 17:53:18', 1, NULL),
(5, 'hamza', 'upcomp28@gmail.com', 'profile_5_1762002578665-805842813.jpg', '234242342525', 'Computer Science', NULL, NULL, 'Available', '$2b$10$LNtql.iEN5Q4DsYoKi5SL.JLFXXAhJNAc5N2zu4tGYIG3fOMm7pKW', 'Student', 1, '2025-10-30 20:07:01', '2025-11-04 20:11:30', 1, '2025-11-04 20:11:30'),
(6, 'hassan', 'hamza.ali@riphah.edu.pk', 'profile_6_1761992958060-92467630.jpg', '9230002485235', 'Cyber Security', 'adfwe', 'wegweg', 'Busy', '$2b$10$Z6rQoe6a2y55oMwX/nJcT.GhHXMKEY4v7ZvAM9Fh35bhqJxK2rkua', 'Teacher', 1, '2025-10-30 20:07:21', '2025-11-04 16:30:35', 1, '2025-11-04 16:30:35');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `archived_projects`
--
ALTER TABLE `archived_projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supervisor_id` (`supervisor_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_year` (`year`),
  ADD KEY `idx_department` (`department`),
  ADD KEY `idx_supervisor_name` (`supervisor_name`),
  ADD KEY `idx_technology` (`technology_type`);
ALTER TABLE `archived_projects` ADD FULLTEXT KEY `idx_search` (`title`,`abstract`,`keywords`,`student_names`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_admin_id` (`admin_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `failed_login_attempts`
--
ALTER TABLE `failed_login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_identifier` (`identifier`),
  ADD KEY `idx_ip_address` (`ip_address`),
  ADD KEY `idx_attempted_at` (`attempted_at`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `security_questions`
--
ALTER TABLE `security_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `security_question_challenges`
--
ALTER TABLE `security_question_challenges`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_profile_picture` (`profile_picture`),
  ADD KEY `idx_availability_status` (`availability_status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `archived_projects`
--
ALTER TABLE `archived_projects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=147;

--
-- AUTO_INCREMENT for table `failed_login_attempts`
--
ALTER TABLE `failed_login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `security_questions`
--
ALTER TABLE `security_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `security_question_challenges`
--
ALTER TABLE `security_question_challenges`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `archived_projects`
--
ALTER TABLE `archived_projects`
  ADD CONSTRAINT `archived_projects_ibfk_1` FOREIGN KEY (`supervisor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `archived_projects_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `audit_logs_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `security_questions`
--
ALTER TABLE `security_questions`
  ADD CONSTRAINT `security_questions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `security_question_challenges`
--
ALTER TABLE `security_question_challenges`
  ADD CONSTRAINT `security_question_challenges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `security_question_challenges_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
