<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RentalPointSeeder::class,
            CarSeeder::class,
        ]);
        // 1. TWORZENIE UŻYTKOWNIKÓW (HASŁO: password123)

        // Administrator
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@test.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'rental_point_id' => null, // Admin zazwyczaj nie jest przypisany do punktu
        ]);

        // Pracownik
        // Zostawiamy pole rental_point_id, żebyś widział, że relacja istnieje.
        // Jest ustawione na null, bo usunęliśmy tworzenie punktów w seederze.
        // Jak stworzysz punkt w panelu, będziesz mógł edytować usera i go przypisać.
        User::create([
            'name' => 'Jan Pracownik',
            'email' => 'pracownik@test.com',
            'password' => Hash::make('password123'),
            'role' => 'employee',
            'rental_point_id' => null
        ]);

        // Klient
        User::create([
            'name' => 'Marek Klient',
            'email' => 'user@test.com',
            'password' => Hash::make('password123'),
            'role' => 'user', // lub 'user' (zależnie od Twojego Enuma)
            'rental_point_id' => null,
        ]);
    }
}
