# Product Requirements Document (PRD)
## Project: SIMDATAN (Sistem Informasi Manajemen Data Pertanian)

### 1. Product Vision
To build a state-of-the-art agricultural administration panel that simplifies field data collection, visualizes land patterns, tracks harvests, and provides real-time analytics to dynamic regional policymakers.

### 2. User Personas
- **Persona A: Pak Bambang (Petugas Lapangan)**
  - **Needs**: Quick mobile access to register farmers, record land coords, upload crop photographs from the field, and log counseling activities.
  - **Pain Points**: Slow networks, complex forms, difficult map coordinate systems.
- **Persona B: Ibu Indah (Supervisor)**
  - **Needs**: A clean review dashboard where she can audit harvest entries, review document attachments, and check historical records.
  - **Pain Points**: Incomplete entries, lack of clarity on data changes, no verification logs.
- **Persona C: Pak Budi (Administrator & Analyst)**
  - **Needs**: Bulk upload options (Excel/CSV), user role configurations, full database backups, and summary exports for the Dinas Pertanian Head.
  - **Pain Points**: Human data entry errors, database slowdowns, complex Excel files.

### 3. Core Feature Details
- **Unified Global Search**: Search for Farmers by NIK, land by Land Code, or commodities by Commodity Name, from a single global navbar search input.
- **GIS Leaflet Map**: Clickable land markers on a map showing current crop species, soil status, owner's name, and historical production output. Display a heatmap based on harvest tonnage.
- **Document Management**: Central repository of certificates, soil test documents, and ownership papers, supporting previews directly on-screen.
- **Dynamic Charting**: Bar charts showing monthly/yearly yields, doughnut charts for commodity distributions, and trend analytics.

### 4. User Experience & Design Guidelines
- **Responsive Layout**: Designed for mobile browsers for field officers, and desktop/widescreen for admins.
- **Premium Aesthetics**: Harmonious dark and light themes, subtle gradients, and glassmorphic panels.
- **No Placeholders**: Always present real charts, real coordinates, and complete tables.

### 5. Metrics & KPIs
- Average time to record a harvest: < 60 seconds.
- Import validation success rate: > 99%.
- Real-time notification delay: < 5 seconds.
