<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Enums\UserRole;

class UserManagementController extends Controller
{
    public function index()
    {
        return response()->json(User::with('rentalPoint')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string',
            'rental_point_id' => 'nullable|exists:rental_points,id'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'rental_point_id' => $validated['rental_point_id'],
        ]);

        return response()->json(['message' => 'Użytkownik stworzony!', 'user' => $user->load('rentalPoint')], 201);
    }

    public function update(Request $request, User $user)
    {
        $user->update($request->only(['name', 'email', 'role', 'rental_point_id']));
        
        if ($request->password) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        return response()->json(['message' => 'Zaktualizowano!', 'user' => $user->load('rentalPoint')]);
    }

    public function destroy(User $user)
    {
        if (auth()->id() === $user->id) {
            return response()->json(['message' => 'Nie możesz usunąć samego siebie!'], 403);
        }
        $user->delete();
        return response()->json(['message' => 'Usunięto pomyślnie']);
    }
}