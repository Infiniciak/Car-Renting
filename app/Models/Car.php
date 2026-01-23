<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Car extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand',
        'model',
        'year',
        'registration_number',
        'type',
        'fuel_type',
        'transmission',
        'seats',
        'price_per_day',
        'insurance_per_day',
        'status',
        'image_path',
        'description',
        'has_gps',
        'has_air_conditioning',
        'discount_percentage',
        'rental_point_id',
    ];

    protected $casts = [
        'price_per_day' => 'decimal:2',
        'insurance_per_day' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'has_gps' => 'boolean',
        'has_air_conditioning' => 'boolean',
    ];

    /**
     * Punkt wypożyczenia gdzie jest samochód
     */
    public function rentalPoint(): BelongsTo
    {
        return $this->belongsTo(RentalPoint::class);
    }

    /**
     * Wypożyczenia tego samochodu
     */
    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    /**
     * Sprawdź czy samochód jest dostępny
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    /**
     * Cena z rabatem
     */
    public function getPriceWithDiscount(): float
    {
        $price = (float) $this->price_per_day;
        $discount = (float) $this->discount_percentage;
        
        return $price - ($price * ($discount / 100));
    }
}
