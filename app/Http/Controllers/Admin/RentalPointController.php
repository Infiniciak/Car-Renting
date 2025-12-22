<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RentalPoint;
use Illuminate\Http\Request;

class RentalPointController extends Controller
{
    public function index()
    {
        return response()->json(RentalPoint::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'has_charging_station' => 'boolean',
        ]);

        $point = RentalPoint::create($data);

        return response()->json(['message' => 'Punkt dodany', 'point' => $point], 201);
    }

    public function update(Request $request, RentalPoint $rentalPoint)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'postal_code' => 'required|string|max:20',
            'has_charging_station' => 'boolean',
        ]);

        $rentalPoint->update($data);

        return response()->json(['message' => 'Punkt zaktualizowany', 'point' => $rentalPoint]);
    }

    public function destroy(RentalPoint $rentalPoint)
    {
        $rentalPoint->delete();
        return response()->json(['message' => 'Punkt usunięty']);
    }
}
