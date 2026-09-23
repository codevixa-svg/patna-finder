<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Get user's businesses stats
        $businesses = Business::where('user_id', $user->id)->get();
        
        $stats = [
            'businesses' => [
                'total' => $businesses->count(),
                'approved' => $businesses->where('status', 'approved')->count(),
                'pending' => $businesses->where('status', 'pending')->count(),
                'rejected' => $businesses->where('status', 'rejected')->count(),
            ],
            'views' => [
                'total' => $businesses->sum('view_count'),
                'this_month' => $businesses->sum('view_count'), // Simplified for now
            ],
            'reviews' => [
                'total' => Review::whereIn('business_id', $businesses->pluck('id'))->count(),
                'average_rating' => Review::whereIn('business_id', $businesses->pluck('id'))->avg('rating') ?? 0,
            ],
            'inquiries' => [
                'total' => 0, // Will be implemented with inquiries feature
                'pending' => 0,
            ]
        ];

        // Recent activity
        $recentBusinesses = $businesses->sortByDesc('created_at')->take(5)->values();
        $recentReviews = Review::whereIn('business_id', $businesses->pluck('id'))
            ->with('business:id,name,slug')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'recent_businesses' => $recentBusinesses,
                'recent_reviews' => $recentReviews,
            ]
        ]);
    }

    public function quickStats(Request $request)
    {
        $user = $request->user();

        $businesses = Business::where('user_id', $user->id)->get();

        return response()->json([
            'success' => true,
            'data' => [
                'businesses' => [
                    'total' => $businesses->count(),
                    'approved' => $businesses->where('status', 'approved')->count(),
                    'pending' => $businesses->where('status', 'pending')->count(),
                ],
                'total_views' => $businesses->sum('view_count'),
                'total_reviews' => Review::whereIn('business_id', $businesses->pluck('id'))->count(),
                'average_rating' => round(Review::whereIn('business_id', $businesses->pluck('id'))->avg('rating') ?? 0, 1),
            ]
        ]);
    }
}
