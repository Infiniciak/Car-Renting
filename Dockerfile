FROM php:8.2-cli

# Instalacja zależności systemowych, sterowników PostgreSQL, gita i unzipa (potrzebne dla Composera)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql

# Instalacja Node.js (wersja 20) i NPM
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Instalacja Composera
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Pozwalamy na uruchomienie kontenera w tle
CMD ["tail", "-f", "/dev/null"]