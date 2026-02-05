@echo off
echo ===========================================
echo      CAR RENTING SYSTEM - FULL START SCRIPT
echo ===========================================

:: 1. TWORZENIE .env JESLI NIE ISTNIEJE
if not exist .env (
    echo [*] Tworze plik .env...
    copy .env.example .env
)

:: 2. USTAWIENIA BAZY DANYCH I SWAGGERA W .env
echo [*] Konfiguracja srodowiska...
powershell -Command "(Get-Content .env) -replace 'DB_HOST=.*', 'DB_HOST=db' -replace 'DB_DATABASE=.*', 'DB_DATABASE=car_rent' -replace 'DB_USERNAME=.*', 'DB_USERNAME=caruser' -replace 'DB_PASSWORD=.*', 'DB_PASSWORD=carpass' | Set-Content .env"

:: Dodajemy ustawienie autogenerowania Swaggera do .env, jeśli go nie ma
findstr /C:"L5_SWAGGER_GENERATE_ALWAYS" .env >nul
if %errorlevel% neq 0 (
    echo L5_SWAGGER_GENERATE_ALWAYS=true >> .env
)

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

:: 7. BUDOWANIE FRONTENDU
echo [*] Buduje manifest Vite...
docker compose exec app npm run build

:: Instalacja recharts jeśli brakuje
docker compose exec app npm install recharts

:: 8. START SERWEROW
echo [*] Startuje serwery w nowych oknach...

:: Vite (Frontend) - musi słuchać na 0.0.0.0 wewnątrz Dockera
start "VITE - Frontend" cmd /k "docker compose exec app npm run dev -- --host 0.0.0.0"

:: Laravel (Backend)
start "LARAVEL - Backend" cmd /k "docker compose exec app php artisan serve --host=0.0.0.0 --port=8001"

:: 9. GENEROWANIE DOKUMENTACJI SWAGGER
echo [*] Generuje dokumentacje API (Swagger)...
docker compose exec -T app php artisan l5-swagger:generate

echo ===========================================
echo      APLIKACJA GOTOWA!
echo      Frontend: http://localhost:8000
echo      Swagger UI: http://localhost:8000/api/documentation
echo ===========================================
pause