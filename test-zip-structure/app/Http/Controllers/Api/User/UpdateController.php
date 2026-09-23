<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Update;
use App\Models\Business;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UpdateController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $updates = Update::whereHas('business', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with('business:id,name,slug')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $updates
        ]);
    }

    public function store(Request $request)
    {
        // Phone numbers are allowed as cta_url for "call" type; URLs required otherwise
        $ctaUrlRule = $request->input('cta_type') === 'call'
            ? 'nullable|string|max:30'
            : 'nullable|url|max:500';

        $validator = Validator::make($request->all(), [
            'business_id' => 'required|exists:businesses,id',
            'content' => 'required|string|max:5000',
            'image' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'cta_url' => $ctaUrlRule,
            'cta_type' => 'nullable|in:learn_more,call,book,order,visit',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verify business belongs to user
        $business = Business::where('id', $request->business_id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$business) {
            return response()->json([
                'success' => false,
                'message' => 'Business not found or unauthorized'
            ], 404);
        }

        $data = $validator->validated();
        $data['published_at'] = now();

        $update = Update::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Update created successfully',
            'data' => $update
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $update = Update::where('id', $id)
            ->whereHas('business', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->with('business:id,name,slug')
            ->first();

        if (!$update) {
            return response()->json([
                'success' => false,
                'message' => 'Update not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $update
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        $update = Update::where('id', $id)
            ->whereHas('business', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();

        if (!$update) {
            return response()->json([
                'success' => false,
                'message' => 'Update not found'
            ], 404);
        }

        // Phone numbers are allowed as cta_url for "call" type; URLs required otherwise
        $ctaUrlRule = $request->input('cta_type', $update->cta_type) === 'call'
            ? 'nullable|string|max:30'
            : 'nullable|url|max:500';

        $validator = Validator::make($request->all(), [
            'content' => 'sometimes|string|max:5000',
            'image' => 'nullable|string',
            'cta_text' => 'nullable|string|max:100',
            'cta_url' => $ctaUrlRule,
            'cta_type' => 'nullable|in:learn_more,call,book,order,visit',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $update->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Update updated successfully',
            'data' => $update->fresh()
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $update = Update::where('id', $id)
            ->whereHas('business', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();

        if (!$update) {
            return response()->json([
                'success' => false,
                'message' => 'Update not found'
            ], 404);
        }

        // Delete image if exists
        if ($update->image) {
            $imagePath = public_path($update->image);
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }

        $update->delete();

        return response()->json([
            'success' => true,
            'message' => 'Update deleted successfully'
        ]);
    }

    public function toggleActive(Request $request, $id)
    {
        $user = $request->user();

        $update = Update::where('id', $id)
            ->whereHas('business', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->first();

        if (!$update) {
            return response()->json([
                'success' => false,
                'message' => 'Update not found'
            ], 404);
        }

        $update->update(['is_active' => !$update->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Update status toggled',
            'data' => $update->fresh()
        ]);
    }
}