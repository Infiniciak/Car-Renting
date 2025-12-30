<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
class UserManagementController extends Controller
{
    public function index() {
    // Zwracamy wszystkich użytkowników, aby React mógł nimi zarządzać (SFP na froncie)
    return response()->json(User::all());
}

public function update(Request $request, User $user)
{
    // Debugowanie: sprawdź czy $user->id w ogóle istnieje
    if (!$user->id) {
        return response()->json(['message' => 'Nie znaleziono użytkownika'], 404);
    }

    $fields = $request->validate([
        'name' => 'required|string|max:255',
        // 'unique:tabela,kolumna,ID_do_zignorowania'
        'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        'role' => 'required|string|in:admin,employee,user',
        'password' => 'nullable|string|min:8',
    ]);

    $user->name = $fields['name'];
    $user->email = $fields['email'];
    $user->role = $fields['role'];

    if (!empty($fields['password'])) {
        $user->password = \Illuminate\Support\Facades\Hash::make($fields['password']);
    }

    $user->save();

    return response()->json([
        'message' => 'Zaktualizowano pomyślnie',
        'user' => $user
    ]);
}
}