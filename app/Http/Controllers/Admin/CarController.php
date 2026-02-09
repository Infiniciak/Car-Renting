<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;

class CarController extends Controller
{
    public function index(): JsonResponse
    {
        // Zwracamy auta z relacją punktu i wirtualnymi polami
        return response()->json(Car::with('rentalPoint')->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:'.(date('Y') + 1),
            'registration_number' => 'required|string|unique:cars,registration_number',
            'type' => 'required|string',
            'fuel_type' => 'required|string',
            'transmission' => 'required|string',
            'seats' => 'required|integer|min:1|max:9',
            'price_per_day' => 'required|numeric|min:1',
            'status' => 'required|string',
            'rental_point_id' => 'nullable|exists:rental_points,id',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072',
            // POPRAWKA: Zmiana walidacji boolean dla multipart/form-data
            'has_gps' => 'required|in:0,1,true,false',
            'has_air_conditioning' => 'required|in:0,1,true,false',
        ]);

        // KONWERSJA stringów na prawdziwe boolean
        $data['has_gps'] = filter_var($data['has_gps'], FILTER_VALIDATE_BOOLEAN);
        $data['has_air_conditioning'] = filter_var($data['has_air_conditioning'], FILTER_VALIDATE_BOOLEAN);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('cars', 'public');
        }

        // Model Car wywoła calculateInsurances() dzięki zdarzeniu saving w booted()
        $car = Car::create($data);

        return response()->json([
            'message' => 'Samochód dodany i ubezpieczenie wyliczone!',
            'car' => $car->load('rentalPoint')
        ], 201);
    }

    public function update(Request $request, Car $car): JsonResponse
    {
        $data = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:'.(date('Y') + 1),
            'registration_number' => 'required|string|unique:cars,registration_number,' . $car->id,
            'type' => 'required|string',
            'fuel_type' => 'required|string',
            'transmission' => 'required|string',
            'seats' => 'required|integer|min:1|max:9',
            'price_per_day' => 'required|numeric|min:1',
            'status' => 'required|string',
            'rental_point_id' => 'nullable|exists:rental_points,id',
            'description' => 'nullable|string',
            // POPRAWKA: Zmiana walidacji boolean dla multipart/form-data
            'has_gps' => 'required|in:0,1,true,false',
            'has_air_conditioning' => 'required|in:0,1,true,false',
        ]);

        // KONWERSJA stringów na prawdziwe boolean
        $data['has_gps'] = filter_var($data['has_gps'], FILTER_VALIDATE_BOOLEAN);
        $data['has_air_conditioning'] = filter_var($data['has_air_conditioning'], FILTER_VALIDATE_BOOLEAN);

        if ($request->input('remove_image') == '1') {
            if ($car->image_path) {
                Storage::disk('public')->delete($car->image_path);
            }
            $car->image_path = null;
        }

        if ($request->hasFile('image')) {
            if ($car->image_path) {
                Storage::disk('public')->delete($car->image_path);
            }
            $car->image_path = $request->file('image')->store('cars', 'public');
        }

        // Update również wyzwoli przeliczenie ubezpieczeń w modelu
        $car->update($data);

        return response()->json([
            'message' => 'Zaktualizowano dane i przeliczono stawki ubezpieczeń!',
            'car' => $car->load('rentalPoint')
        ]);
    }

    public function destroy(Car $car): JsonResponse
    {
        if ($car->image_path) {
            Storage::disk('public')->delete($car->image_path);
        }
        $car->delete();
        return response()->json(['message' => 'Samochód został usunięty']);
    }
}
