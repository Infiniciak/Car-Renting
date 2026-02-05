<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use App\Models\Rental;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Admin Stats", description: "Statystyki i raporty dla panelu administratora")]
class AdminStatsController extends Controller
{
    #[OA\Get(
        path: "/admin/stats",
        operationId: "getAdminStatsIndex",
        summary: "Pobierz ogólne statystyki floty",
        security: [["bearerAuth" => []]],
        tags: ["Admin Stats"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Zwraca statystyki paliwa, miast, typów aut i dane ogólne",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "by_type", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "avg_prices", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "fuel_stats", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "city_stats", type: "array", items: new OA\Items(type: "object")),
                        new OA\Property(property: "general", type: "object")
                    ]
                )
            )
        ]
    )]
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

    #[OA\Get(
        path: "/admin/stats/revenue",
        operationId: "getAdminRevenueStats",
        summary: "Pobierz statystyki przychodów",
        security: [["bearerAuth" => []]],
        tags: ["Admin Stats"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Dane o przychodach netto, brutto i zwrotach",
                content: new OA\JsonContent(type: "object")
            )
        ]
    )]
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

    #[OA\Get(
        path: "/admin/stats/revenue-monthly",
        operationId: "getAdminRevenueMonthly",
        summary: "Przychody w rozbiciu na miesiące",
        security: [["bearerAuth" => []]],
        tags: ["Admin Stats"],
        responses: [
            new OA\Response(response: 200, description: "Wykres miesięczny")
        ]
    )]
    public function getRevenueByMonth()
    {
        $rentals = Rental::whereIn('status', ['completed', 'active', 'early_return'])
            ->where('created_at', '>=', now()->subMonths(12))
            ->get()
            ->groupBy(function($rental) {
                return $rental->created_at->format('Y-m');
            })
            ->map(function($group, $key) {
                $monthNames = [
                    '01' => 'Sty', '02' => 'Lut', '03' => 'Mar', '04' => 'Kwi',
                    '05' => 'Maj', '06' => 'Cze', '07' => 'Lip', '08' => 'Sie',
                    '09' => 'Wrz', '10' => 'Paź', '11' => 'Lis', '12' => 'Gru'
                ];

                $parts = explode('-', $key);
                $monthName = $monthNames[$parts[1]] ?? $parts[1];

                return [
                    'month' => $monthName . ' ' . $parts[0],
                    'revenue' => round($group->sum('total_price'), 2),
                    'rentals_count' => $group->count(),
                ];
            })
            ->values();

        return response()->json($rentals);
    }

    #[OA\Get(
        path: "/admin/stats/revenue-by-point",
        operationId: "getAdminRevenueByPoint",
        summary: "Ranking punktów pod kątem przychodów",
        security: [["bearerAuth" => []]],
        tags: ["Admin Stats"],
        responses: [
            new OA\Response(response: 200, description: "Lista punktów")
        ]
    )]
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

    #[OA\Get(
        path: "/admin/stats/top-users",
        operationId: "getAdminTopUsers",
        summary: "Najlepsi klienci",
        security: [["bearerAuth" => []]],
        tags: ["Admin Stats"],
        responses: [
            new OA\Response(response: 200, description: "Lista użytkowników")
        ]
    )]
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

    #[OA\Get(
        path: "/admin/stats/discounts",
        operationId: "getAdminDiscountStats",
        summary: "Statystyki udzielonych rabatów",
        security: [["bearerAuth" => []]],
        tags: ["Admin Stats"],
        responses: [
            new OA\Response(response: 200, description: "Dane o zniżkach")
        ]
    )]
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
