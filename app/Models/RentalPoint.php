<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RentalPoint extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'city',
        'postal_code',
        'has_charging_station',
        'image_path',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'has_charging_station' => 'boolean',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
    ];

    public function cars(): HasMany
    {
        return $this->hasMany(Car::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function rentalsStarted(): HasMany
    {
        return $this->hasMany(Rental::class, 'rental_point_start_id');
    }

    public function rentalsEnded(): HasMany
    {
        return $this->hasMany(Rental::class, 'rental_point_end_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function availableCars()
    {
        return $this->cars()->where('status', 'available');
    }
}
