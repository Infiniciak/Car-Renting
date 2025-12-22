<?php
use App\Http\Controllers\Auth\ApiAuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Admin\UserManagementController;

// PUBLICZNE
Route::post('/login', [ApiAuthController::class, 'login']);
Route::post('/register', [ApiAuthController::class, 'register']);
Route::post('/forgot-password', [ApiAuthController::class, 'forgotPassword']);

// CHRONIONE TOKENEM
Route::middleware('auth:sanctum')->group(function () {
    
    // Panel wspólny (Zarządzanie swoimi danymi)
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/logout', [ApiAuthController::class, 'logout']);

 
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [UserManagementController::class, 'index']); // Lista wszystkich
        Route::post('/employees', [UserManagementController::class, 'storeEmployee']); // Zatrudnianie
        Route::delete('/users/{user}', [UserManagementController::class, 'destroy']);
        
    });

    // PANEL PRACOWNIKA
    Route::middleware('role:employee')->prefix('employee')->group(function () {
        
    });
});