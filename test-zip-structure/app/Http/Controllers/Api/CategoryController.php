<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('name');

        // Optional server-side search (useful with the 4k+ category list)
        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->get('search') . '%');
        }

        // Optional limit so lightweight surfaces (home tiles, filters) don't
        // have to pull the full list.
        if ($request->filled('limit')) {
            return response()->json(
                $query->limit(max(1, (int) $request->get('limit')))->get()
            );
        }

        return response()->json($query->get());
    }

    public function show($slug)
    {
        $category = Category::where('slug', $slug)
            ->where('is_active', true)
            ->first();

        // Slug-variant fallback — "/categories/doctors" should resolve the
        // "doctor" category (and vice versa) instead of 404-ing.
        if (!$category) {
            foreach ($this->slugVariants($slug) as $variant) {
                $category = Category::where('slug', $variant)
                    ->where('is_active', true)
                    ->first();
                if ($category) break;
            }
        }

        if (!$category) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException();
        }

        return response()->json($category);
    }

    /**
     * Plural/singular slug variants used for forgiving category resolution
     * (doctors↔doctor, restaurants↔restaurant, lawyers↔lawyer …).
     */
    private function slugVariants(string $slug): array
    {
        $variants = [];
        if (str_ends_with($slug, 's')) {
            $variants[] = substr($slug, 0, -1);
        } else {
            $variants[] = $slug . 's';
            if (str_ends_with($slug, 'es')) {
                $variants[] = substr($slug, 0, -2);
            }
        }
        return $variants;
    }

    public function businesses($slug, Request $request)
    {
        $category = Category::where('slug', $slug)->first();

        // Slug-variant fallback (same as show()).
        if (!$category) {
            foreach ($this->slugVariants($slug) as $variant) {
                $category = Category::where('slug', $variant)->first();
                if ($category) break;
            }
        }

        if (!$category) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException();
        }

        $query = $category->businesses()
            ->with(['area'])
            ->approved();

        // ── Filters (category listing page) ──
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('area_id')) {
            $query->where('area_id', $request->get('area_id'));
        }

        if ($request->filled('min_rating')) {
            $query->where('rating', '>=', (float) $request->get('min_rating'));
        }

        // Sorting — whitelisted, defaults to "recommended"
        switch ($request->get('sort', 'recommended')) {
            case 'rating':
                $query->orderByDesc('rating')->orderByDesc('review_count');
                break;
            case 'review_count':
                $query->orderByDesc('review_count')->orderByDesc('rating');
                break;
            case 'newest':
                $query->orderByDesc('created_at');
                break;
            default: // recommended
                $query->orderByDesc('is_featured')
                    ->orderByDesc('is_popular')
                    ->orderByDesc('view_count')
                    ->orderByDesc('rating');
                break;
        }

        $perPage = min(max((int) $request->get('per_page', 12), 1), 48);
        $businesses = $query->paginate($perPage);

        // ── Page extras: stats, per-area counts & top categories (sidebar) ──
        $base = $category->businesses()->approved();

        $areaCounts = DB::table('businesses')
            ->join('areas', 'areas.id', '=', 'businesses.area_id')
            ->where('businesses.category_id', $category->id)
            ->whereNull('businesses.deleted_at')
            ->where('businesses.status', 'approved')
            ->whereNotNull('businesses.area_id')
            ->groupBy('areas.id', 'areas.name')
            ->orderBy('areas.name')
            ->get([
                'areas.id',
                'areas.name',
                DB::raw('COUNT(*) as businesses_count'),
            ])
            ->map(fn ($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'businesses_count' => (int) $r->businesses_count,
            ])
            ->values();

        $topCategories = DB::table('businesses')
            ->join('categories', 'categories.id', '=', 'businesses.category_id')
            ->whereNull('businesses.deleted_at')
            ->where('businesses.status', 'approved')
            ->whereNotNull('businesses.category_id')
            ->where('categories.is_active', true)
            ->groupBy('categories.id', 'categories.name', 'categories.slug', 'categories.icon')
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->limit(12)
            ->get([
                'categories.id',
                'categories.name',
                'categories.slug',
                'categories.icon',
                DB::raw('COUNT(*) as businesses_count'),
            ]);

        return response()->json([
            'category'       => $category,
            'businesses'     => $businesses,
            'stats'          => [
                'total'      => (clone $base)->count(),
                'avg_rating' => round((float) ((clone $base)->avg('rating') ?? 0), 1),
                'review_count' => (clone $base)->sum('review_count'),
                'verified'   => (clone $base)->where('is_verified', true)->count(),
            ],
            'area_counts'    => $areaCounts,
            'top_categories' => $topCategories,
        ]);
    }
}
