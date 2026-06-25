# Database Schema Design Guide
## Project: SIMDATAN (Sistem Informasi Manajemen Data Pertanian)

### 1. Architectural Rules
- **Storage Engine**: `InnoDB` is enforced across all tables to support transactional safety (ACID) and foreign key referential integrity constraints.
- **Character Set & Collation**: `utf8mb4` with `utf8mb4_unicode_ci` to support full multilingual inputs, special characters, and accurate text comparison.
- **Primary Keys**: Big integer unsigned auto-incrementing fields (`bigint unsigned AUTO_INCREMENT`) for all primary IDs.
- **Foreign Keys**: Enforces exact relationships with corresponding primary IDs. Indexes are automatically generated on all foreign key fields by MySQL.
- **Soft Deletion**: Applied via Laravel Eloquent `SoftDeletes` logic using `deleted_at` timestamps on security-critical tables like `users` and `petani`.

### 2. Indexes Optimization Strategy
To optimize database performance, search query speeds, and dashboard loading:
- **Composite Indexes**:
  - `produksi_panen`: Composite index on `(status_panen, tahun_tanam, komoditas_id)` for analytics filtering.
  - `petani`: Composite index on `(kelompok_tani_id, status)` to speed up cooperative group breakdowns.
- **Search Indexes**:
  - `petani`: B-Tree index on NIK and Name fields for instant lookups.
  - `lahan`: Unique index on Land Code (`kode_lahan`).
- **ForeignKey Indexes**: Explicit indexes created on all relationship boundaries to optimize JOIN operations.

### 3. Cascading Rules
- **Restrict Deletions**: Deleting a `kecamatan` is restricted if it contains any active `desa` records (`ON DELETE RESTRICT`). Similarly, deleting a `desa` is blocked if linked to any `kelompok_tani`.
- **Set Null / Cascade**: Deleting a farmer group (`kelompok_tani`) will set the linked farmer's group ID to `NULL` (`ON DELETE SET NULL`), preserving the farmer record.
- **Cascade Deletions**: Deleting a crop record will cascade delete associated `approval_workflows` logs to prevent orphaned records in the database.
