<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\HiddenGem;
use App\Models\Review;
use App\Models\BlogPost;
use App\Models\Category;
use App\Models\Area;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get Dashboard Stats & Analytics
     * GET /api/v1/admin/dashboard
     */
    public function index(Request $request)
    {
        // Overview Stats
        $stats = [
            'total_businesses' => Business::count(),
            'pending_businesses' => Business::where('status', 'pending')->count(),
            'approved_businesses' => Business::where('status', 'approved')->count(),
            'verified_businesses' => Business::where('is_verified', true)->count(),
            'featured_businesses' => Business::where('is_featured', true)->count(),
            
            'total_hidden_gems' => HiddenGem::count(),
            'active_hidden_gems' => HiddenGem::active()->count(),
            'featured_hidden_gems' => HiddenGem::featured()->count(),
            
            'total_reviews' => Review::count(),
            'pending_reviews' => Review::where('status', 'pending')->count(),
            'approved_reviews' => Review::where('status', 'approved')->count(),
            
            'total_blog_posts' => BlogPost::count(),
            'published_blog_posts' => BlogPost::where('status', 'published')->count(),
            'draft_blog_posts' => BlogPost::where('status', 'draft')->count(),
            
            'total_categories' => Category::count(),
            'active_categories' => Category::where('is_active', true)->count(),
            
            'total_areas' => Area::count(),
            'active_areas' => Area::where('is_active', true)->count(),
            
            'total_users' => User::count(),
            'admin_users' => User::whereIn('role', ['super_admin', 'admin'])->count(),
        ];

        // Recent Activity
        $recentBusinesses = Business::with(['category', 'area'])
            ->latest()
            ->take(5)
            ->get(['id', 'name', 'slug', 'category_id', 'area_id', 'status', 'rating', 'created_at']);

        $recentReviews = Review::with(['business'])
            ->latest()
            ->take(5)
            ->get(['id', 'business_id', 'author_name', 'rating', 'status', 'created_at']);

        $recentHiddenGems = HiddenGem::with(['category', 'area'])
            ->latest()
            ->take(5)
            ->get(['id', 'title', 'slug', 'category_id', 'area_id', 'view_count', 'like_count', 'created_at']);

        // Top Businesses by Rating
        $topBusinesses = Business::where('status', 'approved')
            ->orderBy('rating', 'desc')
            ->orderBy('review_count', 'desc')
            ->take(10)
            ->get(['id', 'name', 'slug', 'rating', 'review_count', 'view_count']);

        // Top Categories
        $topCategories = Category::withCount('businesses')
            ->orderBy('businesses_count', 'desc')
            ->take(10)
            ->get();

        // Top Areas
        $topAreas = Area::withCount('businesses')
            ->orderBy('businesses_count', 'desc')
            ->take(10)
            ->get();

        // Monthly Stats (Last 6 months)
        $monthlyBusinesses = Business::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        $monthlyReviews = Review::select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('count(*) as count')
            )
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();

        // Rating Distribution
        $ratingDistribution = Business::select(
                DB::raw('FLOOR(rating) as rating_floor'),
                DB::raw('count(*) as count')
            )
            ->where('status', 'approved')
            ->groupBy('rating_floor')
            ->orderBy('rating_floor', 'desc')
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_activity' => [
                'businesses' => $recentBusinesses,
                'reviews' => $recentReviews,
                'hidden_gems' => $recentHiddenGems,
            ],
            'top_performers' => [
                'businesses' => $topBusinesses,
                'categories' => $topCategories,
                'areas' => $topAreas,
            ],
            'charts' => [
                'monthly_businesses' => $monthlyBusinesses,
                'monthly_reviews' => $monthlyReviews,
                'rating_distribution' => $ratingDistribution,
            ],
        ]);
    }

    /**
     * Get Quick Stats for Dashboard Cards
     * GET /api/v1/admin/dashboard/quick-stats
     */
    public function quickStats()
    {
        return response()->json([
            'businesses' => [
                'total' => Business::count(),
                'pending' => Business::where('status', 'pending')->count(),
                'today' => Business::whereDate('created_at', today())->count(),
                'this_month' => Business::whereMonth('created_at', now()->month)->count(),
            ],
            'reviews' => [
                'total' => Review::count(),
                'pending' => Review::where('status', 'pending')->count(),
                'today' => Review::whereDate('created_at', today())->count(),
                'average_rating' => round(Review::where('status', 'approved')->avg('rating'), 2),
            ],
            'hidden_gems' => [
                'total' => HiddenGem::count(),
                'active' => HiddenGem::active()->count(),
                'featured' => HiddenGem::featured()->count(),
                'total_views' => HiddenGem::sum('view_count'),
            ],
            'blog' => [
                'total' => BlogPost::count(),
                'published' => BlogPost::where('status', 'published')->count(),
                'draft' => BlogPost::where('status', 'draft')->count(),
                'total_views' => BlogPost::sum('view_count'),
            ],
        ]);
    }
}
