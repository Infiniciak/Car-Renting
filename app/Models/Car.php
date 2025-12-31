<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Car extends Model
{

    use HasFactory;
   protected $fillable = [
        'rental_point_id',
        'brand',
        'model',
        'registration_number',
        'price_per_day',
        'promotion_price',
        'status',
        'image_path'
   ];

   public function rentalPoint()
    {
        return $this->belongsTo(RentalPoint::class);
    }

}
