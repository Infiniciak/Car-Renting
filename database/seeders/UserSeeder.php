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
            'role' => 'user',
            'balance' => 5000.00,
        ]);

        // USER z 4 wypożyczeniami (następne = 5 = 10% rabatu)
        User::create([
            'name' => 'Anna Nowak',
            'email' => 'anna@test.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'balance' => 3000.00,
        ]);

        // USER z 9 wypożyczeniami (następne = 10 = 15% rabatu)
        User::create([
            'name' => 'Piotr Wiśniewski',
            'email' => 'piotr@test.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'balance' => 4500.00,
        ]);

        // USER z 14 wypożyczeniami (następne = 15 = 20% rabatu)
        User::create([
            'name' => 'Katarzyna Lewandowska',
            'email' => 'kasia@test.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'balance' => 6000.00,
        ]);

        User::create([
            'name' => 'Michał Dąbrowski',
            'email' => 'michal@test.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'balance' => 3500.00,
        ]);

        User::create([
            'name' => 'Magdalena Kozłowska',
            'email' => 'magda@test.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'balance' => 4000.00,
        ]);
    }
}
