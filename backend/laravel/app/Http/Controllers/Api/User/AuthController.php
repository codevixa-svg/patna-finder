<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AuthEvent;
use App\Models\LoginChallenge;
use App\Rules\StrongPassword;
use App\Services\Security\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            // AWS IAM-style strong password policy
            'password' => ['required', 'string', 'confirmed', new StrongPassword($request->email)],
            'phone' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => strtolower($request->email),
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'user',
            'is_active' => true,
        ]);

        $user->logAuthEvent(AuthEvent::REGISTER);

        $token = $user->createToken('user-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'user' => $this->userPayload($user),
                'token' => $token,
            ]
        ], 201);
    }

    /**
     * Login with AWS Cognito-style flow:
     *  1. Brute-force lockout (5 fails = 15 min lock)
     *  2. Credentials
     *  3. Optional MFA (if user enabled 2FA)
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', strtolower($request->email))->first();

        // Brute-force lockout — checked BEFORE credential verification so a locked
        // account is rejected regardless of whether the password is correct.
        if ($user && $user->isLockedOut()) {
            $user->logAuthEvent(AuthEvent::LOCKED_OUT);
            return response()->json([
                'success' => false,
                'message' => 'Account temporarily locked due to multiple failed login attempts. Try again later.',
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
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        // Only allow regular users (not admins)
        if (in_array($user->role, ['super_admin', 'admin', 'moderator'])) {
            return response()->json([
                'success' => false,
                'message' => 'Please use admin panel to login'
            ], 403);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is inactive'
            ], 403);
        }

        $user->clearFailedLogins();

        // ── Optional MFA (user-enabled 2FA) ──
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
                'success' => true,
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
     * OTP-ONLY LOGIN: Request OTP after email+password verification
     * POST /api/v1/user/login-with-otp
     */
    public function loginWithOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', strtolower($request->email))->first();

        // Check brute force BEFORE credential verification
        if ($user && $user->isLockedOut()) {
            $user->logAuthEvent(AuthEvent::LOCKED_OUT);
            return response()->json([
                'success' => false,
                'message' => 'Account temporarily locked. Try again later.',
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
                'success' => false,
                'message' => 'The provided credentials are incorrect'
            ], 401);
        }

        // Only allow regular users (not admins)
        if (in_array($user->role, ['super_admin', 'admin', 'moderator'])) {
            return response()->json([
                'success' => false,
                'message' => 'Please use admin panel to login'
            ], 403);
        }

        if (!$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account is inactive'
            ], 403);
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
            'success' => true,
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
     * VERIFY OTP and issue token (for OTP-only login)
     * POST /api/v1/user/verify-otp
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'challenge_token' => 'required|string',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

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

            return response()->json([
                'success' => false,
                'message' => $message,
            ], $reason === 'invalid_code' ? 422 : 410);
        }

        if (!$user || in_array($user->role, ['super_admin', 'admin', 'moderator']) || !$user->is_active) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $user->logAuthEvent(AuthEvent::MFA_VERIFIED);

        return $this->issueToken($user, $request);
    }

    /**
     * Resend OTP (for OTP-only login)
     * POST /api/v1/user/resend-otp
     */
    public function resendOtp(Request $request)
    {
        $request->validate(['challenge_token' => 'required|string']);

        $challenge = LoginChallenge::where('token', $request->challenge_token)->first();

        if (!$challenge || $challenge->method !== 'email_otp' || $challenge->consumed_at || $challenge->expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Challenge expired. Please request a new OTP.'
            ], 410);
        }

        $code = app(OtpService::class)->resend($challenge);

        if ($code === null) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait ' . OtpService::RESEND_COOLDOWN . ' seconds before requesting another code.',
                'resend_in' => OtpService::RESEND_COOLDOWN,
            ], 429);
        }

        return response()->json([
            'success' => true,
            'message' => 'A new OTP has been sent to your email.',
            'expires_in' => OtpService::TTL_MINUTES * 60,
            // Only present when MAIL_MAILER=log (local dev)
            'dev_code' => $code ?: null,
        ]);
    }

    /**
     * Verify MFA code and issue token (AWS Cognito MFA step).
     * POST /api/v1/user/verify-mfa
     */
    public function verifyMfa(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'challenge_token' => 'required|string',
            'code' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $challenge = LoginChallenge::where('token', $request->challenge_token)->first();

        [$ok, $reason] = app(OtpService::class)->verifyChallenge($challenge, $request->code);
        $user = $challenge?->user;

        if (!$ok) {
            if ($user) {
                $user->logAuthEvent(AuthEvent::MFA_FAILED);
            }

            $message = match ($reason) {
                'challenge_expired' => 'This verification session has expired. Please login again.',
                'too_many_attempts' => 'Too many incorrect attempts. Please login again.',
                default => 'Invalid verification code.',
            };

            return response()->json([
                'success' => false,
                'message' => $message,
            ], $reason === 'invalid_code' ? 422 : 410);
        }

        if (!$user || in_array($user->role, ['super_admin', 'admin', 'moderator']) || !$user->is_active) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $user->logAuthEvent(AuthEvent::MFA_VERIFIED);

        return $this->issueToken($user, $request);
    }

    /**
     * Resend email OTP for an active challenge.
     * POST /api/v1/user/resend-mfa
     */
    public function resendMfa(Request $request)
    {
        $request->validate(['challenge_token' => 'required|string']);

        $challenge = LoginChallenge::where('token', $request->challenge_token)->first();

        if (!$challenge || $challenge->method !== 'email_otp' || $challenge->consumed_at || $challenge->expires_at->isPast()) {
            return response()->json([
                'success' => false,
                'message' => 'Challenge expired. Please login again.'
            ], 410);
        }

        $code = app(OtpService::class)->resend($challenge);

        if ($code === null) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait ' . OtpService::RESEND_COOLDOWN . ' seconds before requesting another code.',
                'resend_in' => OtpService::RESEND_COOLDOWN,
            ], 429);
        }

        return response()->json([
            'success' => true,
            'message' => 'A new verification code has been sent to your email.',
            'expires_in' => OtpService::TTL_MINUTES * 60,
            // Only present when MAIL_MAILER=log (local dev)
            'dev_code' => $code ?: null,
        ]);
    }

    private function issueToken(User $user, Request $request)
    {
        $user->update(['last_login_at' => now()]);
        $user->forceFill([
            'last_login_ip' => $request->ip(),
            'last_login_user_agent' => substr((string) $request->userAgent(), 0, 500),
        ])->save();

        $user->logAuthEvent(AuthEvent::LOGIN_SUCCESS);

        $token = $user->createToken('user-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $this->userPayload($user),
                'token' => $token,
            ]
        ]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'mfa_enabled' => $user->mfa_enabled,
        ];
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        $request->user()->logAuthEvent(AuthEvent::LOGOUT);

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Sign out from ALL devices (AWS Cognito Global Sign-Out).
     * POST /api/v1/user/logout-all
     */
    public function logoutAll(Request $request)
    {
        $request->user()->tokens()->delete();
        $request->user()->logAuthEvent(AuthEvent::LOGOUT_ALL);

        return response()->json([
            'success' => true,
            'message' => 'Signed out from all devices successfully'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'is_active' => $user->is_active,
                'mfa_enabled' => $user->mfa_enabled,
                'totp_enabled' => (bool) $user->mfa_secret,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'new_password' => ['required', 'string', 'confirmed', new StrongPassword($request->user()->email)],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        // Invalidate all other sessions after password change (AWS-style)
        $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();
        $user->logAuthEvent(AuthEvent::PASSWORD_CHANGED);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully. Other sessions have been signed out.'
        ]);
    }

    /**
     * Security overview — MFA status + recent auth activity (audit log).
     * GET /api/v1/user/security
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
            'success' => true,
            'data' => [
                'mfa_enabled' => $user->mfa_enabled,
                'totp_enabled' => (bool) $user->mfa_secret,
                'active_tokens' => $user->tokens()->count(),
                'last_login' => [
                    'at' => $user->last_login_at,
                    'ip' => $user->last_login_ip,
                    'user_agent' => $user->last_login_user_agent,
                ],
                'events' => $events,
            ]
        ]);
    }

    /**
     * Toggle Email OTP 2FA (optional for users).
     * POST /api/v1/user/security/mfa
     */
    public function toggleMfa(Request $request)
    {
        $request->validate(['enabled' => 'required|boolean']);
        $user = $request->user();

        $user->update(['mfa_enabled' => $request->boolean('enabled')]);
        $user->logAuthEvent($request->boolean('enabled') ? AuthEvent::MFA_ENABLED : AuthEvent::MFA_DISABLED);

        return response()->json([
            'success' => true,
            'message' => $request->boolean('enabled')
                ? 'Two-factor authentication enabled. You will receive an email code on every login.'
                : 'Two-factor authentication disabled.',
            'data' => ['mfa_enabled' => $user->mfa_enabled],
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

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['name', 'phone', 'avatar']));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
            ]
        ]);
    }

    /**
     * Mask email for OTP response: r***a@gmail.com
     */
    private function maskEmail(string $email): string
    {
        [$local, $domain] = array_pad(explode('@', $email, 2), 2, '');
        $first = substr($local, 0, 1);
        $last = strlen($local) > 2 ? substr($local, -1) : '';
        return $first . str_repeat('*', max(3, strlen($local) - 2)) . $last . '@' . $domain;
    }
}
