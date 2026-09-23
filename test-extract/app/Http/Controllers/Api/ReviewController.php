<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Resolve a business by slug OR numeric id so reviews work for both
     * /business/{slug} and /business/{id} style URLs.
     */
    private function resolveBusiness($slugOrId): ?Business
    {
        return is_numeric($slugOrId)
            ? Business::where('id', $slugOrId)->first()
            : Business::where('slug', $slugOrId)->first();
    }

    public function index($businessSlug, Request $request)
    {
        $business = $this->resolveBusiness($businessSlug);

        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        $query = $business->reviews()->approved();

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        
        if ($sortBy === 'likes') {
            $query->orderBy('likes_count', 'desc');
        } elseif ($sortBy === 'rating_high') {
            $query->orderBy('rating', 'desc');
        } elseif ($sortBy === 'rating_low') {
            $query->orderBy('rating', 'asc');
        } else {
            $query->latest();
        }

        $perPage = (int) $request->get('per_page', 10);
        $reviews = $query->paginate($perPage);

        // Aggregate stats (average + per-star distribution) from ALL approved reviews
        $ratings = $business->reviews()->approved()->pluck('rating');

        $distribution = ['5' => 0, '4' => 0, '3' => 0, '2' => 0, '1' => 0];
        foreach ($ratings as $rating) {
            $key = (string) min(5, max(1, (int) $rating));
            $distribution[$key]++;
        }

        return response()->json([
            'data' => $reviews->items(),
            'meta' => [
                'current_page' => $reviews->currentPage(),
                'last_page' => $reviews->lastPage(),
                'per_page' => $reviews->perPage(),
                'total' => $reviews->total(),
                'average' => $ratings->count() > 0 ? round((float) $ratings->avg(), 2) : 0,
                'distribution' => $distribution,
            ],
        ]);
    }

    public function store(Request $request, $businessSlug)
    {
        $business = $this->resolveBusiness($businessSlug);

        if (!$business) {
            return response()->json(['message' => 'Business not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'author_name' => 'required|string|max:255',
            'author_email' => 'nullable|email',
            'rating' => 'required|integer|min:1|max:5',
            'content' => 'required|string|min:10',
            'photos' => 'nullable|array|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $review = $business->reviews()->create(array_merge(
            $request->only(['author_name', 'author_email', 'rating', 'content', 'photos']),
            [
                'ip_address' => $request->ip(),
                'status' => 'pending'
            ]
        ));

        return response()->json([
            'message' => 'Review submitted successfully. It will be published after moderation.',
            'review' => $review
        ], 201);
    }

    public function latest()
    {
        $reviews = Review::with(['business:id,name,slug'])
            ->approved()
            ->latest()
            ->limit(6)
            ->get();

        return response()->json($reviews);
    }

    public function like($id)
    {
        $review = Review::approved()->findOrFail($id);
        $review->increment('likes_count');

        return response()->json([
            'message' => 'Review liked successfully',
            'likes_count' => $review->likes_count
        ]);
    }
}
