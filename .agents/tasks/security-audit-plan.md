# Security Audit Plan: Patna Finder / KHOJYA Application

**Audit Date:** January 2026  
**Application:** Patna Finder (Local Business Discovery Platform)  
**Stack:** Laravel 9 Backend + Next.js 16 Frontend  
**Scope:** Full-stack security assessment covering authentication, authorization, API security, file uploads, data protection, and OWASP Top 10

---

## Executive Summary

This comprehensive security audit plan targets the Patna Finder application, a Laravel + Next.js platform for local business discovery. The audit focuses on 8 critical security domains identified from the original user request and codebase exploration.

**Recent Security Context:**
- Production CORS misconfiguration detected (localhost:3000 allowed on live server)
- Missing constant caused 500 error in password reset flow (PASSWORD_RESET_REQUESTED)
- Email OTP and TOTP MFA implementation in place but requires validation
- File upload handlers exist for both admin and user dashboards

---

## 1. Authentication Security Audit

### 1.1 Password Policy & Storage
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Rules\StrongPassword.php`
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php` (lines 1-50, 400-500)
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\AuthController.php` (lines 1-50, 200-250)
- `d:\patna-finder\backend\laravel\app\Models\User.php` (password hashing)

**Security Checks:**
- [ ] Verify StrongPassword rule enforces minimum 8 characters, complexity requirements
- [ ] Confirm passwords are hashed using bcrypt/argon2 (check User model)
- [ ] Validate password confirmation is required on registration and password change
- [ ] Check for password history prevention (reuse of old passwords)
- [ ] Verify password cannot contain email address (check StrongPassword implementation)
- [ ] Test password reset tokens expire after 10 minutes (TTL_MINUTES constant)
- [ ] Ensure old password required for password changes

**Expected Vulnerabilities:**
- Weak password complexity requirements
- Missing password history checks
- Insufficient password reset token entropy

**Verification:** Run unit tests for password validation rules; attempt registration with weak passwords

---

### 1.2 Multi-Factor Authentication (MFA)
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Services\Security\OtpService.php`
- `d:\patna-finder\backend\laravel\app\Services\Security\TotpService.php`
- `d:\patna-finder\backend\laravel\app\Models\LoginChallenge.php`
- `d:\patna-finder\backend\laravel\app\Mail\MfaCodeMail.php`

**Security Checks:**
- [ ] Verify OTP codes are 6 digits with sufficient randomness (0-999999)
- [ ] Confirm OTP hashing before storage (code_hash field uses Hash::make)
- [ ] Validate 10-minute expiration on MFA challenges (expires_at)
- [ ] Check maximum 5 attempts per challenge (MAX_ATTEMPTS constant)
- [ ] Verify TOTP secret encryption (mfa_secret field uses Crypt::encryptString)
- [ ] Confirm TOTP time window is reasonable (30-60 seconds)
- [ ] Test MFA bypass vectors (race conditions, challenge reuse)
- [ ] Verify email OTP resend cooldown (60 seconds - RESEND_COOLDOWN)
- [ ] Check if consumed challenges are properly invalidated (consumed_at field)
- [ ] Validate admin MFA enforcement (admins must keep one MFA method)

**Expected Vulnerabilities:**
- OTP enumeration through timing attacks
- Challenge token prediction
- Missing rate limiting on OTP generation
- TOTP secret stored in plaintext

**Verification:** Attempt MFA bypass; test OTP brute-force; verify challenge expiration

---

### 1.3 Session & Token Management
**Files to Audit:**
- `d:\patna-finder\backend\laravel\config\sanctum.php`
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php` (issueToken method)
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\AuthController.php` (issueToken method)
- `d:\patna-finder\frontend\lib\userApi.ts` (interceptors)
- `d:\patna-finder\frontend\lib\adminApi.ts` (interceptors)

**Security Checks:**
- [ ] Verify Sanctum token expiration is configured (check sanctum.php)
- [ ] Confirm tokens are revoked on logout (currentAccessToken()->delete())
- [ ] Validate logout-all functionality revokes all user tokens (tokens()->delete())
- [ ] Check password change invalidates other sessions (password changed flow)
- [ ] Verify tokens stored securely in localStorage (XSS risk assessment)
- [ ] Test for session fixation vulnerabilities
- [ ] Confirm CSRF protection is active (sanctum/csrf-cookie endpoint)
- [ ] Validate token refresh mechanism if implemented
- [ ] Check for concurrent session limits

**Expected Vulnerabilities:**
- No token expiration (infinite tokens)
- Tokens not revoked on password change
- Session fixation attacks
- XSS-based token theft from localStorage

**Verification:** Test token lifecycle; attempt session hijacking; verify revocation on security events

---

