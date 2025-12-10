@echo off
echo ===========================================
echo  CAR RENTING SYSTEM - START SCRIPT
echo ===========================================

:: ==============================
:: TWORZENIE .env jesli nie istnieje
:: ==============================
if not exist .env (
    echo Tworze plik .env...
    copy .env.example .env
)

:: ==============================
:: PODMIANA USTAWIEN BAZY
:: ==============================
echo Ustawiam dane bazy PostgreSQL...
powershell -Command "(Get-Content .env) -replace 'DB_HOST=.*', 'DB_HOST=db' -replace 'DB_DATABASE=.*', 'DB_DATABASE=car_rent' -replace 'DB_USERNAME=.*', 'DB_USERNAME=caruser' -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=carpass' | Set-Content .env"

:: ==============================
:: BUDOWANIE I START DOCKERA
:: ==============================
echo Uruchamiam kontenery Dockera...
docker compose up -d --build

echo Czekam na baze danych...
timeout /t 10 /nobreak >nul

:: ==============================
:: GENEROWANIE KLUCZA LARAVEL
:: ==============================
echo Generuje APP_KEY...
docker compose exec app php artisan key:generate

:: ==============================
:: MIGRACJE + SEED
:: ==============================
echo Wykonuje migracje i seed...
docker compose exec app php artisan migrate --seed

:: ==============================
:: START SERWERA LARAVEL
:: ==============================
echo Start aplikacji Laravel...
docker compose exec -d app php artisan serve --host=0.0.0.0 --port=8000

echo ===========================================
echo  APLIKACJA URUCHOMIONA!
echo  Backend: http://localhost:8000
echo  Adminer: http://localhost:8080
echo ===========================================

pause
