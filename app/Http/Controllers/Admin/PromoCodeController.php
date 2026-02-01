<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;

class PromoCodeController extends Controller
{
    public function index()
    {
        $codes = PromoCode::with(['createdByAdmin', 'usedByUser'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($codes);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1|max:10000',
            'expires_at' => 'nullable|date|after:now',
            'description' => 'nullable|string|max:255',
        ]);

        $code = PromoCode::create([
            'code' => PromoCode::generateUniqueCode(),
            'amount' => $validated['amount'],
            'expires_at' => $validated['expires_at'] ?? null,
            'description' => $validated['description'] ?? null,
            'created_by_admin_id' => auth()->id(),
            'used' => false,
        ]);

        return response()->json([
            'message' => 'Kod wygenerowany pomyślnie',
            'code' => $code
        ], 201);
    }

    public function destroy(PromoCode $promoCode)
    {
        if ($promoCode->used) {
            return response()->json([
                'message' => 'Nie można usunąć kodu który został już użyty'
            ], 422);
        }

        $promoCode->delete();

        return response()->json([
            'message' => 'Kod usunięty'
        ]);
    }
}
