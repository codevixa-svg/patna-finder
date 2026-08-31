<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BusinessController extends Controller
{
    public function index(Request $request)
    {
        $query = Business::with(['category', 'area', 'user']);

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('area_id') && $request->area_id) {
            $query->where('area_id', $request->area_id);
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->boolean('is_featured'));
        }

        if ($request->has('is_verified')) {
            $query->where('is_verified', $request->boolean('is_verified'));
        }

        $businesses = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json($businesses);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'area_id' => 'required|exists:areas,id',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'tagline' => 'nullable|string|max:255',
            'established_year' => 'nullable|integer|min:1800|max:' . date('Y'),

            'phone' => 'nullable|string|max:20',
            'alternate_phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'website' => 'nullable|url',
            'whatsapp' => 'nullable|string|max:20',

            'address' => 'nullable|string',
            'address_line2' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'pincode' => 'nullable|string|max:10',
            'country' => 'nullable|string',
            'landmark' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',

            'opening_hours' => 'nullable',
            'services' => 'nullable',
            'gallery' => 'nullable',
            'videos' => 'nullable',
            'social_links' => 'nullable',
            'amenities' => 'nullable',

            'logo' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'featured_image' => 'nullable|string',

            'status' => 'sometimes|in:pending,approved,rejected,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['slug'] = Str::slug($request->name) . '-' . Str::random(6);
        $data['user_id'] = $request->user()->id;

        if (!isset($data['status'])) {
            $data['status'] = 'approved';
        }

        $business = Business::create($data);

        return response()->json([
            'message' => 'Business created successfully',
            'business' => $business->load(['category', 'area']),
        ], 201);
    }

    public function show($id)
    {
        $business = Business::with(['category', 'area', 'user', 'reviews', 'faqs', 'awards'])->findOrFail($id);
        return response()->json($business);
    }

    public function update(Request $request, $id)
    {
        $business = Business::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'short_description' => 'sometimes|string|max:500',
            'tagline' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'email' => 'sometimes|email|max:255',
            'website' => 'sometimes|nullable|url|max:500',
            'address' => 'sometimes|string',
            'city' => 'sometimes|string|max:100',
            'state' => 'sometimes|string|max:100',
            'pincode' => 'sometimes|string|max:10',
            'category_id' => 'sometimes|integer|exists:categories,id',
            'area_id' => 'sometimes|integer|exists:areas,id',
            'status' => 'sometimes|in:pending,approved,rejected,suspended',
            'meta_title' => 'sometimes|nullable|string|max:255',
            'meta_description' => 'sometimes|nullable|string|max:500',
        ]);

        $business->update($validated);

        return response()->json([
            'message' => 'Business updated successfully',
            'business' => $business->fresh()->load(['category', 'area']),
        ]);
    }

    public function approve($id)
    {
        $business = Business::findOrFail($id);
        $business->update(['status' => 'approved']);

        return response()->json([
            'message' => 'Business approved successfully',
            'business' => $business,
        ]);
    }

    public function reject(Request $request, $id)
    {
        $business = Business::findOrFail($id);

        $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $business->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Business rejected',
            'business' => $business,
        ]);
    }

    public function feature($id)
    {
        $business = Business::findOrFail($id);
        $business->update(['is_featured' => !$business->is_featured]);

        return response()->json([
            'message' => $business->is_featured ? 'Business featured' : 'Business unfeatured',
            'business' => $business,
        ]);
    }

    public function verify($id)
    {
        $business = Business::findOrFail($id);
        $business->update(['is_verified' => !$business->is_verified]);

        return response()->json([
            'message' => $business->is_verified ? 'Business verified' : 'Business verification removed',
            'business' => $business,
        ]);
    }

    public function toggleTrending($id)
    {
        $business = Business::findOrFail($id);
        $business->update(['is_trending' => !$business->is_trending]);

        return response()->json([
            'message' => $business->is_trending ? 'Business set as trending' : 'Business removed from trending',
            'business' => $business,
        ]);
    }

    public function toggleSponsored($id)
    {
        $business = Business::findOrFail($id);
        $business->update(['is_sponsored' => !$business->is_sponsored]);

        return response()->json([
            'message' => $business->is_sponsored ? 'Business set as sponsored' : 'Sponsorship removed',
            'business' => $business,
        ]);
    }

    public function destroy($id)
    {
        $business = Business::findOrFail($id);
        $business->delete();

        return response()->json([
            'message' => 'Business deleted successfully',
        ]);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:approve,reject,feature,unfeature,delete',
        ]);

        $businesses = Business::whereIn('id', $request->ids);
        $count = $businesses->count();

        switch ($request->action) {
            case 'approve':
                $businesses->update(['status' => 'approved']);
                break;
            case 'reject':
                $businesses->update(['status' => 'rejected']);
                break;
            case 'feature':
                $businesses->update(['is_featured' => true]);
                break;
            case 'unfeature':
                $businesses->update(['is_featured' => false]);
                break;
            case 'delete':
                $businesses->delete();
                break;
        }

        return response()->json([
            'message' => ucfirst($request->action) . " applied to {$count} businesses",
            'affected' => $count,
        ]);
    }
}
