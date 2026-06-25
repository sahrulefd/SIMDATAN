# Component Diagram
## Software Architecture Components

```mermaid
graph TD
    subgraph SPA [React Client Application]
        UI [UI View Layer - React Components]
        Router [React Router Dom]
        Query [React Query - Cache/Fetch]
        Form [React Hook Form - Form Validation]
        Charts [Chart.js Wrapper]
        Leaflet [Leaflet Map Wrapper]
        Client [API Axios Client]
    end

    subgraph API [Laravel 12 Backend REST API]
        RouterAPI [Laravel API Router]
        JWTMiddle [JWT Auth Middleware]
        RateLimit [Rate Limiting Middleware]
        
        subgraph Controllers [API Controllers]
            AuthController[Auth Controller]
            FarmerController[Petani Controller]
            LandController[Lahan Controller]
            HarvestController[Produksi Controller]
            ActivityController[Kegiatan Controller]
            DocController[Dokumen Controller]
            ReportController[Laporan & Import/Export]
            AdminController[User/Backup Controller]
        end

        subgraph Services [System Core Services]
            ExcelService[Import/Export Engine]
            BackupService[DB Backup & Restore Service]
            NotifyService[Notification Dispatcher]
            AuthService[JWT Authentication Guard]
        end

        Eloquent [Eloquent ORM - Models]
    end

    subgraph Database [Storage Layer]
        MySQL [(MySQL 8.0 Database)]
        Storage [(Laravel Storage - PDF/Images/DOCX)]
    end

    %% Client relations
    UI --> Router
    UI --> Query
    UI --> Form
    UI --> Charts
    UI --> Leaflet
    Query --> Client
    Client --> RouterAPI

    %% Backend relations
    RouterAPI --> RateLimit
    RateLimit --> JWTMiddle
    JWTMiddle --> Controllers
    
    Controllers --> Services
    Controllers --> Eloquent
    
    Eloquent --> MySQL
    Services --> MySQL
    Services --> Storage
```
