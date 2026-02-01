<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class PromoCode extends Model
{
    use HasFactory;

    protected $table = 'promo_codes';

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

    public function usedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'used_by_user_id');
    }

    public function createdByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_admin_id');
    }

    public function isValid(): bool
    {
        if ($this->used) {
            return false;
        }

        if ($this->expires_at && Carbon::now()->gt($this->expires_at)) {
            $this->update(['used' => true]);
            return false;
        }

        return true;
    }

    public function markAsUsed(int $userId): void
    {
        $this->update([
            'used' => true,
            'used_by_user_id' => $userId,
            'used_at' => now(),
        ]);
    }

    public static function generateUniqueCode(): string
    {
        do {
            $code = 'RENT-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 4)) . '-' . strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 4));
        } while (self::where('code', $code)->exists());

        return $code;
    }
}
