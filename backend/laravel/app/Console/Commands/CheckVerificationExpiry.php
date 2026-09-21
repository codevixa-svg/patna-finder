<?php

namespace App\Console\Commands;

use App\Models\Business;
use App\Models\BusinessVerificationDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class CheckVerificationExpiry extends Command
{
    protected $signature = 'verification:check-expiry';

    protected $description = 'Send document expiry reminders (30 days before) and re-verification reminders (1 year after verify)';

    public function handle(): int
    {
        $this->checkDocumentExpiry();
        $this->checkReverification();

        return self::SUCCESS;
    }

    /**
     * Approved documents expiring within 30 days -> owner reminder (once).
     * Already expired documents -> owner notice (once).
     */
    private function checkDocumentExpiry(): void
    {
        $expiring = BusinessVerificationDocument::with('business.user')
            ->where('status', 'approved')
            ->whereNotNull('expires_at')
            ->whereBetween('expires_at', [now()->toDateString(), now()->addDays(30)->toDateString()])
            ->whereNull('reminder_sent_at')
            ->get();

        foreach ($expiring as $doc) {
            $email = $doc->business->email ?: $doc->business->user?->email;

            if ($email) {
                $this->sendSafely(
                    $email,
                    "Document expiring soon - {$doc->business->name} - Patna Finder",
                    "Namaste!\n\n" .
                    "Aapke business \"{$doc->business->name}\" ka {$doc->doc_type_label} " .
                    $doc->expires_at->format('d M Y') . " ko expire ho jayega ({$doc->days_until_expiry} din bache hain).\n\n" .
                    "Kripya renewed document dashboard se upload karein taaki Verified badge bana rahe.\n\nTeam Patna Finder"
                );
            }

            $doc->update(['reminder_sent_at' => now()]);
            $this->info("Expiry reminder sent for doc #{$doc->id} (business {$doc->business_id})");
        }

        $expired = BusinessVerificationDocument::with('business.user')
            ->where('status', 'approved')
            ->whereNotNull('expires_at')
            ->whereDate('expires_at', '<', now()->toDateString())
            ->whereNull('expired_notified_at')
            ->get();

        foreach ($expired as $doc) {
            $email = $doc->business->email ?: $doc->business->user?->email;

            if ($email) {
                $this->sendSafely(
                    $email,
                    "Document expired - {$doc->business->name} - Patna Finder",
                    "Namaste!\n\n" .
                    "Aapke business \"{$doc->business->name}\" ka {$doc->doc_type_label} " .
                    $doc->expires_at->format('d M Y') . " ko expire ho chuka hai.\n\n" .
                    "Naya document upload karein, warna aapka Verified badge remove ho sakta hai.\n\nTeam Patna Finder"
                );
            }

            $doc->update(['expired_notified_at' => now()]);
            $this->info("Expired notice sent for doc #{$doc->id}");
        }
    }

    /**
     * Businesses verified 1+ year ago -> owner re-verification reminder (once)
     * and they appear in the admin reverify_due queue.
     */
    private function checkReverification(): void
    {
        $businesses = Business::with('user')
            ->where('is_verified', true)
            ->whereNotNull('reverify_due_at')
            ->whereDate('reverify_due_at', '<=', now()->toDateString())
            ->whereNull('reverify_notified_at')
            ->get();

        foreach ($businesses as $business) {
            $email = $business->email ?: $business->user?->email;

            if ($email) {
                $this->sendSafely(
                    $email,
                    "Re-verification needed - {$business->name} - Patna Finder",
                    "Namaste!\n\n" .
                    "Aapke business \"{$business->name}\" ki verification 1 saal purani ho gayi hai.\n" .
                    "Verified badge banaye rakhne ke liye re-verification zaroori hai.\n\n" .
                    "Team aapko jaldi hi contact karegi, ya aap dashboard se updated documents upload kar sakte hain.\n\nTeam Patna Finder"
                );
            }

            $business->update(['reverify_notified_at' => now()]);
            $this->info("Re-verification reminder sent for business #{$business->id}");
        }
    }

    private function sendSafely(string $to, string $subject, string $body): void
    {
        try {
            Mail::raw($body, function ($message) use ($to, $subject) {
                $message->to($to)->subject($subject);
            });
        } catch (\Throwable $e) {
            report($e);
            $this->warn("Mail failed for {$to}: {$e->getMessage()}");
        }
    }
}
