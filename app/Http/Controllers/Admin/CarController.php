<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;

class CarController extends Controller
{
    public function index()
    {
        return response()->json(Car::with('rentalPoint')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:'.(date('Y') + 1),
            'registration_number' => 'required|string|unique:cars',
            'type' => 'required|string',
            'fuel_type' => 'required|string',
            'transmission' => 'required|string',
            'seats' => 'required|integer|min:1',
            'price_per_day' => 'required|numeric|min:0',
            'insurance_per_day' => 'required|numeric|min:0',
            'status' => 'required|string',
            'rental_point_id' => 'nullable|exists:rental_points,id',
            'description' => 'nullable|string',
            'has_gps' => 'boolean',
            'has_air_conditioning' => 'boolean',
            'discount_percentage' => 'nullable|numeric|between:0,100',
        ]);

        $car = Car::create($data);

        return response()->json(['message' => 'Samochód dodany!', 'car' => $car->load('rentalPoint')], 201);
    }

    public function update(Request $request, Car $car)
    {
        $data = $request->validate([
            'brand' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|integer',
            'registration_number' => 'required|string|unique:cars,registration_number,'.$car->id,
            'price_per_day' => 'required|numeric',
            'rental_point_id' => 'nullable|exists:rental_points,id',
            'status' => 'required|string',
            'has_gps' => 'boolean',
            'has_air_conditioning' => 'boolean',
        ]);

        $car->update($data);

        return response()->json(['message' => 'Zaktualizowano!', 'car' => $car->load('rentalPoint')]);
    }

    public function destroy(Car $car)
    {
        $car->delete();
        return response()->json(['message' => 'Usunięto pomyślnie']);
    }
}
