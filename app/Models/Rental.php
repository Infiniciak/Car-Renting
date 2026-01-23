<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Rental extends Model
{
    use HasFactory;

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
        return in_array($this->status, ['active']);
    }

    /**
     * Oblicz zwrot za wcześniejsze oddanie (zadanie 17)
     * Proporcjonalnie od czasu i odległości
     */
    public function calculateEarlyReturnRefund(): float
    {
        if (!$this->isActive()) {
            return 0;
        }

        $now = Carbon::now();
        $start = Carbon::parse($this->start_date);
        $plannedEnd = Carbon::parse($this->planned_end_date);

        // Ile dni już minęło
        $daysUsed = max(1, $start->diffInDays($now));

        // Ile dni było planowanych
        $totalDays = max(1, $start->diffInDays($plannedEnd));

        // Jeśli minęło więcej dni niż planowano, brak zwrotu
        if ($daysUsed >= $totalDays) {
            return 0;
        }

        // Proporcjonalny zwrot
        $daysRemaining = $totalDays - $daysUsed;
        $refundPercentage = ($daysRemaining / $totalDays);

        // Zwracamy proporcjonalnie
        return round($this->total_price * $refundPercentage * 0.8, 2);
    }
}
