<?php

namespace App\Http\Controllers\Api;

use App\Models\Car;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PublicCarController extends Controller
{
    public function index(Request $request)
    {
        try {
            // Dodajemy relację punktu, ubezpieczenia standardowe i dodatkowe dołączą się same przez $appends w modelu
            $query = Car::with('rentalPoint')->where('status', 'available');

            // ... (filtrowanie bez zmian) ...
            if ($request->filled('search')) {
                $query->where(function($q) use ($request) {
                    $q->where('brand', 'ilike', '%' . $request->search . '%')
                      ->orWhere('model', 'ilike', '%' . $request->search . '%');
                });
            }

            if ($request->filled('max_price')) {
                $query->where('price_per_day', '<=', $request->max_price);
            }

            if ($request->filled('fuel_type')) {
                $query->where('fuel_type', $request->fuel_type);
            }

            if ($request->filled('rental_point_id')) {
                $query->where('rental_point_id', $request->rental_point_id);
            }

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->filled('transmission')) {
                $query->where('transmission', $request->transmission);
            }

            if ($request->filled('seats')) {
                $query->where('seats', '>=', $request->seats);
            }

            if ($request->boolean('has_gps')) {
                $query->where('has_gps', true);
            }

            if ($request->boolean('has_air_conditioning')) {
                $query->where('has_air_conditioning', true);
            }

            // Paginacja - każdy zwrócony model będzie miał insurance_per_day i extra_insurance_per_day
            return response()->json($query->paginate(9));

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        // Widok pojedynczego auta też otrzyma komplet wyliczonych stawek
        $car = Car::with('rentalPoint')->findOrFail($id);
        return response()->json($car);
    }
}
