# SIMDATAN - Sistem Informasi Manajemen Data Pertanian Terpadu

SIMDATAN adalah platform basis data intelijen pertanian terpusat (*Centralized Agricultural Intelligence Database*) yang dirancang khusus untuk Dinas Pertanian tingkat daerah di Indonesia. Sistem ini mengintegrasikan pendataan petani, pemetaan koordinat lahan berbasis GIS (spasial), pencatatan estimasi dan tonase panen, hingga alur persetujuan data bertingkat demi ketahanan pangan daerah berkelanjutan.

---

## 🔑 Akun Uji Coba (Kredensial Login)

Sistem ini membatasi hak akses berdasarkan peran pengguna (*role-based access control*) demi menjaga keamanan dan validitas data. Semua akun di bawah ini menggunakan password default: **`password`**

| Peran (Role) | Email Login | Password | Deskripsi Hak Akses |
| :--- | :--- | :--- | :--- |
| **Administrator Utama** | `admin@simdatan.go.id` | `password` | Akses penuh sistem: manajemen pengguna, konfigurasi wilayah kecamatan/desa, backup & restore database, serta log audit keamanan. |
| **Supervisor Dinas** | `supervisor@simdatan.go.id` | `password` | Pengawas dinas: persetujuan data lahan baru (*approval*), ekspor berkas laporan dinas, dan monitoring produktivitas keseluruhan wilayah. |
| **Petugas Lapangan** | `petugas@simdatan.go.id` | `password` | Operator lapangan: input pendaftaran petani baru, pemetaan kordinat lahan GPS, pencatatan tonase hasil panen, dan upload dokumen pendukung. |

---

## 🚀 Petunjuk Menjalankan Aplikasi Secara Lokal

### 1. Prasyarat Sistem
* PHP >= 8.2 & Composer
* Node.js >= 18 & npm

### 2. Jalankan Backend (Laravel)
Masuk ke subfolder `backend` dan ikuti perintah di bawah ini:
```bash
# 1. Masuk ke folder backend
cd backend

# 2. Salin environment configuration
copy .env.example .env

# 3. Jalankan migrasi database dan pengisian data uji coba (SQLite)
php artisan migrate:fresh --seed

# 4. Jalankan server backend lokal
php artisan serve
```
*Catatan: Konfigurasi default database menggunakan **SQLite** (`database/database.sqlite`), sehingga Anda tidak memerlukan server MySQL aktif.*

### 3. Jalankan Frontend (React + TS + Vite)
Masuk ke subfolder `frontend` di terminal baru:
```bash
# 1. Masuk ke folder frontend
cd frontend

# 2. Pasang dependensi NodeJS
npm install

# 3. Jalankan server frontend lokal (Vite)
npm run dev
```
Buka alamat **`http://localhost:5173`** di browser Anda untuk mengakses aplikasi.

---

## 📋 Penjelasan Detail Fitur & Kegunaan Modul SIMDATAN

Berikut adalah daftar seluruh fitur yang tersedia pada aplikasi SIMDATAN beserta kegunaan fungsionalnya:

### 1. Halaman Landing Page Publik (Halaman Depan)
* **Kegunaan**: Sebagai portal informasi publik utama resmi Dinas Pertanian.
* **Fitur**:
  * Menampilkan informasi profil, visi, dan misi sistem portal tani daerah secara elegan dengan tata letak bersih (*centered layout*) bergaya dinas resmi.
  * Widget **Statistik Binaan** dinamis yang memperlihatkan rangkuman jumlah kelompok tani terdaftar, luas lahan terpetakan, dan cakupan wilayah secara realtime.
  * Tombol **Masuk Sistem** sebagai satu-satunya gerbang masuk (*gateway*) menuju halaman login internal bagi petugas berwenang.

