<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
            'type' => 'required|in:logo,cover,gallery,update'
        ]);

        try {
            $image = $request->file('image');
            $type = $request->input('type');
            
            // Generate unique filename
            $filename = time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            
            // Store in public/storage/businesses/{type}
            $path = $image->storeAs("businesses/{$type}", $filename, 'public');
            
            // Generate URL
            $url = Storage::url($path);
            
            return response()->json([
                'success' => true,
                'url' => $url,
                'path' => $path,
                'filename' => $filename
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }

    public function uploadBase64(Request $request)
    {
        $request->validate([
            'image' => 'required|string',
            'type' => 'required|in:logo,cover,gallery,update'
        ]);

        try {
            $imageData = $request->input('image');
            $type = $request->input('type');
            
            // Check if it's base64
            if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $matches)) {
                $imageType = $matches[1];
                $imageData = substr($imageData, strpos($imageData, ',') + 1);
                $imageData = base64_decode($imageData);
                
                // Generate unique filename
                $filename = time() . '_' . Str::random(10) . '.' . $imageType;
                
                // Store in public/storage/businesses/{type}
                $path = "businesses/{$type}/{$filename}";
                Storage::disk('public')->put($path, $imageData);
                
                // Generate URL
                $url = Storage::url($path);
                
                return response()->json([
                    'success' => true,
                    'url' => $url,
                    'path' => $path,
                    'filename' => $filename
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Invalid base64 image format'
            ], 400);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }

    public function delete(Request $request)
    {
        $request->validate([
            'path' => 'required|string'
        ]);

        try {
            $path = $request->input('path');
            
            // Security: only allow deleting files within businesses/ directory
            if (!str_starts_with($path, 'businesses/')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid file path'
                ], 403);
            }
            
            // Prevent directory traversal
            if (str_contains($path, '..')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid file path'
                ], 403);
            }
            
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Image deleted successfully'
                ]);
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Image not found'
            ], 404);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image: ' . $e->getMessage()
            ], 500);
        }
    }
}
