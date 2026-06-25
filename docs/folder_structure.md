# Directory Folder Structure
## SIMDATAN Monorepo Directory Mapping

This document illustrates the final system folder structure for both the Laravel 12 Backend API and React.js Frontend client.

---

### 1. Root Workspace Structure
```
d:/SIMDATAN/
├── backend/                  # Laravel 12 Backend Project
├── frontend/                 # React Vite Frontend Project
└── docs/                     # System Design & Manuals Documentation
    ├── diagrams/             # Mermaid Diagrams (Use Case, ERD, Flowcharts)
    ├── srs.md                # Software Requirements Specification
    ├── brd.md                # Business Requirements Document
    ├── prd.md                # Product Requirements Document
    └── ...
```

---

### 2. Backend Directory Layout
```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/V1/      # API Controllers with Versioning
│   │   └── Middleware/       # JWT Auth and Security Middlewares
│   └── Models/               # Eloquent Database Models
├── database/
│   ├── migrations/           # Database Migrations DDL files
│   └── seeders/              # System Seeders (Dummy Data generators)
├── config/                   # Configuration Files (JWT, Database, App)
└── routes/
    └── api.php               # API Route declarations
```

---

### 3. Frontend Directory Layout
```
frontend/
├── src/
│   ├── assets/               # Branding Logos and Static Images
│   ├── components/           # Shared UI Component Library (Shadcn/Custom)
│   │   ├── ui/               # Lower-level primitives (Buttons, Inputs, Dialogs)
│   │   └── dashboard/        # Specialty widgets (KPI cards, charts, maps)
│   ├── context/              # Authentication & Global Context Managers
│   ├── hooks/                # Custom React hooks (React Query integrations)
│   ├── layouts/              # Core App Layouts (AuthLayout, DashboardLayout)
│   ├── pages/                # Functional Views (Dashboard, Petani, Lahan, GIS)
│   ├── services/             # Axios API client integrations
│   ├── App.tsx               # Main Route Router config
│   ├── main.tsx              # Application Bootstrap entrypoint
│   └── index.css             # Tailwind Directives and Global HSL variables
├── tailwind.config.js        # Styling configuration
└── package.json              # Client Dependencies
```
