<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $query = Review::with('business');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('author_name', 'like', "%{$search}%")
                  ->orWhere('author_email', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        if ($request->has('business_id')) {
            $query->where('business_id', $request->business_id);
        }

        $reviews = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json($reviews);
    }

    public function show($id)
    {
        $review = Review::with('business')->findOrFail($id);
        return response()->json($review);
    }

    public function approve($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['status' => 'approved']);

        if ($review->business) {
            $review->business->recalculateRating();
        }

        return response()->json([
            'message' => 'Review approved',
            'review' => $review,
        ]);
    }

    public function reject($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['status' => 'rejected']);

        if ($review->business) {
            $review->business->recalculateRating();
        }

        return response()->json([
            'message' => 'Review rejected',
            'review' => $review,
        ]);
    }

    public function destroy($id)
    {
        $review = Review::findOrFail($id);
        $business = $review->business;

        $review->delete();

        if ($business) {
            $business->recalculateRating();
        }

        return response()->json([
            'message' => 'Review deleted successfully',
        ]);
    }

    public function bulkAction(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:approve,reject,delete',
        ]);

        $reviews = Review::with('business')->whereIn('id', $request->ids)->get();
        $count = $reviews->count();

        switch ($request->action) {
            case 'approve':
                Review::whereIn('id', $request->ids)->update(['status' => 'approved']);
                break;
            case 'reject':
                Review::whereIn('id', $request->ids)->update(['status' => 'rejected']);
                break;
            case 'delete':
                Review::whereIn('id', $request->ids)->delete();
                break;
        }

        // Recalculate rating for every affected business
        $reviews->pluck('business')->filter()->unique('id')->each(function ($business) {
            $business->recalculateRating();
        });

        return response()->json([
            'message' => ucfirst($request->action) . " applied to {$count} reviews",
            'affected' => $count,
        ]);
    }
}
