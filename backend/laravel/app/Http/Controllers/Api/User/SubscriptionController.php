<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class SubscriptionController extends Controller
{
    private function razorpayHeaders(): array
    {
        $keyId = config('services.razorpay.key_id');
        $keySecret = config('services.razorpay.key_secret');
        return [
            'Authorization' => 'Basic ' . base64_encode($keyId . ':' . $keySecret),
            'Content-Type' => 'application/json',
        ];
    }

    private function getPlanPrice(string $plan): float
    {
        return match ($plan) {
            'basic' => 499.00,
            'premium' => 999.00,
            default => 0,
        };
    }

    public function createOrder(Request $request)
    {
        $request->validate([
            'plan' => 'required|in:basic,premium',
        ]);

        $user = $request->user();
        $plan = $request->plan;
        $amount = $this->getPlanPrice($plan);

        // Check if user already has an active plan
        $activeSub = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->first();

        if ($activeSub && $activeSub->plan === $plan) {
            return response()->json(['message' => 'You already have an active ' . $plan . ' plan'], 422);
        }

        // Create Razorpay Order
        $response = Http::withHeaders($this->razorpayHeaders())
            ->post('https://api.razorpay.com/v1/orders', [
                'amount' => $amount * 100, // Razorpay uses paise
                'currency' => 'INR',
                'receipt' => 'sub_' . $user->id . '_' . time(),
                'notes' => [
                    'user_id' => $user->id,
                    'plan' => $plan,
                ],
            ]);

        if ($response->failed()) {
            return response()->json([
                'message' => 'Failed to create payment order',
                'error' => $response->json()['error']['description'] ?? 'Unknown error',
            ], 500);
        }

        $orderData = $response->json();

        // Create pending subscription record
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan' => $plan,
            'amount' => $amount,
            'razorpay_order_id' => $orderData['id'],
            'status' => 'pending',
        ]);

        return response()->json([
            'order_id' => $orderData['id'],
            'amount' => $amount,
            'currency' => 'INR',
            'key_id' => config('services.razorpay.key_id'),
            'plan' => $plan,
            'subscription_id' => $subscription->id,
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
            ],
        ]);
    }

    public function verifyPayment(Request $request)
    {
        $request->validate([
            'razorpay_order_id' => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        $user = $request->user();

        // Find the subscription
        $subscription = Subscription::where('user_id', $user->id)
            ->where('razorpay_order_id', $request->razorpay_order_id)
            ->where('status', 'pending')
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'Subscription not found'], 404);
        }

        // Verify signature
        $generatedSignature = hash_hmac(
            'sha256',
            $request->razorpay_order_id . '|' . $request->razorpay_payment_id,
            config('services.razorpay.key_secret')
        );

        if ($generatedSignature !== $request->razorpay_signature) {
            $subscription->update(['status' => 'failed']);
            return response()->json(['message' => 'Payment verification failed'], 422);
        }

        // Verify payment with Razorpay API
        $response = Http::withHeaders($this->razorpayHeaders())
            ->get("https://api.razorpay.com/v1/payments/{$request->razorpay_payment_id}");

        if ($response->failed() || $response->json()['status'] !== 'captured') {
            $subscription->update(['status' => 'failed']);
            return response()->json(['message' => 'Payment not captured'], 422);
        }

        // Activate subscription
        $subscription->update([
            'razorpay_payment_id' => $request->razorpay_payment_id,
            'razorpay_signature' => $request->razorpay_signature,
            'status' => 'active',
            'starts_at' => now(),
            'expires_at' => now()->addMonth(),
        ]);

        // Update user plan
        $user->update([
            'plan' => $subscription->plan,
            'plan_expires_at' => $subscription->expires_at,
        ]);

        // Cancel any other active subscriptions for this user
        Subscription::where('user_id', $user->id)
            ->where('id', '!=', $subscription->id)
            ->where('status', 'active')
            ->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Payment verified successfully! Your ' . $subscription->plan . ' plan is now active.',
            'subscription' => $subscription,
            'plan' => $subscription->plan,
            'expires_at' => $subscription->expires_at,
        ]);
    }

    public function currentPlan(Request $request)
    {
        $user = $request->user();

        $activeSub = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        return response()->json([
            'plan' => $user->plan ?? 'free',
            'expires_at' => $user->plan_expires_at,
            'subscription' => $activeSub,
            'is_active' => $activeSub ? true : false,
        ]);
    }

    public function cancelSubscription(Request $request)
    {
        $user = $request->user();

        $subscription = Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->first();

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription found'], 404);
        }

        $subscription->update(['status' => 'cancelled']);
        $user->update(['plan' => 'free', 'plan_expires_at' => null]);

        return response()->json([
            'message' => 'Subscription cancelled successfully. You are now on the Free plan.',
            'plan' => 'free',
        ]);
    }

    public function history(Request $request)
    {
        $subscriptions = Subscription::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json($subscriptions);
    }
}
