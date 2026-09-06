<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

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
            'slug' => [
                'nullable', 'string', 'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('blog_posts', 'slug'),
            ],
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'required|string',
            'featured_image' => 'nullable|string|max:500',
            'image_alt' => 'nullable|string|max:500',
            'author_name' => 'nullable|string|max:255',
            'author_bio' => 'nullable|string|max:1000',
            'reading_time' => 'nullable|integer|min:1|max:120',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'status' => 'sometimes|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        // Custom slug from the admin, otherwise auto-generate from the title.
        // Auto-generated slugs get -2, -3… suffixes instead of failing on the
        // unique constraint when two posts share a title.
        $baseSlug = !empty($validated['slug'])
            ? $validated['slug']
            : Str::slug($validated['title']);

        if ($baseSlug === '') {
            // Non-latin titles can slug to an empty string — fall back to a random slug
            $baseSlug = 'post-' . strtolower(Str::random(6));
        }

        $validated['slug'] = $this->ensureUniqueSlug($baseSlug);

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
            'slug' => [
                'nullable', 'string', 'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique('blog_posts', 'slug')->ignore($post->id),
            ],
            'excerpt' => 'nullable|string|max:1000',
            'content' => 'sometimes|required|string',
            'featured_image' => 'nullable|string|max:500',
            'image_alt' => 'nullable|string|max:500',
            'author_name' => 'nullable|string|max:255',
            'author_bio' => 'nullable|string|max:1000',
            'reading_time' => 'nullable|integer|min:1|max:120',
            'category' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'tags.*' => 'string',
            'status' => 'sometimes|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        if (!empty($validated['slug'])) {
            // Admin provided a custom slug — keep it (uniqueness is validated
            // above; this is a safety net for concurrent requests)
            $validated['slug'] = $this->ensureUniqueSlug($validated['slug'], $post->id);
        } elseif (isset($validated['title'])) {
            // No slug sent (auto mode) — regenerate from the title, keeping the
            // existing slug if the new title slugs to an empty string
            $baseSlug = Str::slug($validated['title']);
            if ($baseSlug !== '') {
                $validated['slug'] = $this->ensureUniqueSlug($baseSlug, $post->id);
            }
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

    /**
     * Returns $slug, or $slug-2, $slug-3… until a free slug is found.
     * $ignoreId lets a post keep its own slug when updating.
     */
    private function ensureUniqueSlug(string $slug, ?int $ignoreId = null): string
    {
        $original = $slug;
        $suffix = 2;

        while (true) {
            $query = BlogPost::where('slug', $slug);
            if ($ignoreId !== null) {
                $query->where('id', '!=', $ignoreId);
            }
            if (!$query->exists()) {
                return $slug;
            }
            $slug = $original . '-' . $suffix;
            $suffix++;
        }
    }
}
