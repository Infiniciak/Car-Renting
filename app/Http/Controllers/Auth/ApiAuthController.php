<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class ApiAuthController extends Controller
{
    public function register(Request $request) {
        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|unique:users,email',
            'password' => 'required|string|confirmed'
        ]);

        $user = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => bcrypt($fields['password']),
            'role' => 'user' // domyślna rola
        ]);

        $token = $user->createToken('myapptoken')->plainTextToken;

        return response(['user' => $user, 'token' => $token], 201);
    }

    public function login(Request $request) {
        // Musimy odkomentować walidację, żeby mieć dane w $fields!
        $fields = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string'
        ]);

        // Szukamy usera
        $user = User::where('email', $fields['email'])->first();

        // Sprawdzamy hasło
        if (!$user || !Hash::check($fields['password'], $user->password)) {
            return response()->json(['message' => 'Błędne dane logowania'], 401);
        }

        $token = $user->createToken('myapptoken')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
            'role' => $user->role 
        ], 200);
    }

    public function logout(Request $request) {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Wylogowano']);
    }

    public function forgotPassword(Request $request) {
        $request->validate(['email' => 'required|email']);
        
        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Link do resetu wysłany na email.'])
            : response()->json(['message' => 'Nie udało się wysłać maila.'], 400);
    }
}