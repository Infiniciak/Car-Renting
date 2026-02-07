<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Car;
use App\Models\Rental;
use App\Models\RentalPoint;
use Carbon\Carbon;

class RentalSeeder extends Seeder
{
    public function run(): void
    {
        $points = RentalPoint::all();
        if ($points->count() < 2) {
            $this->command->warn('Potrzeba minimum 2 punktów wypożyczeń. Tworzę dodatkowe...');
            return;
        }

        $cars = Car::where('status', 'available')->get();
        if ($cars->isEmpty()) {
            $this->command->warn('Brak dostępnych samochodów!');
            return;
        }

        // Anna Nowak - 4 wypożyczenia (następne będzie 5 = 10% rabatu)
        $anna = User::where('email', 'anna@test.com')->first();
        $this->createRentalsForUser($anna, 4, $cars, $points);

        // Piotr Wiśniewski - 9 wypożyczeń (następne będzie 10 = 15% rabatu)
        $piotr = User::where('email', 'piotr@test.com')->first();
        $this->createRentalsForUser($piotr, 9, $cars, $points);

        // Katarzyna Lewandowska - 14 wypożyczeń (następne będzie 15 = 20% rabatu)
        $kasia = User::where('email', 'kasia@test.com')->first();
        $this->createRentalsForUser($kasia, 14, $cars, $points);

        // Michał Dąbrowski - 9 wypożyczeń (4 completed, 5 active)
        $michal = User::where('email', 'michal@test.com')->first();
        $this->createRentalsForUser($michal, 4, $cars, $points);
        $this->createActiveRentalsForUser($michal, 5, $cars, $points, 4);
        $this->createCancelledRentalsForUser($michal, 1, $cars, $points, 9);

        // Magdalena Kozłowska - 9 wypożyczeń (4 completed, 5 active)
        $magda = User::where('email', 'magda@test.com')->first();
        $this->createRentalsForUser($magda, 4, $cars, $points);
        $this->createActiveRentalsForUser($magda, 5, $cars, $points, 4);
        $this->createCancelledRentalsForUser($magda, 1, $cars, $points, 9);

        $this->command->info(' Utworzono wypożyczenia testowe!');
    }

    private function createRentalsForUser($user, $count, $cars, $points)
    {
        for ($i = 0; $i < $count; $i++) {
            $car = $cars->random();
            $startPoint = $points->random();
            $endPoint = $points->random();

            $daysAgo = rand(30, 365);
            $rentalDays = rand(1, 7);

            $startDate = Carbon::now()->subDays($daysAgo);
            $endDate = $startDate->copy()->addDays($rentalDays);

            $distance = $this->calculateDistance($startPoint, $endPoint);

            $basePrice = $car->price_per_day * $rentalDays;
            $insurancePrice = $car->insurance_per_day * $rentalDays;
            $distanceFee = $distance * 2;

            $rentalCount = $i + 1;
            $discountAmount = 0;
            if ($rentalCount % 15 === 0) {
                $discountAmount = $basePrice * 0.20;
            } elseif ($rentalCount % 10 === 0) {
                $discountAmount = $basePrice * 0.15;
            } elseif ($rentalCount % 5 === 0) {
                $discountAmount = $basePrice * 0.10;
            }

            $totalPrice = $basePrice + $insurancePrice + $distanceFee - $discountAmount;

            $status = rand(1, 10) > 2 ? 'completed' : 'early_return';

            $refundAmount = 0;
            if ($status === 'early_return') {
                $refundAmount = $totalPrice * 0.40;
            }

            Rental::create([
                'user_id' => $user->id,
                'car_id' => $car->id,
                'rental_point_start_id' => $startPoint->id,
                'rental_point_end_id' => $endPoint->id,
                'start_date' => $startDate,
                'planned_end_date' => $endDate,
                'actual_end_date' => $endDate,
                'status' => $status,
                'distance_km' => $distance,
                'base_price' => round($basePrice, 2),
                'insurance_price' => round($insurancePrice, 2),
                'distance_fee' => round($distanceFee, 2),
                'discount_amount' => round($discountAmount, 2),
                'total_price' => round($totalPrice, 2),
                'refund_amount' => round($refundAmount, 2),
                'user_rental_count' => $rentalCount,
                'notes' => $status === 'early_return' ? 'Wcześniejszy zwrot przez użytkownika' : null,
            ]);
        }
    }

