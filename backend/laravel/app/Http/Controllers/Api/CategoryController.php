<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('name')
            ->get();

        return response()->json($categories);
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
