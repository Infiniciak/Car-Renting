<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\ApiAuthController;
use App\Http\Controllers\Api\PublicRentalPointController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\RentalPointController;
use App\Http\Controllers\Api\EmployeeCarController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- TRASY PUBLICZNE ---
Route::post('/login', [ApiAuthController::class, 'login']);
Route::post('/register', [ApiAuthController::class, 'register']);
Route::post('/forgot-password', [ApiAuthController::class, 'forgotPassword']);
Route::post('/reset-password', [ApiAuthController::class, 'resetPassword']);

Route::get('/rental-points', [PublicRentalPointController::class, 'index']);
Route::get('/rental-points/{id}', [PublicRentalPointController::class, 'show']);

// --- TRASY CHRONIONE (Wymagają zalogowania) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/top-up', [ProfileController::class, 'topUp']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/logout', [ApiAuthController::class, 'logout']);

    // --- TYLKO DLA ADMINA ---
    Route::middleware('role:admin')->prefix('admin')->group(function () {

        // ZARZĄDZANIE UŻYTKOWNIKAMI (CRUD)
        Route::get('/users', [UserManagementController::class, 'index']);
        Route::post('/users', [UserManagementController::class, 'store']);     // DODANE: To naprawia błąd POST
        Route::put('/users/{user}', [UserManagementController::class, 'update']);
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy']);

        // PUNKTY WYPOŻYCZEŃ (CRUD)
        Route::get('/rental-points', [RentalPointController::class, 'index']);
        Route::post('/rental-points', [RentalPointController::class, 'store']);
        Route::put('/rental-points/{rentalPoint}', [RentalPointController::class, 'update']);
        Route::delete('/rental-points/{rentalPoint}', [RentalPointController::class, 'destroy']);
    });

    // --- TYLKO DLA PRACOWNIKA ---
    Route::middleware('role:employee')->prefix('employee')->group(function () {
        // ZARZĄDZANIE AUTAMI W PUNKCIE PRACOWNIKA
    Route::get('/cars', [EmployeeCarController::class, 'index']);
    Route::post('/cars', [EmployeeCarController::class, 'store']);
    Route::delete('/cars/{id}', [EmployeeCarController::class, 'destroy']);

    Route::patch('/cars/{id}/status', [EmployeeCarController::class, 'changeStatus']);
    Route::patch('/cars/{id}/promotion', [EmployeeCarController::class, 'setPromotion']);
    });
});
