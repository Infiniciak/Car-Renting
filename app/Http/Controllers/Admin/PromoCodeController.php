<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PromoCode;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Promo Codes", description: "Zarządzanie kodami promocyjnymi przez administratora")]
class PromoCodeController extends Controller
{
    #[OA\Get(
        path: "/admin/promo-codes",
        operationId: "getAdminPromoCodes",
        summary: "Lista wszystkich kodów promocyjnych",
        security: [["bearerAuth" => []]],
        tags: ["Promo Codes"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Paginowana lista kodów wraz z relacjami",
                content: new OA\JsonContent(type: "object")
            )
        ]
    )]
    public function index()
    {
        $codes = PromoCode::with(['createdByAdmin', 'usedByUser', 'sentToUser'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($codes);
    }

    #[OA\Post(
        path: "/admin/promo-codes",
        operationId: "storeAdminPromoCode",
        summary: "Generowanie nowego kodu dla użytkownika",
        security: [["bearerAuth" => []]],
        tags: ["Promo Codes"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["user_id", "amount"],
                properties: [
                    new OA\Property(property: "user_id", type: "integer", example: 1, description: "ID użytkownika, do którego trafi kod"),
                    new OA\Property(property: "amount", type: "number", format: "float", minimum: 1, maximum: 10000, example: 50.00),
                    new OA\Property(property: "expires_at", type: "string", format: "date-time", nullable: true, example: "2025-12-31 23:59:59"),
                    new OA\Property(property: "description", type: "string", maxLength: 255, nullable: true, example: "Bonus świąteczny")
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Kod utworzony pomyślnie",
                content: new OA\JsonContent(type: "object")
            ),
            new OA\Response(response: 422, description: "Błąd walidacji")
        ]
    )]
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'amount' => 'required|numeric|min:1|max:10000',
            'expires_at' => 'nullable|date|after:now',
            'description' => 'nullable|string|max:255',
        ]);

        $code = PromoCode::create([
            'code' => PromoCode::generateUniqueCode(),
            'amount' => $validated['amount'],
            'used_by_user_id' => $validated['user_id'],
            'expires_at' => $validated['expires_at'] ?? null,
            'description' => $validated['description'] ?? null,
            'created_by_admin_id' => auth()->id(),
            'used' => false,
            'used_at' => null,
        ]);

        return response()->json([
            'message' => 'Kod wygenerowany i wysłany do użytkownika',
            'code' => $code->load(['sentToUser', 'createdByAdmin'])
        ], 201);
    }

    #[OA\Delete(
        path: "/admin/promo-codes/{id}",
        operationId: "deleteAdminPromoCode",
        summary: "Usuwanie kodu promocyjnego",
        security: [["bearerAuth" => []]],
        tags: ["Promo Codes"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                required: true,
                description: "ID kodu",
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(response: 200, description: "Kod usunięty"),
            new OA\Response(response: 422, description: "Nie można usunąć użytego kodu"),
            new OA\Response(response: 404, description: "Kod nie istnieje")
        ]
    )]
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
