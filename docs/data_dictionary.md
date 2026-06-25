# Data Dictionary
## Database: `simdatan_db` (MySQL 8.0)

---

### Table: `users`
Stores system accounts for administrative and field personnel.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `name` | varchar(255) | No | | | Full name of the user. |
| `email` | varchar(255) | No | Unique | | Email address (used as username). |
| `password` | varchar(255) | No | | | BCrypt hashed password. |
| `role` | enum('admin','supervisor','petugas')| No | | 'petugas'| Role governing system privileges. |
| `is_active` | boolean | No | | 1 | Status indicator for active/inactive logins. |
| `last_login_at` | datetime | Yes | | NULL | Timestamp of last login transaction. |
| `deleted_at` | timestamp | Yes | | NULL | Soft delete support timestamp. |
| `created_at` | timestamp | Yes | | CURRENT_TIMESTAMP| Records creation time. |
| `updated_at` | timestamp | Yes | | CURRENT_TIMESTAMP| Records update time. |

---

### Table: `kecamatan`
Administrative divisions under Dinas Pertanian supervision.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `kode_kecamatan` | varchar(50) | No | Unique | | Official regional administrative code. |
| `nama_kecamatan` | varchar(150) | No | | | Name of the district. |
| `created_at` | timestamp | Yes | | NULL | Records creation time. |
| `updated_at` | timestamp | Yes | | NULL | Records update time. |

---

### Table: `desa`
Sub-districts belonging to a specific Kecamatan.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `kecamatan_id` | bigint unsigned | No | FK | | Reference to `kecamatan.id`. |
| `kode_desa` | varchar(50) | No | Unique | | Official sub-district code. |
| `nama_desa` | varchar(150) | No | | | Name of the sub-district village. |
| `created_at` | timestamp | Yes | | NULL | Records creation time. |
| `updated_at` | timestamp | Yes | | NULL | Records update time. |

---

### Table: `kelompok_tani`
Organized farmer groups forming cooperatives.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `desa_id` | bigint unsigned | No | FK | | Reference to `desa.id`. |
| `nama_kelompok` | varchar(150) | No | | | Name of the cooperative. |
| `ketua_nama` | varchar(150) | No | | | Name of the group leader. |
| `tahun_berdiri` | year | No | | | Founding year of the cooperative. |
| `alamat` | text | Yes | | NULL | Address of the group headquarters. |
| `created_at` | timestamp | Yes | | NULL | Records creation time. |
| `updated_at` | timestamp | Yes | | NULL | Records update time. |

---

### Table: `petani`
Agricultural farmers registered in the system.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `kelompok_tani_id`| bigint unsigned | Yes | FK | NULL | Reference to `kelompok_tani.id`. |
| `nik` | varchar(16) | No | Unique | | National Identity Card Number. |
| `nama` | varchar(150) | No | | | Full name of the farmer. |
| `jenis_kelamin` | enum('L','P') | No | | | Gender: L (Laki-laki) or P (Perempuan). |
| `tanggal_lahir` | date | No | | | Date of Birth. |
| `nomor_hp` | varchar(20) | Yes | | NULL | Mobile contact phone number. |
| `alamat` | text | Yes | | NULL | Residential address. |
| `foto_path` | varchar(255) | Yes | | NULL | Path to uploaded avatar picture. |
| `status` | enum('aktif','nonaktif')| No | | 'aktif'| Farmer status in cooperative registries. |
| `tanggal_bergabung`| date | Yes | | NULL | Registration date inside cooperatives. |
| `created_at` | timestamp | Yes | | NULL | Records creation time. |
| `updated_at` | timestamp | Yes | | NULL | Records update time. |

---

### Table: `lahan`
Agricultural land plots.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `pemilik_petani_id`| bigint unsigned | No | FK | | Reference to `petani.id` (Owner). |
| `kode_lahan` | varchar(50) | No | Unique | | System generated unique land code. |
| `nama_lahan` | varchar(150) | No | | | Custom name describing the plot. |
| `luas_ha` | double(8,2) | No | | | Land area size measured in Hectares (Ha). |
| `status_kepemilikan`| enum('Milik Sendiri','Sewa','Bagi Hasil')| No | | 'Milik Sendiri' | Legal status of the land. |
| `latitude` | double(10,8) | Yes | | NULL | Geographic coordinate: Latitude. |
| `longitude` | double(11,8) | Yes | | NULL | Geographic coordinate: Longitude. |
| `foto_path` | varchar(255) | Yes | | NULL | Photo showing land layouts. |
| `dokumen_pendukung_path`| varchar(255)| Yes | | NULL | Reference link to certification documents. |
| `created_at` | timestamp | Yes | | NULL | Records creation time. |
| `updated_at` | timestamp | Yes | | NULL | Records update time. |

---

### Table: `komoditas`
Agricultural plant species directories.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `kode_komoditas` | varchar(50) | No | Unique | | Code identifying the commodity. |
| `nama_komoditas` | varchar(150) | No | | | Common name (e.g., Padi, Jagung). |
| `kategori` | varchar(100) | No | | | Category (Pangan, Hortikultura, Perkebunan). |
| `satuan` | varchar(50) | No | | 'Ton' | Measuring units (Ton, Kg). |
| `harga_acuan` | double(12,2) | No | | 0.00 | Base guidelines price per unit. |
| `foto_path` | varchar(255) | Yes | | NULL | Thumbnail image path. |
| `deskripsi` | text | Yes | | NULL | Description and notes. |
| `created_at` | timestamp | Yes | | NULL | Records creation time. |
| `updated_at` | timestamp | Yes | | NULL | Records update time. |

---

