<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\ApiAuthController;
use App\Http\Controllers\Api\PublicRentalPointController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\RentalPointController;
use App\Http\Controllers\Auth\TwoFactorController;

// --- TRASY PUBLICZNE ---
Route::post('/login', [ApiAuthController::class, 'login']);
Route::post('/register', [ApiAuthController::class, 'register']);
Route::post('/forgot-password', [ApiAuthController::class, 'forgotPassword']);

Route::get('/rental-points', [PublicRentalPointController::class, 'index']);
Route::get('/rental-points/{id}', [PublicRentalPointController::class, 'show']);

Route::post('/reset-password', [ApiAuthController::class, 'resetPassword']);

// Weryfikacja kodu przy logowaniu (Użytkownik nie ma jeszcze tokena Bearer)
Route::post('/2fa/verify-login', [TwoFactorController::class, 'verifyLogin']);

Route::get('/rental-points', [PublicRentalPointController::class, 'index']);
Route::get('/rental-points/{id}', [PublicRentalPointController::class, 'show']);

// --- TRASY CHRONIONE (Wymagają zalogowania) ---
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/top-up', [ProfileController::class, 'topUp']);
    
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Zarządzanie 2FA z poziomu Profilu
    Route::get('/2fa/generate', [TwoFactorController::class, 'generate']); // Pobierz QR kod
    Route::post('/2fa/enable', [TwoFactorController::class, 'enable']);    // Włącz 2FA (potwierdź kodem)
    Route::post('/2fa/disable', [TwoFactorController::class, 'disable']);  // Wyłącz 2FA

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/logout', [ApiAuthController::class, 'logout']);

    // --- TYLKO DLA ADMINA ---
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [UserManagementController::class, 'index']);      
        Route::post('/users', [UserManagementController::class, 'store']);     
        Route::put('/users/{user}', [UserManagementController::class, 'update']); 
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy']); 
        
        Route::get('/rental-points', [RentalPointController::class, 'index']);
        Route::post('/rental-points', [RentalPointController::class, 'store']);
        Route::put('/rental-points/{rentalPoint}', [RentalPointController::class, 'update']);
        Route::delete('/rental-points/{rentalPoint}', [RentalPointController::class, 'destroy']);
    });
});