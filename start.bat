@echo off
echo ===========================================
echo      CAR RENTING SYSTEM - REPAIR START
echo ===========================================

:: 1. TWORZENIE .env
if not exist .env copy .env.example .env

:: 2. KONFIGURACJA (Bez zmian)
powershell -Command "(Get-Content .env) -replace 'DB_HOST=.', 'DB_HOST=db' -replace 'DB_DATABASE=.', 'DB_DATABASE=car_rent' -replace 'DB_USERNAME=.', 'DB_USERNAME=caruser' -replace 'DB_PASSWORD=.', 'DB_PASSWORD=carpass' | Set-Content .env"
findstr /C:"L5_SWAGGER_GENERATE_ALWAYS" .env >nul
if %errorlevel% neq 0 echo L5_SWAGGER_GENERATE_ALWAYS=true >> .env

:: 3. RESTART DOCKERA (Wymuszony czysty start)
echo [] Restartuje kontenery...
docker-compose down
docker-compose up -d --build

:: 4. INSTALACJA (Z flagami braku interakcji)
echo [] Instaluje paczki NPM...
docker-compose exec -T app npm install --no-audit

echo [] Instaluje paczki Composer (Moze to chwile potrwac)...
:: Dodano --no-interaction, żeby skrypt nie wisiał!
docker-compose exec -T app composer install --no-interaction --optimize-autoloader

:: 5. CZEKAJ NA BAZE
echo [] Czekam na baze danych...
:wait_db
docker-compose exec -T db pg_isready -U caruser >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 5 >nul
    goto wait_db
)

:: 6. LARAVEL SETUP
docker-compose exec -T app php artisan key:generate
docker-compose exec -T app php artisan migrate:fresh --seed

:: 7. FRONTEND
docker-compose exec -T app npm run build

:: 8. SWAGGER
echo [*] Generuje dokumentacje...
docker-compose exec -T app php artisan l5-swagger:generate

:: 9. START SERWEROW
start "VITE" cmd /k "docker-compose exec app npm run dev -- --host 0.0.0.0"
start "LARAVEL" cmd /k "docker-compose exec app php artisan serve --host=0.0.0.0 --port=8001"

echo ===========================================
echo GOTOWE! Jesli nadal stoi, nacisnij ENTER w tym oknie.
echo ===========================================
pause