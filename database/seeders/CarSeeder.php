<?php

namespace Database\Seeders;

use App\Models\Car;
use App\Models\RentalPoint;
use Illuminate\Database\Seeder;

class CarSeeder extends Seeder
{
    public function run(): void
    {
        $pointIds = RentalPoint::pluck('id')->toArray();

        if (empty($pointIds)) {
            $defaultPoint = RentalPoint::create([
                'name' => 'Punkt Centralny',
                'city' => 'Warszawa',
                'address' => 'ul. Marszałkowska 100',
                'postal_code' => '00-001',
                'has_charging_station' => true
            ]);
            $pointIds = [$defaultPoint->id];
        }

        $brands = [
            'Toyota' => ['Corolla', 'Yaris', 'RAV4', 'Camry', 'Proace'],
            'BMW' => ['3 Series', '5 Series', 'X5', 'M4', 'X7'],
            'Mercedes' => ['A-Class', 'E-Class', 'GLE', 'S-Class', 'V-Class'],
            'Audi' => ['A3', 'A4', 'A6', 'Q5', 'Q7'],
            'Tesla' => ['Model 3', 'Model Y', 'Model S', 'Model X'],
            'Volkswagen' => ['Golf', 'Passat', 'Tiguan', 'ID.4', 'Transporter'],
            'Ford' => ['Focus', 'Mustang', 'Explorer', 'Transit'],
            'Hyundai' => ['i30', 'Tucson', 'Ioniq 5', 'Santa Fe'],
            'Volvo' => ['XC40', 'XC60', 'XC90', 'S90'],
            'Skoda' => ['Fabia', 'Octavia', 'Superb', 'Kodiaq']
        ];

        $fuels = ['petrol', 'diesel', 'electric', 'hybrid'];

        for ($i = 1; $i <= 50; $i++) {
            $brand = array_rand($brands);
            $model = $brands[$brand][array_rand($brands[$brand])];

            $isVan = (str_contains($model, 'V-Class') || str_contains($model, 'Proace') || str_contains($model, 'Transporter') || str_contains($model, 'Transit'));
            $isSUV = (str_contains($model, 'X') || str_contains($model, 'Q') || str_contains($model, 'Tucson') || str_contains($model, 'XC') || str_contains($model, 'RAV4') || str_contains($model, 'GLE') || str_contains($model, 'Tiguan') || str_contains($model, 'Kodiaq'));
            $isCoupe = (str_contains($model, 'Mustang') || str_contains($model, 'M4'));
            $isElectric = (str_contains($brand, 'Tesla') || str_contains($model, 'ID.4') || str_contains($model, 'Ioniq 5'));

            $seats = 5;
            if ($isVan) $seats = rand(7, 9);
            elseif (str_contains($model, 'X7') || str_contains($model, 'Q7') || str_contains($model, 'XC90')) $seats = 7;
            elseif (in_array($model, ['Yaris', 'Fabia', 'A3', 'M4'])) $seats = 4;

            $type = 'sedan';
            if ($isVan) $type = 'van';
            elseif ($isSUV) $type = 'SUV';
            elseif ($isCoupe) $type = 'coupe';
            elseif (in_array($model, ['Golf', 'Yaris', 'Focus', 'i30', 'Fabia', 'A3'])) $type = 'hatchback';

            $price = rand(150, 400);
            if ($isSUV) $price = rand(350, 700);
            if ($isVan) $price = rand(400, 800);
            if ($isCoupe || str_contains($model, 'S-Class') || str_contains($model, 'Model S')) $price = rand(800, 1600);

            Car::create([
                'brand' => $brand,
                'model' => $model,
                'year' => rand(2021, 2025),
                'registration_number' => strtoupper(substr($brand, 0, 2)) . rand(10000, 99999),
                'type' => $type,
                'fuel_type' => $isElectric ? 'electric' : $fuels[array_rand($fuels)],
                'transmission' => ($isElectric || $price > 450 || rand(0, 1)) ? 'automatic' : 'manual',
                'seats' => $seats,
                'price_per_day' => $price,
                'status' => 'available',
                'has_gps' => (bool)rand(0, 1),
                'has_air_conditioning' => true,
                'rental_point_id' => $pointIds[array_rand($pointIds)],
                'description' => "Wyjątkowy $brand $model w wersji $type. Doskonały wybór dla osób ceniących " . ($price > 500 ? "luksus i prestiż." : "ekonomię i niezawodność."),
            ]);
        }
    }
}
