<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::published();

        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by tag
        if ($request->has('tag')) {
            $query->whereJsonContains('tags', $request->tag);
        }

        $perPage = $request->get('per_page', 12);
        $posts = $query->latest('published_at')->paginate($perPage);

        return response()->json($posts);
    }

    public function show($slug)
    {
        $post = BlogPost::where('slug', $slug)
            ->published()
            ->firstOrFail();

        // Increment view count
        $post->increment('view_count');

        return response()->json($post);
    }

    public function latest()
    {
        $posts = BlogPost::published()
            ->latest('published_at')
            ->limit(6)
            ->get();

        return response()->json($posts);
    }

    public function categories()
    {
        // Admin-managed categories from DB, fallback to defaults if table is empty
        try {
            $categories = \App\Models\BlogCategory::active()->pluck('name')->values()->all();
            if (!empty($categories)) {
                return response()->json($categories);
            }
        } catch (\Throwable $e) {
            // fall through to defaults
        }

        $categories = ['News', 'Events', 'Guides', 'Festivals', 'Lifestyle', 'Food', 'Education', 'Tourism'];

        return response()->json($categories);
    }
}
