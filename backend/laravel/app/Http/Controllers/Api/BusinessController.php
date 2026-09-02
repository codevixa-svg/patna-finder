<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BusinessController extends Controller
{
    public function index(Request $request)
    {
        $query = Business::with(['category', 'area'])
            ->approved();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('area_id')) {
            $query->where('area_id', $request->area_id);
        }

        if ($request->has('is_verified')) {
            $query->where('is_verified', $request->is_verified);
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', $request->is_featured);
        }

        if ($request->has('is_trending')) {
            $query->where('is_trending', $request->is_trending);
        }

        if ($request->has('is_hidden_gem')) {
            $query->where('is_hidden_gem', $request->is_hidden_gem);
        }

        if ($request->has('min_rating')) {
            $query->where('rating', '>=', $request->min_rating);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        if ($sortBy === 'rating') {
            $query->orderBy('rating', $sortOrder);
        } elseif ($sortBy === 'review_count') {
            $query->orderBy('review_count', $sortOrder);
        } elseif ($sortBy === 'popular') {
            $query->orderBy('view_count', 'desc');
        } else {
            $query->orderBy('created_at', $sortOrder);
        }

        $perPage = $request->get('per_page', 12);
        $businesses = $query->paginate($perPage);

        return response()->json($businesses);
    }

    public function show($slugOrId)
    {
        // Check if parameter is numeric (ID) or string (slug)
        if (is_numeric($slugOrId)) {
            $business = Business::with(['category', 'area', 'reviews' => function($query) {
                $query->approved()->latest()->limit(10);
            }, 'awards', 'faqs'])
                ->where('id', $slugOrId)
                ->approved()
                ->firstOrFail();
        } else {
            $business = Business::with(['category', 'area', 'reviews' => function($query) {
                $query->approved()->latest()->limit(10);
            }, 'awards', 'faqs'])
                ->where('slug', $slugOrId)
                ->approved()
                ->firstOrFail();
        }

        // Increment view count
        $business->increment('view_count');

        return response()->json($business);
    }

    /**
     * Public: active & published updates (GMB-style posts) of a business.
     */
    public function updates($slugOrId)
    {
        $query = Business::query()->approved();

        $business = is_numeric($slugOrId)
            ? $query->where('id', $slugOrId)->first()
            : $query->where('slug', $slugOrId)->first();

        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        $updates = $business->updates()
            ->active()
            ->published()
            ->orderByDesc('published_at')
            ->limit(10)
            ->get();

        return response()->json(['data' => $updates]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'area_id' => 'required|exists:areas,id',
            'description' => 'nullable|string',
            'owner_name' => 'required|string|max:255',
            'phone' => 'required|string|max:15',
            'email' => 'required|email',
            'address' => 'required|string',
            'website' => 'nullable|url',
            'whatsapp' => 'nullable|string|max:15',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $business = Business::create(array_merge(
            $request->only([
                'name', 'category_id', 'area_id', 'description',
                'owner_name', 'phone', 'email', 'address', 'website', 'whatsapp'
            ]),
            ['status' => 'pending']
        ));

        return response()->json([
            'message' => 'Business listing submitted successfully. It will be reviewed by our team.',
            'business' => $business
        ], 201);
    }

    public function trending()
    {
        // Businesses explicitly marked as trending by admins come first
        $businesses = Business::with(['category', 'area'])
            ->approved()
            ->trending()
            ->orderByDesc('view_count')
            ->limit(12)
            ->get();

        // Fallback: fill remaining slots with the newest approved businesses
        // so dynamically added listings also appear in the trending section
        if ($businesses->count() < 12) {
            $excludeIds = $businesses->pluck('id')->all();

            $latest = Business::with(['category', 'area'])
                ->approved()
                ->whereNotIn('id', $excludeIds)
                ->orderByDesc('created_at')
                ->limit(12 - $businesses->count())
                ->get();

            $businesses = $businesses->concat($latest)->values();
        }

        return response()->json($businesses);
    }

    public function featured()
    {
        $businesses = Business::with(['category', 'area'])
            ->approved()
            ->featured()
            ->limit(12)
            ->get();

        return response()->json($businesses);
    }

    public function hiddenGems()
    {
        $businesses = Business::with(['category', 'area'])
            ->approved()
            ->hiddenGems()
            ->limit(12)
            ->get();

        return response()->json($businesses);
    }

    public function nearby(Request $request, $slug)
    {
        $business = Business::where('slug', $slug)->firstOrFail();

        if (!$business->latitude || !$business->longitude) {
            return response()->json([]);
        }

        $radius = 1; // 1 km

        $nearbyBusinesses = Business::with(['category', 'area'])
            ->approved()
            ->where('id', '!=', $business->id)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->selectRaw("*, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance", [$business->latitude, $business->longitude, $business->latitude])
            ->having('distance', '<', $radius)
            ->orderBy('distance')
            ->limit(6)
            ->get();

        return response()->json($nearbyBusinesses);
    }
}
