<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogCategory;

class BlogCategoryController extends Controller
{
    /**
     * List active blog categories (public, for filters & forms).
     * GET /api/v1/blog-categories
     */
    public function index()
    {
        $categories = BlogCategory::active()->get();

        return response()->json($categories);
    }
}
