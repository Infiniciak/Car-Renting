<?php

namespace Database\Seeders;

use App\Models\RentalPoint;
use Illuminate\Database\Seeder;

class RentalPointSeeder extends Seeder
{
    public function run(): void
    {
        $points = [
            [
                'name' => 'Centrum Lotnisko',
                'city' => 'Warszawa',
                'address' => 'ul. Żwirki i Wigury 1',
                'postal_code' => '00-906',
                'has_charging_station' => true,
                'latitude' => 52.1672,
                'longitude' => 20.9679,
            ],
            [
                'name' => 'Dworzec Główny - Parking',
                'city' => 'Kraków',
                'address' => 'ul. Pawia 5',
                'postal_code' => '31-154',
                'has_charging_station' => true,
                'latitude' => 50.0647,
                'longitude' => 19.9450,
            ],
            [
                'name' => 'Galeria Dominikańska',
                'city' => 'Wrocław',
                'address' => 'pl. Dominikański 3',
                'postal_code' => '50-159',
                'has_charging_station' => false,
                'latitude' => 51.1084,
                'longitude' => 17.0395,
            ],
            [
                'name' => 'Stare Miasto Port',
                'city' => 'Gdańsk',
                'address' => 'ul. Targ Sienny 7',
                'postal_code' => '80-801',
                'has_charging_station' => true,
                'latitude' => 54.3510,
                'longitude' => 18.6463,
            ],
            [
                'name' => 'MTP Poznań',
                'city' => 'Poznań',
                'address' => 'ul. Głogowska 14',
                'postal_code' => '60-734',
                'has_charging_station' => false,
                'latitude' => 52.4020,
                'longitude' => 16.9125,
            ],
        ];

        foreach ($points as $point) {
            RentalPoint::create($point);
        }
    }
}
