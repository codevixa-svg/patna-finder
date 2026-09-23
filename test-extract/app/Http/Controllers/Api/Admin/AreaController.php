<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function index(Request $request)
    {
        $query = Area::withCount('businesses');

        if ($request->has('search') && $request->search) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $areas = $query->latest()->paginate($request->get('per_page', 50));

        return response()->json($areas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:areas,name',
            'description' => 'nullable|string|max:1000',
            'banner_image' => 'nullable|string|max:500',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_active' => 'boolean',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);

        $area = Area::create($validated);

        return response()->json([
            'message' => 'Area created successfully',
            'area' => $area,
        ], 201);
    }

    public function show($id)
    {
        $area = Area::withCount('businesses')->findOrFail($id);
        return response()->json($area);
    }

    public function update(Request $request, $id)
    {
        $area = Area::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:areas,name,' . $id,
            'description' => 'nullable|string|max:1000',
            'banner_image' => 'nullable|string|max:500',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['name']);
        }

        $area->update($validated);

        return response()->json([
            'message' => 'Area updated successfully',
            'area' => $area->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $area = Area::findOrFail($id);

        if ($area->businesses()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete area with existing businesses. Remove or reassign them first.',
            ], 422);
        }

        $area->delete();

        return response()->json([
            'message' => 'Area deleted successfully',
        ]);
    }

    public function toggleActive($id)
    {
        $area = Area::findOrFail($id);
        $area->update(['is_active' => !$area->is_active]);

        return response()->json([
            'message' => $area->is_active ? 'Area activated' : 'Area deactivated',
            'area' => $area,
        ]);
    }
}
