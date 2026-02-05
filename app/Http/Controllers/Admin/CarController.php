<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Car;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

#[OA\Tag(name: "Admin Cars", description: "Zarządzanie flotą pojazdów (Admin)")]
class CarController extends Controller
{
    #[OA\Get(
        path: "/admin/cars",
        operationId: "getAdminCarsList",
        summary: "Pobierz pełną listę aut",
        security: [["bearerAuth" => []]],
        tags: ["Admin Cars"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista wszystkich samochodów",
                content: new OA\JsonContent(type: "array", items: new OA\Items(ref: "#/components/schemas/Car"))
            )
        ]
    )]
    public function index(): JsonResponse
    {
        return response()->json(Car::with('rentalPoint')->orderBy('created_at', 'desc')->get());
    }

    #[OA\Post(
        path: "/admin/cars",
        operationId: "storeCar",
        summary: "Dodaj nowy pojazd",
        security: [["bearerAuth" => []]],
        tags: ["Admin Cars"],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    required: ["brand", "model", "year", "registration_number", "price_per_day", "type", "fuel_type", "transmission"],
                    properties: [
                        new OA\Property(property: "brand", type: "string", example: "Audi"),
                        new OA\Property(property: "model", type: "string", example: "A6"),
                        new OA\Property(property: "year", type: "integer", example: 2024),
                        new OA\Property(property: "registration_number", type: "string", example: "KR12345"),
                        new OA\Property(property: "type", type: "string", example: "sedan"),
                        new OA\Property(property: "fuel_type", type: "string", example: "petrol"),
                        new OA\Property(property: "transmission", type: "string", example: "automatic"),
                        new OA\Property(property: "seats", type: "integer", example: 5),
                        new OA\Property(property: "price_per_day", type: "number", format: "float", example: 299.99),
                        new OA\Property(property: "status", type: "string", example: "available"),
                        new OA\Property(property: "rental_point_id", type: "integer", example: 1),
                        new OA\Property(property: "has_gps", type: "boolean", example: true),
                        new OA\Property(property: "has_air_conditioning", type: "boolean", example: true),
                        new OA\Property(property: "image", type: "string", format: "binary", description: "Plik obrazu")
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Auto dodane"),
            new OA\Response(response: 422, description: "Błąd walidacji")
        ]
    )]
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:'.(date('Y') + 1),
            'registration_number' => 'required|string|unique:cars,registration_number',
            'type' => 'required|string',
            'fuel_type' => 'required|string',
            'transmission' => 'required|string',
            'seats' => 'required|integer|min:1|max:9',
            'price_per_day' => 'required|numeric|min:1',
            'status' => 'required|string',
            'rental_point_id' => 'nullable|exists:rental_points,id',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072',
            'has_gps' => 'required|boolean',
            'has_air_conditioning' => 'required|boolean',
        ]);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('cars', 'public');
        }

        $car = Car::create($data);

        return response()->json([
            'message' => 'Samochód dodany i ubezpieczenie wyliczone!',
            'car' => $car->load('rentalPoint')
        ], 201);
    }

    #[OA\Post(
        path: "/admin/cars/{id}",
        operationId: "updateCar",
        summary: "Aktualizuj pojazd (Multipart)",
        description: "Używamy POST z _method=PUT dla obsługi plików",
        security: [["bearerAuth" => []]],
        tags: ["Admin Cars"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: "multipart/form-data",
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: "_method", type: "string", example: "PUT"),
                        new OA\Property(property: "brand", type: "string"),
                        new OA\Property(property: "model", type: "string"),
                        new OA\Property(property: "remove_image", type: "string", example: "1")
                    ]
                )
            )
        ),
        responses: [new OA\Response(response: 200, description: "Zaktualizowano")]
    )]
    public function update(Request $request, Car $car): JsonResponse
    {
        $data = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'year' => 'required|integer|min:1900|max:'.(date('Y') + 1),
            'registration_number' => 'required|string|unique:cars,registration_number,' . $car->id,
            'type' => 'required|string',
            'fuel_type' => 'required|string',
            'transmission' => 'required|string',
            'seats' => 'required|integer|min:1|max:9',
            'price_per_day' => 'required|numeric|min:1',
            'status' => 'required|string',
            'rental_point_id' => 'nullable|exists:rental_points,id',
            'has_gps' => 'required|boolean',
            'has_air_conditioning' => 'required|boolean',
            'description' => 'nullable|string'
        ]);

        if ($request->input('remove_image') == '1') {
            if ($car->image_path) {
                Storage::disk('public')->delete($car->image_path);
            }
            $car->image_path = null;
        }

        if ($request->hasFile('image')) {
            if ($car->image_path) {
                Storage::disk('public')->delete($car->image_path);
            }
            $car->image_path = $request->file('image')->store('cars', 'public');
        }

        $car->update($data);

        return response()->json([
            'message' => 'Zaktualizowano dane i przeliczono stawki ubezpieczeń!',
            'car' => $car->load('rentalPoint')
        ]);
    }

    #[OA\Delete(
        path: "/admin/cars/{id}",
        operationId: "deleteCar",
        summary: "Usuń pojazd",
        security: [["bearerAuth" => []]],
        tags: ["Admin Cars"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer"))],
        responses: [new OA\Response(response: 200, description: "Usunięto")]
    )]
    public function destroy(Car $car): JsonResponse
    {
        if ($car->image_path) {
            Storage::disk('public')->delete($car->image_path);
        }
        $car->delete();
        return response()->json(['message' => 'Samochód został usunięty']);
    }
}
