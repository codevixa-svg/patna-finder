<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function index(Request $request)
    {
        $query = Subscription::with('user');

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('plan') && $request->plan !== 'all') {
            $query->where('plan', $request->plan);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $subscriptions = $query->latest()->paginate($request->get('per_page', 20));

        return response()->json($subscriptions);
    }

    public function show($id)
    {
        $subscription = Subscription::with('user')->findOrFail($id);
        return response()->json($subscription);
    }

    public function cancel($id)
    {
        $subscription = Subscription::with('user')->findOrFail($id);

        if ($subscription->status !== 'active') {
            return response()->json(['message' => 'Subscription is not active'], 422);
        }

        $subscription->update(['status' => 'cancelled']);

        // Downgrade user to free if this was their active plan
        $user = $subscription->user;
        $activeSub = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('id', '!=', $subscription->id)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if ($activeSub) {
            $user->update(['plan' => $activeSub->plan, 'plan_expires_at' => $activeSub->expires_at]);
        } else {
            $user->update(['plan' => 'free', 'plan_expires_at' => null]);
        }

        return response()->json([
            'message' => 'Subscription cancelled successfully',
            'subscription' => $subscription->fresh()->load('user'),
        ]);
    }
}
