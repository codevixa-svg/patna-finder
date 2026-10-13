<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\NewsletterMail;
use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class NewsletterController extends Controller
{
    /**
     * Paginated subscriber list with search + status filter.
     */
    public function subscribers(Request $request)
    {
        $query = NewsletterSubscriber::query()->latest('subscribed_at')->latest('id');

        if ($request->filled('search')) {
            $search = trim((string) $request->search);
            $query->where(function ($q) use ($search) {
                $q->where('email', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status') && in_array($request->status, [
            NewsletterSubscriber::STATUS_ACTIVE,
            NewsletterSubscriber::STATUS_UNSUBSCRIBED,
        ], true)) {
            $query->where('status', $request->status);
        }

        return response()->json(
            $query->paginate((int) $request->input('per_page', 15))
        );
    }

    /**
     * Headline numbers for the admin newsletter dashboard.
     */
    public function stats()
    {
        return response()->json([
            'total' => NewsletterSubscriber::count(),
            'active' => NewsletterSubscriber::active()->count(),
            'unsubscribed' => NewsletterSubscriber::where('status', NewsletterSubscriber::STATUS_UNSUBSCRIBED)->count(),
            'campaigns' => NewsletterCampaign::count(),
        ]);
    }

    /**
     * Manually add a subscriber from the admin panel.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|max:255',
            'name' => 'nullable|string|max:255',
        ]);

        $email = strtolower(trim($validated['email']));

        $existing = NewsletterSubscriber::where('email', $email)->first();

        if ($existing) {
            if ($existing->is_active()) {
                return response()->json([
                    'message' => 'This email is already subscribed.',
                    'subscriber' => $existing,
                ], 422);
            }

            $existing->update([
                'status' => NewsletterSubscriber::STATUS_ACTIVE,
                'name' => $validated['name'] ?? $existing->name,
                'subscribed_at' => now(),
                'unsubscribed_at' => null,
            ]);

            return response()->json([
                'message' => 'Subscriber reactivated successfully.',
                'subscriber' => $existing,
            ]);
        }

        $subscriber = NewsletterSubscriber::create([
            'email' => $email,
            'name' => $validated['name'] ?? null,
            'source' => 'admin',
            'status' => NewsletterSubscriber::STATUS_ACTIVE,
            'subscribed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Subscriber added successfully.',
            'subscriber' => $subscriber,
        ], 201);
    }

    /**
     * Toggle a subscriber between active / unsubscribed.
     */
    public function toggleActive($id)
    {
        $subscriber = NewsletterSubscriber::findOrFail($id);

        $isActive = $subscriber->is_active();

        $subscriber->update([
            'status' => $isActive
                ? NewsletterSubscriber::STATUS_UNSUBSCRIBED
                : NewsletterSubscriber::STATUS_ACTIVE,
            'subscribed_at' => $isActive ? $subscriber->subscribed_at : now(),
            'unsubscribed_at' => $isActive ? now() : null,
        ]);

        return response()->json([
            'message' => $isActive
                ? 'Subscriber deactivated.'
                : 'Subscriber activated.',
            'subscriber' => $subscriber->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $subscriber = NewsletterSubscriber::findOrFail($id);
        $subscriber->delete();

        return response()->json([
            'message' => 'Subscriber deleted successfully.',
        ]);
    }

    /**
     * Campaign history (newest first).
     */
    public function campaigns(Request $request)
    {
        return response()->json(
            NewsletterCampaign::with('sender:id,name,email')
                ->latest('sent_at')
                ->latest('id')
                ->paginate((int) $request->input('per_page', 10))
        );
    }

    /**
     * Compose + send a newsletter to every active subscriber.
     *
     * QUEUE_CONNECTION is `sync` in this project, so sending happens inline;
     * each recipient is wrapped in try/catch so one SMTP failure doesn't
     * abort the whole campaign, and results are logged in
     * newsletter_campaigns.
     */
    public function send(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:150',
            'body' => 'required|string|max:20000',
        ]);

        $subscribers = NewsletterSubscriber::active()->get();

        if ($subscribers->isEmpty()) {
            return response()->json([
                'message' => 'No active subscribers to send to.',
            ], 422);
        }

        $campaign = NewsletterCampaign::create([
            'subject' => $validated['subject'],
            'body' => $validated['body'],
            'status' => NewsletterCampaign::STATUS_SENDING,
            'total_subscribers' => $subscribers->count(),
            'sent_by' => $request->user()?->id,
        ]);

        $sent = 0;
        $failed = 0;

        foreach ($subscribers as $subscriber) {
            try {
                Mail::to($subscriber->email)->send(
                    new NewsletterMail($subscriber, $campaign)
                );
                $sent++;
            } catch (\Throwable $e) {
                $failed++;
                report($e);
            }
        }

        $campaign->update([
            'status' => $sent === 0 ? NewsletterCampaign::STATUS_FAILED : NewsletterCampaign::STATUS_SENT,
            'sent_count' => $sent,
            'failed_count' => $failed,
            'sent_at' => now(),
        ]);

        return response()->json([
            'message' => "Newsletter sent to {$sent} subscriber(s)"
                . ($failed ? " ({$failed} failed)" : '') . '.',
            'campaign' => $campaign->fresh('sender:id,name,email'),
            'sent' => $sent,
            'failed' => $failed,
        ]);
    }
}

