<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\RentalPoint;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    public function run(): void
    {
        // Pobieramy wszystkie dostępne ID punktów, aby przypisać auta
        $pointIds = RentalPoint::pluck('id')->toArray();

        $cars = [
            // ELEKTRYCZNE
            ['brand' => 'Tesla', 'model' => 'Model 3', 'year' => 2024, 'reg' => 'EL-TS324', 'type' => 'electric', 'fuel' => 'electric', 'price' => 350],
            ['brand' => 'Tesla', 'model' => 'Model Y', 'year' => 2023, 'reg' => 'WA-TY999', 'type' => 'SUV', 'fuel' => 'electric', 'price' => 420],
            ['brand' => 'Kia', 'model' => 'EV6', 'year' => 2024, 'reg' => 'KR-EV600', 'type' => 'hatchback', 'fuel' => 'electric', 'price' => 320],

            // PREMIUM / SEDAN
            ['brand' => 'BMW', 'model' => 'M3', 'year' => 2023, 'reg' => 'W0-BMW01', 'type' => 'sedan', 'fuel' => 'petrol', 'price' => 550],
            ['brand' => 'Mercedes', 'model' => 'C-Class', 'year' => 2022, 'reg' => 'DW-MC123', 'type' => 'sedan', 'fuel' => 'petrol', 'price' => 400],
            ['brand' => 'Audi', 'model' => 'A6', 'year' => 2023, 'reg' => 'PO-A666A', 'type' => 'sedan', 'fuel' => 'diesel', 'price' => 450],

            // SUV / CROSSOVER
            ['brand' => 'Volvo', 'model' => 'XC60', 'year' => 2024, 'reg' => 'GD-V6000', 'type' => 'SUV', 'fuel' => 'hybrid', 'price' => 380],
            ['brand' => 'Toyota', 'model' => 'RAV4', 'year' => 2023, 'reg' => 'BI-RAV44', 'type' => 'SUV', 'fuel' => 'hybrid', 'price' => 280],
            ['brand' => 'Hyundai', 'model' => 'Tucson', 'year' => 2022, 'reg' => 'ZS-HYU11', 'type' => 'SUV', 'fuel' => 'petrol', 'price' => 250],

            // EKONOMICZNE / MIEJSKIE
            ['brand' => 'Volkswagen', 'model' => 'Golf 8', 'year' => 2023, 'reg' => 'LU-GOLF8', 'type' => 'hatchback', 'fuel' => 'petrol', 'price' => 180],
            ['brand' => 'Toyota', 'model' => 'Yaris', 'year' => 2024, 'reg' => 'RZ-YAR24', 'type' => 'hatchback', 'fuel' => 'hybrid', 'price' => 150],
            ['brand' => 'Skoda', 'model' => 'Octavia', 'year' => 2023, 'reg' => 'PZ-SKO01', 'type' => 'sedan', 'fuel' => 'diesel', 'price' => 220],
            ['brand' => 'Dacia', 'model' => 'Sandero', 'year' => 2022, 'reg' => 'NO-DAC12', 'type' => 'hatchback', 'fuel' => 'petrol', 'price' => 120],

            // INNE
            ['brand' => 'Ford', 'model' => 'Mustang', 'year' => 2021, 'reg' => 'W1-FORD1', 'type' => 'coupe', 'fuel' => 'petrol', 'price' => 600],
            ['brand' => 'Porsche', 'model' => 'Taycan', 'year' => 2024, 'reg' => 'WA-PORS1', 'type' => 'electric', 'fuel' => 'electric', 'price' => 950],
        ];

        foreach ($cars as $carData) {
            Car::create([
                'brand' => $carData['brand'],
                'model' => $carData['model'],
                'year' => $carData['year'],
                'registration_number' => $carData['reg'],
                'type' => $carData['type'],
                'fuel_type' => $carData['fuel'],
                'transmission' => (rand(0, 1) ? 'automatic' : 'manual'),
                'seats' => ($carData['type'] === 'coupe' ? 4 : 5),
                'price_per_day' => $carData['price'],
                'insurance_per_day' => rand(30, 80),
                'status' => 'available',
                'has_gps' => (bool)rand(0, 1),
                'has_air_conditioning' => true,
                'rental_point_id' => !empty($pointIds) ? $pointIds[array_rand($pointIds)] : null,
                'description' => 'Świetny samochód do wynajęcia. Polecamy!',
            ]);
        }
    }
}
