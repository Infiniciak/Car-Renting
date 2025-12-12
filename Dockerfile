# ----------------------------------------------------------------------
# Etap 1: Budowanie i instalacja zależności (Builder)
# Używamy oficjalnego obrazu Composer'a, aby zainstalować zależności.
# ----------------------------------------------------------------------
FROM composer:2.7 as composer_deps

WORKDIR /app

# Kopiowanie plików Composer'a
COPY composer.json composer.lock ./

# Instalacja zależności
# Używamy --ignore-platform-reqs, aby ignorować lokalne wymagania PHP/extensions,
# gdyż będą one spełnione w obrazie docelowym (stage 2).
# Używamy również -o/--optimize-autoloader dla optymalizacji klas.
RUN composer install --no-interaction --optimize-autoloader --prefer-dist --ignore-platform-reqs

# ----------------------------------------------------------------------
# Etap 2: Finalny obraz PHP-FPM (Runtime)
# Ostateczny, lekki obraz, który będzie używany w kontenerze.
# ----------------------------------------------------------------------
FROM php:8.2-fpm

# Instalacja zależności systemowych i rozszerzeń PHP
# W jednym bloku dla optymalizacji warstw obrazu.
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpq-dev \
    # Usuwamy listę pakietów, aby zmniejszyć rozmiar obrazu
    && rm -rf /var/lib/apt/lists/* \
    # Instalacja rozszerzeń
    && docker-php-ext-install pdo pdo_pgsql

# Konfiguracja użytkownika www-data (dobra praktyka dla FPM/Laravel)
RUN usermod -u 1000 www-data

# Ustawienie katalogu roboczego
WORKDIR /var/www/html

# Kopiowanie zainstalowanych zależności z etapu Builder
COPY --from=composer_deps /app/vendor /var/www/html/vendor

# Skopiowanie reszty aplikacji
COPY . .

# Naprawa uprawnień dla storage i bootstrap/cache (ważne dla Laravela)
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# Uruchomienie jako użytkownik www-data
USER www-data

# CMD pozostawiamy PHP-FPM
CMD ["php-fpm"]