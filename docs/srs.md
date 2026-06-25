# Software Requirements Specification (SRS)
## Project: SIMDATAN (Sistem Informasi Manajemen Data Pertanian)

### 1. Introduction
#### 1.1 Purpose
This document specifies the software requirements for SIMDATAN. It describes the complete functional scope, user interfaces, security protocols, API architectures, and performance standards of the application.

#### 1.2 Document Conventions
- **MUST / SHALL**: Mandatory specifications.
- **SHOULD / RECOMMENDED**: Optional but strongly advised features.
- All technical terms and Indonesian agricultural terminology are defined in the Data Dictionary.

#### 1.3 Intended Audience
This specification is intended for software developers, database engineers, testers, and project supervisors at the Dinas Pertanian.

---

### 2. Overall Description
#### 2.1 Product Perspective
SIMDATAN is an independent web application containing a Laravel 12 API backend and a React.js client. It integrates Leaflet.js with OpenStreetMap for mapping. Data persistence is managed with a MySQL 8 engine.

#### 2.2 System Functions (Core Modules)
1. **Authentication**: JWT, multi-role security (Admin, Petugas Lapangan, Supervisor).
2. **User Management**: RBAC, user activation, logs, pagination.
3. **Regional Hierarchy**: Administrative divisions down to Desa level.
4. **Petani & Kelompok Tani Profile**: Farmer registers, structural organization, details of groups.
5. **Crop & Land Records**: Geographic land parcel polygons or markers, land ownership status, crops grown.
6. **Yield & Productivity Tracking**: Real-time logging of planting schedules, harvest records, and auto-productivity indices ($Hasil / Luas$).
7. **GIS Map View**: Filterable agricultural plots, markers, and heatmaps.
8. **Field Activities**: Logging extension activities, advisory audits, and uploads.
9. **Document Versioning**: Secured PDF/DOCX/XLSX storage.
10. **Multi-tier Approval**: Workflows for verifying harvest logs.
11. **Import & Export Engine**: CSV, Excel, PDF, JSON formats.
12. **Audit Logging & Backups**: Automated database logs and backups.

#### 2.3 Operating Environment
- **Server**: PHP 8.2+, Composer 2.0+, Node.js 18+, MySQL 8.0+.
- **Client**: Modern web browsers (Chrome, Edge, Safari, Firefox). Responsive down to 360px viewport.

---

### 3. System Features
#### 3.1 Authentication & Role-Based Access Control
- **Req-1.1**: User logins must use JWT tokens.
- **Req-1.2**: Tokens must expire after 60 minutes and support refreshment.
- **Req-1.3**: Admin accounts must have absolute CRUD permissions, whereas Petugas Lapangan accounts are restricted to editing their own field inputs.

#### 3.2 Automated Productivity Calculation
- **Req-2.1**: The system must automatically execute calculations for crop yields upon harvest submission.
- **Formula**: $\text{Productivity (Ton/Ha)} = \frac{\text{Hasil Panen (Ton)}}{\text{Luas Lahan (Ha)}}$
- **Req-2.2**: The productivity index must be aggregate-queryable per region, commodity, and kelompok tani.

#### 3.3 Three-Tier Approval Workflow
- **Req-3.1**: Submitting field harvests sets the record status to `Submit`.
- **Req-3.2**: A Supervisor reviews and updates the record status to `Review`.
- **Req-3.3**: An Administrator approves (status becomes `Approve`) or rejects (status becomes `Reject` with remarks).

---

### 4. External Interface Requirements
#### 4.1 User Interfaces
- Modern, high-aesthetic dark and light modes.
- Accessible tables with sortable, filterable headers.
- Interactive map drawers built via Leaflet.

#### 4.2 API Interfaces
- JSON REST API.
- Prefix: `/api/v1/`.
- Standard HTTP status returns: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `422 Unprocessable Entity`, `500 Server Error`.
