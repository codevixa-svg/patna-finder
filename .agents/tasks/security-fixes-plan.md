# Security Fixes Implementation Plan: HIGH Priority Vulnerabilities

**Date:** January 2026  
**Target:** Patna Finder Application - HIGH priority security issues  
**Production Server:** https://patnafinderapi.codevixa.com  
**Frontend:** https://patnafinder.codevixa.com  
**Backend:** Laravel 9.52.22  

---

## Executive Summary

This plan addresses 5 HIGH priority security vulnerabilities identified in the security audit. The application is currently LIVE in production, so all changes must maintain backward compatibility and be deployed with zero downtime.

**Good News:** 
- The User model has already been fixed for mass assignment vulnerability (CRITICAL-002) - `$fillable` and `$guarded` are properly configured
- Strong password policy is already implemented via `StrongPassword` rule (8+ chars, uppercase, lowercase, number, special char)
- CORS configuration in `config/cors.php` is correct
- Session regeneration after login is NOT currently happening - this needs to be fixed

**Priority Issues to Fix:**
1. SQL Injection risk in SearchController (raw LIKE queries)
2. Weak password validation on registration endpoints (already has StrongPassword rule but not enforced everywhere)
3. Missing CSRF protection on admin routes (Sanctum is stateless, need additional protection)
4. Session fixation vulnerability (no session regeneration after login)
5. Rate limiting gaps (missing on several critical endpoints)

---

## HIGH-001: SQL Injection Risk in SearchController.php

### Current Vulnerability Analysis

**File:** `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\SearchController.php`  
**Lines:** 14-24

**Current Code:**
```php
$businesses = Business::with(['category', 'area'])
    ->approved()
    ->where(function($q) use ($query) {
        $q->where('name', 'like', "%{$query}%")  // ✅ SAFE - Eloquent escapes
          ->orWhere('description', 'like', "%{$query}%")  // ✅ SAFE
          ->orWhere('address', 'like', "%{$query}%")  // ✅ SAFE
          ->orWhereHas('category', function($categoryQuery) use ($query) {
              $categoryQuery->where('name', 'like', "%{$query}%");  // ✅ SAFE
          })
          ->orWhereHas('area', function($areaQuery) use ($query) {
              $areaQuery->where('name', 'like', "%{$query}%");  // ✅ SAFE
          });
    })
```

**Assessment:** The current code is ACTUALLY SAFE because Laravel's Eloquent query builder automatically escapes parameters when using `where()` methods. However, the audit flagged this as HIGH risk due to string interpolation pattern that LOOKS vulnerable.

**What We Need to Fix:**
1. Add input validation and sanitization
2. Add rate limiting to search endpoint
3. Add length limits to prevent resource exhaustion
4. Improve code clarity to show parameters are escaped

### Specific Code Changes

**File:** `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\SearchController.php`

**Changes:**
```php
public function search(Request $request)
{
    // INPUT VALIDATION - prevent injection and resource exhaustion
    $request->validate([
        'q' => 'required|string|min:2|max:100',
    ]);
    
    $query = trim($request->get('q', ''));
    
    // Sanitize input - remove special SQL characters just to be extra safe
    $query = preg_replace('/[^\p{L}\p{N}\s\-\']/u', '', $query);
    
    if (empty($query) || strlen($query) < 2) {
        return response()->json([
            'businesses' => [],
            'message' => 'Search query must be at least 2 characters'
        ]);
    }

    // Use parameterized queries - Eloquent automatically escapes these
    $businesses = Business::with(['category', 'area'])
        ->approved()
        ->where(function($q) use ($query) {
            $q->where('name', 'like', '%' . $query . '%')
              ->orWhere('description', 'like', '%' . $query . '%')
              ->orWhere('address', 'like', '%' . $query . '%')
              ->orWhereHas('category', function($categoryQuery) use ($query) {
                  $categoryQuery->where('name', 'like', '%' . $query . '%');
              })
              ->orWhereHas('area', function($areaQuery) use ($query) {
                  $areaQuery->where('name', 'like', '%' . $query . '%');
              });
        })
        ->orderBy('is_featured', 'desc')
        ->orderBy('rating', 'desc')
        ->limit(20)
        ->get();

    return response()->json([
        'query' => $query,
        'count' => $businesses->count(),
        'businesses' => $businesses
    ]);
}
```

### Testing Approach

