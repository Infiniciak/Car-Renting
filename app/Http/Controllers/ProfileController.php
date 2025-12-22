<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    // Widok profilu (Zadanie: zarządzanie swoimi danymi)
    public function show(Request $request) {
        return response()->json($request->user());
    }

    // Aktualizacja danych
    public function update(Request $request) {
        $user = $request->user();
        $data = $request->validate([
            'name' => 'string|max:255',
            'password' => 'nullable|min:8|confirmed',
        ]);

        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        return response()->json(['message' => 'Dane zaktualizowane', 'user' => $user]);
    }
}