<?php

namespace App\Mail;

use App\Models\NewsletterCampaign;
use App\Models\NewsletterSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewsletterMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public NewsletterSubscriber $subscriber,
        public NewsletterCampaign $campaign
    ) {}

    public function build()
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
        $unsubscribeUrl = $frontendUrl . '/unsubscribe?token=' . urlencode($this->subscriber->token);

        return $this
            ->subject($this->campaign->subject)
            ->view('emails.newsletter')
            ->with([
                'subscriberName' => $this->subscriber->name,
                'subject' => $this->campaign->subject,
                'body' => $this->campaign->body,
                'unsubscribeUrl' => $unsubscribeUrl,
            ]);
    }
}
