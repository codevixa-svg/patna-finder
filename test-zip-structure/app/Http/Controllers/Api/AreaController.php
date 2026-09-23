<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AreaController extends Controller
{
    public function index()
    {
        $areas = Area::where('is_active', true)
            ->orderBy('name')
            ->get();

        // ── Per-area extras for the All Areas page ──
        // Approved business counts keyed by area
        $counts = DB::table('businesses')
            ->whereNull('deleted_at')
            ->where('status', 'approved')
            ->whereNotNull('area_id')
            ->groupBy('area_id')
            ->selectRaw('area_id, COUNT(*) as total')
            ->pluck('total', 'area_id');

        // Top categories per area (single grouped query, sliced to 3 in PHP)
        $categoryRows = DB::table('businesses')
            ->join('categories', 'categories.id', '=', 'businesses.category_id')
            ->whereNull('businesses.deleted_at')
            ->where('businesses.status', 'approved')
            ->whereNotNull('businesses.category_id')
            ->whereNotNull('businesses.area_id')
            ->groupBy('businesses.area_id', 'categories.id', 'categories.name', 'categories.icon')
            ->orderBy('categories.name')
            ->get([
                'businesses.area_id',
                'categories.name',
                'categories.icon',
                DB::raw('COUNT(*) as businesses_count'),
            ]);

        $topByArea = [];
        foreach ($categoryRows as $row) {
            $topByArea[$row->area_id][] = [
                'name'             => $row->name,
                'icon'             => $row->icon,
                'businesses_count' => (int) $row->businesses_count,
            ];
        }
        foreach ($topByArea as $areaId => $cats) {
            usort($cats, fn ($a, $b) => $b['businesses_count'] <=> $a['businesses_count']);
            $topByArea[$areaId] = array_slice($cats, 0, 3);
        }

        $areas->each(function ($area) use ($counts, $topByArea) {
            $area->businesses_count = (int) ($counts[$area->id] ?? 0);
            $area->top_categories   = $topByArea[$area->id] ?? [];
        });

        return response()->json($areas);
    }

    public function show($slug)
    {
        $area = Area::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return response()->json($area);
    }

    public function businesses($slug, Request $request)
    {
        $area = Area::where('slug', $slug)->firstOrFail();

        $query = $area->businesses()
            ->with(['category', 'area'])
            ->approved();

        // Sorting — whitelisted, defaults to most_popular
        switch ($request->get('sort', 'most_popular')) {
            case 'highest_rated':
                $query->orderByDesc('rating')->orderByDesc('review_count');
                break;
            case 'most_reviewed':
                $query->orderByDesc('review_count')->orderByDesc('rating');
                break;
            case 'newest':
                $query->orderByDesc('created_at');
                break;
            default: // most_popular
                $query->orderByDesc('is_popular')
                    ->orderByDesc('view_count')
                    ->orderByDesc('rating');
                break;
        }

        $perPage = min(max((int) $request->get('per_page', 12), 1), 48);
        $businesses = $query->paginate($perPage);

        // ── Area page extras: hero stats, sidebar categories & location info ──
        $base = $area->businesses()->approved();

        $topCategories = DB::table('businesses')
            ->join('categories', 'categories.id', '=', 'businesses.category_id')
            ->where('businesses.area_id', $area->id)
            ->whereNull('businesses.deleted_at')
            ->where('businesses.status', 'approved')
            ->whereNotNull('businesses.category_id')
            ->groupBy('categories.id', 'categories.name', 'categories.slug', 'categories.icon')
            ->orderByDesc(DB::raw('COUNT(*)'))
            ->limit(8)
            ->get([
                'categories.id',
                'categories.name',
                'categories.slug',
                'categories.icon',
                DB::raw('COUNT(*) as businesses_count'),
            ]);

        $landmark = (clone $base)
            ->whereNotNull('landmark')
            ->orderByDesc('view_count')
            ->value('landmark');

        $pincode = (clone $base)
            ->whereNotNull('pincode')
            ->orderByDesc('view_count')
            ->value('pincode');

        return response()->json([
            'area'           => $area,
            'businesses'     => $businesses,
            'stats'          => [
                'total'      => (clone $base)->count(),
                'categories' => (clone $base)->whereNotNull('category_id')->distinct()->count('category_id'),
                'avg_rating' => round((float) ((clone $base)->avg('rating') ?? 0), 1),
            ],
            'top_categories' => $topCategories,
            'landmark'       => $landmark,
            'pincode'        => $pincode,
        ]);
    }
}
