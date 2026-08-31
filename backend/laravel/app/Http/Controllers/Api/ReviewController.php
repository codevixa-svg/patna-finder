<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    public function index($businessSlug, Request $request)
    {
        $business = Business::where('slug', $businessSlug)->firstOrFail();

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

        $perPage = $request->get('per_page', 10);
        $reviews = $query->paginate($perPage);

        return response()->json($reviews);
    }

    public function store(Request $request, $businessSlug)
    {
        $business = Business::where('slug', $businessSlug)->firstOrFail();

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
