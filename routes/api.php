<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\ApiAuthController;
use App\Http\Controllers\Api\PublicRentalPointController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\RentalPointController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- TRASY PUBLICZNE ---
Route::post('/login', [ApiAuthController::class, 'login']);
Route::post('/register', [ApiAuthController::class, 'register']);
Route::post('/forgot-password', [ApiAuthController::class, 'forgotPassword']);

Route::get('/rental-points', [PublicRentalPointController::class, 'index']);
Route::get('/rental-points/{id}', [PublicRentalPointController::class, 'show']);

// --- TRASY CHRONIONE (Wymagają zalogowania) ---
Route::middleware('auth:sanctum')->group(function () {

    // Pobieranie danych zalogowanego użytkownika (do Profilu w React)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Profil użytkownika (przez dedykowany kontroler)
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // Wylogowanie
    Route::post('/logout', [ApiAuthController::class, 'logout']);

    // --- TYLKO DLA ADMINA ---
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [UserManagementController::class, 'index']); // Lista wszystkich
        Route::post('/employees', [UserManagementController::class, 'storeEmployee']); // Zatrudnianie
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy']);

        Route::get('/rental-points', [RentalPointController::class, 'index']);
        Route::post('/rental-points', [RentalPointController::class, 'store']);
        Route::put('/rental-points/{rentalPoint}', [RentalPointController::class, 'update']);
        Route::delete('/rental-points/{rentalPoint}', [RentalPointController::class, 'destroy']);
    });

    // --- TYLKO DLA PRACOWNIKA ---
    Route::middleware('role:employee')->prefix('employee')->group(function () {
        // Tu dodasz trasy dla Nadii i Emilii (np. flota, rezerwacje)
    });
});