### 1.4 Account Lockout & Brute-Force Protection
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Models\User.php` (lockout methods)
- `d:\patna-finder\backend\laravel\routes\api.php` (throttle middleware)
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php` (login method lines 70-150)
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\AuthController.php` (login method lines 20-80)

**Security Checks:**
- [ ] Verify 5 failed attempts trigger lockout (MAX_FAILED_ATTEMPTS = 5)
- [ ] Confirm 15-minute lockout duration (LOCKOUT_MINUTES = 15)
- [ ] Check lockout is checked BEFORE password verification (timing attack prevention)
- [ ] Validate rate limiting on login endpoints (throttle:5,1 in routes)
- [ ] Test rate limiting on password reset (throttle:3,1)
- [ ] Verify rate limiting on OTP endpoints (throttle:10,1 for verify, throttle:2,1 for resend)
- [ ] Check if lockout bypasses are possible (email enumeration)
- [ ] Validate lockout countdown accuracy (secondsUntilUnlock method)
- [ ] Test distributed brute-force attacks (IP-based vs account-based)

**Expected Vulnerabilities:**
- Insufficient rate limiting
- Lockout bypass through timing analysis
- No CAPTCHA on repeated failures
- Account enumeration through lockout messages

**Verification:** Trigger lockout with 5 failed attempts; test rate limit effectiveness; verify timing attacks

---

### 1.5 Password Reset Flow
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php` (forgotPassword, verifyResetOtp, resetPassword methods)
- `d:\patna-finder\backend\laravel\app\Models\AuthEvent.php` (PASSWORD_RESET_REQUESTED constant - recently added)
- `d:\patna-finder\backend\laravel\app\Services\Security\OtpService.php` (password_reset method)

**Security Checks:**
- [ ] Verify email enumeration protection (always returns success message)
- [ ] Confirm reset tokens are single-use (consumed_at field)
- [ ] Validate 10-minute expiration on reset challenges
- [ ] Check OTP verification before password reset (two-step: verify then reset)
- [ ] Test reset token prediction/brute-force
- [ ] Verify old sessions invalidated after password reset (tokens()->delete())
- [ ] Confirm no password reset for admin accounts through user endpoint
- [ ] Check AuthEvent.PASSWORD_RESET_REQUESTED constant exists (production bug fix)
- [ ] Validate rate limiting on reset requests (throttle:3,1)

**Expected Vulnerabilities:**
- Email enumeration through response timing
- Reset token reuse
- Missing session invalidation
- Admin account reset through user endpoint

**Verification:** Test complete password reset flow; attempt token reuse; verify session invalidation

---

## 2. Authorization & Access Control Audit

