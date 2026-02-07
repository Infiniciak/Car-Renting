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
        'brand', 'model', 'year', 'registration_number', 'type',
        'fuel_type', 'transmission', 'seats', 'price_per_day',
        'insurance_per_day', 'status', 'image_path', 'description',
        'has_gps', 'has_air_conditioning', 'discount_percentage',
        'rental_point_id',
    ];

    protected $casts = [
        'price_per_day' => 'decimal:2',
        'insurance_per_day' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'has_gps' => 'boolean',
        'has_air_conditioning' => 'boolean',
    ];

    protected $appends = ['extra_insurance_per_day'];

    public function rentalPoint(): BelongsTo
    {
        return $this->belongsTo(RentalPoint::class);
    }

    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    protected static function booted()
    {
        static::saving(function ($car) {
            $car->insurance_per_day = round($car->price_per_day * 0.05, 2);
        });
    }

    public function getExtraInsurancePerDayAttribute()
    {
        $basePrice = (float) $this->price_per_day;
        if ($basePrice <= 0) return 0;

        $multiplier = 1.0;

        $typeMultipliers = [
            'SUV' => 1.4, 'van' => 1.3, 'sedan' => 1.0,
            'hatchback' => 0.9, 'coupe' => 1.8, 'electric' => 1.5
        ];
        $multiplier *= ($typeMultipliers[$this->type] ?? 1.0);

        $premiumBrands = ['BMW', 'Mercedes', 'Audi', 'Tesla', 'Porsche'];
        if (in_array($this->brand, $premiumBrands)) $multiplier *= 1.3;

        $age = date('Y') - $this->year;
        if ($age <= 2) $multiplier *= 1.25;

        return round(($basePrice * 0.12) * $multiplier, 2);
    }


    public function getPriceWithDiscount(): float
    {
        $price = (float) $this->price_per_day;
        $discount = (float) $this->discount_percentage;

        return $price - ($price * ($discount / 100));
    }
}
