<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;
    const TYPE_RENTAL = 'rental';
    const TYPE_REFUND = 'refund';
    const TYPE_TOP_UP = 'top_up';

    protected $fillable = [
        'user_id',
        'rental_id',
        'rental_point_id',
        'type',
        'amount',
        'balance_after',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function rental(): BelongsTo
    {
        return $this->belongsTo(Rental::class);
    }

    public function rentalPoint(): BelongsTo
    {
        return $this->belongsTo(RentalPoint::class);
    }
}
