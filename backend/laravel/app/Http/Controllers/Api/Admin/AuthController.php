<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuthEvent;
use App\Models\LoginChallenge;
use App\Services\Security\OtpService;
use App\Services\Security\TotpService;
use App\Rules\StrongPassword;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Step 1 — Admin Login with AWS Cognito-style flow:
     *  1. Brute-force lockout check (5 fails = 15 min lock)
     *  2. Credential verification
     *  3. If MFA enabled → issue challenge token + email OTP / TOTP method
     *  4. Else → issue API token
     * POST /api/v1/admin/login
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', strtolower($request->email))->first();

        // Brute-force lockout (AWS Cognito adaptive lockout style) — checked BEFORE
        // credential verification so a locked account is rejected regardless of password.
        if ($user && $user->isLockedOut()) {
            $user->logAuthEvent(AuthEvent::LOCKED_OUT);
            return response()->json([
                'error' => 'Account temporarily locked due to multiple failed login attempts.',
                'locked' => true,
                'retry_after_seconds' => $user->secondsUntilUnlock(),
            ], 423);
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            if ($user) {
                $user->recordFailedLogin();
                $user->logAuthEvent($user->isLockedOut() ? AuthEvent::LOCKED_OUT : AuthEvent::LOGIN_FAILED);
            }
            return response()->json([
                'error' => 'The provided credentials are incorrect.',
            ], 401);
        }

        if (!$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized. Admin access required.'], 403);
        }

        if (!$user->is_active) {
            return response()->json(['error' => 'Your account has been deactivated.'], 403);
        }

        // Successful password check → reset failed attempts
        $user->clearFailedLogins();

        // ── MFA second factor (AWS Cognito MFA) ──
        if ($user->mfa_enabled) {
            $method = $user->mfa_secret ? 'totp' : 'email_otp';
            $challenge = app(OtpService::class)->createChallenge(
                $user,
                $method,
                $request->ip(),
                substr((string) $request->userAgent(), 0, 500)
            );

            $user->logAuthEvent(AuthEvent::MFA_CHALLENGE);

            return response()->json([
                'message' => 'MFA verification required',
                'mfa_required' => true,
                'challenge_token' => $challenge['token'],
                'method' => $method,
                'email_masked' => $this->maskEmail($user->email),
                'expires_in' => OtpService::TTL_MINUTES * 60,
                'resend_in' => OtpService::RESEND_COOLDOWN,
                // Only present when MAIL_MAILER=log (local dev) — no real email is sent
                'dev_code' => $challenge['dev_code'] ?? null,
            ]);
        }

        return $this->issueToken($user, $request);
    }

    /**
     * OTP-ONLY LOGIN: Request OTP after email+password verification - FOR ADMINS
     * POST /api/v1/admin/login-with-otp
     */
    public function loginWithOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', strtolower($request->email))->first();

        // Check brute force BEFORE credential verification
        if ($user && $user->isLockedOut()) {
            $user->logAuthEvent(AuthEvent::LOCKED_OUT);
            return response()->json([
                'error' => 'Account temporarily locked. Try again later.',
                'locked' => true,
                'retry_after_seconds' => $user->secondsUntilUnlock(),
            ], 423);
        }

        // Verify password
        if (!$user || !Hash::check($request->password, $user->password)) {
            if ($user) {
                $user->recordFailedLogin();
                $user->logAuthEvent($user->isLockedOut() ? AuthEvent::LOCKED_OUT : AuthEvent::LOGIN_FAILED);
            }
            return response()->json([
                'error' => 'The provided credentials are incorrect.'
            ], 401);
        }

        if (!$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized. Admin access required.'], 403);
        }

        if (!$user->is_active) {
            return response()->json(['error' => 'Your account has been deactivated.'], 403);
        }

        // Successful password check → reset failed attempts
        $user->clearFailedLogins();

        // Create OTP challenge
        $challenge = app(OtpService::class)->createChallenge(
            $user,
            'email_otp',
            $request->ip(),
            substr((string) $request->userAgent(), 0, 500)
        );

        $user->logAuthEvent(AuthEvent::MFA_CHALLENGE);

        return response()->json([
            'message' => 'OTP sent to your email address',
            'challenge_token' => $challenge['token'],
            'email_masked' => $this->maskEmail($user->email),
            'expires_in' => OtpService::TTL_MINUTES * 60,
            'resend_in' => OtpService::RESEND_COOLDOWN,
            // Only present when MAIL_MAILER=log (local dev)
            'dev_code' => $challenge['dev_code'] ?? null,
        ]);
    }

    /**
     * VERIFY OTP and issue token (for OTP-only login) - FOR ADMINS
     * POST /api/v1/admin/verify-otp
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'challenge_token' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        $challenge = LoginChallenge::where('token', $request->challenge_token)->first();

        [$ok, $reason] = app(OtpService::class)->verifyChallenge($challenge, $request->code);
        $user = $challenge?->user;

        if (!$ok) {
            if ($user) {
                $user->logAuthEvent(AuthEvent::MFA_FAILED);
            }

            $message = match ($reason) {
                'challenge_expired' => 'This verification session has expired. Please request a new OTP.',
                'too_many_attempts' => 'Too many incorrect attempts. Please request a new OTP.',
                default => 'Invalid OTP code.',
            };

            $remaining = ($challenge && $reason === 'invalid_code')
                ? max(0, OtpService::MAX_ATTEMPTS - $challenge->attempts)
                : 0;

            throw ValidationException::withMessages([
                'code' => [$message . ($remaining > 0 ? " {$remaining} attempts remaining." : '')],
            ]);
        }

        if (!$user || !$user->isAdmin() || !$user->is_active) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user->logAuthEvent(AuthEvent::MFA_VERIFIED);

        return $this->issueToken($user, $request);
    }

    /**
     * Resend OTP (for OTP-only login) - FOR ADMINS
     * POST /api/v1/admin/resend-otp
     */
    public function resendOtp(Request $request)
    {
        $request->validate(['challenge_token' => 'required|string']);

        $challenge = LoginChallenge::where('token', $request->challenge_token)->first();

        if (!$challenge || $challenge->method !== 'email_otp' || $challenge->consumed_at || $challenge->expires_at->isPast()) {
            return response()->json([
                'error' => 'Challenge expired. Please request a new OTP.'
            ], 410);
        }

        $code = app(OtpService::class)->resend($challenge);

        if ($code === null) {
            return response()->json([
                'error' => 'Please wait ' . OtpService::RESEND_COOLDOWN . ' seconds before requesting another code.',
                'resend_in' => OtpService::RESEND_COOLDOWN,
            ], 429);
        }

        return response()->json([
            'message' => 'A new OTP has been sent to your email.',
            'expires_in' => OtpService::TTL_MINUTES * 60,
            // Only present when MAIL_MAILER=log (local dev)
            'dev_code' => $code ?: null,
        ]);
    }

    /**
     * Step 2 — Verify MFA code (email OTP or TOTP) and issue token.
     * POST /api/v1/admin/verify-mfa
     */
    public function verifyMfa(Request $request)
    {
        $request->validate([
            'challenge_token' => 'required|string',
            'code' => 'required|string',
        ]);

        $challenge = LoginChallenge::where('token', $request->challenge_token)->first();

        [$ok, $reason] = app(OtpService::class)->verifyChallenge($challenge, $request->code);
        $user = $challenge?->user;

        if (!$ok) {
            if ($user) {
                $user->logAuthEvent(AuthEvent::MFA_FAILED);
            }

            $messages = match ($reason) {
                'challenge_expired' => 'This verification session has expired. Please login again.',
                'too_many_attempts' => 'Too many incorrect attempts. Please login again.',
                default => 'Invalid verification code.',
            };

            $remaining = ($challenge && $reason === 'invalid_code')
                ? max(0, OtpService::MAX_ATTEMPTS - $challenge->attempts)
                : 0;

            throw ValidationException::withMessages([
                'code' => [$messages . ($remaining > 0 ? " {$remaining} attempts remaining." : '')],
            ]);
        }

        if (!$user || !$user->isAdmin() || !$user->is_active) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user->logAuthEvent(AuthEvent::MFA_VERIFIED);

        return $this->issueToken($user, $request);
    }

    /**
     * Resend the email OTP for an active challenge.
     * POST /api/v1/admin/resend-mfa
     */
    public function resendMfa(Request $request)
    {
        $request->validate(['challenge_token' => 'required|string']);

        $challenge = LoginChallenge::where('token', $request->challenge_token)->first();

        if (!$challenge || $challenge->method !== 'email_otp' || $challenge->consumed_at || $challenge->expires_at->isPast()) {
            return response()->json(['error' => 'Challenge expired. Please login again.'], 410);
        }

        $executed = RateLimiter::attempt(
            key: 'mfa-resend:' . $challenge->id,
            maxAttempts: 2,
            callback: fn () => app(OtpService::class)->resend($challenge),
            decaySeconds: OtpService::RESEND_COOLDOWN,
        );

        if ($executed === false) {
            return response()->json([
                'error' => 'Please wait before requesting another code.',
                'resend_in' => OtpService::RESEND_COOLDOWN,
            ], 429);
        }

        return response()->json([
            'message' => 'A new verification code has been sent to your email.',
            'expires_in' => OtpService::TTL_MINUTES * 60,
            // Only present when MAIL_MAILER=log (local dev)
            'dev_code' => $executed ?: null,
        ]);
    }

    /**
     * Issue Sanctum token after successful authentication.
     */
    private function issueToken(User $user, Request $request)
    {
        $user->updateLastLogin();
        $user->forceFill([
            'last_login_ip' => $request->ip(),
            'last_login_user_agent' => substr((string) $request->userAgent(), 0, 500),
        ])->save();

        $user->logAuthEvent(AuthEvent::LOGIN_SUCCESS);

        $token = $user->createToken('admin-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'permissions' => $user->permissions,
                'avatar' => $user->avatar,
                'mfa_enabled' => $user->mfa_enabled,
            ],
            'token' => $token,
        ]);
    }

    /**
     * Get Authenticated Admin User
     * GET /api/v1/admin/me
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'permissions' => $user->permissions,
            'avatar' => $user->avatar,
            'is_super_admin' => $user->isSuperAdmin(),
            'is_admin' => $user->isAdmin(),
            'mfa_enabled' => $user->mfa_enabled,
            'totp_enabled' => (bool) $user->mfa_secret,
            'last_login_at' => $user->last_login_at,
            'last_login_ip' => $user->last_login_ip,
            'created_at' => $user->created_at,
        ]);
    }

    /**
     * Logout (current device only)
     * POST /api/v1/admin/logout
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        $request->user()->logAuthEvent(AuthEvent::LOGOUT);

        return response()->json(['message' => 'Logout successful']);
    }

    /**
     * Logout from ALL devices (AWS Cognito "Global Sign-Out")
     * POST /api/v1/admin/logout-all
     */
    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();
        $request->user()->logAuthEvent(AuthEvent::LOGOUT_ALL);

        return response()->json(['message' => 'Signed out from all devices successfully']);
    }

    /**
     * Change Password (AWS IAM-style strong password policy)
     * POST /api/v1/admin/change-password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => ['required', 'confirmed', new StrongPassword($request->user()->email)],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Current password is incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        // Invalidate all other sessions after password change (AWS-style)
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();
        $user->logAuthEvent(AuthEvent::PASSWORD_CHANGED);

        return response()->json([
            'message' => 'Password changed successfully. Other sessions have been signed out.',
        ]);
    }

    /**
     * Security overview — MFA status + recent auth activity (audit log)
     * GET /api/v1/admin/security
     */
    public function securityOverview(Request $request)
    {
        $user = $request->user();

        $events = AuthEvent::where('user_id', $user->id)
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($e) => [
                'id' => $e->id,
                'event' => $e->event,
                'ip_address' => $e->ip_address,
                'user_agent' => $e->user_agent,
                'created_at' => $e->created_at,
            ]);

        return response()->json([
            'mfa_enabled' => $user->mfa_enabled,
            'totp_enabled' => (bool) $user->mfa_secret,
            'active_tokens' => $user->tokens()->count(),
            'last_login' => [
                'at' => $user->last_login_at,
                'ip' => $user->last_login_ip,
                'user_agent' => $user->last_login_user_agent,
            ],
            'events' => $events,
        ]);
    }

    /**
     * Toggle Email OTP MFA
     * POST /api/v1/admin/security/mfa
     */
    public function toggleMfa(Request $request)
    {
        $request->validate(['enabled' => 'required|boolean']);
        $user = $request->user();

        // Admins cannot disable the only security factor
        if (!$request->boolean('enabled') && !$user->mfa_secret && $user->isAdmin()) {
            return response()->json([
                'error' => 'Admin accounts must keep at least one MFA method enabled. Set up an authenticator app first.',
            ], 422);
        }

        $user->update(['mfa_enabled' => $request->boolean('enabled')]);
        $user->logAuthEvent($request->boolean('enabled') ? AuthEvent::MFA_ENABLED : AuthEvent::MFA_DISABLED);

        return response()->json([
            'message' => $request->boolean('enabled')
                ? 'Email OTP verification enabled.'
                : 'Email OTP verification disabled.',
            'mfa_enabled' => $user->mfa_enabled,
        ]);
    }

    /**
     * Begin TOTP (Google Authenticator) setup — returns secret + otpauth URI.
     * POST /api/v1/admin/security/totp/setup
     */
    public function totpSetup(Request $request)
    {
        $user = $request->user();
        $totp = app(TotpService::class);

        $secret = $totp->generateSecret();
        // Store encrypted — becomes active only after confirm
        $user->forceFill(['mfa_secret' => Crypt::encryptString($secret)])->save();
        $user->logAuthEvent(AuthEvent::TOTP_SETUP);

        return response()->json([
            'secret' => $secret,
            'otpauth_url' => $totp->otpauthUri($secret, $user->email),
            'message' => 'Scan the QR code or enter the key in your authenticator app, then confirm with a 6-digit code.',
        ]);
    }

    /**
     * Confirm TOTP setup by verifying a live code.
     * POST /api/v1/admin/security/totp/confirm
     */
    public function totpConfirm(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        $user = $request->user();

        if (!$user->mfa_secret) {
            return response()->json(['error' => 'No pending TOTP setup found. Call setup first.'], 422);
        }

        $secret = Crypt::decryptString($user->mfa_secret);

        if (!app(TotpService::class)->verify($secret, $request->code)) {
            throw ValidationException::withMessages([
                'code' => ['Invalid code. Make sure your authenticator app time is synced and try again.'],
            ]);
        }

        $user->update(['mfa_enabled' => true]);
        $user->logAuthEvent(AuthEvent::MFA_ENABLED);

        return response()->json([
            'message' => 'Authenticator app linked successfully. TOTP MFA is now active.',
            'mfa_enabled' => true,
            'totp_enabled' => true,
        ]);
    }

    /**
     * Disable TOTP MFA.
     * POST /api/v1/admin/security/totp/disable
     */
    public function totpDisable(Request $request)
    {
        $user = $request->user();
        $user->forceFill(['mfa_secret' => null])->save();

        // Admins must keep a factor — fall back to email OTP
        if ($user->isAdmin() && !$user->mfa_enabled) {
            $user->update(['mfa_enabled' => true]);
        }

        $user->logAuthEvent(AuthEvent::MFA_DISABLED);

        return response()->json([
            'message' => 'Authenticator app removed. Email OTP verification remains active.',
            'totp_enabled' => false,
            'mfa_enabled' => $user->mfa_enabled,
        ]);
    }

    /**
     * Mask email for MFA response: j***n@example.com
     */
    private function maskEmail(string $email): string
    {
        [$local, $domain] = array_pad(explode('@', $email, 2), 2, '');
        $first = substr($local, 0, 1);
        $last = strlen($local) > 2 ? substr($local, -1) : '';
        return $first . str_repeat('*', max(3, strlen($local) - 2)) . $last . '@' . $domain;
    }
}