### 2.1 Role-Based Access Control (RBAC)
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Models\User.php` (role methods and constants)
- `d:\patna-finder\backend\laravel\app\Http\Middleware\IsAdmin.php`
- `d:\patna-finder\backend\laravel\app\Http\Middleware\IsSuperAdmin.php`
- `d:\patna-finder\backend\laravel\routes\api.php` (middleware assignments)

**Security Checks:**
- [ ] Verify role hierarchy: super_admin > admin > moderator > user
- [ ] Confirm isSuperAdmin, isAdmin, isModerator methods work correctly
- [ ] Validate admin middleware blocks non-admin users
- [ ] Check super_admin middleware blocks non-super-admin users
- [ ] Test privilege escalation vectors (role field manipulation)
- [ ] Verify user cannot access admin endpoints (role check in auth controllers)
- [ ] Confirm admin cannot access super_admin-only endpoints
- [ ] Validate role changes are logged in audit trail
- [ ] Check for horizontal privilege escalation (user A accessing user B's data)

**Expected Vulnerabilities:**
- Missing role checks on sensitive endpoints
- Role field directly modifiable through mass assignment
- Horizontal privilege escalation
- Inconsistent role enforcement

**Verification:** Attempt cross-role access; test privilege escalation; verify middleware enforcement

---

### 2.2 Permission System
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Models\User.php` (hasPermission, canManage methods)
- `d:\patna-finder\backend\laravel\routes\api.php` (admin routes with permissions)
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\UserController.php`

**Security Checks:**
- [ ] Verify super_admin has all permissions by default
- [ ] Confirm permissions array is properly cast (permissions => 'array' in User model)
- [ ] Validate canManage method for resource-level permissions
- [ ] Check permission enforcement in admin controllers
- [ ] Test permission bypass vectors (null permissions array)
- [ ] Verify permission changes require super_admin role
- [ ] Validate granular permissions: manage_businesses, manage_reviews, manage_blog, etc.
- [ ] Check for missing permission checks on destructive operations

**Expected Vulnerabilities:**
- Missing permission checks on sensitive operations
- Permissions bypassable with null/empty array
- Direct permission manipulation
- Inconsistent permission enforcement

**Verification:** Test resource access with different permission sets; attempt permission escalation

---

### 2.3 Business Ownership & Data Isolation
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\BusinessController.php`
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\BusinessController.php`
- `d:\patna-finder\backend\laravel\app\Models\Business.php`
- `d:\patna-finder\backend\laravel\app\Models\User.php` (businesses relationship)

**Security Checks:**
- [ ] Verify user can only edit their own businesses (user_id check)
- [ ] Confirm business creation assigns correct user_id
- [ ] Validate business update checks ownership before allowing changes
- [ ] Check business deletion requires ownership or admin role
- [ ] Test IDOR (Insecure Direct Object Reference) vulnerabilities
- [ ] Verify admin can access all businesses regardless of owner
- [ ] Confirm business query scoping prevents data leakage
- [ ] Validate subscription-based feature access (verified badge, featured listing)

**Expected Vulnerabilities:**
- IDOR allowing users to modify others' businesses
- Missing ownership validation on updates/deletes
- Business data leakage through unscoped queries
- Subscription bypass for premium features

**Verification:** Attempt to modify another user's business; test IDOR with sequential IDs

---

## 3. API Security Audit

### 3.1 CORS Configuration
**Files to Audit:**
- `d:\patna-finder\backend\laravel\config\cors.php`
- `d:\patna-finder\backend\laravel\public\.htaccess`
- `d:\patna-finder\backend\laravel\routes\api.php` (OPTIONS handler)
- `d:\patna-finder\backend\laravel\.env` (FRONTEND_URL)

**Security Checks:**
- [ ] **CRITICAL:** Verify FRONTEND_URL in production .env matches live domain
- [ ] Confirm cors.php uses FRONTEND_URL from .env (not hardcoded localhost:3000)
- [ ] Validate .htaccess CORS headers match config (dynamic SetEnvIf Origin)
- [ ] Check OPTIONS preflight handler returns correct headers
- [ ] Test CORS with unauthorized origins (should be blocked)
- [ ] Verify Access-Control-Allow-Credentials is true only for allowed origins
- [ ] Confirm no wildcard (*) origins in production
- [ ] Validate exposed headers are minimal (Authorization only)

**Expected Vulnerabilities:**
- **CONFIRMED:** Production server allows localhost:3000 (from user report)
- Wildcard CORS origins
- Missing origin validation
- Overly permissive exposed headers

**Verification:** Test CORS from unauthorized domains; verify production .env FRONTEND_URL

---

### 3.2 Rate Limiting
**Files to Audit:**
- `d:\patna-finder\backend\laravel\routes\api.php` (all throttle middleware)
- `d:\patna-finder\backend\laravel\config\app.php` (rate limiter config)
- `d:\patna-finder\backend\laravel\app\Providers\RouteServiceProvider.php`

**Security Checks:**
- [ ] Verify login endpoints: throttle:5,1 (5 attempts per minute)
- [ ] Confirm password reset: throttle:3,1 (3 attempts per minute)
- [ ] Validate OTP verify: throttle:10,1 (10 attempts per minute)
- [ ] Check OTP resend: throttle:2,1 (2 attempts per minute)
- [ ] Test review submission: throttle:10,1
- [ ] Verify business submission: throttle:5,1
- [ ] Confirm newsletter subscribe: throttle:10,1
- [ ] Validate tracking endpoint: throttle:120,1 (GMB-style analytics)
- [ ] Check newsletter send (admin): throttle:5,1
- [ ] Test rate limit bypass vectors (IP rotation, header manipulation)
- [ ] Verify rate limiting is IP-based or user-based

**Expected Vulnerabilities:**
- Insufficient rate limits on expensive operations
- Rate limit bypass through X-Forwarded-For manipulation
- Missing rate limits on search/query endpoints
- No distributed rate limiting (per-server vs global)

**Verification:** Trigger rate limits on each endpoint; test bypass techniques

---

### 3.3 Input Validation & Sanitization
**Files to Audit:**
- All controllers in `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\`
- `d:\patna-finder\backend\laravel\app\Rules\StrongPassword.php`
- `d:\patna-finder\backend\laravel\app\Http\Requests\` (if exists)

**Security Checks:**
- [ ] Verify all POST/PUT endpoints have validation rules
- [ ] Confirm email validation on registration, login, password reset
- [ ] Check phone number format validation
- [ ] Validate URL inputs (website, social links) use 'url' rule
- [ ] Test for SQL injection in search/filter parameters
- [ ] Verify integer/numeric validation on IDs
- [ ] Check max length limits on text fields
- [ ] Validate JSON fields (opening_hours, services, gallery, amenities)
- [ ] Test for XSS in user-generated content (business descriptions, reviews)
- [ ] Verify slug generation prevents injection (Str::slug usage)
- [ ] Check for LDAP/NoSQL injection if applicable

**Expected Vulnerabilities:**
- Missing validation on optional fields
- SQL injection in search queries
- XSS in rich text fields
- JSON injection in structured data
- Insufficient length limits

**Verification:** Attempt SQL injection in search; test XSS payloads in text fields; validate all inputs

---

### 3.4 Mass Assignment Protection
**Files to Audit:**
- All models in `d:\patna-finder\backend\laravel\app\Models\`
- All controllers performing create/update operations

**Security Checks:**
- [ ] Verify User model has $fillable or $guarded defined
- [ ] Confirm role field is NOT mass-assignable (not in $fillable)
- [ ] Check permissions field is NOT mass-assignable
- [ ] Validate is_active field is NOT mass-assignable
- [ ] Verify Business model protects status, is_verified, is_featured fields
- [ ] Confirm controllers use validated data, not $request->all()
- [ ] Check for _method parameter tampering
- [ ] Test mass assignment bypass through unexpected fields

**Expected Vulnerabilities:**
- Role escalation through mass assignment
- Privilege fields directly modifiable
- Missing $fillable/$guarded definitions
- Controllers using $request->all() directly

**Verification:** Attempt to set role/permissions through registration; test field injection

---

### 3.5 API Response Data Exposure
**Files to Audit:**
- All API controllers returning user data
- `d:\patna-finder\backend\laravel\app\Models\User.php` ($hidden attribute)
- All admin and user dashboard API responses

**Security Checks:**
- [ ] Verify User model hides: password, remember_token, mfa_secret, locked_until, failed_login_attempts
- [ ] Confirm API responses don't expose internal IDs unnecessarily
- [ ] Check admin endpoints don't leak sensitive user data to non-admins
- [ ] Validate error messages don't expose stack traces in production
- [ ] Verify APP_DEBUG=false in production .env
- [ ] Check for leaked database structure in error responses
- [ ] Confirm pagination doesn't expose total record counts on sensitive data
- [ ] Test for information disclosure in 404/403/500 responses

**Expected Vulnerabilities:**
- Sensitive fields exposed in API responses
- Stack traces visible in production
- Internal system details in error messages
- Database schema leaked through errors

**Verification:** Inspect all API responses for sensitive data; trigger errors to check exposure

---

## 4. Database Security Audit

### 4.1 SQL Injection Prevention
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\SearchController.php`
- All controllers with database queries
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\BusinessController.php` (index method with filters)

**Security Checks:**
- [ ] Verify all queries use Eloquent ORM or parameterized queries
- [ ] Check search functionality uses proper escaping (SearchController)
- [ ] Validate WHERE clauses use bindings, not string concatenation
- [ ] Test LIKE queries for injection (business name, category searches)
- [ ] Confirm ORDER BY clauses validate input
- [ ] Check raw queries use parameter binding (DB::raw usage)
- [ ] Validate complex queries with joins use parameterization
- [ ] Test stored procedures if any exist

**Expected Vulnerabilities:**
- SQL injection in search queries
- Unsafe raw queries
- Unvalidated ORDER BY parameters
- LIKE clause injection

**Verification:** Attempt SQL injection payloads in search; test complex filters with injection

---

### 4.2 Database Credentials & Connection Security
**Files to Audit:**
- `d:\patna-finder\backend\laravel\.env`
- `d:\patna-finder\backend\laravel\.env.example`
- `d:\patna-finder\backend\laravel\config\database.php`

**Security Checks:**
- [ ] Verify .env is not in version control (.gitignore)
- [ ] Confirm .env.example doesn't contain real credentials
- [ ] Check database user has minimal required privileges
- [ ] Validate database connection uses SSL if remote
- [ ] Verify database password complexity
- [ ] Confirm different credentials for dev/staging/production
- [ ] Check for hardcoded credentials in config files
- [ ] Validate database backups are encrypted

**Expected Vulnerabilities:**
- .env committed to git
- Weak database passwords
- Database user with excessive privileges
- Unencrypted database connections

**Verification:** Check git history for .env; review database user permissions

---

### 4.3 Data Encryption
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Models\User.php` (mfa_secret encryption)
- `d:\patna-finder\backend\laravel\app\Services\Security\TotpService.php`
- All models storing sensitive data

