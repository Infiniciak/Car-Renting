<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromoCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'amount',
        'used',
        'used_by_user_id',
        'used_at',
        'created_by_admin_id',
        'expires_at',
        'description',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'used' => 'boolean',
        'used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Użytkownik który użył kodu
     */
    public function usedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'used_by_user_id');
    }

    /**
     * Admin który utworzył kod
     */
    public function createdByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_admin_id');
    }

    /**
     * Sprawdź czy kod jest dostępny do użycia
     */
    public function isAvailable(): bool
    {
        if ($this->used) {
            return false;
        }

        if ($this->expires_at && now()->isAfter($this->expires_at)) {
            return false;
        }

        return true;
    }

    /**
     * Użyj kodu
     */
    public function redeem(User $user): bool
    {
        if (!$this->isAvailable()) {
            return false;
        }

        $this->update([
            'used' => true,
            'used_by_user_id' => $user->id,
            'used_at' => now(),
        ]);

        // Dodaj saldo użytkownikowi
        $user->increment('balance', (float) $this->amount);

        // Utwórz transakcję
        Transaction::create([
            'user_id' => $user->id,
            'type' => 'balance_add',
            'amount' => $this->amount,
            'balance_after' => $user->balance,
            'description' => "Doładowanie konta kodem: {$this->code}",
        ]);

        return true;
    }
}
