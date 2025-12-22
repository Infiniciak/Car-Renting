<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // DODAJ TO
use App\Enums\UserRole; // DODAJ TO (zakładając, że tak nazywa się Twój enum)

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // DODAJ HasApiTokens tutaj

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'balance',
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
            'role' => UserRole::class, // Mapowanie roli na Enum
        ];
    }
}