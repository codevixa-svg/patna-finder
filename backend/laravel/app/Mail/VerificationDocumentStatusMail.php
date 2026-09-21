<?php

namespace App\Mail;

use App\Models\Business;
use App\Models\BusinessVerificationDocument;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class VerificationDocumentStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public Business $business;

    public BusinessVerificationDocument $document;

    public function __construct(Business $business, BusinessVerificationDocument $document)
    {
        $this->business = $business;
        $this->document = $document;
    }

    public function build(): self
    {
        $status = $this->document->status;

        $subject = $status === 'approved'
            ? "Document approved for \"{$this->business->name}\" - Patna Finder"
            : "Document needs attention for \"{$this->business->name}\" - Patna Finder";

        return $this->subject($subject)->view('emails.verification-document-status');
    }
}
