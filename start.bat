@echo off
echo ===========================================
echo   CAR RENTING SYSTEM - START SCRIPT
echo ===========================================

:: ==============================
:: TWORZENIE .env JESLI NIE ISTNIEJE
:: ==============================
if not exist .env (
    echo Tworze plik .env...
    copy .env.example .env
)

:: ==============================
:: USTAWIENIA BAZY POSTGRESQL (Dla kontenerow)
:: ==============================
echo Ustawiam dane bazy PostgreSQL w .env...
powershell -Command "(Get-Content .env) -replace 'DB_HOST=.*', 'DB_HOST=db' -replace 'DB_DATABASE=.*', 'DB_DATABASE=car_rent' -replace 'DB_USERNAME=.*', 'DB_USERNAME=caruser' -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=carpass' | Set-Content .env"

:: ==============================
:: URUCHOMIENIE DOCKERA
:: ==============================
echo Buduje i uruchamiam kontenery...
docker compose up -d --build

:: ==============================
:: CZEKAJ NA BAZE DANYCH
:: ==============================
echo Czekam na baze danych...
:wait_db
docker compose exec db pg_isready -U caruser >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 5 >nul
    goto wait_db
)

:: ==============================
:: KLUCZ LARAVEL
:: ==============================
echo Generuje APP_KEY...
docker compose exec app php artisan key:generate

:: ==============================
:: MIGRACJE + SEED
:: ==============================
echo Wykonuje migracje i seed...
docker compose exec app php artisan migrate --seed

:: ==============================
:: URUCHOMIENIE LARAVEL SERVE (Jako osobny proces)
:: Uzywamy host=0.0.0.0, aby nasluchiwac w kontenerze
:: ==============================
echo Start aplikacji Laravel...
start "" cmd /c "docker compose exec app php artisan serve --host=0.0.0.0 --port=8000"

echo ===========================================
echo   APLIKACJA URUCHOMIONA!
echo   -----------------------------------------
echo   Backend: http://localhost:8000
echo   Adminer (Szybki podglad): http://localhost:8080
echo   pgAdmin4 (Zaawansowana administracja): http://localhost:5050
echo ===========================================

pause