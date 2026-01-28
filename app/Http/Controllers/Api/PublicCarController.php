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

            $query = Car::with('rentalPoint')->where('status', 'available');

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

            return response()->json($query->paginate(9));

        } catch (\Exception $e) {

            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
    public function show($id)
    {
        $car = Car::with('rentalPoint')->findOrFail($id);
        return response()->json($car);
    }
}
