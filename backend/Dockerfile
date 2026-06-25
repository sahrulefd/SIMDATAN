FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libsqlite3-dev \
    sqlite3

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN touch database/database.sqlite

EXPOSE 10000

# Run migrations and seed data on startup, then start Laravel server
CMD php artisan migrate --force --seed && php artisan serve --host=0.0.0.0 --port=$PORT
