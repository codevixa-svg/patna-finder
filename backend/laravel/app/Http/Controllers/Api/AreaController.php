<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    public function index()
    {
        $areas = Area::where('is_active', true)
            ->orderBy('name')
            ->get();

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
            ->with(['category'])
            ->approved();

        $perPage = $request->get('per_page', 12);
        $businesses = $query->paginate($perPage);

        return response()->json([
            'area' => $area,
            'businesses' => $businesses
        ]);
    }
}
