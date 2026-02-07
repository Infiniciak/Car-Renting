@echo off
echo ===========================================
echo      CAR RENTING SYSTEM - FULL START SCRIPT
echo ===========================================

:: 1. TWORZENIE .env JESLI NIE ISTNIEJE
if not exist .env (
    echo [*] Tworze plik .env...
    copy .env.example .env
)

:: 2. USTAWIENIA BAZY DANYCH W .env
echo [*] Konfiguracja srodowiska...
powershell -Command "(Get-Content .env) -replace 'DB_HOST=.*', 'DB_HOST=db' -replace 'DB_DATABASE=.*', 'DB_DATABASE=car_rent' -replace 'DB_USERNAME=.*', 'DB_USERNAME=caruser' -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=carpass' | Set-Content .env"

:: 3. URUCHOMIENIE DOCKERA
echo [*] Buduje obraz (to moze potrwac przy pierwszym raz)...
docker compose up -d --build

:: 4. INSTALACJA ZALEZNOSCI (Wewnatrz Dockera)
echo [*] Instaluje paczki NPM...
docker compose exec app npm install

echo [*] Instaluje paczki Composer...
docker compose exec app composer install

:: 5. CZEKAJ NA BAZE DANYCH
echo [*] Czekam na baze danych...
:wait_db
docker compose exec db pg_isready -U caruser >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 5 >nul
    goto wait_db
)

:: 6. KONFIGURACJA LARAVEL
echo [*] Generuje klucz i migruje baze...
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed

echo [*] Tworze link symboliczny do storage...
docker compose exec app php artisan storage:link

:: 7. BUDOWANIE FRONTENDU
echo [*] Buduje manifest Vite...
docker compose exec app npm run build

docker-compose exec app npm install recharts

:: 8. START SERWEROW
echo [*] Startuje serwery w nowych oknach...

:: Vite (Frontend) - musi słuchać na 0.0.0.0 wewnątrz Dockera
start "VITE - Frontend" cmd /k "docker compose exec app npm run dev -- --host 0.0.0.0"

:: Laravel (Backend)
start "LARAVEL - Backend" cmd /k "docker compose exec app php artisan serve --host=0.0.0.0 --port=8001"

echo ===========================================
echo      APLIKACJA GOTOWA!
echo      Link: http://localhost:8000
echo ===========================================
pause