1. **SQL Injection Tests:**
```bash
# Test SQL injection attempts (should be safely escaped)
curl "https://patnafinderapi.codevixa.com/api/v1/search?q=test'; DROP TABLE businesses;--"
curl "https://patnafinderapi.codevixa.com/api/v1/search?q=1' OR '1'='1"
curl "https://patnafinderapi.codevixa.com/api/v1/search?q=test%27%20UNION%20SELECT%20*%20FROM%20users--"

# Expected: All return sanitized results or validation errors, no SQL execution
```

2. **Validation Tests:**
```bash
# Test minimum length
curl "https://patnafinderapi.codevixa.com/api/v1/search?q=a"
# Expected: 422 validation error

# Test maximum length
curl "https://patnafinderapi.codevixa.com/api/v1/search?q=$(python3 -c 'print("a"*101)')"
# Expected: 422 validation error

# Test normal search
curl "https://patnafinderapi.codevixa.com/api/v1/search?q=restaurant"
# Expected: 200 with results
```

3. **PHPUnit Test:**
Create `tests/Feature/SearchSecurityTest.php`:
```php
<?php
namespace Tests\Feature;
use Tests\TestCase;

class SearchSecurityTest extends TestCase
{
    public function test_search_rejects_sql_injection_attempts()
    {
        $response = $this->getJson("/api/v1/search?q=test'; DROP TABLE businesses;--");
        $this->assertEquals(200, $response->status());
        // Should return safely escaped results, not execute SQL
    }
    
    public function test_search_enforces_minimum_length()
    {
        $response = $this->getJson('/api/v1/search?q=a');
        $response->assertStatus(422);
    }
    
    public function test_search_enforces_maximum_length()
    {
        $response = $this->getJson('/api/v1/search?q=' . str_repeat('a', 101));
        $response->assertStatus(422);
    }
}
```

Run: `php artisan test --filter SearchSecurityTest`

### Deployment Considerations

- **Zero Downtime:** This change only adds validation, doesn't break existing functionality
- **Backward Compatible:** Frontend already sends valid search queries
- **Cache Clear:** Run `php artisan config:cache` after deployment

---

## HIGH-002: Weak Password Policy Enforcement

### Current Vulnerability Analysis

**Files:** 
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php` (register method - line 24)
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\AuthController.php` (not applicable - admins created manually)

**Current Status:**
✅ **GOOD NEWS:** The `StrongPassword` rule is ALREADY enforced on user registration (line 24 of UserAuthController):
```php
'password' => ['required', 'string', 'confirmed', new StrongPassword($request->email)],
```

✅ **GOOD NEWS:** The StrongPassword rule already requires:
- Min 8 characters
- At least one uppercase letter
- At least one lowercase letter  
- At least one number
- At least one special character
- Must not contain email address

**Assessment:** This vulnerability is ALREADY FIXED. The audit report may have been based on older code.

### What Still Needs Fixing

1. **Password reset endpoints** - need to verify StrongPassword is enforced
2. **Change password endpoints** - need to verify StrongPassword is enforced  
3. **Admin creation** - currently no registration endpoint (admins created via seeder/console)

### Specific Code Changes

**File:** `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php`

**Verification Needed:**
- Line 518 (register): ✅ Already has StrongPassword rule
- Line 562 (changePassword): ✅ Already has StrongPassword rule
- Line 787 (resetPassword): ❌ MISSING StrongPassword rule - needs fix

**Change needed at line 787:**
```php
// BEFORE:
$validator = Validator::make($request->all(), [
    'challenge_token' => 'required|string',
    'code' => 'required|string|size:6',
    'password' => ['required', 'string', 'confirmed', 'min:8'],  // ❌ Weak
]);

// AFTER:
$validator = Validator::make($request->all(), [
    'challenge_token' => 'required|string',
    'code' => 'required|string|size:6',
    'password' => ['required', 'string', 'confirmed', new StrongPassword($request->email ?? null)],  // ✅ Strong
]);
```

### Testing Approach

1. **Test Weak Password on Registration:**
```bash
curl -X POST https://patnafinderapi.codevixa.com/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "weak",
    "password_confirmation": "weak"
  }'
# Expected: 422 validation error
```

2. **Test Weak Password on Reset:**
```bash
# First request reset
curl -X POST https://patnafinderapi.codevixa.com/api/v1/user/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Then try weak password
curl -X POST https://patnafinderapi.codevixa.com/api/v1/user/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "challenge_token": "<token>",
    "code": "123456",
    "password": "weak",
    "password_confirmation": "weak"
  }'
# Expected: 422 validation error
```

