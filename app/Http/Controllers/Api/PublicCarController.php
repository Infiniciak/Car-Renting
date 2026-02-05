<?php

namespace App\Http\Controllers\Api;

use App\Models\Car;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Public Cars", description: "Operacje na samochodach dostępne dla każdego użytkownika")]
class PublicCarController extends Controller
{
    #[OA\Get(
        path: "/cars",
        operationId: "getPublicCarsList",
        summary: "Pobierz listę dostępnych samochodów",
        description: "Zwraca listę samochodów o statusie 'available' z paginacją oraz wyliczonymi stawkami ubezpieczeń.",
        tags: ["Public Cars"],
        parameters: [
            new OA\Parameter(name: "search", in: "query", description: "Wyszukiwanie po marce lub modelu", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "max_price", in: "query", description: "Maksymalna cena za dobę", required: false, schema: new OA\Schema(type: "number", format: "float")),
            new OA\Parameter(name: "fuel_type", in: "query", description: "Typ paliwa", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "rental_point_id", in: "query", description: "ID punktu odbioru", required: false, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "type", in: "query", description: "Typ nadwozia", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "transmission", in: "query", description: "Rodzaj skrzyni biegów", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "seats", in: "query", description: "Minimalna liczba miejsc", required: false, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "has_gps", in: "query", description: "Czy posiada GPS (true/false)", required: false, schema: new OA\Schema(type: "boolean")),
            new OA\Parameter(name: "has_air_conditioning", in: "query", description: "Czy posiada klimatyzację (true/false)", required: false, schema: new OA\Schema(type: "boolean")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Pomyślnie pobrano listę",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "data",
                            type: "array",
                            items: new OA\Items(ref: "#/components/schemas/Car")
                        ),
                        new OA\Property(property: "current_page", type: "integer", example: 1),
                        new OA\Property(property: "last_page", type: "integer", example: 5),
                        new OA\Property(property: "total", type: "integer", example: 45)
                    ]
                )
            ),
            new OA\Response(response: 500, description: "Błąd serwera")
        ]
    )]
    public function index(Request $request)
    {
        try {
            $query = Car::with('rentalPoint')->where('status', 'available');

            if ($request->filled('search')) {
                $query->where(function($q) use ($request) {
                    $q->where('brand', 'ilike', '%' . $request->search . '%')
                      ->orWhere('model', 'ilike', '%' . $request->search . '%');
                });
            }

            if ($request->filled('max_price')) {
                $query->where('price_per_day', '<=', $request->max_price);
            }

            if ($request->filled('fuel_type')) {
                $query->where('fuel_type', $request->fuel_type);
            }

            if ($request->filled('rental_point_id')) {
                $query->where('rental_point_id', $request->rental_point_id);
            }

            if ($request->filled('type')) {
                $query->where('type', $request->type);
            }

            if ($request->filled('transmission')) {
                $query->where('transmission', $request->transmission);
            }

            if ($request->filled('seats')) {
                $query->where('seats', '>=', $request->seats);
            }

            if ($request->boolean('has_gps')) {
                $query->where('has_gps', true);
            }

            if ($request->boolean('has_air_conditioning')) {
                $query->where('has_air_conditioning', true);
            }

            return response()->json($query->paginate(9));

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    #[OA\Get(
        path: "/cars/{id}",
        operationId: "getPublicCarById",
        summary: "Pobierz szczegóły konkretnego samochodu",
        tags: ["Public Cars"],
        parameters: [
            new OA\Parameter(
                name: "id",
                in: "path",
                description: "ID samochodu",
                required: true,
                schema: new OA\Schema(type: "integer")
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Szczegóły samochodu",
                content: new OA\JsonContent(ref: "#/components/schemas/Car")
            ),
            new OA\Response(response: 404, description: "Nie znaleziono pojazdu")
        ]
    )]
    public function show($id)
    {
        $car = Car::with('rentalPoint')->findOrFail($id);
        return response()->json($car);
    }
}
