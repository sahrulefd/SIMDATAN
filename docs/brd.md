# Business Requirements Document (BRD)
## Project: SIMDATAN (Sistem Informasi Manajemen Data Pertanian)

### 1. Executive Summary
SIMDATAN is an enterprise agricultural data management platform developed for the Department of Agriculture (Dinas Pertanian). The platform centralizes, monitors, and analyzes agricultural data across regions, farmer groups (Kelompok Tani), individual farmers, crop lands, commodity prices, and seasonal harvest yields. The core purpose is to enable data-driven decision-making, optimize land use, track real-time crop growth phases, and streamline official field reporting workflows.

### 2. Business Objectives
- **Centralized Data Repository**: Eliminate siloed agricultural databases by uniting region, farmer, land, and crop records under one system.
- **Accurate Productivity Monitoring**: Automate the calculation of agricultural productivity (Yield/Area) per land parcel, region, farmer group, and commodity.
- **Streamlined Workflow Approvals**: Implement a digital chain of custody (Petugas Lapangan → Supervisor → Admin) to ensure high data integrity for harvest figures.
- **GIS-Enabled Resource Allocation**: Map crop cultivation areas and yield statistics to optimize distribution of seeds, fertilizers, and subsidies.
- **Improved Management Reporting**: Provide dynamic analytical dashboards and instant multi-format exports (PDF, Excel, CSV) for planning and budgeting.

### 3. Stakeholders & User Roles
- **Dinas Pertanian Administrator (Admin)**: Full system access including CRUD on all records, system configurations, user administration, backup/restore, and imports.
- **Field Officer (Petugas Lapangan)**: Enters real-time field data, documents activities, submits harvest reports, and tracks crop schedules.
- **Supervisor**: Reviews field data, approves or rejects data submissions, and views performance reports.
- **Government Deciders / Department Head**: Consumes analytics dashboards to make policy decisions.

### 4. Project Scope
#### In-Scope:
- Regional hierarchy management (Kecamatan and Desa).
- Farmer and Kelompok Tani membership profiles.
- Land mapping and geographic visualization (GIS markers and heatmaps).
- Commodity directories with base target pricing.
- Complete crop season lifecycle management (Belum Tanam, Sedang Tanam, Akan Panen, Sudah Panen, Gagal Panen).
- Automated productivity computation logic.
- Document repository with support for versioning.
- Field visitation and counseling reports (Kegiatan Lapangan).
- System-wide search and notification center.
- Database backup/restore and import/export utilities.

#### Out-of-Scope:
- Financial ledger bookkeeping or payroll for farmers.
- Automated weather forecast sensors (IoT integration can be added in future phases).

### 5. Functional Requirements Overview
- **FR-AUTH**: JWT-based secure authentication, roles, session management, and log auditing.
- **FR-GIS**: Leaflet integration mapping farm layouts, clusters of Kelompok Tani, and productivity heatmaps.
- **FR-REP**: Exportable reports (PDF, Excel, CSV, JSON) with complex multi-criteria filters.
- **FR-APP**: Three-tiered approval pipeline for data entry validation.

### 6. Non-Functional Requirements
- **Security**: Password hashing (BCrypt), RBAC, SQL Injection & XSS prevention, JWT token rotation, rate limiting.
- **Performance**: Pagination on all index queries, query optimization for analytics dashboards, lazy loading frontend assets.
- **Usability**: Fully responsive, accessible UI, dark/light theme, and support for mobile views for field officers.

### 7. Key Success Metrics
- 100% data centralization for Dinas Pertanian.
- Under 2-second dashboard load time for analytics compilation.
- Elimination of paper-based harvest reporting.
- Reduction of input errors via multi-tier validation.
