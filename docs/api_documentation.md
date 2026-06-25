# API Documentation
## API Base URL: `/api/v1`

---

### 1. Authentication Modul
#### 1.1 Login User
- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Request Body**:
  ```json
  {
    "email": "petugas@simdatan.go.id",
    "password": "password"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": 3,
      "name": "Bambang Lapangan",
      "email": "petugas@simdatan.go.id",
      "role": "petugas"
    }
  }
  ```

#### 1.2 User Profile (Me)
- **Method**: `GET`
- **Endpoint**: `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "id": 3,
    "name": "Bambang Lapangan",
    "email": "petugas@simdatan.go.id",
    "role": "petugas"
  }
  ```

---

### 2. Farmer (Petani) Modul
#### 2.1 Get Farmers List (Paginated & Filtered)
- **Method**: `GET`
- **Endpoint**: `/farmers`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (int, default: 1)
  - `search` (string, search name or NIK)
  - `kelompok_tani_id` (int)
  - `status` (aktif / nonaktif)
- **Response (200 OK)**:
  ```json
  {
    "current_page": 1,
    "data": [
      {
        "id": 1,
        "nik": "3201020304050001",
        "nama": "Sutisna",
        "jenis_kelamin": "L",
        "nomor_hp": "081234567890",
        "status": "aktif",
        "kelompok_tani": {
          "id": 2,
          "nama_kelompok": "Mekar Sari"
        }
      }
    ],
    "total": 50,
    "per_page": 15
  }
  ```

#### 2.2 Create Farmer Profile
- **Method**: `POST`
- **Endpoint**: `/farmers`
- **Request Body (Multipart Form-Data)**:
  - `nik` (string, required, length: 16)
  - `nama` (string, required)
  - `jenis_kelamin` (string, required, L/P)
  - `tanggal_lahir` (date, required)
  - `kelompok_tani_id` (int, nullable)
  - `foto` (file, image format, max 2MB)
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Data petani berhasil ditambahkan",
    "data": { "id": 51, "nama": "Asep", "nik": "3201020304059999" }
  }
  ```

---

### 3. Yield Production & Calculations
#### 3.1 Get Analytics Summary
- **Method**: `GET`
- **Endpoint**: `/analytics/dashboard`
- **Response (200 OK)**:
  ```json
  {
    "cards": {
      "total_wilayah": 10,
      "total_petani": 50,
      "total_kelompok": 20,
      "total_lahan": 100,
      "total_komoditas": 15,
      "total_produksi_ton": 3450.50
    },
    "produksi_per_wilayah": [
      { "kecamatan": "Ciawi", "total_ton": 1200.40 },
      { "kecamatan": "Cisarua", "total_ton": 850.10 }
    ]
  }
  ```
