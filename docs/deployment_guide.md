# Deployment Guide
## Production Environment Configuration

This guide details instructions for deploying SIMDATAN to a production Linux server (Ubuntu 22.04 LTS / 24.04 LTS).

---

### 1. Prerequisites (Server Packages)
Install core dependencies:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx mysql-server php8.2-fpm php8.2-mysql php8.2-cli \
     php8.2-mbstring php8.2-xml php8.2-bcmath php8.2-curl php8.2-zip php8.2-gd \
     unzip curl git nodejs npm
```

---

### 2. Backend Installation (Laravel 12 API)
1. Clone the project and navigate to the backend folder:
   ```bash
   cd /var/www/simdatan/backend
   composer install --no-dev --optimize-autoloader
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env
   nano .env
   ```
   *Modify database and URL configurations:*
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://simdatan.go.id

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=simdatan_db
   DB_USERNAME=simdatan_user
   DB_PASSWORD=SecurePassword123
   ```
3. Generate keys and run database setup:
   ```bash
   php artisan key:generate
   php artisan jwt:secret
   php artisan migrate --force
   php artisan db:seed --force
   ```
4. Set permissions:
   ```bash
   sudo chown -R www-data:www-data /var/www/simdatan/backend/storage
   sudo chown -R www-data:www-data /var/www/simdatan/backend/bootstrap/cache
   ```

---

### 3. Frontend Installation (React Vite SPA)
1. Navigate to the frontend folder:
   ```bash
   cd /var/www/simdatan/frontend
   npm install
   ```
2. Create environment variables file:
   ```bash
   nano .env.production
   ```
   Add base API endpoint:
   ```env
   VITE_API_URL=https://simdatan.go.id/api/v1
   ```
3. Build static assets:
   ```bash
   npm run build
   ```
   *This compiles files into the `dist/` directory, ready to be served by Nginx.*

---

### 4. Nginx Configuration
Create a virtual host configuration:
```nginx
server {
    listen 80;
    server_name simdatan.go.id;
    root /var/www/simdatan/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        alias /var/www/simdatan/backend/public/;
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $request_filename;
    }
}
```
*Enable the site and restart Nginx:*
```bash
sudo ln -s /etc/nginx/sites-available/simdatan /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

---

### 5. SSL & Scheduler Setup
- **SSL Setup (Let's Encrypt)**:
  ```bash
  sudo apt install -y certbot python3-certbot-nginx
  sudo certbot --nginx -d simdatan.go.id
  ```
- **Laravel Cron Task Scheduler**:
  Open system cron configurations:
  ```bash
  crontab -e
  ```
  Add scheduling line to run backups and notifications every minute:
  ```cron
  * * * * * cd /var/www/simdatan/backend && php artisan schedule:run >> /dev/null 2>&1
  ```
