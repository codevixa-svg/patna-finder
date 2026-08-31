<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::query();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('author_name', 'like', "%{$search}%")
                  ->orWhere('category', 'like', "%{$search}%");
            });
        }

        if ($request->has('category') && $request->category) {
            $query->where('category', $request->category);
        }

        $posts = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json($posts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'featured_image' => 'nullable|string|max:500',
            'author_name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'status' => 'sometimes|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);

        if (($validated['status'] ?? 'draft') === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $post = BlogPost::create($validated);

        return response()->json([
            'message' => 'Blog post created successfully',
            'post' => $post,
        ], 201);
    }

    public function show($id)
    {
        $post = BlogPost::findOrFail($id);
        return response()->json($post);
    }

    public function update(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'sometimes|required|string',
            'featured_image' => 'nullable|string|max:500',
            'author_name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'status' => 'sometimes|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        if (isset($validated['title'])) {
            $validated['slug'] = \Illuminate\Support\Str::slug($validated['title']);
        }

        if (isset($validated['status']) && $validated['status'] === 'published' && empty($post->published_at)) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        return response()->json([
            'message' => 'Blog post updated successfully',
            'post' => $post->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();

        return response()->json([
            'message' => 'Blog post deleted successfully',
        ]);
    }

    public function togglePublish($id)
    {
        $post = BlogPost::findOrFail($id);

        if ($post->status === 'published') {
            $post->update(['status' => 'draft', 'published_at' => null]);
            $message = 'Blog post unpublished';
        } else {
            $post->update(['status' => 'published', 'published_at' => $post->published_at ?? now()]);
            $message = 'Blog post published';
        }

        return response()->json([
            'message' => $message,
            'post' => $post,
        ]);
    }
}