**Security Checks:**
- [ ] Verify mfa_secret is encrypted (Crypt::encryptString usage confirmed)
- [ ] Check APP_KEY is properly generated (32-byte base64)
- [ ] Confirm sensitive fields use Eloquent encryption casts if available
- [ ] Validate payment data is not stored directly (PCI compliance)
- [ ] Check PII (Personally Identifiable Information) encryption
- [ ] Verify encryption key rotation procedures exist
- [ ] Confirm backup encryption includes encrypted fields

**Expected Vulnerabilities:**
- Sensitive data stored in plaintext
- Weak or default APP_KEY
- Missing encryption on PII
- No key rotation strategy

**Verification:** Inspect database for plaintext secrets; verify APP_KEY strength

---

## 5. File Upload Security Audit

### 5.1 User Image Uploads
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\ImageUploadController.php`
- `d:\patna-finder\backend\laravel\config\filesystems.php`
- `d:\patna-finder\backend\laravel\storage\app\public\businesses\`

**Security Checks:**
- [ ] Verify file type validation: 'image|mimes:jpeg,png,jpg,gif|max:5120'
- [ ] Confirm MIME type checking is not bypassable
- [ ] Check file size limit (5MB max validated)
- [ ] Validate filename sanitization (Str::random(10) usage)
- [ ] Verify path traversal prevention (str_starts_with 'businesses/')
- [ ] Confirm uploaded files are not executable (.htaccess prevention)
- [ ] Check image reprocessing to strip metadata/exif
- [ ] Validate storage path doesn't allow web access to PHP files
- [ ] Test for double extension attacks (image.php.jpg)
- [ ] Verify file deletion checks ownership (businesses/ prefix validation)
- [ ] Confirm no symlink attacks possible
- [ ] Check base64 upload validation (uploadBase64 method)

**Expected Vulnerabilities:**
- Insufficient MIME type validation
- Path traversal in file deletion
- Executable files uploadable through extension tricks
- Missing image reprocessing (malicious EXIF)
- No virus scanning on uploads

**Verification:** Attempt to upload PHP file as image; test path traversal; try double extensions

---

### 5.2 Admin Media Uploads
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\MediaController.php`
- `d:\patna-finder\backend\laravel\storage\app\public\uploads\`

**Security Checks:**
- [ ] Verify file type validation: 'image|mimes:jpg,jpeg,png,webp,gif,svg|max:5120'
- [ ] **CRITICAL:** Check SVG sanitization (SVG can contain XSS)
- [ ] Confirm file size limit (5MB max)
- [ ] Validate UUID filename generation (Str::uuid())
- [ ] Check directory traversal prevention in deletion (str_starts_with 'uploads/')
- [ ] Verify admin authentication required
- [ ] Confirm uploaded files stored outside webroot or with .htaccess protection
- [ ] Test for zip bomb attacks (SVG compression)
- [ ] Validate no script execution in upload directories

**Expected Vulnerabilities:**
- SVG XSS attacks (inline scripts in SVG)
- Admin upload path traversal
- Insufficient file type validation
- Missing Content-Security-Policy headers

**Verification:** Upload malicious SVG with XSS; test path traversal in deletion; verify CSP

---

### 5.3 Verification Document Uploads
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\VerificationDocumentController.php`
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\VerificationDocumentController.php`

**Security Checks:**
- [ ] Verify document type validation (PDF, images only)
- [ ] Confirm file size limits for documents
- [ ] Check access control on document downloads (admin/owner only)
- [ ] Validate documents stored outside public web directory
- [ ] Verify document deletion requires proper authorization
- [ ] Confirm no direct file access URLs (authenticated download only)
- [ ] Check for metadata stripping on sensitive documents
- [ ] Validate document expiration tracking (expires_at field)

**Expected Vulnerabilities:**
- Public access to verification documents
- Missing authorization on download
- Document enumeration
- Insufficient file type validation

**Verification:** Attempt to access documents without auth; test document enumeration

---

## 6. Configuration Security Audit

### 6.1 Environment Configuration
**Files to Audit:**
- `d:\patna-finder\backend\laravel\.env`
- `d:\patna-finder\backend\laravel\.env.example`
- `d:\patna-finder\backend\laravel\public\.htaccess`
- `d:\patna-finder\backend\laravel\config\app.php`

**Security Checks:**
- [ ] **CRITICAL:** Verify APP_DEBUG=false in production (from user's .env: confirmed false)
- [ ] Confirm APP_ENV=production (from user's .env: confirmed)
- [ ] Validate APP_KEY is properly generated and not default
- [ ] Check FRONTEND_URL matches production domain (https://patnafinder.codevixa.com)
- [ ] Verify APP_URL matches API domain (https://patnafinderapi.codevixa.com)
- [ ] Confirm mail configuration doesn't expose credentials
- [ ] Check database credentials are strong
- [ ] Validate no secrets in .env.example
- [ ] Verify .env file permissions (600 or 400)
- [ ] Confirm .htaccess prevents .env access

**Expected Vulnerabilities:**
- APP_DEBUG=true in production (leaks stack traces)
- Weak APP_KEY
- .env file accessible via web
- Hardcoded secrets in config files

**Verification:** Attempt to access /.env via HTTP; check APP_DEBUG setting

---

### 6.2 Security Headers
**Files to Audit:**
- `d:\patna-finder\backend\laravel\public\.htaccess`
- `d:\patna-finder\backend\laravel\app\Http\Middleware\` (security headers middleware if exists)
- `d:\patna-finder\frontend\next.config.js` or `next.config.ts`

**Security Checks:**
- [ ] Verify X-Frame-Options header (prevent clickjacking)
- [ ] Confirm X-Content-Type-Options: nosniff
- [ ] Check X-XSS-Protection header (legacy browsers)
- [ ] Validate Content-Security-Policy implementation
- [ ] Verify Strict-Transport-Security (HSTS) header
- [ ] Confirm Referrer-Policy is set appropriately
- [ ] Check Permissions-Policy for feature restrictions
- [ ] Validate CORS headers (already checked in 3.1)

**Expected Vulnerabilities:**
- Missing security headers
- Weak CSP allowing inline scripts
- No HSTS enforcement
- Clickjacking vulnerability

**Verification:** Inspect HTTP response headers; test clickjacking; verify CSP effectiveness

---

### 6.3 Directory Listing & File Exposure
**Files to Audit:**
- `d:\patna-finder\backend\laravel\public\.htaccess`
- `d:\patna-finder\backend\laravel\public\index.php`
- Server configuration (Apache/Nginx)

**Security Checks:**
- [ ] Verify directory listing is disabled (Options -Indexes in .htaccess)
- [ ] Confirm sensitive files not in public directory (.env, composer.json)
- [ ] Check storage directory is not web-accessible
- [ ] Validate no Git directory accessible (/.git/)
- [ ] Verify backup files not exposed (.sql, .bak, .old)
- [ ] Confirm vendor directory not directly accessible
- [ ] Check for exposed configuration files
- [ ] Test common sensitive paths: /admin, /phpmyadmin, /.env, /config

**Expected Vulnerabilities:**
- Directory listing enabled
- .git directory accessible
- Backup files in webroot
- Configuration files exposed

**Verification:** Attempt directory listing; check /.git/, /.env, /storage/ access

---

## 7. Frontend Security Audit

### 7.1 Client-Side Authentication
**Files to Audit:**
- `d:\patna-finder\frontend\lib\userApi.ts`
- `d:\patna-finder\frontend\lib\adminApi.ts`
- `d:\patna-finder\frontend\app\dashboard\**\*.tsx`
- `d:\patna-finder\frontend\app\admin\**\*.tsx`

**Security Checks:**
- [ ] Verify tokens stored in localStorage (XSS risk assessment)
- [ ] Check for sensitive data in localStorage/sessionStorage
- [ ] Confirm automatic logout on 401 responses
- [ ] Validate token sent via Authorization header (not query params)
- [ ] Check for token exposure in browser history
- [ ] Verify no tokens in URL parameters
- [ ] Confirm HTTPS enforcement on production
- [ ] Test XSS vectors for token theft from localStorage

**Expected Vulnerabilities:**
- Token theft via XSS (localStorage access)
- Tokens in URL parameters
- No httpOnly cookie option (Sanctum limitation)
- Sensitive data persisted in browser storage

**Verification:** Test XSS payloads to steal tokens; inspect browser storage; check URLs for tokens

---

### 7.2 Cross-Site Scripting (XSS) Prevention
**Files to Audit:**
- All Next.js components rendering user-generated content
- `d:\patna-finder\frontend\app\blog\[slug]\page.tsx`
- `d:\patna-finder\frontend\app\categories\page.tsx`
- Business and review display components

**Security Checks:**
- [ ] Verify React escapes user input by default
- [ ] Check for dangerouslySetInnerHTML usage (should be minimal/sanitized)
- [ ] Confirm rich text rendered through safe parser (DOMPurify or similar)
- [ ] Validate URL inputs are sanitized (social links, websites)
- [ ] Check for JavaScript: protocol in href attributes
- [ ] Verify SVG content is sanitized
- [ ] Confirm no eval() or Function() with user input
- [ ] Test for DOM-based XSS
- [ ] Validate Content-Security-Policy prevents inline scripts

**Expected Vulnerabilities:**
- dangerouslySetInnerHTML without sanitization
- Unsanitized URLs in links
- DOM-based XSS in search/filter
- Inline event handlers with user data

**Verification:** Attempt XSS payloads in all user input fields; test reflected XSS in search

---

### 7.3 API Security in Frontend
**Files to Audit:**
- `d:\patna-finder\frontend\lib\api.ts`
- `d:\patna-finder\frontend\lib\userApi.ts`
- `d:\patna-finder\frontend\lib\adminApi.ts`

**Security Checks:**
- [ ] Verify API_URL comes from environment variable
- [ ] Confirm no hardcoded API keys in frontend code
- [ ] Check error handling doesn't expose sensitive details
- [ ] Validate CORS credentials included (withCredentials: true if needed)
- [ ] Verify no sensitive operations via GET requests
- [ ] Confirm CSRF token handling for state-changing operations
- [ ] Check for request signature/integrity validation
- [ ] Test for API key exposure in network traffic

**Expected Vulnerabilities:**
- Hardcoded API URLs or keys
- Sensitive operations via GET
- Missing CSRF protection
- Error messages exposing backend details

**Verification:** Inspect frontend bundle for secrets; test CSRF attacks; review error messages

---

## 8. Business Logic Security Audit

### 8.1 Email Enumeration
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php` (forgotPassword method)
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php` (login method)
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\AuthController.php`