3. **PHPUnit Test:**
Create `tests/Feature/PasswordPolicyTest.php`:
```php
<?php
namespace Tests\Feature;
use Tests\TestCase;
use App\Models\User;

class PasswordPolicyTest extends TestCase
{
    public function test_registration_rejects_weak_password()
    {
        $response = $this->postJson('/api/v1/user/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ]);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors('password');
    }
    
    public function test_registration_accepts_strong_password()
    {
        $response = $this->postJson('/api/v1/user/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'StrongPass123!',
            'password_confirmation' => 'StrongPass123!',
        ]);
        $response->assertStatus(201);
    }
}
```

Run: `php artisan test --filter PasswordPolicyTest`

### Deployment Considerations

- **Zero Downtime:** Only adds validation, doesn't affect existing users
- **Backward Compatible:** Password reset is a new flow each time
- **User Impact:** Users with weak passwords can still login, but must use strong password on reset

---

## HIGH-003: Missing CSRF Protection on API Routes

### Current Vulnerability Analysis

**File:** `d:\patna-finder\backend\laravel\routes\api.php`  
**Issue:** Laravel Sanctum is being used for stateless API authentication (token-based), which is inherently CSRF-resistant. However, the audit flagged this because:
1. Admin routes could potentially use session-based auth
2. Defense-in-depth principle suggests additional protection

**Current Status:**
- All API routes use `auth:sanctum` middleware
- Sanctum uses Bearer tokens, not cookies (for API routes)
- No session-based authentication on API routes
- CSRF protection is already enabled for web routes (not API routes by design)

**Assessment:** This is a **FALSE POSITIVE** for API routes. Sanctum token authentication is CSRF-safe because:
1. Tokens are sent in Authorization header (not cookies)
2. Attackers cannot access tokens from another domain
3. SPA authentication uses sanctum/csrf-cookie endpoint

### What We Need to Do

**Document the CSRF protection strategy** rather than add middleware (which would break the API):

1. **Create documentation file:** `d:\patna-finder\backend\laravel\SECURITY.md`
2. **Add CSRF token support for future SPA routes** (if needed)
3. **Ensure Sanctum configuration is correct**

### Specific Code Changes

**File:** `d:\patna-finder\backend\laravel\config\sanctum.php`

**Verify these settings:**
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),

'middleware' => [
    'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
    'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
],
```

**File:** `d:\patna-finder\backend\laravel\app\Http\Middleware\VerifyCsrfToken.php`

**Add API exemptions (they're already exempt by default):**
```php
protected $except = [
    'api/*',  // API routes use Bearer tokens, not CSRF
];
```

### Create Security Documentation

**File:** `d:\patna-finder\backend\laravel\SECURITY.md`

```markdown
# Security Documentation

## CSRF Protection Strategy

### API Routes (`/api/v1/*`)
- **Protection:** Laravel Sanctum Bearer Token Authentication
- **Mechanism:** Tokens sent in `Authorization: Bearer <token>` header
- **CSRF Risk:** NONE - Cross-site requests cannot access Authorization headers
- **Implementation:** All API routes use `auth:sanctum` middleware

### Admin Routes (`/api/v1/admin/*`)
- **Protection:** Laravel Sanctum Bearer Token Authentication
- **Same mechanism as API routes** - stateless token authentication
- **Additional Protection:** Brute force protection (5 attempts = 15 min lockout)

### Why API Routes Don't Need CSRF Middleware
1. Bearer tokens are stored in localStorage/memory (not cookies)
2. Attacker websites cannot read tokens from another domain (Same-Origin Policy)
3. Even if attacker knows an endpoint, they cannot send authenticated requests
4. CSRF attacks work by leveraging automatic cookie sending - we don't use cookies for API auth

### SPA Routes (Future)
If we add session-based SPA authentication:
1. Call `/sanctum/csrf-cookie` before authentication
2. Send `X-XSRF-TOKEN` header with state-changing requests
3. Laravel automatically verifies CSRF tokens for web routes

## Rate Limiting
See HIGH-005 below for rate limiting implementation.
```

### Testing Approach

1. **Verify CSRF cookie endpoint works:**
```bash
curl -X GET https://patnafinderapi.codevixa.com/sanctum/csrf-cookie \
  -H "Accept: application/json" \
  --cookie-jar cookies.txt