    private function createActiveRentalsForUser($user, $count, $cars, $points, $startingCount = 0)
    {
        for ($i = 0; $i < $count; $i++) {
            $car = $cars->random();
            $startPoint = $points->random();
            $endPoint = $points->random();

            // Wypożyczenia aktywne: rozpoczęły się w przeszłości (1-10 dni temu), kończą się w przyszłości (3-10 dni)
            $daysAgoStarted = rand(1, 10);
            $daysUntilEnd = rand(3, 10);

            $startDate = Carbon::now()->subDays($daysAgoStarted);
            $endDate = Carbon::now()->addDays($daysUntilEnd);

            $rentalDays = $startDate->diffInDays($endDate);

            $distance = $this->calculateDistance($startPoint, $endPoint);

            $basePrice = $car->price_per_day * $rentalDays;
            $insurancePrice = $car->insurance_per_day * $rentalDays;
            $distanceFee = $distance * 2;

            $rentalCount = $startingCount + $i + 1;
            $discountAmount = 0;
            if ($rentalCount % 15 === 0) {
                $discountAmount = $basePrice * 0.20;
            } elseif ($rentalCount % 10 === 0) {
                $discountAmount = $basePrice * 0.15;
            } elseif ($rentalCount % 5 === 0) {
                $discountAmount = $basePrice * 0.10;
            }

            $totalPrice = $basePrice + $insurancePrice + $distanceFee - $discountAmount;

            Rental::create([
                'user_id' => $user->id,
                'car_id' => $car->id,
                'rental_point_start_id' => $startPoint->id,
                'rental_point_end_id' => $endPoint->id,
                'start_date' => $startDate,
                'planned_end_date' => $endDate,
                'actual_end_date' => null,
                'status' => 'active',
                'distance_km' => $distance,
                'base_price' => round($basePrice, 2),
                'insurance_price' => round($insurancePrice, 2),
                'distance_fee' => round($distanceFee, 2),
                'discount_amount' => round($discountAmount, 2),
                'total_price' => round($totalPrice, 2),
                'refund_amount' => 0,
                'user_rental_count' => $rentalCount,
                'notes' => null,
            ]);
        }
    }

    private function calculateDistance($startPoint, $endPoint)
    {
        if (!$startPoint->latitude || !$endPoint->latitude) {
            return 0;
        }

        $earthRadius = 6371;

        $latFrom = deg2rad((float) $startPoint->latitude);
        $lonFrom = deg2rad((float) $startPoint->longitude);
        $latTo = deg2rad((float) $endPoint->latitude);
        $lonTo = deg2rad((float) $endPoint->longitude);

        $angle = 2 * asin(sqrt(pow(sin(($latTo - $latFrom) / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin(($lonTo - $lonFrom) / 2), 2)));

        $straightDistance = $angle * $earthRadius;
        return round($straightDistance * 1.2, 2);
    }

    private function createCancelledRentalsForUser($user, $count, $cars, $points, $startingCount = 0)
    {
        for ($i = 0; $i < $count; $i++) {
            $car = $cars->random();
            $startPoint = $points->random();
            $endPoint = $points->random();

            $startDate = Carbon::now()->subDays(rand(20, 30));
            $endDate = $startDate->copy()->addDays(rand(1, 3));

            $distance = $this->calculateDistance($startPoint, $endPoint);
            $rentalCount = $startingCount + $i + 1;

            // Przy anulowanych zazwyczaj zwracamy 100% ceny w Twoim systemie
            $basePrice = $car->price_per_day * 2;
            $totalPrice = $basePrice + ($car->insurance_per_day * 2);

            Rental::create([
                'user_id' => $user->id,
                'car_id' => $car->id,
                'rental_point_start_id' => $startPoint->id,
                'rental_point_end_id' => $endPoint->id,
                'start_date' => $startDate,
                'planned_end_date' => $endDate,
                'actual_end_date' => $startDate->copy()->addMinutes(30), // Anulowane po 30 min
                'status' => 'cancelled',
                'distance_km' => $distance,
                'base_price' => round($basePrice, 2),
                'insurance_price' => round($car->insurance_per_day * 2, 2),
                'distance_fee' => 0,
                'discount_amount' => 0,
                'total_price' => round($totalPrice, 2),
                'refund_amount' => round($totalPrice, 2), // Pełny zwrot
                'user_rental_count' => $rentalCount,
                'cancellation_reason' => 'Błąd w wyborze terminu - anulowanie testowe',
                'notes' => 'Automatyczne anulowanie przez seeder',
            ]);
        }
    }
}
