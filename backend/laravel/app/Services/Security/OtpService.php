<?php

namespace App\Services\Security;

use App\Mail\MfaCodeMail;
use App\Models\LoginChallenge;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

/**
 * Email-OTP second factor service (AWS Cognito-style MFA challenge sessions).
 */
class OtpService
{
    public const TTL_MINUTES = 10;        // challenge + code validity
    public const MAX_ATTEMPTS = 5;        // code guesses per challenge
    public const RESEND_COOLDOWN = 60;    // seconds between OTP emails

    /**
     * Create an MFA challenge for the user and (optionally) email the code.
     *
     * @return array{token: string, method: string, expires_at: \Carbon\CarbonInterface}
     */
    public function createChallenge(User $user, string $method, string $ip, string $userAgent): array
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $challenge = LoginChallenge::create([
            'token' => bin2hex(random_bytes(32)), // 256-bit token
            'user_id' => $user->id,
            'method' => $method,
            'code_hash' => in_array($method, ['email_otp', 'password_reset']) ? Hash::make($code) : null,
            'otp_sent_at' => in_array($method, ['email_otp', 'password_reset']) ? now() : null,
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::TTL_MINUTES),
            'ip_address' => $ip,
            'user_agent' => $userAgent,
        ]);

        if (in_array($method, ['email_otp', 'password_reset'])) {
            Mail::to($user->email)->send(new MfaCodeMail($user->name, $code, self::TTL_MINUTES));
        }

        $result = [
            'token' => $challenge->token,
            'method' => $method,
            'expires_at' => $challenge->expires_at,
        ];

        // Local dev helper: when the mailer is "log" no real email is sent,
        // so expose the code in the API response so developers can log in.
        if (in_array($method, ['email_otp', 'password_reset']) && config('mail.default') === 'log') {
            $result['dev_code'] = $code;
        }

        return $result;
    }

    /**
     * Verify the challenge + code. Consumes the challenge on success.
     */
    public function verifyChallenge(?LoginChallenge $challenge, string $code): array
    {
        // [ok, reason]
        if (!$challenge || $challenge->consumed_at || $challenge->expires_at->isPast()) {
            return [false, 'challenge_expired'];
        }
        if ($challenge->attempts >= self::MAX_ATTEMPTS) {
            return [false, 'too_many_attempts'];
        }

        $challenge->increment('attempts');

        if ($challenge->method === 'totp') {
            $secret = decrypt($challenge->user->mfa_secret);
            $ok = app(TotpService::class)->verify($secret, $code);
        } else {
            $ok = $challenge->code_hash && Hash::check($code, $challenge->code_hash);
        }

        if ($ok) {
            $challenge->update(['consumed_at' => now()]);
        } else {
            // Invalidate challenge after too many wrong guesses
            if ($challenge->fresh()->attempts >= self::MAX_ATTEMPTS) {
                $challenge->update(['consumed_at' => now()]);
            }
        }

        return [$ok, $ok ? 'verified' : 'invalid_code'];
    }

    /**
     * Resend the email OTP for an active challenge (throttled).
     *
     * @return string|null The new code when mailer is "log" (dev helper), null on failure.
     */
    public function resend(LoginChallenge $challenge): ?string
    {
        if (!in_array($challenge->method, ['email_otp', 'password_reset']) || $challenge->consumed_at || $challenge->expires_at->isPast()) {
            return null;
        }
        if ($challenge->otp_sent_at && $challenge->otp_sent_at->diffInSeconds(now()) < self::RESEND_COOLDOWN) {
            return null;
        }

        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $challenge->update([
            'code_hash' => Hash::make($code),
            'otp_sent_at' => now(),
            'attempts' => 0,
            'expires_at' => now()->addMinutes(self::TTL_MINUTES),
        ]);

        Mail::to($challenge->user->email)->send(new MfaCodeMail($challenge->user->name, $code, self::TTL_MINUTES));

        return config('mail.default') === 'log' ? $code : '';
    }

    /**
     * Clean up expired/consumed challenges (housekeeping).
     */
    public static function prune(): void
    {
        DB::table('login_challenges')
            ->where('expires_at', '<', now()->subDay())
            ->delete();
    }
}