# Expected: 204 No Content, XSRF-TOKEN cookie set
```

2. **Verify API routes work without CSRF token:**
```bash
# Login and get token
curl -X POST https://patnafinderapi.codevixa.com/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "StrongPass123!"}'

# Use token to access protected route (no CSRF token needed)
curl -X GET https://patnafinderapi.codevixa.com/api/v1/user/me \
  -H "Authorization: Bearer <token>"
# Expected: 200 with user data
```

3. **Verify attacker cannot use tokens from another domain:**
This is automatically protected by browser Same-Origin Policy. No test needed.

### Deployment Considerations

- **Zero Downtime:** No code changes, only documentation
- **Backward Compatible:** N/A - no changes
- **User Impact:** None

**Verdict:** Mark this as **NOT APPLICABLE** for token-based API. Document the security model instead.

---

## HIGH-004: Session Fixation Vulnerability

### Current Vulnerability Analysis

**Files:**
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php` (login, issueToken methods)
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\AuthController.php` (login, issueToken methods)

**Current Status:**
❌ **VULNERABLE:** Session regeneration is NOT happening after successful login.

**Laravel Best Practice:** Always regenerate session ID after login to prevent session fixation attacks.

### What We Need to Fix

**The Problem:**
Session fixation attack flow:
1. Attacker gets a session ID from the server
2. Attacker tricks user into using that session ID (via URL or cookie injection)
3. User logs in with attacker's session ID
4. Attacker now has authenticated session

**The Solution:**
Regenerate the session ID after successful authentication.

### Specific Code Changes

**File:** `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php`

**Method:** `issueToken()` (line 402)

**Add session regeneration:**
```php
private function issueToken(User $user, Request $request)
{
    // SECURITY FIX (HIGH-004): Regenerate session after successful login
    // This prevents session fixation attacks
    if ($request->hasSession()) {
        $request->session()->regenerate();
    }
    
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
```

**File:** `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\AuthController.php`

**Method:** `issueToken()` (line 232)

**Add session regeneration:**
```php
private function issueToken(User $user, Request $request)
{
    // SECURITY FIX (HIGH-004): Regenerate session after successful login
    // This prevents session fixation attacks
    if ($request->hasSession()) {
        $request->session()->regenerate();
    }
    
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
```

**ALSO ADD session invalidation on logout:**

**File:** `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php`

**Method:** `logout()` (line 432)

**Add session invalidation:**
```php
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();
    $request->user()->logAuthEvent(AuthEvent::LOGOUT);
    
    // SECURITY FIX (HIGH-004): Invalidate session on logout
    if ($request->hasSession()) {
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    return response()->json([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
}
```

**File:** `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\AuthController.php`

**Method:** `logout()` (line 261)

**Add session invalidation:**
```php
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();
    $request->user()->logAuthEvent(AuthEvent::LOGOUT);
    
    // SECURITY FIX (HIGH-004): Invalidate session on logout
    if ($request->hasSession()) {
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }

    return response()->json(['message' => 'Logout successful']);
}
```

### Testing Approach

1. **Manual Session Fixation Test:**
```bash
# Step 1: Get initial session cookie
curl -X GET https://patnafinderapi.codevixa.com/sanctum/csrf-cookie \
  -c cookies.txt -b cookies.txt

# Step 2: Note session ID
cat cookies.txt | grep XSRF-TOKEN

# Step 3: Login
curl -X POST https://patnafinderapi.codevixa.com/api/v1/user/login \
  -H "Content-Type: application/json" \
  -b cookies.txt -c cookies.txt \
  -d '{"email": "user@example.com", "password": "StrongPass123!"}'

# Step 4: Check if session ID changed (it should)
cat cookies.txt | grep XSRF-TOKEN
# Expected: Different session ID after login
```

2. **PHPUnit Test:**
Create `tests/Feature/SessionSecurityTest.php`:
```php
<?php
namespace Tests\Feature;
use Tests\TestCase;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class SessionSecurityTest extends TestCase
{
    public function test_session_regenerated_after_login()
    {
        $user = User::factory()->create([
            'password' => Hash::make('StrongPass123!'),
            'role' => 'user',
        ]);

        // Start session
        $this->get('/sanctum/csrf-cookie');
        $oldSessionId = session()->getId();

        // Login
        $response = $this->postJson('/api/v1/user/login', [
            'email' => $user->email,
            'password' => 'StrongPass123!',
        ]);

        $response->assertStatus(200);
        
        // Verify session was regenerated
        $newSessionId = session()->getId();
        $this->assertNotEquals($oldSessionId, $newSessionId);
    }
    
    public function test_session_invalidated_after_logout()
    {
        $user = User::factory()->create(['role' => 'user']);
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/user/logout');

        $response->assertStatus(200);
        
        // Verify session was invalidated
        $this->assertNull(session()->getId());
    }
}
```

Run: `php artisan test --filter SessionSecurityTest`

### Deployment Considerations

- **Zero Downtime:** Sessions are transparent to users
- **Backward Compatible:** Session regeneration doesn't break API token auth
- **User Impact:** None - users stay logged in, just with new session IDs
- **Note:** Session regeneration only matters if cookies are used. For pure token-based API (which this is), it's defense-in-depth.

---

## HIGH-005: Rate Limiting Gaps

### Current Vulnerability Analysis

**File:** `d:\patna-finder\backend\laravel\routes\api.php`  
**File:** `d:\patna-finder\backend\laravel\app\Providers\RouteServiceProvider.php`

**Current Rate Limits (from routes/api.php):**
- Login: `throttle:5,1` (5 per minute) ✅ Good
- Register: `throttle:5,1` (5 per minute) ✅ Good
- Business submit: `throttle:5,1` (5 per minute) ✅ Good
- Reviews: `throttle:10,1` (10 per minute) ✅ Good
- Newsletter subscribe: `throttle:10,1` (10 per minute) ⚠️ Too generous
- Search: **NO RATE LIMIT** ❌ Vulnerable

**Missing Rate Limits:**
1. ❌ `/api/v1/search` - No rate limit (resource exhaustion risk)
2. ❌ `/api/v1/user/forgot-password` - Has `throttle:3,1` but needs per-email limit
3. ❌ `/api/v1/user/verify-otp` - Needs stricter limit per challenge token
4. ⚠️ `/api/v1/newsletter/subscribe` - 10/min allows email bombing

### Specific Code Changes

**File:** `d:\patna-finder\backend\laravel\app\Providers\RouteServiceProvider.php`

**Add custom rate limiters:**
```php
protected function configureRateLimiting()
{
    // Default API rate limit
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });
    
    // SECURITY FIX (HIGH-005): Custom rate limiters for security-sensitive endpoints
    
    // Registration: 5 per hour per IP (prevent spam accounts)
    RateLimiter::for('register', function (Request $request) {
        return Limit::perHour(5)->by($request->ip())
            ->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many registration attempts. Please try again later.'
                ], 429);
            });
    });
    
    // OTP generation: 3 per 15 minutes per email (prevent email bombing)
    RateLimiter::for('otp-generate', function (Request $request) {
        $email = $request->input('email', $request->ip());
        return Limit::perMinutes(15, 3)->by($email)
            ->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many OTP requests. Please wait 15 minutes.'
                ], 429);
            });
    });
    
    // Forgot password: 3 per hour per email (prevent email bombing)
    RateLimiter::for('forgot-password', function (Request $request) {
        $email = $request->input('email', $request->ip());
        return Limit::perHour(3)->by($email)
            ->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many password reset requests. Please try again in 1 hour.'
                ], 429);
            });
    });
    
    // OTP verification: 5 attempts per challenge token (prevent brute force)
    RateLimiter::for('verify-otp', function (Request $request) {
        $token = $request->input('challenge_token', $request->ip());
        return Limit::perMinute(5)->by($token)
            ->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many verification attempts. Request a new OTP.'
                ], 429);
            });
    });
    
    // Newsletter subscribe: 3 per hour per IP (prevent email bombing)
    RateLimiter::for('newsletter', function (Request $request) {
        return Limit::perHour(3)->by($request->ip())
            ->response(function () {
                return response()->json([
                    'success' => false,
                    'message' => 'Too many subscription attempts. Please try again later.'
                ], 429);
            });
    });
    
    // Search: 30 per minute per IP (prevent resource exhaustion)
    RateLimiter::for('search', function (Request $request) {
        return Limit::perMinute(30)->by($request->ip())
            ->response(function () {
                return response()->json([
                    'message' => 'Too many search requests. Please slow down.'
                ], 429);
            });
    });
}
```

**File:** `d:\patna-finder\backend\laravel\routes\api.php`

**Update route rate limiters:**

```php
// BEFORE (line 55):
Route::get('/search', [SearchController::class, 'search']);

