FROM php:8.2-fpm

# Instalacja zależności systemowych i rozszerzeń PHP
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Instalacja Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Skopiuj tylko pliki konfiguracyjne najpierw (przyspiesza rebuild)
COPY composer.json composer.lock ./

# Instalacja zależności Composer
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts

# Skopiuj resztę aplikacji
COPY . .

# CMD pozostawiamy PHP-FPM, start.bat uruchomi php artisan serve
CMD ["php-fpm"]
