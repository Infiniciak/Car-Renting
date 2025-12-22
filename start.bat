@echo off
echo ===========================================
echo    CAR RENTING SYSTEM - FULL START SCRIPT
echo ===========================================

:: 1. TWORZENIE .env JESLI NIE ISTNIEJE
if not exist .env (
    echo [*] Tworze plik .env...
    copy .env.example .env
)

:: 2. USTAWIENIA BAZY DANYCH W .env
echo [*] Konfiguracja srodowiska...
powershell -Command "(Get-Content .env) -replace 'DB_HOST=.*', 'DB_HOST=db' -replace 'DB_DATABASE=.*', 'DB_DATABASE=car_rent' -replace 'DB_USERNAME=.*', 'DB_USERNAME=caruser' -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=carpass' | Set-Content .env"

:: 3. INSTALACJA PACZEK JS (Na Windowsie)
:: To naprawi błędy u Nadii/Bartosza, którzy nie mają folderu node_modules
echo [*] Instaluje zaleznosci frontendu (NPM)...
call npm install

:: 4. URUCHOMIENIE DOCKERA
echo [*] Buduje i uruchamiam kontenery...
docker compose up -d --build

:: 5. INSTALACJA COMPOSERA (Wewnątrz Dockera)
echo [*] Instaluje zaleznosci backendu (Composer)...
docker compose exec app composer install

:: 6. CZEKAJ NA BAZE DANYCH
echo [*] Czekam na baze danych...
:wait_db
docker compose exec db pg_isready -U caruser >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 5 >nul
    goto wait_db
)

:: 7. KLUCZ I MIGRACJE
echo [*] Konfiguracja bazy danych...
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed

:: 8. FIX DLA MANIFESTU (Budowanie frontendu)
:: Budujemy pliki raz, aby Laravel "zobaczyl" manifest, 
:: a potem odpalamy tryb dev dla pracy na zywo.
echo [*] Rozwiazywanie problemu z manifestem...
call npm run build

:: 9. START APLIKACJI (Osobne okna)
echo [*] Startuje serwery...

:: Start Vite (Frontend)
start "VITE - Frontend" cmd /c "npm run dev"

:: Start Laravel (Backend)
start "LARAVEL - Backend" cmd /c "docker compose exec app php artisan serve --host=0.0.0.0 --port=8001"

echo ===========================================
echo    APLIKACJA GOTOWA DO PRACY!
echo    -----------------------------------------
echo    Link: http://localhost:8000
echo   Adminer (Szybki podglad): http://localhost:8080
echo   pgAdmin4 (Zaawansowana administracja): http://localhost:5050
echo ===========================================
pause