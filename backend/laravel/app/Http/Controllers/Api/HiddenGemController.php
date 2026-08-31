<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HiddenGem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HiddenGemController extends Controller
{
    /**
     * List all active hidden gems
     * GET /api/v1/hidden-gems
     */
    public function index(Request $request)
    {
        $query = HiddenGem::with(['category', 'area'])
            ->active()
            ->ordered();

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by area
        if ($request->has('area_id')) {
            $query->where('area_id', $request->area_id);
        }

        // Filter featured
        if ($request->has('is_featured')) {
            $query->featured();
        }

        // Pagination
        $perPage = $request->get('per_page', 12);
        $hiddenGems = $query->paginate($perPage);

        return response()->json($hiddenGems);
    }

    /**
     * Get latest 4 hidden gems for homepage
     * GET /api/v1/hidden-gems/latest
     */
    public function latest()
    {
        $hiddenGems = HiddenGem::with(['category', 'area'])
            ->active()
            ->ordered()
            ->take(4)
            ->get();

        return response()->json($hiddenGems);
    }

    /**
     * Get featured hidden gems
     * GET /api/v1/hidden-gems/featured
     */
    public function featured()
    {
        $hiddenGems = HiddenGem::with(['category', 'area'])
            ->active()
            ->featured()
            ->ordered()
            ->take(8)
            ->get();

        return response()->json($hiddenGems);
    }

    /**
     * Get single hidden gem by slug
     * GET /api/v1/hidden-gems/{slug}
     */
    public function show($slug)
    {
        $hiddenGem = HiddenGem::with(['category', 'area'])
            ->where('slug', $slug)
            ->active()
            ->firstOrFail();

        // Increment view count
        $hiddenGem->incrementViewCount();

        // Sync GMB data if due
        if ($hiddenGem->isGmbSyncDue()) {
            $this->syncGmbData($hiddenGem);
        }

        return response()->json($hiddenGem);
    }

    /**
     * Like a hidden gem
     * POST /api/v1/hidden-gems/{slug}/like
     */
    public function like($slug)
    {
        $hiddenGem = HiddenGem::where('slug', $slug)->firstOrFail();
        $hiddenGem->incrementLikeCount();

        return response()->json([
            'message' => 'Liked successfully',
            'like_count' => $hiddenGem->like_count,
        ]);
    }

    /**
     * Share a hidden gem
     * POST /api/v1/hidden-gems/{slug}/share
     */
    public function share($slug)
    {
        $hiddenGem = HiddenGem::where('slug', $slug)->firstOrFail();
        $hiddenGem->incrementShareCount();

        return response()->json([
            'message' => 'Share counted',
            'share_count' => $hiddenGem->share_count,
        ]);
    }

    /**
     * Sync Google My Business data for a hidden gem
     * POST /api/v1/hidden-gems/{slug}/sync-gmb
     */
    public function syncGmb($slug)
    {
        $hiddenGem = HiddenGem::where('slug', $slug)->firstOrFail();

        if (!$hiddenGem->gmb_place_id) {
            return response()->json([
                'error' => 'No GMB Place ID configured',
            ], 400);
        }

        $result = $this->syncGmbData($hiddenGem);

        if ($result) {
            return response()->json([
                'message' => 'GMB data synced successfully',
                'data' => [
                    'gmb_rating' => $hiddenGem->gmb_rating,
                    'gmb_review_count' => $hiddenGem->gmb_review_count,
                    'gmb_last_synced' => $hiddenGem->gmb_last_synced,
                ],
            ]);
        }

        return response()->json([
            'error' => 'Failed to sync GMB data',
        ], 500);
    }

    /**
     * Internal method to sync GMB data using Google Places API
     * Note: Requires GOOGLE_PLACES_API_KEY in .env
     */
    private function syncGmbData(HiddenGem $hiddenGem)
    {
        try {
            $apiKey = config('services.google_places.api_key');

            if (!$apiKey) {
                Log::warning('Google Places API Key not configured');
                return false;
            }

            // Call Google Places API - Place Details
            $response = Http::get('https://maps.googleapis.com/maps/api/place/details/json', [
                'place_id' => $hiddenGem->gmb_place_id,
                'fields' => 'rating,user_ratings_total,reviews',
                'key' => $apiKey,
            ]);

            if (!$response->successful()) {
                Log::error('GMB API request failed', [
                    'place_id' => $hiddenGem->gmb_place_id,
                    'status' => $response->status(),
                ]);
                return false;
            }

            $data = $response->json();

            if ($data['status'] !== 'OK') {
                Log::error('GMB API returned error status', [
                    'place_id' => $hiddenGem->gmb_place_id,
                    'status' => $data['status'],
                ]);
                return false;
            }

            $result = $data['result'] ?? [];

            // Update hidden gem with GMB data
            $hiddenGem->update([
                'gmb_rating' => $result['rating'] ?? null,
                'gmb_review_count' => $result['user_ratings_total'] ?? 0,
                'gmb_reviews' => $this->formatGmbReviews($result['reviews'] ?? []),
                'gmb_last_synced' => now(),
            ]);

            Log::info('GMB data synced successfully', [
                'place_id' => $hiddenGem->gmb_place_id,
                'rating' => $hiddenGem->gmb_rating,
            ]);

            return true;

        } catch (\Exception $e) {
            Log::error('Exception while syncing GMB data', [
                'place_id' => $hiddenGem->gmb_place_id,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Format GMB reviews for storage
     */
    private function formatGmbReviews(array $reviews)
    {
        return array_map(function ($review) {
            return [
                'author_name' => $review['author_name'] ?? '',
                'author_url' => $review['author_url'] ?? '',
                'profile_photo_url' => $review['profile_photo_url'] ?? '',
                'rating' => $review['rating'] ?? 0,
                'text' => is_array($review['text'] ?? null) ? ($review['text']['text'] ?? '') : ($review['text'] ?? ''),
                'time' => $review['time'] ?? null,
                'relative_time_description' => $review['relative_time_description'] ?? '',
            ];
        }, array_slice($reviews, 0, 5)); // Store only top 5 reviews
    }
}
