# Deployment Diagram
## Physical Infrastructure & Network Architecture

```mermaid
graph TD
    subgraph ClientNodes [Client Tier]
        BrowserMobile [Mobile Web Browser - Field Officer]
        BrowserDesktop [Desktop Web Browser - Admin/Supervisor]
    end

    subgraph Internet [Public Network]
        OSM [OpenStreetMap Tile API Server]
    end

    subgraph AppServer [Application Server Tier - Nginx / Apache]
        ViteBuild [Static Web Assets - React SPA / Tailwind]
        LaravelAPI [Laravel 12 API - PHP 8.2 FPM]
        QueueWorker [Laravel Queue / Scheduler Worker]
    end

    subgraph DatabaseTier [Database & Storage Tier]
        MySQLNode [MySQL 8.0 Database Engine]
        FileStorage [Local SSD Storage - uploads/ docs/]
    end

    %% Network protocols
    BrowserMobile -->|HTTPS / Port 443| ViteBuild
    BrowserDesktop -->|HTTPS / Port 443| ViteBuild
    BrowserMobile -->|JSON REST API / HTTPS| LaravelAPI
    BrowserDesktop -->|JSON REST API / HTTPS| LaravelAPI
    
    BrowserMobile -->|Load Tile Maps / HTTPS| OSM
    BrowserDesktop -->|Load Tile Maps / HTTPS| OSM

    LaravelAPI -->|TCP / Port 3306| MySQLNode
    LaravelAPI -->|File System Write/Read| FileStorage
    QueueWorker -->|Read Queue / Jobs| MySQLNode
    QueueWorker -->|Process Backup/Export| FileStorage
```
