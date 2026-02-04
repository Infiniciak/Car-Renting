<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rental;
use App\Models\Car;
use App\Models\User;
use App\Models\RentalPoint;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class RentalController extends Controller
{
    public function index(Request $request)
    {
        $query = Rental::with([
            'user',
            'car.rentalPoint',
            'rentalPointStart',
            'rentalPointEnd'
        ]);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('rental_point_id')) {
            $query->where(function ($q) use ($request) {
                $q->where('rental_point_start_id', $request->rental_point_id)
                    ->orWhere('rental_point_end_id', $request->rental_point_id);
            });
        }

        $rentals = $query->orderBy('created_at', 'desc')->paginate(10);

        return response()->json($rentals);
    }

    public function show(Rental $rental)
    {
        $rental->load([
            'user',
            'car.rentalPoint',
            'rentalPointStart',
            'rentalPointEnd',
            'transactions'
        ]);

        return response()->json($rental);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'car_id' => 'required|exists:cars,id',
            'rental_point_start_id' => 'required|exists:rental_points,id',
            'rental_point_end_id' => 'required|exists:rental_points,id',
            'start_date' => 'required|date|after_or_equal:now',
            'planned_end_date' => 'required|date|after:start_date',
            'use_extra_insurance' => 'boolean', // NOWE POLE
            'notes' => 'nullable|string',
        ]);

        $car = Car::findOrFail($validated['car_id']);
        if (!$car->isAvailable()) {
            return response()->json([
                'message' => 'Samochód nie jest dostępny w wybranym terminie'
            ], 422);
        }

        $user = User::findOrFail($validated['user_id']);
        $startDate = Carbon::parse($validated['start_date']);

        $status = $startDate->isToday() ? 'active' : 'reserved';

        $days = Carbon::parse($validated['start_date'])
            ->diffInDays(Carbon::parse($validated['planned_end_date']));
        $days = max(1, $days);

        $distance = $this->calculateDistance(
            $validated['rental_point_start_id'],
            $validated['rental_point_end_id']
        );

        $basePrice = $car->getPriceWithDiscount() * $days;
        $distanceFee = $distance * 2;

        // --- ZMODYFIKOWANA LOGIKA UBEZPIECZENIA ---
        $useExtra = $request->boolean('use_extra_insurance');
        // Jeśli AC wybrane, bierzemy extra_insurance_per_day, w przeciwnym razie insurance_per_day
        $insuranceRate = $useExtra ? $car->extra_insurance_per_day : $car->insurance_per_day;
        $insurancePrice = $insuranceRate * $days;
        // ------------------------------------------

        $userRentalCount = $user->rentals()
            ->whereIn('status', ['completed', 'active', 'early_return'])
            ->count() + 1;
        $discountAmount = $this->calculateLoyaltyDiscount($userRentalCount, $basePrice);

        $totalPrice = $basePrice + $insurancePrice + $distanceFee - $discountAmount;

        if (!$user->hasEnoughBalance($totalPrice)) {
            return response()->json([
                'message' => "Niewystarczające saldo. Potrzebne: {$totalPrice} zł, dostępne: {$user->balance} zł"
            ], 422);
        }

        return DB::transaction(function () use ($validated, $user, $car, $status, $distance, $basePrice, $insurancePrice, $distanceFee, $discountAmount, $totalPrice, $userRentalCount, $useExtra) {

            $rental = Rental::create([
                'user_id' => $validated['user_id'],
                'car_id' => $validated['car_id'],
                'rental_point_start_id' => $validated['rental_point_start_id'],
                'rental_point_end_id' => $validated['rental_point_end_id'],
                'start_date' => $validated['start_date'],
                'planned_end_date' => $validated['planned_end_date'],
                'distance_km' => $distance,
                'base_price' => $basePrice,
                'insurance_price' => $insurancePrice,
                'use_extra_insurance' => $useExtra, // ZAPISUJEMY WYBÓR
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
                'description' => "Wynajem: {$car->brand} {$car->model} (Status: {$status})",
            ]);

            return response()->json([
                'message' => $status === 'active' ? 'Wypożyczenie rozpoczęte' : 'Samochód został zarezerwowany',
                'rental' => $rental->load(['user', 'car', 'rentalPointStart', 'rentalPointEnd'])
            ], 201);
        });
    }

    public function update(Request $request, Rental $rental)
    {
        $validated = $request->validate([
            'planned_end_date' => 'sometimes|date',
            'actual_end_date' => 'sometimes|date',
            'rental_point_end_id' => 'sometimes|exists:rental_points,id',
            'status' => 'sometimes|in:active,completed,cancelled,early_return',
            'notes' => 'nullable|string',
        ]);

        $rental->update($validated);

        if (isset($validated['status']) && in_array($validated['status'], ['completed', 'cancelled', 'early_return'])) {
            $rental->car->update(['status' => 'available']);
        }

        return response()->json([
            'message' => 'Wypożyczenie zaktualizowane',
            'rental' => $rental->load(['user', 'car', 'rentalPointStart', 'rentalPointEnd'])
        ]);
    }

    public function destroy(Rental $rental)
    {
        if (in_array($rental->status, ['active', 'reserved'])) {
            return response()->json([
                'message' => 'Nie można usunąć aktywnej lub zarezerwowanej rezerwacji. Najpierw użyj opcji "Anuluj", aby system zwrócił środki użytkownikowi.'
            ], 422);
        }

        $rental->delete();

        return response()->json([
            'message' => 'Wypożyczenie usunięte'
        ]);
    }

    public function cancel(Request $request, Rental $rental)
    {
        if (!$rental->canBeCancelled()) {
            return response()->json(['message' => 'To wypożyczenie nie może być anulowane'], 422);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string',
        ]);

        $now = now();
        $startDate = Carbon::parse($rental->start_date);

        $isReserved = ($rental->status === 'reserved' || $now->lt($startDate));
        $newStatus = $isReserved ? 'cancelled' : 'early_return';

        $refundAmount = $rental->calculateEarlyReturnRefund();

        $rental->update([
            'status' => $newStatus,
            'actual_end_date' => $now,
            'cancellation_reason' => $validated['cancellation_reason'],
            'refund_amount' => $refundAmount,
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
            'message' => $isReserved ? 'Rezerwacja anulowana' : 'Wypożyczenie zakończone przed czasem',
            'refund_amount' => $refundAmount,
            'rental' => $rental->fresh()->load(['user', 'car']),
        ]);
    }

    private function calculateLoyaltyDiscount($rentalCount, $basePrice)
    {
        if ($rentalCount % 15 === 0) {
            return $basePrice * 0.20;
        }

        if ($rentalCount % 10 === 0) {
            return $basePrice * 0.15;
        }

        if ($rentalCount % 5 === 0) {
            return $basePrice * 0.10;
        }

        return 0;
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

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        $straightDistance = $angle * $earthRadius;

        $roadDistance = $straightDistance * 1.2;

        return round($roadDistance, 2);
    }

    public function approveReturn(Request $request, Rental $rental)
    {
        if ($rental->status !== 'pending_return') {
            return response()->json(['message' => 'Ten zwrot nie oczekuje na weryfikację'], 422);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($rental, $validated) {
            $rental->update([
                'status' => 'completed',
                'notes' => isset($validated['notes'])
                    ? ($rental->notes ? $rental->notes . "\n\nZwrot: " . $validated['notes'] : "Zwrot: " . $validated['notes'])
                    : $rental->notes,
            ]);

            $rental->car->update(['status' => 'available']);
        });

        return response()->json([
            'message' => 'Zwrot zatwierdzony. Auto dostępne do wynajmu.',
            'rental' => $rental->fresh()
        ]);
    }

    public function rejectReturn(Request $request, Rental $rental)
    {
        if ($rental->status !== 'pending_return') {
            return response()->json(['message' => 'Ten zwrot nie oczekuje na weryfikację'], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $rental->update([
            'status' => 'active',
            'actual_end_date' => null,
            'notes' => $rental->notes
                ? $rental->notes . "\n\nOdrzucono zwrot: " . $validated['reason']
                : "Odrzucono zwrot: " . $validated['reason'],
        ]);

        return response()->json([
            'message' => 'Zwrot odrzucony. Klient musi poprawić.',
            'rental' => $rental->fresh()
        ]);
    }
}