### 2. Halaman Login Terenkripsi
* **Kegunaan**: Autentikasi keamanan bagi para pengguna sistem internal.
* **Fitur**:
  * Form login responsif yang memvalidasi email, sandi, serta mengenali peran pengguna secara instan menggunakan token JWT.
  * Fitur **Lupa Password** terproteksi yang mengarahkan pengguna menghubungi Administrator Utama (admin@simdatan.go.id) demi keamanan sistem.

### 3. Dasbor Analitik Utama (Internal Dashboard)
* **Kegunaan**: Menyajikan analitik visual terpadu mengenai produktivitas pertanian kepada pengambil keputusan.
* **Fitur**:
  * **KPI Cards**: Menampilkan metrik utama seperti total kecamatan binaan, jumlah petani terdaftar, kelompok tani terbina, dan total tonase hasil produksi secara akumulatif.
  * **Grafik Produksi per Tahun**: Grafik batang untuk membandingkan peningkatan/penurunan kuantitas panen dari tahun ke tahun.
  * **Grafik Produksi per Bulan**: Grafik dinamis (secara otomatis menyesuaikan fungsi database SQLite/MySQL) untuk memantau bulan dengan produktivitas panen tertinggi.
  * **Grafik Kontribusi Wilayah & Komoditas**: Grafik lingkaran (*donut/pie chart*) yang menguraikan kecamatan penyumbang panen terbesar dan komoditas pangan paling unggul di daerah tersebut.

### 4. GIS Pemetaan Spasial (Peta Interaktif)
* **Kegunaan**: Memetakan, memvisualisasikan, dan melacak sebaran lahan pertanian secara geografis.
* **Fitur**:
  * Integrasi **Leaflet JS Map** interaktif yang memplot titik-titik koordinat lahan pertanian di peta.
  * Penanda peta (*map markers*) yang bervariasi warna berdasarkan jenis komoditas utama lahan.
  * Tooltip informasi lahan instan: menampilkan nama pemilik, luas lahan (Hektar), komoditas aktif, estimasi panen, dan status pendaftaran saat marker diklik.

### 5. Manajemen Data Petani
* **Kegunaan**: Sebagai basis data master kepesertaan petani daerah.
* **Fitur**:
  * Tabel pencarian data petani berdasarkan Nama atau NIK (Nomor Induk Kependudukan).
  * Formulir pendaftaran petani baru yang mencakup NIK (16 digit), jenis kelamin, HP, alamat, tanggal bergabung, serta penetapan kelompok tani.
  * Status keaktifan petani (aktif/nonaktif) yang memengaruhi hak penerimaan program bantuan dinas.

### 6. Manajemen Kelompok Tani
* **Kegunaan**: Mengelola kelompok-kelompok usaha tani binaan dinas di setiap desa.
* **Fitur**:
  * Pengelompokan petani ke dalam organisasi tani lokal agar koordinasi distribusi pupuk subsidi dan alat mesin pertanian (alsintan) berjalan tertib.
  * Pendataan profil kelompok: Nama Kelompok, Ketua Kelompok, Tahun Berdiri, Alamat, dan Desa Domisili.

### 7. Wilayah Kerja Administratif (Kecamatan & Desa)
* **Kegunaan**: Menyusun hirarki pembagian wilayah kerja binaan dinas pertanian.
* **Fitur**:
  * Manajemen tingkat Kecamatan (Kode Kecamatan, Nama Kecamatan).
  * Manajemen tingkat Desa/Kelurahan yang terhubung (*belongs-to*) ke masing-masing kecamatan.
  * Memastikan koordinasi wilayah kerja petugas lapangan berjalan efisien.

### 8. Manajemen Lahan Pertanian
* **Kegunaan**: Mencatat properti fisik dan administratif area garapan tani.
* **Fitur**:
  * Pencatatan nomor sertifikat/kode lahan, nama lahan, dan luas total dalam satuan Hektar (Ha).
  * Koordinat Geografis (Latitude & Longitude) lahan untuk diintegrasikan ke modul GIS.
  * Pengarsipan berkas kepemilikan lahan (seperti sertifikat kepemilikan/sewa) secara digital.

