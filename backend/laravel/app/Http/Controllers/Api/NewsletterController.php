<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    /**
     * Public subscribe endpoint — used by the footer, blog and events
     * newsletter forms. Idempotent: re-subscribing an unsubscribed email
     * reactivates it, and an already-active email just gets a friendly reply.
     */
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'source' => 'nullable|string|max:32',
            'name' => 'nullable|string|max:255',
        ]);

        $email = strtolower(trim($validated['email']));

        $subscriber = NewsletterSubscriber::where('email', $email)->first();

        if ($subscriber && $subscriber->is_active()) {
            return response()->json([
                'message' => 'You are already subscribed to the Patna Finder newsletter.',
                'already_subscribed' => true,
            ]);
        }

        if ($subscriber) {
            $subscriber->update([
                'status' => NewsletterSubscriber::STATUS_ACTIVE,
                'source' => $validated['source'] ?? $subscriber->source,
                'name' => $validated['name'] ?? $subscriber->name,
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
            ]);

            return response()->json([
                'message' => 'Welcome back! You are subscribed to the Patna Finder newsletter.',
                'subscriber' => $subscriber,
            ]);
        }

        $subscriber = NewsletterSubscriber::create([
            'email' => $email,
            'name' => $validated['name'] ?? null,
            'source' => $validated['source'] ?? 'footer',
            'status' => NewsletterSubscriber::STATUS_ACTIVE,
            'subscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Subscribed! The latest Patna news will land in your inbox.',
            'subscriber' => $subscriber,
        ], 201);
    }

    /**
     * Public unsubscribe — accepts either the one-click token (from
     * newsletter emails) or the plain email address typed into the
     * /unsubscribe page form.
     */
    public function unsubscribe(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required_without:email|nullable|string|max:64',
            'email' => 'required_without:token|nullable|email|max:255',
        ]);

        if (!empty($validated['token'])) {
            $subscriber = NewsletterSubscriber::where('token', $validated['token'])->first();

            if (!$subscriber) {
                return response()->json([
                    'message' => 'Invalid unsubscribe link.',
                ], 404);
            }
        } else {
            $email = strtolower(trim($validated['email']));

            $subscriber = NewsletterSubscriber::where('email', $email)->first();

            if (!$subscriber) {
                return response()->json([
                    'message' => 'No newsletter subscription found for this email address.',
                ], 404);
            }
        }

        if (!$subscriber->is_active()) {
            return response()->json([
                'message' => 'This email is already unsubscribed.',
                'already_unsubscribed' => true,
            ]);
        }

        $subscriber->update([
            'status' => NewsletterSubscriber::STATUS_UNSUBSCRIBED,
            'unsubscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'You have been unsubscribed from the Patna Finder newsletter.',
        ]);
    }
}
