<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    /**
     * Upload an image (blog featured image, editor image blocks, galleries).
     * POST /api/v1/admin/upload  (multipart/form-data, field: "file")
     */
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|image|mimes:jpg,jpeg,png,webp,gif,svg|max:5120',
        ]);

        $file = $request->file('file');
        $directory = 'uploads/' . now()->format('Y/m');
        $path = $file->storeAs(
            $directory,
            Str::uuid() . '.' . strtolower($file->getClientOriginalExtension()),
            'public'
        );

        return response()->json([
            'message' => 'Image uploaded successfully',
            'url' => url(Storage::disk('public')->url($path)),
            'path' => $path,
            'size' => $file->getSize(),
        ], 201);
    }

    /**
     * Delete an uploaded image by path (optional cleanup).
     * DELETE /api/v1/admin/upload?path=uploads/2026/01/xx.jpg
     */
    public function destroy(Request $request)
    {
        $request->validate(['path' => 'required|string']);

        $path = $request->query('path');

        // Only allow deleting files inside the uploads directory
        if (!str_starts_with($path, 'uploads/')) {
            return response()->json(['message' => 'Invalid path'], 422);
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            return response()->json(['message' => 'Image deleted successfully']);
        }

        return response()->json(['message' => 'File not found'], 404);
    }
}
