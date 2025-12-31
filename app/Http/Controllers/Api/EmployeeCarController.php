<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmployeeCarController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        if (!$user->rental_point_id) {
            return response()->json(['message' => 'Nie jesteś przypisany do żadnego punktu.'], 403);
        }

        $cars = Car::where('rental_point_id', $user->rental_point_id)
                    ->orderBy('created_at', 'desc')
                    ->get();

        return response()->json($cars);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user->rental_point_id) {
            return response()->json(['message' => 'Brak przypisanego punktu.'], 403);
        }

        $validated = $request->validate([
            'brand' => 'required|string',
            'model' => 'required|string',
            'registration_number' => 'required|string|unique:cars',
            'price_per_day' => 'required|numeric',
        ]);

        $car = Car::create(array_merge($validated, [
            'rental_point_id' => $user->rental_point_id,
            'status' => 'available'
        ]));

        return response()->json($car, 201);
    }

    public function destroy($id)
    {
        $user = Auth::user();
        $car = Car::where('id', $id)
                  ->where('rental_point_id', $user->rental_point_id)
                  ->firstOrFail();

        $car->delete();
        return response()->json(['message' => 'Usunięto pojazd']);
    }

    public function changeStatus(Request $request, $id)
    {
        $user = \Illuminate\Support\Facades\Auth::user();
        $car = \App\Models\Car::where('id', $id)
        ->where('rental_point_id', $user->rental_point_id)
        ->firstOrFail();

        $request->validate([
        'status' => 'required|in:available,rented,maintenance'
        ]);

        $car->status = $request->status;
        $car->save();

        return response()->json(['message' => 'Status zmieniony', 'car' => $car]);
    }


    public function setPromotion(Request $request, $id)
    {
    $user = \Illuminate\Support\Facades\Auth::user();
    $car = \App\Models\Car::where('id', $id)
        ->where('rental_point_id', $user->rental_point_id)
        ->firstOrFail();


    $price = $request->input('promotion_price');

    if ($price && $price > 0) {
        if ($price >= $car->price_per_day) {
             return response()->json(['message' => 'Cena promocyjna musi być niższa od regularnej!'], 422);
        }
        $car->promotion_price = $price;
        $message = "Promocja ustawiona!";
    } else {
        $car->promotion_price = null;
        $message = "Promocja zakończona.";
    }

    $car->save();

    return response()->json(['message' => $message, 'car' => $car]);
    }
}