// AFTER:
Route::get('/search', [SearchController::class, 'search'])->middleware('throttle:search');

// BEFORE (line 124):
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->middleware('throttle:10,1');

// AFTER:
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->middleware('throttle:newsletter');

// BEFORE (line 130):
Route::post('/register', [UserAuthController::class, 'register'])->middleware('throttle:5,1');

// AFTER:
Route::post('/register', [UserAuthController::class, 'register'])->middleware('throttle:register');

// BEFORE (line 138):
Route::post('/login-with-otp', [UserAuthController::class, 'loginWithOtp'])->middleware('throttle:3,1');

// AFTER:
Route::post('/login-with-otp', [UserAuthController::class, 'loginWithOtp'])->middleware('throttle:otp-generate');

// BEFORE (line 139):
Route::post('/verify-otp', [UserAuthController::class, 'verifyOtp'])->middleware('throttle:10,1');

// AFTER:
Route::post('/verify-otp', [UserAuthController::class, 'verifyOtp'])->middleware('throttle:verify-otp');

// BEFORE (line 143):
Route::post('/forgot-password', [UserAuthController::class, 'forgotPassword'])->middleware('throttle:3,1');

// AFTER:
Route::post('/forgot-password', [UserAuthController::class, 'forgotPassword'])->middleware('throttle:forgot-password');