### Table: `produksi_panen`
Harvest and crop cycle tracking records.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `lahan_id` | bigint unsigned | No | FK | | Reference to `lahan.id`. |
| `komoditas_id` | bigint unsigned | No | FK | | Reference to `komoditas.id`. |
| `musim_tanam` | varchar(50) | No | | | Musim Tanam ID (e.g., Hujan, Kemarau). |
| `tahun_tanam` | year | No | | | Calendar year of planting. |
| `tanggal_tanam` | date | No | | | Actual date of crop planting. |
| `tanggal_panen_estimasi`| date | No | | | Estimated harvest date. |
| `tanggal_panen_aktual`| date | Yes | | NULL | Actual harvest date. |
| `status_panen` | enum('Belum Tanam','Sedang Tanam','Akan Panen','Sudah Panen','Gagal Panen')| No | | 'Belum Tanam' | Crop status phase. |
| `hasil_panen` | double(12,2) | Yes | | NULL | Net harvest volume. |
| `satuan` | varchar(50) | No | | 'Ton' | Metric unit identifier. |
| `produktivitas` | double(8,2) | Yes | | NULL | Harvest Yield / Luas Lahan (calculated). |
| `keterangan` | text | Yes | | NULL | Incident reports, details of failure, etc. |
| `created_at` | timestamp | Yes | | NULL | Records creation time. |
| `updated_at` | timestamp | Yes | | NULL | Records update time. |

---

### Table: `kegiatan_lapangan`
Visits, extension training, and advisory activities.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `petugas_id` | bigint unsigned | No | FK | | Reference to `users.id` (Petugas). |
| `judul` | varchar(255) | No | | | Title of the counseling/counsel session. |
| `tipe_kegiatan` | enum('Kunjungan','Penyuluhan','Monitoring')| No | | 'Monitoring' | Categorization of field activity. |
| `tanggal_kegiatan`| date | No | | | Date of session. |
| `catatan` | text | Yes | | NULL | Executive summary of outcomes. |
| `foto_path` | varchar(255) | Yes | | NULL | Photo showing documentation. |
| `created_at` | timestamp | Yes | | NULL | Records creation time. |
| `updated_at` | timestamp | Yes | | NULL | Records update time. |

---

### Table: `dokumen`
Supporting certificates, deeds, and file attachments.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `nama_dokumen` | varchar(255) | No | | | Friendly display name. |
| `tipe_file` | varchar(10) | No | | | PDF, DOCX, XLSX, JPG, PNG. |
| `file_path` | varchar(255) | No | | | Relative file path on server storage. |
| `versi` | int | No | | 1 | Numeric document revision version. |
| `uploaded_by_id` | bigint unsigned | No | FK | | Reference to `users.id`. |
| `model_type` | varchar(255) | Yes | | NULL | Polymorphic target class structure. |
| `model_id` | bigint unsigned | Yes | | NULL | Polymorphic model ID reference. |
| `created_at` | timestamp | Yes | | NULL | Records creation time. |
| `updated_at` | timestamp | Yes | | NULL | Records update time. |

---

### Table: `approval_workflows`
Tracks workflow state promotions (Petugas -> Supervisor -> Admin).

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `model_type` | varchar(255) | No | | | Polymorphic model name (e.g. ProduksiPanen). |
| `model_id` | bigint unsigned | No | | | ID of target model being approved. |
| `requester_id` | bigint unsigned | No | FK | | Reference to `users.id` (initiator). |
| `status` | enum('Draft','Submit','Review','Approve','Reject')| No | | 'Draft' | State of the approval. |
| `reviewer_id` | bigint unsigned | Yes | FK | NULL | Reference to `users.id` (auditor). |
| `notes` | text | Yes | | NULL | Review notes or reason for rejection. |
| `created_at` | timestamp | Yes | | NULL | Records creation time. |
| `updated_at` | timestamp | Yes | | NULL | Records update time. |

---

### Table: `audit_logs`
Records database changes and user login transactions.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `user_id` | bigint unsigned | Yes | FK | NULL | Reference to `users.id` (initiator). |
| `action` | enum('Login','Logout','Tambah','Edit','Hapus','Import','Export')| No | | | Action code. |
| `modul` | varchar(100) | No | | | Target system section. |
| `deskripsi` | text | No | | | Comprehensive activity log. |
| `ip_address` | varchar(45) | Yes | | NULL | IP address of request. |
| `user_agent` | varchar(255) | Yes | | NULL | User agent signature. |
| `created_at` | timestamp | Yes | | CURRENT_TIMESTAMP| Logging time. |

---

### Table: `notifications`
Direct in-app messages and warnings to users.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `user_id` | bigint unsigned | No | FK | | Reference to `users.id`. |
| `title` | varchar(255) | No | | | Header text. |
| `message` | text | No | | | Detailed notification body. |
| `is_read` | boolean | No | | 0 | Unread status. |
| `type` | varchar(50) | No | | 'info' | Category (info, warning, danger). |
| `created_at` | timestamp | Yes | | NULL | Records creation time. |
| `updated_at` | timestamp | Yes | | NULL | Records update time. |

---

### Table: `settings`
System variables and custom logos.

| Column Name | Data Type | Nullable | Key | Default | Description |
|---|---|---|---|---|---|
| `id` | bigint unsigned | No | PK | Auto | Unique identifier. |
| `key` | varchar(100) | No | Unique | | Setting name indicator. |
| `value` | text | Yes | | NULL | Stored configuration setting values. |
| `created_at` | timestamp | Yes | | NULL | Records creation time. |
| `updated_at` | timestamp | Yes | | NULL | Records update time. |
