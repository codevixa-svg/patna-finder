<?php

namespace App\Mail;

use App\Models\Business;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BusinessVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Business $business;

    public string $action; // 'verified' | 'unverified'

    public string $methodLabel;

    public ?string $note;

    public function __construct(Business $business, string $action, string $methodLabel = '', ?string $note = null)
    {
        $this->business = $business;
        $this->action = $action;
        $this->methodLabel = $methodLabel;
        $this->note = $note;
    }

    public function build(): self
    {
        $subject = $this->action === 'verified'
            ? "Your business \"{$this->business->name}\" has been verified - Patna Finder"
            : "Verification removed for \"{$this->business->name}\" - Patna Finder";

        return $this->subject($subject)
            ->view('emails.business-verification');
    }
}
