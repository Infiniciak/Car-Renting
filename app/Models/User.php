<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'balance',
        'rental_point_id',
        'google2fa_secret',
        'two_factor_enabled'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
            'balance' => 'decimal:2',
        ];
    }

    public function rentalPoint(): BelongsTo
    {
        return $this->belongsTo(RentalPoint::class, 'rental_point_id');
    }

    public function rentals(): HasMany
    {
        return $this->hasMany(Rental::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function usedPromoCodes(): HasMany
    {
        return $this->hasMany(PromoCode::class, 'used_by_user_id');
    }

    public function createdPromoCodes(): HasMany
    {
        return $this->hasMany(PromoCode::class, 'created_by_admin_id');
    }

    public function getRentalCountAttribute(): int
    {
        return $this->rentals()->where('status', 'completed')->count();
    }

    public function hasEnoughBalance(float $amount): bool
    {
        return $this->balance >= $amount;
    }

    public function deductBalance(float $amount): bool
    {
        if (!$this->hasEnoughBalance($amount)) {
            return false;
        }

        $this->decrement('balance', $amount);
        return true;
    }

    public function addBalance(float $amount): void
    {
        $this->increment('balance', $amount);
    }
}
