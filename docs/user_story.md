# User Stories & Acceptance Criteria
## Project: SIMDATAN (Sistem Informasi Manajemen Data Pertanian)

| ID | As a/an... | I want to... | So that... | Acceptance Criteria |
|---|---|---|---|---|
| **US-01** | User | Log in securely with my credentials and use "Remember Me" | I don't have to log in repeatedly during the day | - Generates a valid JWT token.<br>- Stores session safely.<br>- "Remember Me" token stores login state. |
| **US-02** | Admin | Create, Edit, View, and Soft-Delete system users | I can manage access control and staff roles | - UI supports pagination and search.<br>- Soft deleted users are hidden but kept in DB.<br>- Role switching is instantaneous. |
| **US-03** | Petugas | Register new farmers with NIK, name, gender, photo, and Kelompok Tani membership | We have a reliable registry of agricultural workers | - NIK must be exactly 16 digits.<br>- Farmer profile pictures can be uploaded.<br>- Shows historical membership details. |
| **US-04** | Petugas | Record land coordinates (lat/long) and attach supporting documents | The land parcel can be mapped and verified | - Latitude/Longitude validation.<br>- File uploads (PDF, images) up to 5MB.<br>- Auto-assigns unique Land Code. |
| **US-05** | Petugas | Input harvest yields for a specific plot and commodity | I can record seasonal productivity | - Auto-calculates: Yield / Luas = Productivity.<br>- Sets default status to `Submit` (pending approval). |
| **US-06** | Supervisor | Review submitted harvest logs and approve or reject them | The database only contains audited and correct information | - Reject triggers comment prompt.<br>- Status transitions correctly in the DB.<br>- Logs audit trail for the action. |
| **US-07** | Admin | Import Wilayah, Farmers, Lands, and Production statistics from Excel/CSV templates | I can seed the system without manually typing every record | - Validation screen previews errors before database execution.<br>- Provides downloadable spreadsheet templates. |
| **US-08** | User | Filter and download reports as Excel, CSV, PDF, and JSON | I can share data with non-system users | - PDF layout uses professional styling.<br>- Excel exports preserve tabular formats and columns. |
| **US-09** | Admin | Trigger manual backups and restore DB snapshots | The database is protected from hardware failures | - Backup generates ZIP file with SQL script.<br>- Restore file input parses and rebuilds tables. |
