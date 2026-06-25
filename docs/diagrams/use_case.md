# Use Case Diagram
## Project: SIMDATAN (Sistem Informasi Manajemen Data Pertanian)

```mermaid
left_to_right_direction
actor "Petugas Lapangan" as Petugas
actor "Supervisor" as Supervisor
actor "Admin" as Admin

rectangle "SIMDATAN System" {
  usecase "Login & Manage Profile" as UC_Auth
  usecase "Manage Wilayah (Kecamatan/Desa)" as UC_Wilayah
  usecase "Input & Edit Farmer Profiles" as UC_Farmer
  usecase "Input Land Coordinates & Documents" as UC_Land
  usecase "Record Harvest Production" as UC_Harvest
  usecase "Record Field Activities" as UC_Activity
  usecase "Upload and Manage Documents" as UC_Document
  usecase "Review & Verify Data" as UC_Review
  usecase "Approve or Reject Submissions" as UC_Approve
  usecase "Import & Export Excel/CSV/PDF" as UC_ImportExport
  usecase "Global Search & View Analytics" as UC_Dashboard
  usecase "Database Backup & Restore" as UC_Backup
  usecase "System Settings Configuration" as UC_Settings
}

Petugas --> UC_Auth
Petugas --> UC_Farmer
Petugas --> UC_Land
Petugas --> UC_Harvest
Petugas --> UC_Activity
Petugas --> UC_Document
Petugas --> UC_Dashboard

Supervisor --> UC_Auth
Supervisor --> UC_Review
Supervisor --> UC_Dashboard

Admin --> UC_Auth
Admin --> UC_Wilayah
Admin --> UC_Farmer
Admin --> UC_Land
Admin --> UC_Harvest
Admin --> UC_Approve
Admin --> UC_ImportExport
Admin --> UC_Dashboard
Admin --> UC_Backup
Admin --> UC_Settings
```
