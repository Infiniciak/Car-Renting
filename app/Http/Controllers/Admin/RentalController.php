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

        $rentals = $query->orderBy('created_at', 'desc')->paginate(20);

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
            'start_date' => 'required|date',
            'planned_end_date' => 'required|date|after:start_date',
            'notes' => 'nullable|string',
        ]);

        $car = Car::findOrFail($validated['car_id']);
        if (!$car->isAvailable()) {
            return response()->json([
                'message' => 'Samochód nie jest dostępny'
            ], 422);
        }

        $days = Carbon::parse($validated['start_date'])
            ->diffInDays(Carbon::parse($validated['planned_end_date']));
        $days = max(1, $days);

        $distance = $this->calculateDistance(
            $validated['rental_point_start_id'],
            $validated['rental_point_end_id']
        );

        $basePrice = $car->getPriceWithDiscount() * $days;
        $distanceFee = $distance * 1; // 1 zł za km
        $insurancePrice = $car->insurance_per_day * $days;

        // Promocje dla stałych klientów (zadanie 18)
        $user = User::findOrFail($validated['user_id']);
        $userRentalCount = $user->rentals()->where('status', 'completed')->count() + 1;
        $discountAmount = $this->calculateLoyaltyDiscount($userRentalCount, $basePrice);

        $totalPrice = $basePrice + $insurancePrice + $distanceFee - $discountAmount;

        if (!$user->hasEnoughBalance($totalPrice)) {
            return response()->json([
                'message' => 'Niewystarczające saldo. Potrzebne: ' . $totalPrice . ' zł, dostępne: ' . $user->balance . ' zł'
            ], 422);
        }

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
            'distance_fee' => $distanceFee,
            'discount_amount' => $discountAmount,
            'total_price' => $totalPrice,
            'status' => 'active',
            'user_rental_count' => $userRentalCount,
            'notes' => $validated['notes'] ?? null,
        ]);

        $user->deductBalance($totalPrice);
        $car->update(['status' => 'rented']);

        Transaction::create([
            'user_id' => $user->id,
            'rental_id' => $rental->id,
            'rental_point_id' => $validated['rental_point_start_id'],
            'type' => Transaction::TYPE_RENTAL,
            'amount' => -$totalPrice,
            'balance_after' => $user->balance,
            'description' => "Wypożyczenie {$car->brand} {$car->model} ({$rental->id})",
        ]);

        return response()->json([
            'message' => 'Wypożyczenie utworzone pomyślnie',
            'rental' => $rental->load(['user', 'car', 'rentalPointStart', 'rentalPointEnd'])
        ], 201);
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
        if ($rental->status === 'active') {
            return response()->json([
                'message' => 'Nie można usunąć aktywnego wypożyczenia. Najpierw anuluj.'
            ], 422);
        }

        $rental->delete();

        return response()->json([
            'message' => 'Wypożyczenie usunięte'
        ]);
    }

    // Wcześniejszy zwrot z częściowym zwrotem kosztów (zadanie 17)
    public function cancel(Request $request, Rental $rental)
    {
        if (!$rental->canBeCancelled()) {
            return response()->json([
                'message' => 'To wypożyczenie nie może być anulowane'
            ], 422);
        }

        $validated = $request->validate([
            'cancellation_reason' => 'required|string',
        ]);

        $refundAmount = $rental->calculateEarlyReturnRefund();

        $rental->update([
            'status' => 'early_return',
            'actual_end_date' => now(),
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
                'description' => "Zwrot za wcześniejsze oddanie wypożyczenia {$rental->id}",
            ]);
        }

        return response()->json([
            'message' => 'Wypożyczenie anulowane. Zwrot: ' . $refundAmount . ' zł',
            'rental' => $rental->fresh()->load(['user', 'car']),
            'refund_amount' => $refundAmount,
        ]);
    }

    // Wzór Haversine - odległość między punktami GPS (zadanie 16)
    private function calculateDistance($startPointId, $endPointId)
    {
        $start = RentalPoint::findOrFail($startPointId);
        $end = RentalPoint::findOrFail($endPointId);

        if (!$start->latitude || !$end->latitude) {
            return 0;
        }

        $earthRadius = 6371; // km

        $latFrom = deg2rad((float) $start->latitude);
        $lonFrom = deg2rad((float) $start->longitude);
        $latTo = deg2rad((float) $end->latitude);
        $lonTo = deg2rad((float) $end->longitude);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return round($angle * $earthRadius, 2);
    }

    // Rabaty: 10% co 5., 15% co 10., 20% co 15. wypożyczenie (zadanie 18)
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
}
