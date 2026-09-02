<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

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
            ->firstOrFail();

        return response()->json($category);
    }

    public function businesses($slug, Request $request)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $query = $category->businesses()
            ->with(['area'])
            ->approved();

        $perPage = $request->get('per_page', 12);
        $businesses = $query->paginate($perPage);

        return response()->json([
            'category' => $category,
            'businesses' => $businesses
        ]);
    }
}
