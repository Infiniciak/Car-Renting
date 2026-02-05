<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: "Rental",
    description: "Model reprezentujący wypożyczenie pojazdu",
    type: "object"
)]
class Rental extends Model
{
    use HasFactory;

    #[OA\Property(property: "id", type: "integer", example: 1)]
    #[OA\Property(property: "user_id", type: "integer", example: 1)]
    #[OA\Property(property: "car_id", type: "integer", example: 5)]
    #[OA\Property(property: "rental_point_start_id", type: "integer", example: 1)]
    #[OA\Property(property: "rental_point_end_id", type: "integer", example: 2)]
    #[OA\Property(property: "start_date", type: "string", format: "date-time")]
    #[OA\Property(property: "planned_end_date", type: "string", format: "date-time")]
    #[OA\Property(property: "actual_end_date", type: "string", format: "date-time", nullable: true)]
    #[OA\Property(property: "distance_km", type: "number", format: "float", example: 120.50)]
    #[OA\Property(property: "base_price", type: "number", format: "float", example: 500.00)]
    #[OA\Property(property: "insurance_price", type: "number", format: "float", example: 50.00)]
    #[OA\Property(property: "distance_fee", type: "number", format: "float", example: 241.00)]
    #[OA\Property(property: "discount_amount", type: "number", format: "float", example: 25.00)]
    #[OA\Property(property: "total_price", type: "number", format: "float", example: 766.00)]
    #[OA\Property(property: "refund_amount", type: "number", format: "float", example: 0.00)]
    #[OA\Property(property: "status", type: "string", enum: ["reserved", "active", "pending_return", "completed", "cancelled", "early_return"])]
    #[OA\Property(property: "user_rental_count", type: "integer", example: 3)]
    #[OA\Property(property: "notes", type: "string", nullable: true)]
    #[OA\Property(property: "cancellation_reason", type: "string", nullable: true)]

    protected $fillable = [
        'user_id',
        'car_id',
        'rental_point_start_id',
        'rental_point_end_id',
        'start_date',
        'planned_end_date',
        'actual_end_date',
        'distance_km',
        'base_price',
        'insurance_price',
        'distance_fee',
        'discount_amount',
        'total_price',
        'refund_amount',
        'status',
        'user_rental_count',
        'notes',
        'cancellation_reason',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'planned_end_date' => 'datetime',
        'actual_end_date' => 'datetime',
        'distance_km' => 'decimal:2',
        'base_price' => 'decimal:2',
        'insurance_price' => 'decimal:2',
        'distance_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'total_price' => 'decimal:2',
        'refund_amount' => 'decimal:2',
    ];

    /**
     * Użytkownik który wypożyczył
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Wypożyczony samochód
     */
    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    /**
     * Punkt początkowy
     */
    public function rentalPointStart(): BelongsTo
    {
        return $this->belongsTo(RentalPoint::class, 'rental_point_start_id');
    }

    /**
     * Punkt końcowy
     */
    public function rentalPointEnd(): BelongsTo
    {
        return $this->belongsTo(RentalPoint::class, 'rental_point_end_id');
    }

    /**
     * Transakcje powiązane z wypożyczeniem
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Oblicz liczbę dni wypożyczenia
     */
    public function calculateDays(): int
    {
        $start = Carbon::parse($this->start_date);
        $end = Carbon::parse($this->planned_end_date);

        return max(1, $start->diffInDays($end));
    }

    /**
     * Sprawdź czy wypożyczenie jest aktywne
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Sprawdź czy można anulować
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['active', 'reserved']);
    }

    public function calculateEarlyReturnRefund(): float
    {
        if ($this->status === 'reserved' || Carbon::now()->lt($this->start_date)) {
            return (float) $this->total_price;
        }

        if (!$this->isActive()) {
            return 0;
        }

        $now = Carbon::now();
        $start = Carbon::parse($this->start_date);
        $plannedEnd = Carbon::parse($this->planned_end_date);

        $totalHours = max(1, $start->diffInHours($plannedEnd));
        $hoursUsed = $start->diffInHours($now);

        if ($hoursUsed >= $totalHours) {
            return 0;
        }

        $hoursRemaining = $totalHours - $hoursUsed;

        $refundPercentage = ($hoursRemaining / $totalHours) * 0.80;

        return round($this->total_price * $refundPercentage, 2);
    }
}
