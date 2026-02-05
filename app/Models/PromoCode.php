<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;
use OpenApi\Attributes as OA;

#[OA\Schema(
    title: "PromoCode",
    description: "Model reprezentujący kod promocyjny doładowujący saldo użytkownika",
    type: "object"
)]
class PromoCode extends Model
{
    use HasFactory;

    #[OA\Property(property: "id", type: "integer", example: 1)]
    #[OA\Property(property: "code", type: "string", example: "RENT-A1B2-C3D4")]
    #[OA\Property(property: "amount", type: "number", format: "float", example: 50.00)]
    #[OA\Property(property: "used", type: "boolean", example: false)]
    #[OA\Property(property: "used_by_user_id", type: "integer", nullable: true, example: 5)]
    #[OA\Property(property: "used_at", type: "string", format: "date-time", nullable: true)]
    #[OA\Property(property: "created_by_admin_id", type: "integer", example: 1)]
    #[OA\Property(property: "expires_at", type: "string", format: "date-time", nullable: true)]
    #[OA\Property(property: "description", type: "string", nullable: true, example: "Bonus lojalnościowy")]
    #[OA\Property(property: "status", type: "string", enum: ["active", "used", "expired"], example: "active")]
    #[OA\Property(property: "created_at", type: "string", format: "date-time")]
    #[OA\Property(property: "updated_at", type: "string", format: "date-time")]

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
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    protected $appends = ['status'];

    public function getStatusAttribute(): string
    {
        if ($this->used) {
            return 'used';
        }

        if ($this->expires_at && now()->gt($this->expires_at)) {
            return 'expired';
        }

        return 'active';
    }

    public function createdByAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_admin_id');
    }

    public function usedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'used_by_user_id');
    }

    public function sentToUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'used_by_user_id');
    }

    public function isValid(): bool
    {
        if ($this->used) {
            return false;
        }

        if ($this->expires_at && Carbon::now()->gt($this->expires_at)) {
            return false;
        }

        return true;
    }

    public function canBeUsedBy(int $userId): bool
    {
        return $this->used_by_user_id == $userId && !$this->used;
    }

    public function markAsUsed(): void
    {
        $this->update([
            'used' => true,
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
