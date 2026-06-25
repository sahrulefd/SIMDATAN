-- =============================================================================
-- SIMDATAN (Sistem Informasi Manajemen Data Pertanian)
-- Database DDL Schema Setup & Initial Data Seeds
-- Target Database Engine: MySQL 8.0+
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `settings`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `audit_logs`;
DROP TABLE IF EXISTS `approval_workflows`;
DROP TABLE IF EXISTS `dokumen`;
DROP TABLE IF EXISTS `kegiatan_lapangan`;
DROP TABLE IF EXISTS `produksi_panen`;
DROP TABLE IF EXISTS `komoditas`;
DROP TABLE IF EXISTS `lahan`;
DROP TABLE IF EXISTS `petani`;
DROP TABLE IF EXISTS `kelompok_tani`;
DROP TABLE IF EXISTS `desa`;
DROP TABLE IF EXISTS `kecamatan`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- -----------------------------------------------------------------------------
-- Table: users
-- -----------------------------------------------------------------------------
CREATE TABLE `users` (
  `id` bigint unsigned AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin', 'supervisor', 'petugas') NOT NULL DEFAULT 'petugas',
  `is_active` boolean NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `deleted_at` timestamp DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_idx` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: kecamatan
-- -----------------------------------------------------------------------------
CREATE TABLE `kecamatan` (
  `id` bigint unsigned AUTO_INCREMENT,
  `kode_kecamatan` varchar(50) NOT NULL,
  `nama_kecamatan` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `kecamatan_kode_unique` (`kode_kecamatan`),
  KEY `kecamatan_nama_idx` (`nama_kecamatan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: desa
-- -----------------------------------------------------------------------------
CREATE TABLE `desa` (
  `id` bigint unsigned AUTO_INCREMENT,
  `kecamatan_id` bigint unsigned NOT NULL,
  `kode_desa` varchar(50) NOT NULL,
  `nama_desa` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `desa_kode_unique` (`kode_desa`),
  KEY `desa_kecamatan_idx` (`kecamatan_id`),
  CONSTRAINT `fk_desa_kecamatan` FOREIGN KEY (`kecamatan_id`) REFERENCES `kecamatan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: kelompok_tani
-- -----------------------------------------------------------------------------
CREATE TABLE `kelompok_tani` (
  `id` bigint unsigned AUTO_INCREMENT,
  `desa_id` bigint unsigned NOT NULL,
  `nama_kelompok` varchar(150) NOT NULL,
  `ketua_nama` varchar(150) NOT NULL,
  `tahun_berdiri` year NOT NULL,
  `alamat` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `kelompok_tani_desa_idx` (`desa_id`),
  CONSTRAINT `fk_kelompok_tani_desa` FOREIGN KEY (`desa_id`) REFERENCES `desa` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: petani
-- -----------------------------------------------------------------------------
CREATE TABLE `petani` (
  `id` bigint unsigned AUTO_INCREMENT,
  `kelompok_tani_id` bigint unsigned DEFAULT NULL,
  `nik` varchar(16) NOT NULL,
  `nama` varchar(150) NOT NULL,
  `jenis_kelamin` enum('L', 'P') NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `nomor_hp` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `foto_path` varchar(255) DEFAULT NULL,
  `status` enum('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
  `tanggal_bergabung` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `petani_nik_unique` (`nik`),
  KEY `petani_kelompok_tani_idx` (`kelompok_tani_id`),
  KEY `petani_nama_idx` (`nama`),
  CONSTRAINT `fk_petani_kelompok` FOREIGN KEY (`kelompok_tani_id`) REFERENCES `kelompok_tani` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: lahan
-- -----------------------------------------------------------------------------
CREATE TABLE `lahan` (
  `id` bigint unsigned AUTO_INCREMENT,
  `pemilik_petani_id` bigint unsigned NOT NULL,
  `kode_lahan` varchar(50) NOT NULL,
  `nama_lahan` varchar(150) NOT NULL,
  `luas_ha` double(8,2) NOT NULL,
  `status_kepemilikan` enum('Milik Sendiri', 'Sewa', 'Bagi Hasil') NOT NULL DEFAULT 'Milik Sendiri',
  `latitude` double(10,8) DEFAULT NULL,
  `longitude` double(11,8) DEFAULT NULL,
  `foto_path` varchar(255) DEFAULT NULL,
  `dokumen_pendukung_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `lahan_kode_unique` (`kode_lahan`),
  KEY `lahan_pemilik_idx` (`pemilik_petani_id`),
  CONSTRAINT `fk_lahan_pemilik` FOREIGN KEY (`pemilik_petani_id`) REFERENCES `petani` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: komoditas
-- -----------------------------------------------------------------------------
CREATE TABLE `komoditas` (
  `id` bigint unsigned AUTO_INCREMENT,
  `kode_komoditas` varchar(50) NOT NULL,
  `nama_komoditas` varchar(150) NOT NULL,
  `kategori` varchar(100) NOT NULL,
  `satuan` varchar(50) NOT NULL DEFAULT 'Ton',
  `harga_acuan` double(12,2) NOT NULL DEFAULT 0.00,
  `foto_path` varchar(255) DEFAULT NULL,
  `deskripsi` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `komoditas_kode_unique` (`kode_komoditas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: produksi_panen
-- -----------------------------------------------------------------------------
CREATE TABLE `produksi_panen` (
  `id` bigint unsigned AUTO_INCREMENT,
  `lahan_id` bigint unsigned NOT NULL,
  `komoditas_id` bigint unsigned NOT NULL,
  `musim_tanam` varchar(50) NOT NULL,
  `tahun_tanam` year NOT NULL,
  `tanggal_tanam` date NOT NULL,
  `tanggal_panen_estimasi` date NOT NULL,
  `tanggal_panen_aktual` date DEFAULT NULL,
  `status_panen` enum('Belum Tanam', 'Sedang Tanam', 'Akan Panen', 'Sudah Panen', 'Gagal Panen') NOT NULL DEFAULT 'Belum Tanam',
  `hasil_panen` double(12,2) DEFAULT NULL,
  `satuan` varchar(50) NOT NULL DEFAULT 'Ton',
  `produktivitas` double(8,2) DEFAULT NULL,
  `keterangan` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `produksi_lahan_idx` (`lahan_id`),
  KEY `produksi_komoditas_idx` (`komoditas_id`),
  KEY `produksi_analytics_idx` (`status_panen`, `tahun_tanam`, `komoditas_id`),
  CONSTRAINT `fk_produksi_lahan` FOREIGN KEY (`lahan_id`) REFERENCES `lahan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_produksi_komoditas` FOREIGN KEY (`komoditas_id`) REFERENCES `komoditas` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: kegiatan_lapangan
-- -----------------------------------------------------------------------------
CREATE TABLE `kegiatan_lapangan` (
  `id` bigint unsigned AUTO_INCREMENT,
  `petugas_id` bigint unsigned NOT NULL,
  `judul` varchar(255) NOT NULL,
  `tipe_kegiatan` enum('Kunjungan', 'Penyuluhan', 'Monitoring') NOT NULL DEFAULT 'Monitoring',
  `tanggal_kegiatan` date NOT NULL,
  `catatan` text DEFAULT NULL,
  `foto_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `kegiatan_petugas_idx` (`petugas_id`),
  CONSTRAINT `fk_kegiatan_petugas` FOREIGN KEY (`petugas_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: dokumen
-- -----------------------------------------------------------------------------
CREATE TABLE `dokumen` (
  `id` bigint unsigned AUTO_INCREMENT,
  `nama_dokumen` varchar(255) NOT NULL,
  `tipe_file` varchar(10) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `versi` int NOT NULL DEFAULT 1,
  `uploaded_by_id` bigint unsigned NOT NULL,
  `model_type` varchar(255) DEFAULT NULL,
  `model_id` bigint unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `dokumen_uploader_idx` (`uploaded_by_id`),
  CONSTRAINT `fk_dokumen_uploader` FOREIGN KEY (`uploaded_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: approval_workflows
-- -----------------------------------------------------------------------------
CREATE TABLE `approval_workflows` (
  `id` bigint unsigned AUTO_INCREMENT,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint unsigned NOT NULL,
  `requester_id` bigint unsigned NOT NULL,
  `status` enum('Draft', 'Submit', 'Review', 'Approve', 'Reject') NOT NULL DEFAULT 'Draft',
  `reviewer_id` bigint unsigned DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `approval_requester_idx` (`requester_id`),
  KEY `approval_reviewer_idx` (`reviewer_id`),
  CONSTRAINT `fk_approval_requester` FOREIGN KEY (`requester_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_approval_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: audit_logs
-- -----------------------------------------------------------------------------
CREATE TABLE `audit_logs` (
  `id` bigint unsigned AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `action` enum('Login', 'Logout', 'Tambah', 'Edit', 'Hapus', 'Import', 'Export') NOT NULL,
  `modul` varchar(100) NOT NULL,
  `deskripsi` text NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `audit_user_idx` (`user_id`),
  CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: notifications
-- -----------------------------------------------------------------------------
CREATE TABLE `notifications` (
  `id` bigint unsigned AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` boolean NOT NULL DEFAULT 0,
  `type` varchar(50) NOT NULL DEFAULT 'info',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notifications_user_idx` (`user_id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- Table: settings
-- -----------------------------------------------------------------------------
CREATE TABLE `settings` (
  `id` bigint unsigned AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `settings_key_unique` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Initial Data Seeds (Startup essentials)
-- =================------------------------------------------------------------

-- Seed System Settings
INSERT INTO `settings` (`key`, `value`) VALUES
('nama_instansi', 'Dinas Pertanian Daerah SIMDATAN'),
('logo_path', '/images/logo-dinas.png'),
('alamat', 'Jl. Jenderal Sudirman No. 45, Kompleks Perkantoran Pemda'),
('kontak', '021-5551234 / info@simdatan.go.id'),
('tahun_aktif', '2026'),
('tema_sistem', 'dark');

-- Seed Users (Passwords are BCrypt hashes of 'password')
INSERT INTO `users` (`name`, `email`, `password`, `role`, `is_active`) VALUES
('Administrator Utama', 'admin@simdatan.go.id', '$2y$10$32i49vGf55/5NqHswFqQeuF46FkY1hYt1U6W0i5U/tS2yUqgD10h2', 'admin', 1),
('Supervisor Dinas', 'supervisor@simdatan.go.id', '$2y$10$32i49vGf55/5NqHswFqQeuF46FkY1hYt1U6W0i5U/tS2yUqgD10h2', 'supervisor', 1),
('Bambang Lapangan', 'petugas@simdatan.go.id', '$2y$10$32i49vGf55/5NqHswFqQeuF46FkY1hYt1U6W0i5U/tS2yUqgD10h2', 'petugas', 1);

-- Seed Commodities
INSERT INTO `komoditas` (`kode_komoditas`, `nama_komoditas`, `kategori`, `satuan`, `harga_acuan`, `deskripsi`) VALUES
('KMD-PADI', 'Padi Sawah', 'Pangan', 'Ton', 6500000.00, 'Varietas unggul padi sawah tadah hujan.'),
('KMD-JAGUNG', 'Jagung Kuning', 'Pangan', 'Ton', 4200000.00, 'Jagung pakan ternak berkadar air rendah.'),
('KMD-KEDELAI', 'Kedelai Lokal', 'Pangan', 'Ton', 9800000.00, 'Kedelai bahan baku tempe tahu.'),
('KMD-CABE', 'Cabai Merah Keriting', 'Hortikultura', 'Kg', 35000.00, 'Komoditas sayuran hortikultura sensitif inflasi.'),
('KMD-BAWANG', 'Bawang Merah', 'Hortikultura', 'Kg', 28000.00, 'Bawang merah varietas Brebes.');
