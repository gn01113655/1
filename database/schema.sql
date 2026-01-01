CREATE TABLE IF NOT EXISTS `member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `level` varchar(20) NOT NULL,
  `city` varchar(16) NOT NULL,
  `edu` varchar(16) NOT NULL,
  `auth_token` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=148 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

