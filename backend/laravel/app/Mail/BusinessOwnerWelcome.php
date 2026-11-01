<?php

namespace App\Mail;

use App\Models\Business;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BusinessOwnerWelcome extends Mailable
{
    use Queueable, SerializesModels;

    public $business;
    public $user;

    /**
     * Create a new message instance.
     */
    public function __construct(Business $business, User $user)
    {
        $this->business = $business;
        $this->user = $user;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to Patna Finder - Your Business is Live!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.business.welcome',
            with: [
                'business' => $this->business,
                'user' => $this->user,
                'frontendUrl' => config('app.frontend_url'),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