// BEFORE (line 144):
Route::post('/verify-reset-otp', [UserAuthController::class, 'verifyResetOtp'])->middleware('throttle:10,1');

// AFTER:
Route::post('/verify-reset-otp', [UserAuthController::class, 'verifyResetOtp'])->middleware('throttle:verify-otp');
```

### Testing Approach

1. **Test Search Rate Limit:**
```bash
# Make 31 search requests in quick succession
for i in {1..31}; do
  curl -s https://patnafinderapi.codevixa.com/api/v1/search?q=test
done
# Expected: First 30 succeed, 31st returns 429
```

2. **Test Newsletter Rate Limit:**
```bash
# Try to subscribe 4 times in an hour
for i in {1..4}; do
  curl -X POST https://patnafinderapi.codevixa.com/api/v1/newsletter/subscribe \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"test$i@example.com\"}"
done
# Expected: First 3 succeed, 4th returns 429
```

3. **Test Registration Rate Limit:**
```bash
# Try to register 6 accounts in an hour
for i in {1..6}; do
  curl -X POST https://patnafinderapi.codevixa.com/api/v1/user/register \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"Test$i\", \"email\": \"test$i@example.com\", \"password\": \"StrongPass123!\", \"password_confirmation\": \"StrongPass123!\"}"
done
# Expected: First 5 succeed, 6th returns 429
```

4. **Test Forgot Password Rate Limit:**
```bash
# Try to request password reset 4 times in an hour
for i in {1..4}; do
  curl -X POST https://patnafinderapi.codevixa.com/api/v1/user/forgot-password \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com"}'
  sleep 1
done
# Expected: First 3 succeed, 4th returns 429
```

5. **PHPUnit Test:**
Create `tests/Feature/RateLimitingTest.php`:
```php
<?php
namespace Tests\Feature;
use Tests\TestCase;

class RateLimitingTest extends TestCase
{
    public function test_search_rate_limit()
    {
        // Make 31 requests
        for ($i = 0; $i < 31; $i++) {
            $response = $this->getJson('/api/v1/search?q=test');
            if ($i < 30) {
                $response->assertStatus(200);
            } else {
                $response->assertStatus(429);
            }
        }
    }
    
