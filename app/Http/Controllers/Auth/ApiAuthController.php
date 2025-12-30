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

    
    // Symulacja "zapomnienia" hasła
    public function forgotPassword(Request $request) {
    $request->validate([
        'email' => 'required|email|exists:users,email' // Walidacja: email musi istnieć w bazie
    ]);

    $user = User::where('email', $request->email)->first();
    
    // Generujemy losowy kod i zapisujemy go w bazie dla tego usera
    $code = (string)rand(100000, 999999);
    $user->reset_code = $code;
    $user->save();

    return response()->json([
        'message' => 'Kod wygenerowany.',
        'code' => $code // Tylko do Twoich testów, normalnie byłoby w mailu
    ]);
    }

// 2. Reset hasła
public function resetPassword(Request $request) {
    $request->validate([
        'email' => 'required|email|exists:users,email',
        'code' => 'required|string|min:6|max:6', // Kod musi mieć 6 znaków
        'password' => 'required|string|min:8|confirmed', // Hasło min 8 znaków i musi być powtórzone
    ]);

    $user = User::where('email', $request->email)->first();

    // WALIDACJA KODU: Sprawdzamy, czy kod z bazy zgadza się z tym od użytkownika
    if (!$user->reset_code || $user->reset_code !== $request->code) {
        return response()->json(['message' => 'Błędny kod weryfikacyjny.'], 422);
    }

    // Zmiana hasła i CZYSZCZENIE kodu, żeby nie można go było użyć drugi raz!
    $user->password = Hash::make($request->password);
    $user->reset_code = null; 
    $user->save();

    return response()->json(['message' => 'Hasło zmienione pomyślnie.']);
    }
}