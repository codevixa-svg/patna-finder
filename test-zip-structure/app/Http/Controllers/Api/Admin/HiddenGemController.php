<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\HiddenGem;
use Illuminate\Http\Request;

class HiddenGemController extends Controller
{
    public function index(Request $request)
    {
        $query = HiddenGem::with(['category', 'area']);

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $gems = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json($gems);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|integer|exists:categories,id',
            'area_id' => 'required|integer|exists:areas,id',
            'story' => 'required|string',
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'featured_image' => 'nullable|string|max:500',
            'gallery' => 'nullable|array',
            'gallery.*' => 'string',
            'badge' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);

        $gem = HiddenGem::create($validated);

        return response()->json([
            'message' => 'Hidden gem created successfully',
            'gem' => $gem->load(['category', 'area']),
        ], 201);
    }

    public function show($id)
    {
        $gem = HiddenGem::with(['category', 'area'])->findOrFail($id);
        return response()->json($gem);
    }

    public function update(Request $request, $id)
    {
        $gem = HiddenGem::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'category_id' => 'sometimes|integer|exists:categories,id',
            'area_id' => 'sometimes|integer|exists:areas,id',
            'story' => 'sometimes|required|string',
            'address' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'featured_image' => 'nullable|string|max:500',
            'gallery' => 'nullable|array',
            'gallery.*' => 'string',
            'badge' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);
        }

        $gem->update($validated);

        return response()->json([
            'message' => 'Hidden gem updated successfully',
            'gem' => $gem->fresh()->load(['category', 'area']),
        ]);
    }

    public function feature($id)
    {
        $gem = HiddenGem::findOrFail($id);
        $gem->update(['is_featured' => !$gem->is_featured]);

        return response()->json([
            'message' => $gem->is_featured ? 'Hidden gem featured' : 'Hidden gem unfeatured',
            'gem' => $gem,
        ]);
    }

    public function toggleActive($id)
    {
        $gem = HiddenGem::findOrFail($id);
        $gem->update(['is_active' => !$gem->is_active]);

        return response()->json([
            'message' => $gem->is_active ? 'Hidden gem activated' : 'Hidden gem deactivated',
            'gem' => $gem,
        ]);
    }

    public function destroy($id)
    {
        $gem = HiddenGem::findOrFail($id);
        $gem->delete();

        return response()->json([
            'message' => 'Hidden gem deleted successfully',
        ]);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:feature,unfeature,activate,deactivate,delete',
        ]);

        $gems = HiddenGem::whereIn('id', $request->ids);
        $count = $gems->count();

        switch ($request->action) {
            case 'feature':
                $gems->update(['is_featured' => true]);
                break;
            case 'unfeature':
                $gems->update(['is_featured' => false]);
                break;
            case 'activate':
                $gems->update(['is_active' => true]);
                break;
            case 'deactivate':
                $gems->update(['is_active' => false]);
                break;
            case 'delete':
                $gems->delete();
                break;
        }

        return response()->json([
            'message' => ucfirst($request->action) . " applied to {$count} hidden gems",
            'affected' => $count,
        ]);
    }
}
