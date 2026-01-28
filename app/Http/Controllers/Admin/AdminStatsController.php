<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
public function index()
{

    $fuelStats = Car::select('fuel_type', DB::raw('count(*) as total'))
        ->groupBy('fuel_type')
        ->get();

    $cityStats = Car::join('rental_points', 'cars.rental_point_id', '=', 'rental_points.id')
        ->select('rental_points.city', DB::raw('count(*) as total'))
        ->groupBy('rental_points.city')
        ->get();

    $carsByType = Car::select('type', DB::raw('count(*) as total'))->groupBy('type')->get();
    $avgPriceByType = Car::select('type', DB::raw('round(avg(price_per_day), 2) as avg_price'))->groupBy('type')->get();

    return response()->json([
        'by_type' => $carsByType,
        'avg_prices' => $avgPriceByType,
        'fuel_stats' => $fuelStats,
        'city_stats' => $cityStats,
        'general' => [
            'total_cars' => Car::count(),
            'available_cars' => Car::where('status', 'available')->count(),
            'total_value' => Car::sum('price_per_day'),
            'avg_year' => round(Car::avg('year'), 0)
        ]
    ]);
}
}
