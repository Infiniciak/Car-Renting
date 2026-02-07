<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\Rental;
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

    public function getRevenueStats()
    {
        $totalRevenue = Rental::whereIn('status', ['completed', 'active', 'early_return'])
            ->sum('total_price');

        $totalRefunds = Rental::whereIn('status', ['cancelled', 'early_return'])
            ->sum('refund_amount');

        $netRevenue = $totalRevenue - $totalRefunds;

        $activeRentalsValue = Rental::where('status', 'active')
            ->sum('total_price');

        $reservedRentalsValue = Rental::where('status', 'reserved')
            ->sum('total_price');

        $avgRentalValue = Rental::whereIn('status', ['completed', 'active', 'early_return'])
            ->avg('total_price');

        $totalRentals = Rental::count();
        $completedRentals = Rental::where('status', 'completed')->count();
        $activeRentals = Rental::where('status', 'active')->count();
        $cancelledRentals = Rental::where('status', 'cancelled')->count();

        return response()->json([
            'total_revenue' => round($totalRevenue, 2),
            'net_revenue' => round($netRevenue, 2),
            'total_refunds' => round($totalRefunds, 2),
            'active_rentals_value' => round($activeRentalsValue, 2),
            'reserved_rentals_value' => round($reservedRentalsValue, 2),
            'avg_rental_value' => round($avgRentalValue, 2),
            'total_rentals' => $totalRentals,
            'completed_rentals' => $completedRentals,
            'active_rentals' => $activeRentals,
            'cancelled_rentals' => $cancelledRentals,
        ]);
    }

   public function getRevenueByMonth()
    {
        $rentals = Rental::whereIn('status', ['completed', 'active', 'early_return'])
            ->whereNotNull('start_date')
            ->orderBy('start_date', 'asc')
            ->get();

        $monthNames = [
            '01' => 'Sty', '02' => 'Lut', '03' => 'Mar', '04' => 'Kwi',
            '05' => 'Maj', '06' => 'Cze', '07' => 'Lip', '08' => 'Sie',
            '09' => 'Wrz', '10' => 'Paź', '11' => 'Lis', '12' => 'Gru'
        ];

        $grouped = [];

        foreach ($rentals as $rental) {
            $date = \Carbon\Carbon::parse($rental->start_date);
            $key = $date->format('Y-m');

            if (!isset($grouped[$key])) {
                $grouped[$key] = [
                    'month' => $monthNames[$date->format('m')] . ' ' . $date->format('Y'),
                    'revenue' => 0,
                    'rentals_count' => 0
                ];
            }

            $grouped[$key]['revenue'] += $rental->total_price;
            $grouped[$key]['rentals_count']++;
        }

        ksort($grouped);

        $result = array_map(function($item) {
            return [
                'month' => $item['month'],
                'revenue' => round($item['revenue'], 2),
                'rentals_count' => $item['rentals_count']
            ];
        }, $grouped);

        return response()->json(array_values($result));
    }

    public function getRevenueByPoint()
    {
        $revenue = Rental::join('rental_points', 'rentals.rental_point_start_id', '=', 'rental_points.id')
            ->select(
                'rental_points.name',
                'rental_points.city',
                DB::raw('round(sum(rentals.total_price), 2) as revenue'),
                DB::raw('count(rentals.id) as rentals_count')
            )
            ->whereIn('rentals.status', ['completed', 'active', 'early_return'])
            ->groupBy('rental_points.id', 'rental_points.name', 'rental_points.city')
            ->orderBy('revenue', 'desc')
            ->limit(10)
            ->get();

        return response()->json($revenue);
    }

    public function getTopUsers()
    {
        $users = Rental::join('users', 'rentals.user_id', '=', 'users.id')
            ->select(
                'users.id',
                'users.name',
                'users.email',
                DB::raw('round(sum(rentals.total_price), 2) as total_spent'),
                DB::raw('count(rentals.id) as rentals_count')
            )
            ->whereIn('rentals.status', ['completed', 'active', 'early_return'])
            ->groupBy('users.id', 'users.name', 'users.email')
            ->orderBy('total_spent', 'desc')
            ->limit(10)
            ->get();

        return response()->json($users);
    }

    public function getDiscountStats()
    {
        $totalDiscounts = Rental::whereIn('status', ['completed', 'active', 'early_return'])
            ->sum('discount_amount');

        $rentalsWithDiscount = Rental::whereIn('status', ['completed', 'active', 'early_return'])
            ->where('discount_amount', '>', 0)
            ->count();

        $avgDiscount = Rental::whereIn('status', ['completed', 'active', 'early_return'])
            ->where('discount_amount', '>', 0)
            ->avg('discount_amount');

        return response()->json([
            'total_discounts_given' => round($totalDiscounts, 2),
            'rentals_with_discount' => $rentalsWithDiscount,
            'avg_discount' => round($avgDiscount, 2),
        ]);
    }
}
