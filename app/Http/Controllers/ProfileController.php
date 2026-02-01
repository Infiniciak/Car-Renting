<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Models\PromoCode;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

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
    public function redeemCode(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string'
        ]);

        $promoCode = PromoCode::where('code', strtoupper($validated['code']))->first();

        if (!$promoCode) {
            return response()->json([
                'message' => 'Nieprawidłowy kod'
            ], 404);
        }

        if (!$promoCode->isValid()) {
            if ($promoCode->used) {
                return response()->json(['message' => 'Ten kod został już wykorzystany'], 422);
            }
            return response()->json(['message' => 'Kod wygasł'], 422);
        }

        $user = $request->user();

        return DB::transaction(function () use ($promoCode, $user) {
            $user->addBalance($promoCode->amount);

            $promoCode->markAsUsed($user->id);

            Transaction::create([
                'user_id' => $user->id,
                'rental_id' => null,
                'rental_point_id' => null,
                'type' => Transaction::TYPE_TOP_UP,
                'amount' => $promoCode->amount,
                'balance_after' => $user->balance,
                'description' => "Doładowanie kodem: {$promoCode->code}",
            ]);

            return response()->json([
                'message' => "Konto doładowane o {$promoCode->amount} PLN!",
                'new_balance' => $user->balance
            ]);
        });;
    }
}