**Security Checks:**
- [ ] Verify password reset always returns success (email enumeration prevention confirmed in code)
- [ ] Check login timing is consistent for valid/invalid users
- [ ] Confirm registration doesn't leak email existence through different errors
- [ ] Validate lockout messages don't differ for existing/non-existing accounts
- [ ] Test response time analysis for user enumeration
- [ ] Verify forgot password doesn't confirm account existence

**Expected Vulnerabilities:**
- Different responses for valid/invalid emails
- Timing attacks reveal user existence
- Registration endpoint leaks email existence

**Verification:** Time responses for valid/invalid users; attempt email enumeration through multiple endpoints

---

### 8.2 OTP/MFA Bypass
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Services\Security\OtpService.php`
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php` (verifyMfa, verifyOtp)
- `d:\patna-finder\backend\laravel\app\Models\LoginChallenge.php`

**Security Checks:**
- [ ] Test OTP brute-force (should be limited to 5 attempts)
- [ ] Verify challenge token cannot be predicted
- [ ] Confirm challenges expire after 10 minutes
- [ ] Check for race conditions in OTP verification
- [ ] Validate consumed challenges cannot be reused
- [ ] Test for timing attacks on OTP verification
- [ ] Verify backup codes don't exist without secure storage
- [ ] Check for OTP bypass through parameter manipulation

