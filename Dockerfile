FROM php:8.2-fpm

# Instalacja zależności systemowych i rozszerzeń PHP
RUN apt-get update && apt-get install -y \
    git curl zip unzip libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql

# Instalacja Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-interaction --prefer-dist

CMD ["php-fpm"]