### 9. Katalog Komoditas Pangan
* **Kegunaan**: Menyusun daftar pustaka komoditas tanaman pangan daerah.
* **Fitur**:
  * Penggolongan kategori komoditas (pangan, hortikultura, perkebunan, dll.).
  * Penetapan Harga Acuan Pasar per kilogram/ton serta satuan panen resmi guna memantau nilai keekonomian hasil bumi.

### 10. Pencatatan Produksi & Panen
* **Kegunaan**: Memantau siklus hidup tanaman dari masa tanam hingga realisasi hasil produksi.
* **Fitur**:
  * Perekaman tanggal masa tanam, estimasi tanggal panen, serta tanggal panen aktual.
  * Klasifikasi **Status Siklus**: *Belum Tanam, Sedang Tanam, Akan Panen, Sudah Panen, Gagal Panen*.
  * Penghitungan otomatis angka **Produktivitas Lahan** (Tonase per Hektar).
  * **Ekspor Data Excel/CSV**: Memungkinkan pengunduhan instan seluruh tabel laporan panen untuk keperluan kompilasi data dinas.

### 11. Pelaporan Kegiatan Lapangan
* **Kegunaan**: Bukti pertanggungjawaban aktivitas penyuluhan dan survei dinas di lapangan.
* **Fitur**:
  * Upload foto dokumentasi kegiatan fisik secara langsung dari area persawahan.
  * Pencatatan deskripsi aktivitas kerja harian petugas lapangan di setiap kelompok tani.

### 12. Persetujuan Data Lahan & Petani (Approval Workflow)
* **Kegunaan**: Filter validasi data sebelum disimpan permanen ke database pusat.
* **Fitur**:
  * Setiap data lahan baru yang didaftarkan oleh Petugas Lapangan berstatus *Pending* dan tidak akan muncul di GIS map sebelum disetujui.
  * Halaman khusus bagi Admin/Supervisor untuk menyetujui (*Approve*) atau menolak (*Reject*) data tersebut berdasarkan bukti berkas fisik.

### 13. Vault Dokumen Digital
* **Kegunaan**: Penyimpanan awan berkas administratif kelompok tani secara digital.
* **Fitur**:
  * Menyimpan file digital dalam format PDF, Word, Excel, dan Gambar.
  * Pencarian cepat berkas arsip pendataan kelompok tani secara terorganisir.

### 14. Audit Trail Logs (Keamanan Sistem)
* **Kegunaan**: Merekam rekam jejak aktivitas digital untuk mencegah manipulasi sistem.
* **Fitur**:
  * Pencatatan otomatis log: ID Pengguna, Tindakan (Tambah/Ubah/Hapus/Ekspor), Modul, Deskripsi Aksi, Alamat IP, serta User Agent browser.
  * Hanya dapat diakses oleh Administrator Utama.

### 15. Backup & Restore Basis Data
* **Kegunaan**: Mitigasi risiko kehilangan data sistem akibat kerusakan perangkat keras.
* **Fitur**:
  * Pembuatan file cadangan database (.sqlite / .sql) secara instan dalam satu klik.
  * Pemulihan (*restore*) data dari file cadangan yang diunggah secara aman.

### 16. Manajemen Pengguna (User Management)
* **Kegunaan**: Mengelola akun pengguna sistem internal dinas (hanya untuk peran Administrator Utama).
* **Fitur**:
  * Pendaftaran akun pengguna baru beserta penentuan peran (Admin, Supervisor, Petugas) dan status keaktifan.
  * **Reset Kata Sandi**: Pengubahan password instan oleh Administrator Utama untuk memulihkan akses pengguna/petugas yang lupa kata sandi.
  * Penonaktifan akun secara langsung untuk mencabut hak akses tanpa menghapus histori data audit.
