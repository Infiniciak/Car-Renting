<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: "Car",
    description: "Model reprezentujący pojazd w systemie",
    type: "object"
)]
class Car extends Model
{
    use HasFactory;

    #[OA\Property(property: "id", type: "integer", example: 1)]
    #[OA\Property(property: "brand", type: "string", example: "Audi")]
    #[OA\Property(property: "model", type: "string", example: "A6")]
    #[OA\Property(property: "year", type: "integer", example: 2026)]
    #[OA\Property(property: "registration_number", type: "string", example: "RZ12345")]
    #[OA\Property(property: "type", type: "string", example: "SUV")]
    #[OA\Property(property: "fuel_type", type: "string", example: "petrol")]
    #[OA\Property(property: "transmission", type: "string", example: "automatic")]
    #[OA\Property(property: "seats", type: "integer", example: 5)]
    #[OA\Property(property: "price_per_day", type: "number", format: "float", example: 299.99)]
    #[OA\Property(property: "insurance_per_day", type: "number", format: "float", description: "Podstawowe ubezpieczenie (5% ceny)", example: 15.00)]
    #[OA\Property(property: "extra_insurance_per_day", type: "number", format: "float", description: "Wyliczona stawka AC Premium", example: 45.50)]
    #[OA\Property(property: "status", type: "string", example: "available")]
    #[OA\Property(property: "image_path", type: "string", nullable: true, example: "cars/audi_a6.jpg")]
    #[OA\Property(property: "description", type: "string", nullable: true)]
    #[OA\Property(property: "has_gps", type: "boolean", example: true)]
    #[OA\Property(property: "has_air_conditioning", type: "boolean", example: true)]
    #[OA\Property(property: "rental_point_id", type: "integer", example: 1)]

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
