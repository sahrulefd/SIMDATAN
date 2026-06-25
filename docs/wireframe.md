# Wireframe Specification
## SIMDATAN Desktop & Mobile Layout Outlines

This document details the interface blueprints for critical system views.

---

### 1. Dashboard Layout (Desktop View)
```
+---------------------------------------------------------------------------------------+
|  [SIMDATAN LOGO]  |  Global Search: Farmer/Land...    | (Notification Icon 3) | Admin |
+---------------------------------------------------------------------------------------+
| Sidebar Navigation|  Dashboard Analitik                                               |
| - Dashboard (Act) |  +-------------------------------------------------------------+  |
| - GIS Map         |  | KPI cards:                                                  |  |
| - Data Petani     |  | Total Farmers: 50 | Total Lahan: 100 | Total Yield: 3450 Ton|  |
| - Kelompok Tani   |  +-------------------------------------------------------------+  |
| - Wilayah         |                                                                   |
| - Lahan           |  +---------------------------+     +----------------------------+ |
| - Komoditas       |  | Crop Production (Bar Chart)|     | Yield per Region (Pie Chart)| |
| - Approval        |  |                           |     |                            | |
| - Log & Backup    |  +---------------------------+     +----------------------------+ |
| - Settings        |                                                                   |
|                   |  +-------------------------------------------------------------+  |
| [Toggle Dark Mode]|  | Top Productive Kelompok Tani Table                          |  |
+-------------------+-------------------------------------------------------------------+
```

---

### 2. GIS Mapping Layout (Desktop View)
```
+---------------------------------------------------------------------------------------+
|  [SIMDATAN LOGO]  |  Search...                        | (Notification Icon)   | Admin |
+---------------------------------------------------------------------------------------+
| Sidebar Navigation|  GIS Map - Sebaran Lahan & Kelompok Tani                          |
|                   |  +-----------------------------------+-------------------------+  |
|                   |  | [Map Filters]                     | Map Workspace           |  |
|                   |  | - Kecamatan: [All v]              | +---------------------+ |  |
|                   |  | - Komoditas: [Padi v]             | | Leaflet Maps Canvas | |  |
|                   |  | - View mode: (x) Marker ( ) Heatmap| |                     | |  |
|                   |  |                                   | |  [Marker 1]         | |  |
|                   |  | [Search Location]                 | |  (Land detail pop)  | |  |
|                   |  | - Input: [ Bogor ]                | |  - Code: LHN-001    | |  |
|                   |  |                                   | |  - Owner: Sutisna   | |  |
|                   |  | [Legend]                          | |  - Crop: Padi       | |  |
|                   |  | - Green: Active                   | |                     | |  |
|                   |  | - Yellow: Harvest Pending         | +---------------------+ |  |
+-------------------+-------------------------------------------------------------------+
```

---

### 3. Data Entry Form (Responsive / Mobile View)
```
+-----------------------+
| SIMDATAN       (=)    |  <-- Mobile Navigation Hamburger Menu
+-----------------------+
| Input Produksi Baru   |
|                       |
| Lahan                 |
| [ LHN-098 (Padi)   v] |
|                       |
| Komoditas             |
| [ Padi Sawah       v] |
|                       |
| Musim Tanam           |
| [ Musim Hujan 1    v] |
|                       |
| Tanggal Tanam         |
| [ 2026-03-10       o] |
|                       |
| Hasil Panen (Estimasi)|
| [ 5.50              ] Ton
|                       |
| Foto / Attachment     |
| [+ Upload File      ] |
|                       |
|  [SUBMIT WORKFLOW]    |  <-- Submits to Supervisor workflow queue.
+-----------------------+
```
