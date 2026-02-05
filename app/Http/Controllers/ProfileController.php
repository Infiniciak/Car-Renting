<?php

namespace App\Http\Controllers;

use App\Models\PromoCode;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'password' => 'nullable|min:8',
        ]);

        if (!empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
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

        $user = $request->user();

        if ($promoCode->used_by_user_id && $promoCode->used_by_user_id != $user->id) {
            return response()->json(['message' => 'Ten kod nie jest dla Ciebie'], 403);
        }

        if (!$promoCode->isValid()) {
            if ($promoCode->used) {
                return response()->json(['message' => 'Ten kod został już wykorzystany'], 422);
            }
            return response()->json(['message' => 'Kod wygasł'], 422);
        }

        return DB::transaction(function () use ($promoCode, $user) {
            $user->addBalance($promoCode->amount);

            $promoCode->markAsUsed();

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
        });
    }

    public function getUserCodes(Request $request)
    {
        $user = $request->user();

        $codes = PromoCode::where('used_by_user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($codes);
    }

    public function usePromoCode(Request $request, $codeId)
    {
        $user = $request->user();
        $promoCode = PromoCode::findOrFail($codeId);

        if ($promoCode->used_by_user_id != $user->id) {
            return response()->json(['message' => 'Ten kod nie jest dla Ciebie'], 403);
        }

        if (!$promoCode->isValid()) {
            if ($promoCode->used) {
                return response()->json(['message' => 'Ten kod został już wykorzystany'], 422);
            }
            return response()->json(['message' => 'Kod wygasł'], 422);
        }

        return DB::transaction(function () use ($promoCode, $user) {
            $user->addBalance($promoCode->amount);
            $promoCode->markAsUsed();

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
        });
    }

    public function getMyCodes(Request $request)
    {
        $user = $request->user();

        $codes = PromoCode::where('used_by_user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($codes);
    }

    public function useMyCode(Request $request, $codeId)
    {
        $user = $request->user();
        $promoCode = PromoCode::findOrFail($codeId);

        if ($promoCode->used_by_user_id != $user->id) {
            return response()->json(['message' => 'Ten kod nie jest dla Ciebie'], 403);
        }

        if (!$promoCode->isValid()) {
            return response()->json(['message' => 'Kod już został użyty lub wygasł'], 422);
        }

        return DB::transaction(function () use ($promoCode, $user) {
            $user->addBalance($promoCode->amount);
            $promoCode->markAsUsed();

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
        });
    }
}