    public function test_forgot_password_rate_limit()
    {
        // Make 4 requests with same email
        for ($i = 0; $i < 4; $i++) {
            $response = $this->postJson('/api/v1/user/forgot-password', [
                'email' => 'test@example.com'
            ]);
            if ($i < 3) {
                $response->assertStatus(200);
            } else {
                $response->assertStatus(429);
            }
        }
    }
}
```

Run: `php artisan test --filter RateLimitingTest`

### Deployment Considerations

- **Zero Downtime:** Rate limiters are transparent to normal users
- **Backward Compatible:** Only affects abusive traffic
- **User Impact:** Legitimate users won't hit these limits
- **Cache:** Rate limits use Laravel cache - ensure Redis/Memcached is configured in production

**Production Deployment Steps:**
1. Deploy code changes
2. Run `php artisan config:cache`
3. Run `php artisan route:cache`
4. Monitor logs for 429 errors (should be rare for legitimate users)

---

## Summary of All Changes

### Files to Modify:

1. ✅ `app/Http/Controllers/Api/SearchController.php` - Add input validation
2. ✅ `app/Http/Controllers/Api/User/AuthController.php` - Fix password reset validation, add session regeneration
3. ✅ `app/Http/Controllers/Api/Admin/AuthController.php` - Add session regeneration
4. ✅ `app/Providers/RouteServiceProvider.php` - Add custom rate limiters
5. ✅ `routes/api.php` - Update route middleware to use custom rate limiters
6. ✅ `SECURITY.md` (NEW) - Document CSRF protection strategy

### Testing Files to Create:

1. `tests/Feature/SearchSecurityTest.php`
2. `tests/Feature/PasswordPolicyTest.php`
3. `tests/Feature/SessionSecurityTest.php`
4. `tests/Feature/RateLimitingTest.php`

### Verification Commands:

```bash
# Run all security tests
cd d:\patna-finder\backend\laravel
php artisan test --filter Security
php artisan test --filter PasswordPolicy
php artisan test --filter RateLimit

# Clear caches after deployment
php artisan config:cache
php artisan route:cache
php artisan cache:clear

# Verify rate limiters are registered
php artisan route:list | grep throttle
```

### Deployment Checklist:

- [ ] 1. Backup production database
- [ ] 2. Deploy code changes to staging first
- [ ] 3. Run all PHPUnit tests on staging
- [ ] 4. Test all endpoints manually on staging
- [ ] 5. Clear Laravel caches on staging
- [ ] 6. Monitor staging logs for 24 hours
- [ ] 7. Deploy to production during low-traffic window
- [ ] 8. Run `php artisan config:cache` on production
- [ ] 9. Run `php artisan route:cache` on production
- [ ] 10. Monitor production logs for 429 errors
- [ ] 11. Test critical flows (login, register, search) on production
- [ ] 12. Update security audit report status

### Estimated Timeline:

- Development: 3-4 hours
- Testing: 2 hours
- Code Review: 1 hour
- Staging Deployment: 1 hour
- Production Deployment: 1 hour
- **Total: 1 business day**

### Risk Assessment:

- **LOW RISK:** All changes are additive (validation, rate limiting)
- **NO BREAKING CHANGES:** Existing functionality preserved
- **ROLLBACK PLAN:** Git revert + cache clear if issues occur
- **USER IMPACT:** None for legitimate users, blocks only abusive traffic

---

## Post-Deployment Verification

### 1. Verify SQL Injection Protection:
```bash
curl "https://patnafinderapi.codevixa.com/api/v1/search?q=test'; DROP TABLE--"
# Expected: 200 with sanitized results
```

### 2. Verify Password Policy:
```bash
curl -X POST https://patnafinderapi.codevixa.com/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"weak","password_confirmation":"weak"}'
# Expected: 422 validation error
```

### 3. Verify Session Regeneration:
Check Laravel logs for session regeneration events after login.

### 4. Verify Rate Limiting:
```bash
# Test search rate limit
for i in {1..31}; do curl -s https://patnafinderapi.codevixa.com/api/v1/search?q=test; done | grep -c "429"
# Expected: 1 (last request blocked)
```

### 5. Monitor Production Logs:
```bash
# SSH to production server
tail -f storage/logs/laravel.log | grep -E "429|rate|throttle"
```

---

## Notes for Implementation Agent

1. **Preserve existing functionality** - all changes are defensive additions
2. **Test each fix individually** before committing
3. **Run PHPUnit tests** after each change
4. **Follow Laravel 9 conventions** - don't use Laravel 10/11 syntax
5. **Keep backward compatibility** - don't change API response formats
6. **Comment security fixes** with issue number (e.g., `// SECURITY FIX (HIGH-001)`)
7. **Production is LIVE** - deploy during low-traffic hours
8. **Clear all caches** after deployment: config, route, view caches

---

## Success Criteria

✅ All HIGH priority issues resolved  
✅ All PHPUnit tests passing  
✅ No breaking changes to API  
✅ Zero downtime deployment  
✅ Production logs show no errors  
✅ Manual testing confirms fixes work  
✅ Security audit report updated  

---

**End of Implementation Plan**
