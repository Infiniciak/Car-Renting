<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. ADMIN
        User::create([
            'name' => 'Admin Piotr',
            'email' => 'admin@test.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::ADMIN,
            'balance' => 0,
        ]);

        // 2. PRACOWNIK
        User::create([
            'name' => 'Pracownik Marek',
            'email' => 'worker@test.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::EMPLOYEE,
            'balance' => 0,
        ]);

        // 3. ZWYKŁY UŻYTKOWNIK
        User::create([
            'name' => 'Jan Kowalski',
            'email' => 'user@test.com',
            'password' => Hash::make('password123'),
            'role' => UserRole::USER,
            'balance' => 500.00, // Twoje zadanie: pre-paid
        ]);
    }
}