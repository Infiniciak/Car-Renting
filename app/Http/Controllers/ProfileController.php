<?php

namespace App\Http\Controllers;

use App\Models\PromoCode;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "User Profile", description: "Zarządzanie profilem użytkownika i portfelem")]
class ProfileController extends Controller
{
    #[OA\Get(
        path: "/profile",
        operationId: "getUserProfile",
        summary: "Pobierz dane profilu",
        security: [["bearerAuth" => []]],
        tags: ["User Profile"],
        responses: [
            new OA\Response(response: 200, description: "Zwraca dane zalogowanego użytkownika")
        ]
    )]
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    #[OA\Patch(
        path: "/profile",
        operationId: "updateUserProfile",
        summary: "Zaktualizuj dane profilu",
        security: [["bearerAuth" => []]],
        tags: ["User Profile"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "name", type: "string", example: "Jan Kowalski"),
                    new OA\Property(property: "email", type: "string", format: "email", example: "jan@example.com"),
                    new OA\Property(property: "password", type: "string", format: "password", minLength: 8, nullable: true)
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Dane zaktualizowane"),
            new OA\Response(response: 422, description: "Błąd walidacji")
        ]
    )]
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

    #[OA\Post(
        path: "/profile/redeem-code",
        operationId: "redeemPromoCode",
        summary: "Zrealizuj kod promocyjny (wpisywany ręcznie)",
        security: [["bearerAuth" => []]],
        tags: ["User Profile"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["code"],
                properties: [
                    new OA\Property(property: "code", type: "string", example: "BONUS2024")
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Konto doładowane"),
            new OA\Response(response: 404, description: "Nieprawidłowy kod"),
            new OA\Response(response: 422, description: "Kod wygasł lub użyty")
        ]
    )]
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

    #[OA\Get(
        path: "/profile/codes",
        operationId: "getUserPromoCodes",
        summary: "Lista kodów przypisanych do użytkownika",
        security: [["bearerAuth" => []]],
        tags: ["User Profile"],
        responses: [
            new OA\Response(response: 200, description: "Lista kodów")
        ]
    )]
    public function getUserCodes(Request $request)
    {
        $user = $request->user();

        $codes = PromoCode::where('used_by_user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($codes);
    }

    #[OA\Post(
        path: "/profile/codes/{id}/use",
        operationId: "useAssignedPromoCode",
        summary: "Zrealizuj kod przypisany do konta (przez ID)",
        security: [["bearerAuth" => []]],
        tags: ["User Profile"],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))
        ],
        responses: [
            new OA\Response(response: 200, description: "Konto doładowane"),
            new OA\Response(response: 403, description: "Kod nie należy do użytkownika")
        ]
    )]
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
