<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RentalPoint;
use Illuminate\Http\Request;

class PublicRentalPointController extends Controller
{
    public function index(Request $request)
    {
        $query = RentalPoint::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('city', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('city')) {
            $query->where('city', $request->input('city'));
        }

        if ($request->boolean('has_charger')) {
            $query->where('has_charging_station', true);
        }

        $sortColumn = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');

        $allowedSorts = ['name', 'city', 'created_at', 'id'];

        if (in_array($sortColumn, $allowedSorts)) {
            $query->orderBy($sortColumn, $sortOrder);
        }

        $perPage = $request->input('per_page', 9);

        return response()->json($query->paginate($perPage));
    }

    public function show($id)
    {
        $point = RentalPoint::findOrFail($id);
        return response()->json($point);
    }
}