**Expected Vulnerabilities:**
- OTP brute-force possible
- Challenge token prediction
- Race condition allowing multiple verifications
- Timing attacks reveal partial OTP

**Verification:** Attempt 100+ OTP guesses; test concurrent verification requests

---

### 8.3 Subscription & Payment Security
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\SubscriptionController.php`
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\SubscriptionController.php`
- `d:\patna-finder\backend\laravel\app\Models\Subscription.php`

**Security Checks:**
- [ ] Verify payment verification uses cryptographic signatures (Razorpay)
- [ ] Confirm subscription status checks before granting premium features
- [ ] Check for price manipulation in payment flow
- [ ] Validate payment callback authenticity
- [ ] Verify subscription cancellation requires authentication
- [ ] Confirm no PCI data stored locally (card numbers, CVV)
- [ ] Check for replay attacks on payment verification
- [ ] Validate subscription expiration enforcement

**Expected Vulnerabilities:**
- Payment signature not validated
- Subscription bypass for premium features
- Price manipulation in checkout
- Replay attacks on payment callbacks

**Verification:** Test payment flow; attempt subscription bypass; verify signature validation

---

### 8.4 Business Verification Bypass
**Files to Audit:**
- `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\BusinessController.php` (verify/unverify methods)
- `d:\patna-finder\backend\laravel\app\Models\Business.php`
- `d:\patna-finder\backend\laravel\app\Models\BusinessVerificationLog.php`

