# Admin Manual
## Target Audience: System Administrators & Supervisors

This document guides platform administrators through high-level configurations and system audits.

---

### 1. User Management & Access Controls
1. Go to **User Management** in the sidebar.
2. Here you can search, filter, and edit user status.
3. To register a new official:
   - Click **+ Tambah User**.
   - Input Name, Email, and assign a Role: `Admin` (full system control), `Supervisor` (audits/reviews), or `Petugas` (data entries).
4. You can suspend access by toggling **Is Active** to Off.
5. Soft-deleted users can be restored from the "Recycle Bin" view.

---

### 2. Approval Workflows
1. Select **Approval Workspace** in the sidebar.
2. Review records submitted by Petugas.
3. Click **Review** to read comments and inspect coordinates.
4. Click **Approve** to accept the entries (instantly updates dashboard statistics).
5. Click **Reject** to send the record back to the Petugas, providing notes explaining the decision.

---

### 3. Bulk Data Imports
1. Navigate to **Import Data** in the sidebar.
2. Select the target module (Wilayah, Petani, Lahan, or Produksi).
3. Download the blank Excel/CSV template provided.
4. Fill in the data, keeping formatting intact.
5. Drag and drop the completed file.
6. The system displays a validation table. If errors are found (e.g. wrong NIK format), they are highlighted in red.
7. Click **Import All** to commit valid rows to the database.

---

### 4. System Backup & Restore
- **Manual Backups**:
  1. Navigate to **System Settings** and select **Backup & Restore**.
  2. Click **Generate Backup**. This compiles a SQL DDL snapshot along with uploaded media, saving it as a ZIP file.
- **Restoring database**:
  1. Click **Upload Backup File**.
  2. Select your ZIP file.
  3. Confirm your action (WARNING: This replaces active database tables).
- **Scheduled Backups**: Backups run automatically daily at 00:00 via Laravel's Task Scheduler.

---

### 5. Reviewing Audit Logs
- Go to **Audit Logs** in the sidebar to review transactions.
- Filter logs by User, Modul (e.g., Lahan), or Action (Edit, Delete, Export).
- Review IP addresses and timestamps for security compliance.
