<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class MfaCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $name,
        public string $code,
        public int $minutes
    ) {}

    public function build()
    {
        return $this
            ->subject("Patna Finder verification code: {$this->code}")
            ->view('mail.mfa-code');
    }
}