**Security Checks:**
- [ ] Verify only admins can verify businesses
- [ ] Confirm is_verified flag cannot be manipulated by business owners
- [ ] Check verification logs are immutable
- [ ] Validate re-verification cycle enforcement (reverify_due_at)
- [ ] Test for verification badge persistence after downgrade
- [ ] Verify verification requires document review
- [ ] Confirm verification status displayed only to authorized users

**Expected Vulnerabilities:**
- Business owners can self-verify
- Verification flag directly modifiable
- No verification expiration enforcement
- Verification logs can be deleted

**Verification:** Attempt self-verification as business owner; test verification flag manipulation

---

## 9. Audit Execution Plan

### Phase 1: Automated Scanning (Week 1)
1. Run OWASP ZAP spider and active scan on all endpoints
2. Execute SQLMap against search and filter endpoints
3. Run Burp Suite active scanner on authenticated endpoints
4. Use npm audit / composer audit for dependency vulnerabilities
5. Execute Snyk scan for code-level vulnerabilities

### Phase 2: Manual Code Review (Week 2-3)
1. Review authentication flows (login, MFA, password reset)
2. Audit authorization checks (RBAC, permissions, ownership)
3. Examine file upload handlers and storage
4. Review API input validation and output encoding
5. Analyze database queries for injection vulnerabilities
6. Check configuration files and environment setup

### Phase 3: Penetration Testing (Week 4)
1. Attempt authentication bypass and privilege escalation
2. Test for IDOR and horizontal privilege escalation
3. Execute XSS and CSRF attacks
4. Test file upload restrictions and execution
5. Attempt SQL/NoSQL injection
6. Test business logic flaws (email enumeration, OTP bypass)
7. Validate rate limiting and brute-force protection

### Phase 4: Production Environment Review (Week 5)
1. Verify CORS configuration on live server
2. Check security headers on production responses
3. Test SSL/TLS configuration and certificate validity
4. Validate .env file protection on server
5. Confirm directory listing disabled
6. Check for exposed sensitive files (.git, backups)
7. Verify production logging and monitoring

### Phase 5: Reporting & Remediation (Week 6)
1. Compile findings with severity ratings (Critical/High/Medium/Low)
2. Provide remediation recommendations for each vulnerability
3. Create proof-of-concept exploits for critical issues
4. Prioritize fixes based on CVSS scores
5. Verify fixes with re-testing

---

## 10. Critical Findings from Initial Review

### 🔴 CRITICAL
1. **CORS Misconfiguration (Production)**
   - **Issue:** Production server allows localhost:3000 origin
   - **File:** `d:\patna-finder\backend\laravel\.env` (FRONTEND_URL), `config\cors.php`
   - **Impact:** Allows unauthorized cross-origin requests from attacker's localhost
   - **Fix:** Update production .env FRONTEND_URL to https://patnafinder.codevixa.com

2. **SVG XSS Risk (Admin Upload)**
   - **Issue:** SVG files allowed without sanitization in admin media upload
   - **File:** `app\Http\Controllers\Api\Admin\MediaController.php` line 17
   - **Impact:** Stored XSS via malicious SVG
   - **Fix:** Add SVG sanitization library or exclude SVG from allowed types

3. **Token Storage in localStorage**
   - **Issue:** Sanctum tokens stored in localStorage (XSS-vulnerable)
   - **File:** `frontend\lib\userApi.ts`, `frontend\lib\adminApi.ts`
   - **Impact:** Token theft via XSS
   - **Fix:** Consider httpOnly cookies or implement additional XSS protections

### 🟠 HIGH
4. **Missing Security Headers**
   - **Issue:** No Content-Security-Policy, X-Frame-Options headers detected
   - **File:** `backend\laravel\public\.htaccess`
   - **Impact:** Clickjacking, XSS vulnerabilities
   - **Fix:** Add security headers in .htaccess or middleware

5. **Insufficient Rate Limiting**
   - **Issue:** OTP verification allows 10 attempts per minute (should be lower)
   - **File:** `routes\api.php` line with throttle:10,1
   - **Impact:** Faster OTP brute-force
   - **Fix:** Reduce to throttle:5,1 or implement exponential backoff

6. **Email Enumeration Through Timing**
   - **Issue:** Login response time may differ for existing vs. non-existing users
   - **File:** `app\Http\Controllers\Api\User\AuthController.php` login method
   - **Impact:** User enumeration via timing analysis
   - **Fix:** Add constant-time delay or use cache to normalize timing

---

## 11. Testing Commands & Tools

### Laravel Security Testing
```bash
# Navigate to backend
cd d:\patna-finder\backend\laravel

# Check for vulnerable dependencies
composer audit

# Run Laravel security checks
php artisan route:list --columns=name,method,uri,middleware

# Test database connection
php artisan tinker
>>> User::count()

# Check file permissions
ls -la .env
ls -la storage/
```

