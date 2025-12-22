<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    // Widok profilu
    public function show(Request $request) {
        return response()->json($request->user());
    }

    // Aktualizacja danych
    public function update(Request $request) {
        $user = $request->user();
        
        $data = $request->validate([
            'name' => 'required|string|max:255',
            // Sprawdzamy unikalność emaila, ale ignorujemy obecny ID użytkownika
            'email' => [
                'required', 
                'email', 
                'max:255', 
                Rule::unique('users')->ignore($user->id)
            ],
            // Hasło opcjonalne, ale jeśli wpisane, to min. 8 znaków
            'password' => 'nullable|min:8', 
        ]);

        // Szyfrujemy hasło tylko jeśli zostało przesłane
        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            // Usuwamy password z tablicy, żeby nie nadpisać go pustym stringiem
            unset($data['password']);
        }

        $user->update($data);
        
        return response()->json([
            'message' => 'Dane zaktualizowane pomyślnie!',
            'user' => $user
        ]);
    }
}