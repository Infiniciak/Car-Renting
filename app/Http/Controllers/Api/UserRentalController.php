<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Rental;
use App\Models\Car;
use App\Models\RentalPoint;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "User Rentals", description: "Obsługa wypożyczeń po stronie klienta")]
class UserRentalController extends Controller
{
    #[OA\Get(
        path: "/rentals/stats",
        operationId: "getUserRentalStats",
        summary: "Pobierz statystyki lojalnościowe użytkownika",
        security: [["bearerAuth" => []]],
        tags: ["User Rentals"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Zwraca liczbę wynajmów i info o nadchodzących zniżkach",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "completed_rentals", type: "integer"),
                        new OA\Property(property: "next_discount", type: "integer", description: "Wartość % następnej zniżki"),
                        new OA\Property(property: "rentals_until_discount", type: "integer"),
                        new OA\Property(property: "balance", type: "number")
                    ]
                )
            )
        ]
    )]
    public function getUserRentalCount()
    {
        $user = auth()->user();
        $completedRentals = $user->rentals()
            ->whereIn('status', ['completed', 'active', 'early_return'])
            ->count();

        $nextDiscount = null;
        $rentalsUntilDiscount = null;

        if (($completedRentals + 1) % 15 === 0) {
            $nextDiscount = 20;
            $rentalsUntilDiscount = 0;
        } elseif (($completedRentals + 1) % 10 === 0) {
            $nextDiscount = 15;
            $rentalsUntilDiscount = 0;
        } elseif (($completedRentals + 1) % 5 === 0) {
            $nextDiscount = 10;
            $rentalsUntilDiscount = 0;
        } else {
            $nextMilestone = ceil(($completedRentals + 1) / 5) * 5;
            $rentalsUntilDiscount = $nextMilestone - $completedRentals - 1;

            if ($nextMilestone % 15 === 0) {
                $nextDiscount = 20;
            } elseif ($nextMilestone % 10 === 0) {
                $nextDiscount = 15;
            } else {
                $nextDiscount = 10;
            }
        }

        return response()->json([
            'completed_rentals' => $completedRentals,
            'next_discount' => $nextDiscount,
            'rentals_until_discount' => $rentalsUntilDiscount,
            'balance' => $user->balance
        ]);
    }

    #[OA\Post(
        path: "/rentals/calculate",
        operationId: "calculateRentalPrice",
        summary: "Oblicz koszt wynajmu przed złożeniem zamówienia",
        security: [["bearerAuth" => []]],
        tags: ["User Rentals"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["car_id", "rental_point_start_id", "rental_point_end_id", "start_date", "planned_end_date"],
                properties: [
                    new OA\Property(property: "car_id", type: "integer"),
                    new OA\Property(property: "rental_point_start_id", type: "integer"),
                    new OA\Property(property: "rental_point_end_id", type: "integer"),
                    new OA\Property(property: "start_date", type: "string", format: "date"),
                    new OA\Property(property: "planned_end_date", type: "string", format: "date"),
                    new OA\Property(property: "use_extra_insurance", type: "boolean")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Szczegółowa kalkulacja ceny")
        ]
    )]
    public function calculatePrice(Request $request)
    {
        $validated = $request->validate([
            'car_id' => 'required|exists:cars,id',
            'rental_point_start_id' => 'required|exists:rental_points,id',
            'rental_point_end_id' => 'required|exists:rental_points,id',
            'start_date' => 'required|date|after_or_equal:now',
            'planned_end_date' => 'required|date|after:start_date',
            'use_extra_insurance' => 'boolean'
        ]);

        $car = Car::findOrFail($validated['car_id']);
        $startDate = Carbon::parse($validated['start_date']);
        $endDate = Carbon::parse($validated['planned_end_date']);
        $days = max(1, $startDate->diffInDays($endDate));

        $distance = $this->calculateDistance($validated['rental_point_start_id'], $validated['rental_point_end_id']);

        $basePrice = $car->getPriceWithDiscount() * $days;

        // --- ZMODYFIKOWANA LOGIKA UBEZPIECZENIA ---
        $useExtra = $request->boolean('use_extra_insurance');
        // Jeśli zaznaczono AC, bierzemy extra_insurance_per_day z modelu, inaczej insurance_per_day z bazy
        $insuranceRate = $useExtra ? $car->extra_insurance_per_day : $car->insurance_per_day;
        $insurancePrice = $insuranceRate * $days;
        // ------------------------------------------

        $distanceFee = $distance * 2;

        $user = auth()->user();
        $userRentalCount = $user->rentals()->whereIn('status', ['completed', 'active', 'early_return'])->count() + 1;
        $discountAmount = $this->calculateLoyaltyDiscount($userRentalCount, $basePrice);

        $totalPrice = ($basePrice + $insurancePrice + $distanceFee) - $discountAmount;

        return response()->json([
            'days' => $days,
            'distance_km' => $distance,
            'base_price' => round($basePrice, 2),
            'insurance_price' => round($insurancePrice, 2),
            'distance_fee' => round($distanceFee, 2),
            'discount_amount' => round($discountAmount, 2),
            'total_price' => round($totalPrice, 2),
            'user_balance' => $user->balance,
            'has_enough_balance' => $user->balance >= $totalPrice
        ]);
    }

    #[OA\Post(
        path: "/rentals",
        operationId: "storeUserRental",
        summary: "Stwórz nową rezerwację lub rozpocznij wynajem",
        security: [["bearerAuth" => []]],
        tags: ["User Rentals"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "car_id", type: "integer"),
                    new OA\Property(property: "rental_point_start_id", type: "integer"),
                    new OA\Property(property: "rental_point_end_id", type: "integer"),
                    new OA\Property(property: "start_date", type: "string", format: "date-time"),
                    new OA\Property(property: "planned_end_date", type: "string", format: "date-time"),
                    new OA\Property(property: "use_extra_insurance", type: "boolean"),
                    new OA\Property(property: "notes", type: "string")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Wynajem rozpoczęty / zarezerwowany"),
            new OA\Response(response: 422, description: "Brak środków lub auto niedostępne")
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'car_id' => 'required|exists:cars,id',
            'rental_point_start_id' => 'required|exists:rental_points,id',
            'rental_point_end_id' => 'required|exists:rental_points,id',
            'start_date' => 'required|date|after_or_equal:now',
            'planned_end_date' => 'required|date|after:start_date',
            'use_extra_insurance' => 'boolean', // DODANO DO VALIDACJI
            'notes' => 'nullable|string',
        ]);

        $user = auth()->user();
        $car = Car::findOrFail($validated['car_id']);

        if (!$car->isAvailable()) {
            return response()->json(['message' => 'Samochód nie jest dostępny w wybranym terminie'], 422);
        }

        $startDate = Carbon::parse($validated['start_date']);
        $status = $startDate->isToday() ? 'active' : 'reserved';

        $days = max(1, $startDate->diffInDays(Carbon::parse($validated['planned_end_date'])));

        $distance = $this->calculateDistance(
            $validated['rental_point_start_id'],
            $validated['rental_point_end_id']
        );

        $basePrice = $car->getPriceWithDiscount() * $days;

        // --- ZMODYFIKOWANA LOGIKA UBEZPIECZENIA ---
        $useExtra = $request->boolean('use_extra_insurance');
        $insuranceRate = $useExtra ? $car->extra_insurance_per_day : $car->insurance_per_day;
        $insurancePrice = $insuranceRate * $days;
        // ------------------------------------------

        $distanceFee = $distance * 2;

        $userRentalCount = $user->rentals()
            ->whereIn('status', ['completed', 'active', 'early_return'])
            ->count() + 1;
        $discountAmount = $this->calculateLoyaltyDiscount($userRentalCount, $basePrice);

        $totalPrice = $basePrice + $insurancePrice + $distanceFee - $discountAmount;

        if (!$user->hasEnoughBalance($totalPrice)) {
            return response()->json([
                'message' => 'Niewystarczające saldo. Potrzebne: ' . round($totalPrice, 2) . ' zł, dostępne: ' . $user->balance . ' zł'
            ], 422);
        }

        return DB::transaction(function () use ($validated, $user, $car, $status, $distance, $basePrice, $insurancePrice, $distanceFee, $discountAmount, $totalPrice, $userRentalCount, $useExtra) {

            $rental = Rental::create([
                'user_id' => $user->id,
                'car_id' => $validated['car_id'],
                'rental_point_start_id' => $validated['rental_point_start_id'],
                'rental_point_end_id' => $validated['rental_point_end_id'],
                'start_date' => $validated['start_date'],
                'planned_end_date' => $validated['planned_end_date'],
                'distance_km' => $distance,
                'base_price' => $basePrice,
                'insurance_price' => $insurancePrice,
                'use_extra_insurance' => $useExtra, // ZAPISUJEMY INFORMACJĘ
                'distance_fee' => $distanceFee,
                'discount_amount' => $discountAmount,
                'total_price' => $totalPrice,
                'status' => $status,
                'user_rental_count' => $userRentalCount,
                'notes' => $validated['notes'] ?? null,
            ]);

            $user->deductBalance($totalPrice);

            $car->update(['status' => ($status === 'active' ? 'rented' : 'reserved')]);

            Transaction::create([
                'user_id' => $user->id,
                'rental_id' => $rental->id,
                'rental_point_id' => $validated['rental_point_start_id'],
                'type' => Transaction::TYPE_RENTAL,
                'amount' => -$totalPrice,
                'balance_after' => $user->balance,
                'description' => "Wypożyczenie {$car->brand} {$car->model} - Status: " . ($status === 'active' ? 'Aktywne' : 'Zarezerwowane'),
            ]);

            return response()->json([
                'message' => $status === 'active' ? 'Wypożyczenie rozpoczęte!' : 'Rezerwacja utworzona pomyślnie!',
                'rental' => $rental->load(['car', 'rentalPointStart', 'rentalPointEnd'])
            ], 201);
        });
    }

    #[OA\Get(
        path: "/rentals/my",
        operationId: "getMyRentals",
        summary: "Lista wypożyczeń zalogowanego użytkownika",
        security: [["bearerAuth" => []]],
        tags: ["User Rentals"],
        responses: [
            new OA\Response(response: 200, description: "Paginowana lista wynajmów")
        ]
    )]
    public function myRentals()
    {
        $user = auth()->user();
        $rentals = $user->rentals()
            ->with(['car', 'rentalPointStart', 'rentalPointEnd'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($rentals);
    }

    private function calculateDistance($startPointId, $endPointId)
    {
        $start = RentalPoint::findOrFail($startPointId);
        $end = RentalPoint::findOrFail($endPointId);

        if (!$start->latitude || !$end->latitude) {
            return 0;
        }

        $earthRadius = 6371;

        $latFrom = deg2rad((float) $start->latitude);
        $lonFrom = deg2rad((float) $start->longitude);
        $latTo = deg2rad((float) $end->latitude);
        $lonTo = deg2rad((float) $end->longitude);

        $angle = 2 * asin(sqrt(pow(sin(($latTo - $latFrom) / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin(($lonTo - $lonFrom) / 2), 2)));

        $straightDistance = $angle * $earthRadius;
        return round($straightDistance * 1.2, 2);
    }

    private function calculateLoyaltyDiscount($rentalCount, $basePrice)
    {
        if ($rentalCount % 15 === 0) return $basePrice * 0.20;
        if ($rentalCount % 10 === 0) return $basePrice * 0.15;
        if ($rentalCount % 5 === 0)  return $basePrice * 0.10;
        return 0;
    }

    #[OA\Post(
        path: "/rentals/{id}/cancel",
        operationId: "cancelUserRental",
        summary: "Anulowanie rezerwacji lub wczesny zwrot przez użytkownika",
        security: [["bearerAuth" => []]],
        tags: ["User Rentals"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Zwrócono środki na saldo"),
            new OA\Response(response: 422, description: "Nie można już anulować")
        ]
    )]
    public function cancel(Request $request, Rental $rental)
    {
        if ($rental->user_id !== auth()->id()) {
            return response()->json(['message' => 'Nie masz uprawnień do tego wypożyczenia'], 403);
        }

        if (!$rental->canBeCancelled()) {
            return response()->json(['message' => 'To wypożyczenie nie może już zostać anulowane'], 422);
        }

        $now = now();
        $startDate = Carbon::parse($rental->start_date);

        $isReserved = ($rental->status === 'reserved' || $now->lt($startDate));
        $newStatus = $isReserved ? 'cancelled' : 'early_return';

        $refundAmount = $rental->calculateEarlyReturnRefund();

        return DB::transaction(function () use ($rental, $newStatus, $refundAmount, $now, $isReserved) {

            $rental->update([
                'status' => $newStatus,
                'actual_end_date' => $now,
                'refund_amount' => $refundAmount,
                'cancellation_reason' => 'Anulowane przez użytkownika'
            ]);

            $rental->car->update(['status' => 'available']);

            if ($refundAmount > 0) {
                $rental->user->addBalance($refundAmount);

                Transaction::create([
                    'user_id' => $rental->user_id,
                    'rental_id' => $rental->id,
                    'rental_point_id' => $rental->rental_point_start_id,
                    'type' => Transaction::TYPE_REFUND,
                    'amount' => $refundAmount,
                    'balance_after' => $rental->user->balance,
                    'description' => $isReserved
                        ? "Pełny zwrot za anulowanie rezerwacji #{$rental->id}"
                        : "Zwrot za wcześniejsze oddanie auta #{$rental->id}",
                ]);
            }

            return response()->json([
                'message' => $isReserved ? 'Rezerwacja została anulowana' : 'Zakończono wypożyczenie przed czasem',
                'refund_amount' => $refundAmount,
                'status' => $newStatus
            ]);
        });
    }

    #[OA\Post(
        path: "/rentals/{id}/request-return",
        operationId: "requestReturnUser",
        summary: "Zgłoszenie zwrotu pojazdu do weryfikacji",
        security: [["bearerAuth" => []]],
        tags: ["User Rentals"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Status zmieniony na pending_return")
        ]
    )]
    public function requestReturn(Request $request, Rental $rental)
    {
        $user = $request->user();

        if ($rental->user_id !== $user->id) {
            return response()->json(['message' => 'To nie Twoje wypożyczenie'], 403);
        }

        if ($rental->status !== 'active') {
            return response()->json(['message' => 'Można zakończyć tylko aktywne wypożyczenie'], 422);
        }

        $rental->update([
            'status' => 'pending_return',
            'actual_end_date' => now(),
        ]);

        return response()->json([
            'message' => 'Zgłoszono zwrot pojazdu. Oczekuj na weryfikację przez pracownika.',
            'rental' => $rental->fresh()
        ]);
    }
}