### Frontend Security Testing
```bash
# Navigate to frontend
cd d:\patna-finder\frontend

# Check for vulnerable dependencies
npm audit
npm audit fix

# Build and analyze bundle
npm run build
npm run analyze # if configured

# Check for exposed secrets
grep -r "API_KEY\|SECRET\|PASSWORD" .next/
```

### Manual Security Tests
```bash
# Test CORS (replace with actual domains)
curl -H "Origin: https://evil.com" -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: X-Requested-With" \
  -X OPTIONS https://patnafinderapi.codevixa.com/api/v1/user/login

# Test .env exposure
curl https://patnafinderapi.codevixa.com/.env
curl https://patnafinderapi.codevixa.com/../.env

# Test directory listing
curl https://patnafinderapi.codevixa.com/storage/

# Test SQL injection in search
curl "https://patnafinderapi.codevixa.com/api/v1/search?q=test'+OR+'1'='1"

# Test XSS in business name
# POST to /api/v1/businesses with payload: <script>alert('XSS')</script>

# Test file upload with PHP file
# Upload file with .php.jpg extension to image upload endpoint
```

### Automated Scanning Tools
- **OWASP ZAP:** Full application security scan
- **Burp Suite:** Manual penetration testing
- **SQLMap:** SQL injection detection
- **Nikto:** Web server scanner
- **Nmap:** Network security scanner
- **Snyk:** Dependency vulnerability scanner

---

## 12. Compliance Checklist

### OWASP Top 10 (2021) Coverage
- [x] A01:2021 – Broken Access Control (Sections 2, 3.2, 8.4)
- [x] A02:2021 – Cryptographic Failures (Section 4.3)
- [x] A03:2021 – Injection (Sections 3.3, 4.1)
- [x] A04:2021 – Insecure Design (Section 8)
- [x] A05:2021 – Security Misconfiguration (Sections 6, 3.1)
- [x] A06:2021 – Vulnerable and Outdated Components (Dependency audit)
- [x] A07:2021 – Identification and Authentication Failures (Section 1)
- [x] A08:2021 – Software and Data Integrity Failures (Section 5)
- [x] A09:2021 – Security Logging and Monitoring Failures (AuthEvent audit)
- [x] A10:2021 – Server-Side Request Forgery (SSRF) (URL validation checks)

### Data Protection Requirements
- [ ] GDPR compliance (data retention, right to delete)
- [ ] PCI DSS compliance (payment data handling)
- [ ] Data encryption at rest and in transit
- [ ] Secure backup procedures
- [ ] Audit logging and retention

---

## 13. Deliverables

1. **Executive Summary Report**
   - Overview of security posture
   - Critical findings summary
   - Risk assessment matrix
   - Compliance status

2. **Technical Vulnerability Report**
   - Detailed vulnerability descriptions
   - CVSS scores for each finding
   - Proof-of-concept exploits
   - Remediation steps with code examples

3. **Remediation Roadmap**
   - Prioritized fix list (Critical → Low)
   - Estimated effort for each fix
   - Dependencies and prerequisites
   - Timeline for implementation

4. **Security Best Practices Guide**
   - Secure coding guidelines for Laravel + Next.js
   - Authentication and authorization patterns
   - File upload security checklist
   - API security best practices

---

## 14. Success Criteria

The security audit will be considered complete when:
1. All 8 security domains have been thoroughly reviewed
2. All critical and high-severity vulnerabilities have been documented
3. Proof-of-concept exploits have been created for major findings
4. Remediation recommendations have been provided with code examples
5. Production CORS issue has been verified and fix documented
6. OWASP Top 10 compliance has been assessed
7. Re-testing has confirmed all critical fixes

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Auditor:** Security Team  
**Status:** Ready for Execution

---

## Quick Reference: Files Requiring Immediate Review

### Authentication & Authorization (Priority 1)
- `backend\laravel\app\Http\Controllers\Api\User\AuthController.php`
- `backend\laravel\app\Http\Controllers\Api\Admin\AuthController.php`
- `backend\laravel\app\Services\Security\OtpService.php`
- `backend\laravel\app\Models\User.php`
- `backend\laravel\app\Http\Middleware\IsAdmin.php`

### Configuration (Priority 1 - CRITICAL)
- `backend\laravel\.env` (production server)
- `backend\laravel\config\cors.php`
- `backend\laravel\public\.htaccess`

### File Uploads (Priority 2)
- `backend\laravel\app\Http\Controllers\Api\User\ImageUploadController.php`
- `backend\laravel\app\Http\Controllers\Api\Admin\MediaController.php`

### API Security (Priority 2)
- `backend\laravel\routes\api.php`
- `frontend\lib\api.ts`
- `frontend\lib\userApi.ts`
- `frontend\lib\adminApi.ts`

### Frontend Security (Priority 3)
- All components in `frontend\app\dashboard\**\*.tsx`
- All components in `frontend\app\admin\**\*.tsx`

---

*This audit plan provides a comprehensive roadmap for securing the Patna Finder application. Execute each section methodically, document all findings, and prioritize remediation based on risk severity.*
