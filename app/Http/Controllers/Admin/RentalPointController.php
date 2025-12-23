<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RentalPoint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
        $path = $request->file('image')->store('rental_points', 'public');
        $data['image_path'] = $path;
    }

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
            'has_charging_station' => 'sometimes|boolean',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $data = $request->except(['image']);

        if ($request->hasFile('image')) {
            if ($rentalPoint->image_path) {
                Storage::disk('public')->delete($rentalPoint->image_path);
            }
            $path = $request->file('image')->store('rental_points', 'public');
            $data['image_path'] = $path;
        }

        $rentalPoint->update($data);

        return response()->json(['message' => 'Punkt zaktualizowany', 'point' => $rentalPoint]);
    }

    public function destroy(RentalPoint $rentalPoint)
    {
        if ($rentalPoint->image_path) {
            Storage::disk('public')->delete($rentalPoint->image_path);
        }

        $rentalPoint->delete();
        return response()->json(['message' => 'Punkt usunięty']);
    }
}
