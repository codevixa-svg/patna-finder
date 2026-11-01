# Implementation Plan: Fix 4 CRITICAL Security Vulnerabilities

**Project:** Patna Finder / KHOJYA  
**Backend Path:** d:\patna-finder\backend\laravel  
**Frontend Path:** d:\patna-finder\frontend  
**Laravel Version:** 9.52.22  
**Live Server:** https://patnafinderapi.codevixa.com  
**Production Frontend:** https://patnafinder.codevixa.com  
**Plan Date:** January 2026

---

## Overview

This plan addresses 4 CRITICAL security vulnerabilities identified in the security audit report. Each issue has been prioritized based on severity and impact on the live production environment.

**Estimated Total Time:** 2-3 hours  
**Risk Level:** Medium (requires production deployment)  
**Backward Compatibility:** All fixes are backward compatible

---

## CRITICAL-001: CORS Misconfiguration

### Issue Summary
- **Severity:** CRITICAL
- **Location:** `backend/laravel/public/.htaccess` and `backend/laravel/config/cors.php`
- **Problem:** .htaccess allows both production domain AND localhost, creating security risk
- **Impact:** Potential unauthorized cross-origin requests if localhost is tunneled

### Current Code Analysis

**File:** `backend/laravel/public/.htaccess` (Lines 11-12)
```apache
SetEnvIf Origin "^https://patnafinder\.codevixa\.com$" ORIGIN=$0
SetEnvIf Origin "^http://localhost:3000$" ORIGIN=$0
```

**File:** `backend/laravel/config/cors.php` (Line 22)
```php
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
```

### Implementation Steps

- [ ] 1. **Update .htaccess to remove localhost in production pattern**
      
      **File:** `d:\patna-finder\backend\laravel\public\.htaccess`
      
      **Change:** Replace lines 11-12 with environment-aware CORS configuration that ONLY allows production domain
      
      **New Code:**
      ```apache
      # SECURITY FIX: Only allow production domain - localhost removed for production servers
      # For local development, use Laravel's config/cors.php instead
      SetEnvIf Origin "^https://patnafinder\.codevixa\.com$" ORIGIN=$0
      # Line below should ONLY exist on local development servers:
      # SetEnvIf Origin "^http://localhost:3000$" ORIGIN=$0
      ```
      
      **Verify:** Test CORS from production frontend
      ```bash
      curl -H "Origin: https://patnafinder.codevixa.com" \
           -H "Access-Control-Request-Method: POST" \
           -X OPTIONS \
           https://patnafinderapi.codevixa.com/api/v1/user/login
      ```
      
      **Expected Output:** 
      ```
      Access-Control-Allow-Origin: https://patnafinder.codevixa.com
      Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
      ```

- [ ] 2. **Update cors.php to remove localhost fallback**
      
      **File:** `d:\patna-finder\backend\laravel\config\cors.php`
      
      **Change:** Line 22 - Add validation to ensure FRONTEND_URL is set
      
      **Current:**
      ```php
      'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
      ```
      
      **New:**
      ```php
      'allowed_origins' => [
          env('FRONTEND_URL') ?: (app()->environment('production') 
              ? throw new \RuntimeException('FRONTEND_URL must be set in production .env') 
              : 'http://localhost:3000')
      ],
      ```
      
      **Verify:** Run config cache command and check for errors
      ```bash
      cd d:\patna-finder\backend\laravel
      php artisan config:clear
      php artisan config:cache
      ```
      
      **Expected:** No errors thrown

- [ ] 3. **Verify production .env has FRONTEND_URL set** (Documentation only - production server task)
      
      **Action Required on Production Server:**
      ```bash
      # SSH to production server
      ssh user@production-server
      
      # Navigate to application directory
      cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi
      
      # Edit .env and ensure this line exists:
      nano .env
      # Add or verify: FRONTEND_URL=https://patnafinder.codevixa.com
      
      # Clear and recache config
      php artisan config:clear
      php artisan config:cache
      php artisan route:cache
      ```
      
      **Verify:** Check cached config
      ```bash
      php artisan tinker
      >>> config('cors.allowed_origins')
      # Should output: ["https://patnafinder.codevixa.com"]
      ```

### Backward Compatibility Notes
- Local development unaffected (uses config/cors.php with localhost)
- Production requires FRONTEND_URL in .env (should already be set)
- No API changes, only configuration

### Security Impact
- **Before:** Any localhost tunnel could make requests to production API
- **After:** Only https://patnafinder.codevixa.com can make cross-origin requests

---

## CRITICAL-002: Mass Assignment Vulnerability

### Issue Summary
- **Severity:** CRITICAL
- **Location:** `backend/laravel/app/Models/User.php`
- **Problem:** Sensitive fields in $fillable array allow privilege escalation
- **Impact:** Users can set their own role to super_admin, bypass MFA, unlock accounts

### Current Code Analysis

**File:** `backend/laravel/app/Models/User.php` (Lines 20-35)
```php
protected $fillable = [
    'name',
    'email',
    'password',
    'phone',
    'role',                      // ❌ CRITICAL: Mass assignable
    'permissions',               // ❌ CRITICAL: Mass assignable
    'is_active',                // ❌ HIGH: Mass assignable
    'last_login_at',
    'avatar',
    'failed_login_attempts',    // ❌ HIGH: Mass assignable
    'locked_until',             // ❌ HIGH: Mass assignable
    'mfa_enabled',              // ⚠️ MEDIUM: Mass assignable
    'mfa_secret',               // ❌ HIGH: Mass assignable
    'last_login_ip',
    'last_login_user_agent',
];
```

### Implementation Steps

- [ ] 4. **Switch User model from $fillable to $guarded approach**
      
      **File:** `d:\patna-finder\backend\laravel\app\Models\User.php`
      
      **Change:** Replace the entire $fillable array (lines 20-35) with restrictive $fillable and $guarded
      
      **Remove:**
      ```php
      protected $fillable = [
          'name',
          'email',
          'password',
          'phone',
          'role',
          'permissions',
          'is_active',
          'last_login_at',
          'avatar',
          'failed_login_attempts',
          'locked_until',
          'mfa_enabled',
          'mfa_secret',
          'last_login_ip',
          'last_login_user_agent',
      ];
      ```
      
      **Add (after line 19, before $hidden array):**
      ```php
      /**
       * The attributes that are mass assignable.
       * SECURITY: Only safe user-modifiable fields allowed.
       * Sensitive fields protected via $guarded.
       *
       * @var array<int, string>
       */
      protected $fillable = [
          'name',
          'email',
          'password',
          'phone',
          'avatar',
      ];
      
      /**
       * The attributes that are NOT mass assignable.
       * SECURITY: Protects against privilege escalation and lockout bypass.
       *
       * @var array<int, string>
       */
      protected $guarded = [
          'id',
          'role',                    // Only admins can change roles
          'permissions',             // Only super_admins can grant permissions
          'is_active',              // Only admins can activate/deactivate accounts
          'mfa_secret',             // Only managed through MFA setup flow
          'failed_login_attempts',  // Only system can modify lockout state
          'locked_until',           // Only system can modify lockout state
          'verified_at',
          'email_verified_at',
          'remember_token',
      ];
      ```
      
      **Verify:** Run existing tests to ensure no regressions
      ```bash
      cd d:\patna-finder\backend\laravel
      php artisan test --filter=UserTest
      ```
      
      **Expected:** All tests pass (or note which controllers need updates)

- [ ] 5. **Audit controllers for direct mass assignment of protected fields**
      
      **Files to Check:**
      - `app/Http/Controllers/Api/User/AuthController.php`
      - `app/Http/Controllers/Api/User/ProfileController.php`
      - `app/Http/Controllers/Api/Admin/UserController.php`
      
      **Search Pattern:** Look for code that might set sensitive fields
      ```bash
      cd d:\patna-finder\backend\laravel
      # Search for potential mass assignment of role/permissions
      findstr /S /I "role.*request" app\Http\Controllers\*.php
      findstr /S /I "permissions.*request" app\Http\Controllers\*.php
      ```
      
      **Action:** For any controller that needs to set protected fields, update to use explicit assignment:
      
      **Bad Pattern:**
      ```php
      $user = User::create($request->all()); // ❌ Includes role from request
      ```
      
      **Good Pattern:**
      ```php
      $user = User::create([
          'name' => $request->name,
          'email' => strtolower($request->email),
          'password' => Hash::make($request->password),
          'phone' => $request->phone,
          'role' => 'user',  // ✅ Hardcoded, not from request
          'is_active' => true,
      ]);
      ```
      
      **Verify:** Manual code review of registration and profile update endpoints
      ```bash
      # Test user registration doesn't allow role escalation
      curl -X POST https://patnafinderapi.codevixa.com/api/v1/user/register \
           -H "Content-Type: application/json" \
           -d '{
             "name": "Test User",
             "email": "test@example.com",
             "password": "ValidPassword123!",
             "password_confirmation": "ValidPassword123!",
             "role": "super_admin"
           }'
      # Expected: User created with role='user', NOT 'super_admin'
      ```

- [ ] 6. **Add comment documentation to controllers**
      
      **File:** `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\User\AuthController.php`
      
      **Action:** Add security comment above user creation in register() method
      
      **Add above User::create() call:**
      ```php
      // SECURITY: Role is hardcoded to 'user' to prevent privilege escalation
      // via mass assignment. The $guarded property in User model provides
      // additional protection, but explicit role assignment is defense-in-depth.
      $user = User::create([
          'name' => $request->name,
          'email' => strtolower($request->email),
          'password' => Hash::make($request->password),
          'phone' => $request->phone,
          'role' => 'user',  // ← Hardcoded
          'is_active' => true,
      ]);
      ```

### Backward Compatibility Notes
- **BREAKING CHANGE:** Code that directly assigns to protected fields will fail
- Profile update endpoints should only allow name, email, phone, avatar updates
- Admin endpoints need explicit permission checks to modify role/permissions
- MFA setup flow needs explicit $user->mfa_secret assignment (not mass assignment)

### Security Impact
- **Before:** Attackers could escalate to super_admin via registration or profile update
- **After:** Only explicitly authorized code can modify role, permissions, account status

---

## CRITICAL-003: Insecure File Uploads (SVG XSS Risk)

### Issue Summary
- **Severity:** HIGH (elevated to CRITICAL due to admin context)
- **Location:** `backend/laravel/app/Http/Controllers/Api/Admin/MediaController.php` and `ImageUploadController.php`
- **Problem:** SVG files can contain malicious JavaScript
- **Impact:** Stored XSS leading to admin session hijacking, privilege escalation

### Current Code Analysis

**File 1:** `app/Http/Controllers/Api/Admin/MediaController.php` (Line 16)
```php
$request->validate([
    'file' => 'required|image|mimes:jpg,jpeg,png,webp,gif,svg|max:5120',
    // ❌ SVG allowed without sanitization
]);
```

**File 2:** `app/Http/Controllers/Api/User/ImageUploadController.php` (Line 13)
```php
$request->validate([
    'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
    // ✅ No SVG - user uploads are safe
]);
```

### Implementation Steps

- [ ] 7. **Install SVG sanitization library**
      
      **Action:** Add enshrined/svg-sanitize package to composer
      
      ```bash
      cd d:\patna-finder\backend\laravel
      composer require enshrined/svg-sanitize
      ```
      
      **Verify:** Check composer.json includes the package
      ```bash
      composer show enshrined/svg-sanitize
      ```
      
      **Expected Output:**
      ```
      name     : enshrined/svg-sanitize
      descrip. : Sanitise SVG files to prevent XSS attacks
      versions : * 0.15.4
      ```

- [ ] 8. **Add MIME type verification helper method**
      
      **File:** `d:\patna-finder\backend\laravel\app\Http\Controllers\Controller.php`
      
      **Action:** Add protected method for file validation (add at end of class, before closing brace)
      
      ```php
      /**
       * Verify file MIME type matches extension (prevents disguised files).
       * 
       * @param \Illuminate\Http\UploadedFile $file
       * @param array $allowedMimes ['image/jpeg', 'image/png', ...]
       * @return bool
       */
      protected function verifyFileMimeType($file, array $allowedMimes): bool
      {
          // Get actual MIME type from file content (not from extension)
          $finfo = finfo_open(FILEINFO_MIME_TYPE);
          $mimeType = finfo_file($finfo, $file->getRealPath());
          finfo_close($finfo);
          
          return in_array($mimeType, $allowedMimes);
      }
      ```

- [ ] 9. **Update MediaController with SVG sanitization**
      
      **File:** `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\MediaController.php`
      
      **Change:** Replace the store() method (lines 12-34) with sanitized version
      
      **New Code:**
      ```php
      public function store(Request $request)
      {
          $request->validate([
              'file' => 'required|image|mimes:jpg,jpeg,png,webp,gif,svg|max:5120',
          ]);
      
          $file = $request->file('file');
          
          // SECURITY: Verify actual MIME type matches declared type
          $allowedMimes = [
              'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'
          ];
          
          if (!$this->verifyFileMimeType($file, $allowedMimes)) {
              return response()->json([
                  'message' => 'File type mismatch. File content does not match extension.'
              ], 422);
          }
          
          // SECURITY: Sanitize SVG files to remove XSS vectors
          if ($file->getClientOriginalExtension() === 'svg' || 
              $file->getMimeType() === 'image/svg+xml') {
              
              $sanitizer = new \enshrined\svgSanitize\Sanitizer();
              $sanitizer->removeRemoteReferences(true);
              $sanitizer->minify(true);
              
              $dirty = file_get_contents($file->getRealPath());
              $clean = $sanitizer->sanitize($dirty);
              
              if ($clean === false) {
                  \Log::warning('Malicious SVG upload attempt blocked', [
                      'filename' => $file->getClientOriginalName(),
                      'admin_id' => auth()->id(),
                      'ip' => request()->ip(),
                  ]);
                  
                  return response()->json([
                      'message' => 'SVG file failed security validation. It may contain malicious content.'
                  ], 422);
              }
              
              // Overwrite file with sanitized content
              file_put_contents($file->getRealPath(), $clean);
          }
          
          $directory = 'uploads/' . now()->format('Y/m');
          $path = $file->storeAs(
              $directory,
              \Illuminate\Support\Str::uuid() . '.' . strtolower($file->getClientOriginalExtension()),
              'public'
          );
      
          return response()->json([
              'message' => 'Image uploaded successfully',
              'url' => url(\Illuminate\Support\Facades\Storage::disk('public')->url($path)),
              'path' => $path,
              'size' => $file->getSize(),
          ], 201);
      }
      ```
      
      **Verify:** Upload a test SVG with embedded script
      ```bash
      # Create test malicious SVG
      echo '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("XSS")</script><rect width="100" height="100"/></svg>' > test-xss.svg
      
      # Upload via admin endpoint (requires admin token)
      curl -X POST https://patnafinderapi.codevixa.com/api/v1/admin/upload \
           -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
           -F "file=@test-xss.svg"
      
      # Expected: File uploaded but <script> tag removed
      # Download the uploaded file and verify no <script> tags present
      ```

- [ ] 10. **Optional: Remove SVG support entirely (RECOMMENDED for maximum security)**
      
      **Alternative to steps 7-9:** If SVG uploads are not essential, simply remove SVG from allowed mimes
      
      **File:** `d:\patna-finder\backend\laravel\app\Http\Controllers\Api\Admin\MediaController.php`
      
      **Change Line 16:**
      ```php
      // Before:
      'file' => 'required|image|mimes:jpg,jpeg,png,webp,gif,svg|max:5120',
      
      // After:
      'file' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120', // SVG removed
      ```
      
      **Verify:** Attempt to upload SVG
      ```bash
      curl -X POST https://patnafinderapi.codevixa.com/api/v1/admin/upload \
           -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
           -F "file=@test.svg"
      # Expected: 422 Validation Error - "The file must be a file of type: jpg, jpeg, png, webp."
      ```
      
      **Recommendation:** Choose this option unless SVG logos are business-critical

- [ ] 11. **Add Content-Security-Policy header for defense in depth**
      
      **File:** `d:\patna-finder\backend\laravel\public\.htaccess`
      
      **Action:** Add after line 19 (after existing Header directives)
      
      ```apache
      # Content Security Policy - Prevent inline script execution
      Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://patnafinder.codevixa.com https://patnafinderapi.codevixa.com;"
      
      # Additional Security Headers
      Header always set X-Content-Type-Options "nosniff"
      Header always set X-Frame-Options "SAMEORIGIN"
      Header always set Referrer-Policy "strict-origin-when-cross-origin"
      ```
      
      **Verify:** Check response headers
      ```bash
      curl -I https://patnafinderapi.codevixa.com/api/v1/health
      # Should include: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options
      ```

### Backward Compatibility Notes
- Existing non-SVG uploads unaffected
- If SVG support removed: Admins cannot upload SVG files (need to convert to PNG/WebP)
- If SVG sanitization added: Complex SVG features may be stripped (animations, filters)

### Security Impact
- **Before:** Malicious SVG could execute JavaScript in admin context, steal tokens
- **After:** SVGs sanitized or blocked entirely, XSS vectors removed

---

## CRITICAL-004: Exposed Credentials in Git

### Issue Summary
- **Severity:** CRITICAL
- **Location:** `.env` file git tracking status
- **Problem:** If .env is committed to git, credentials are exposed in history
- **Impact:** Database passwords, API keys, email credentials exposed to anyone with repo access

### Current Code Analysis

**File:** `d:\patna-finder\backend\laravel\.gitignore`
```
.env
.env.backup
.env.production
```
✅ .env is in .gitignore (good)

**Need to verify:** Is .env currently tracked in git despite being in .gitignore?

### Implementation Steps

- [ ] 12. **Check if .env is currently tracked in git**
      
      **Action:** Verify git tracking status
      
      ```bash
      cd d:\patna-finder\backend\laravel
      
      # Check if .env is tracked
      git ls-files .env
      # If output shows ".env", it IS tracked (bad)
      # If output is empty, it is NOT tracked (good)
      
      # Check git history for .env
      git log --all --full-history --oneline -- .env
      # If output shows commits, .env WAS committed in the past (bad)
      ```
      
      **Expected:** Empty output (file not tracked)
      
      **If file IS tracked, proceed to step 13**

- [ ] 13. **Remove .env from git tracking (if currently tracked)**
      
      **Action:** Remove .env from git index without deleting local file
      
      ```bash
      cd d:\patna-finder\backend\laravel
      
      # Remove from git tracking but keep local file
      git rm --cached .env
      
      # Verify .gitignore includes .env
      cat .gitignore | findstr ".env"
      # Should output: .env
      
      # Commit the removal
      git add .gitignore
      git commit -m "security: Remove .env from git tracking to protect credentials"
      
      # Verify .env is no longer tracked
      git ls-files .env
      # Should output: (nothing)
      ```
      
      **Verify:** Check that .env still exists locally
      ```bash
      Test-Path .env
      # Should output: True
      ```

- [ ] 14. **Create .env.example template file**
      
      **File:** `d:\patna-finder\backend\laravel\.env.example`
      
      **Action:** Create sanitized template (if it doesn't exist or update existing)
      
      **Content:**
      ```env
      APP_NAME="Patna Finder"
      APP_ENV=local
      APP_KEY=
      APP_DEBUG=true
      APP_URL=http://localhost:8000
      
      FRONTEND_URL=http://localhost:3000
      
      LOG_CHANNEL=stack
      LOG_DEPRECATIONS_CHANNEL=null
      LOG_LEVEL=debug
      
      DB_CONNECTION=mysql
      DB_HOST=127.0.0.1
      DB_PORT=3306
      DB_DATABASE=patna_finder
      DB_USERNAME=root
      DB_PASSWORD=
      
      BROADCAST_DRIVER=log
      CACHE_DRIVER=file
      FILESYSTEM_DISK=local
      QUEUE_CONNECTION=sync
      SESSION_DRIVER=file
      SESSION_LIFETIME=120
      
      MEMCACHED_HOST=127.0.0.1
      
      REDIS_HOST=127.0.0.1
      REDIS_PASSWORD=null
      REDIS_PORT=6379
      
      MAIL_MAILER=smtp
      MAIL_HOST=smtp.gmail.com
      MAIL_PORT=587
      MAIL_USERNAME=your-email@gmail.com
      MAIL_PASSWORD=your-app-password
      MAIL_ENCRYPTION=tls
      MAIL_FROM_ADDRESS="noreply@patnafinder.com"
      MAIL_FROM_NAME="${APP_NAME}"
      
      AWS_ACCESS_KEY_ID=
      AWS_SECRET_ACCESS_KEY=
      AWS_DEFAULT_REGION=us-east-1
      AWS_BUCKET=
      AWS_USE_PATH_STYLE_ENDPOINT=false
      
      PUSHER_APP_ID=
      PUSHER_APP_KEY=
      PUSHER_APP_SECRET=
      PUSHER_HOST=
      PUSHER_PORT=443
      PUSHER_SCHEME=https
      PUSHER_APP_CLUSTER=mt1
      
      VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
      VITE_PUSHER_HOST="${PUSHER_HOST}"
      VITE_PUSHER_PORT="${PUSHER_PORT}"
      VITE_PUSHER_SCHEME="${PUSHER_SCHEME}"
      VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"
      ```
      
      **Verify:** File created without sensitive values
      ```bash
      cd d:\patna-finder\backend\laravel
      Test-Path .env.example
      # Should output: True
      
      # Verify no actual passwords in template
      Select-String -Path .env.example -Pattern "odavthwgjjancopx"
      # Should output: (nothing)
      ```

- [ ] 15. **Add .env protection to .htaccess**
      
      **File:** `d:\patna-finder\backend\laravel\public\.htaccess`
      
      **Action:** Add at the top of file (after line 5, before RewriteEngine On)
      
      ```apache
      # SECURITY: Prevent direct access to .env file
      <FilesMatch "^\.env">
          Order allow,deny
          Deny from all
      </FilesMatch>
      ```
      
      **Verify:** Attempt to access .env via web (should be blocked)
      ```bash
      curl -I https://patnafinderapi.codevixa.com/.env
      # Expected: 403 Forbidden
      ```

- [ ] 16. **Document credential rotation procedure**
      
      **File:** `d:\patna-finder\backend\laravel\SECURITY_CREDENTIALS.md` (create new)
      
      **Content:**
      ```markdown
      # Credential Rotation Procedure
      
      ## ⚠️ IMPORTANT: .env File Exposure Response
      
      If the `.env` file was ever committed to git, ALL credentials in it should be considered compromised and must be rotated immediately.
      
      ## Credentials to Rotate
      
      ### 1. Application Key
      ```bash
      php artisan key:generate
      # WARNING: This will invalidate all existing sessions
      ```
      
      ### 2. Database Password
      1. Change MySQL password on hosting control panel
      2. Update `DB_PASSWORD` in production `.env`
      3. Restart application: `php artisan config:cache`
      
      ### 3. Gmail App Password (MAIL_PASSWORD)
      1. Go to https://myaccount.google.com/apppasswords
      2. Revoke existing app password for "Patna Finder"
      3. Generate new 16-character app password
      4. Update `MAIL_PASSWORD` in production `.env`
      5. Test: `php artisan tinker` → `Mail::raw('Test', fn($m) => $m->to('test@example.com')->subject('Test'));`
      
      ### 4. API Keys (if any)
      - AWS credentials (if used)
      - Razorpay keys (payment gateway)
      - Any third-party API keys
      
      ## Production Deployment Checklist
      
      After rotating credentials:
      - [ ] Update production `.env` file via SSH
      - [ ] Clear config cache: `php artisan config:clear`
      - [ ] Rebuild config cache: `php artisan config:cache`
      - [ ] Verify application still works
      - [ ] Check Laravel logs for auth errors: `tail -f storage/logs/laravel.log`
      
      ## Prevention
      
      - ✅ `.env` is in `.gitignore`
      - ✅ `.env.example` template is committed (without secrets)
      - ✅ Production `.env` only exists on server, never in git
      - ✅ Use environment variables on hosting platform when possible
      ```
      
      **Verify:** File created
      ```bash
      Test-Path d:\patna-finder\backend\laravel\SECURITY_CREDENTIALS.md
      # Should output: True
      ```

- [ ] 17. **Verify .gitignore is correctly configured**
      
      **File:** `d:\patna-finder\backend\laravel\.gitignore`
      
      **Action:** Ensure these lines exist (they already do)
      
      ```
      .env
      .env.backup
      .env.production
      ```
      
      **Add additional sensitive files (if not present):**
      ```
      .env.local
      .env.*.local
      /storage/*.key
      auth.json
      ```
      
      **Verify:** Test .gitignore rules
      ```bash
      cd d:\patna-finder\backend\laravel
      git check-ignore .env
      # Should output: .env
      
      git check-ignore .env.production
      # Should output: .env.production
      ```

### Backward Compatibility Notes
- No code changes, only git repository hygiene
- Developers must copy .env.example to .env and fill in credentials for local development
- Production deployment unchanged (credentials already on server)

### Security Impact
- **Before:** If .env was in git, all credentials exposed in repository history
- **After:** .env removed from tracking, template provided, credentials protected

### Post-Deployment Actions (Production Server Only)

**CRITICAL:** If .env was ever committed to git, credentials are permanently exposed in git history. You must:

1. **Rotate ALL credentials:**
   - Database password
   - Gmail app password
   - APP_KEY (regenerate with `php artisan key:generate`)
   - Any API keys

2. **Consider repository as compromised:**
   - If repo is public on GitHub, treat all credentials as public knowledge
   - If repo is private, audit who has access
   - Consider creating new repo with clean history (advanced)

---

## Verification & Testing Checklist

### Local Development Testing

- [ ] 18. **Test User model mass assignment protection**
      
      ```bash
      cd d:\patna-finder\backend\laravel
      
      # Create test script
      php artisan tinker
      
      # Try to create user with role via mass assignment (should fail)
      >>> $user = new \App\Models\User(['name' => 'Test', 'email' => 'test@example.com', 'password' => 'test', 'role' => 'super_admin']);
      >>> $user->role;
      # Expected: null (role not assigned via mass assignment)
      
      # Try to fill protected fields (should fail)
      >>> $user->fill(['role' => 'admin', 'permissions' => ['manage_users']]);
      >>> $user->role;
      # Expected: null (guarded fields cannot be mass assigned)
      ```

- [ ] 19. **Run full test suite**
      
      ```bash
      cd d:\patna-finder\backend\laravel
      
      # Run PHPUnit tests (if they exist)
      php artisan test
      
      # Expected: All tests pass (or note failures for investigation)
      ```

- [ ] 20. **Test CORS locally**
      
      ```bash
      # Start Laravel server
      cd d:\patna-finder\backend\laravel
      php artisan serve
      
      # In another terminal, test CORS
      curl -H "Origin: http://localhost:3000" \
           -H "Access-Control-Request-Method: POST" \
           -X OPTIONS \
           http://localhost:8000/api/v1/user/login
      
      # Expected: Access-Control-Allow-Origin: http://localhost:3000
      ```

### Production Deployment Testing

- [ ] 21. **Test CORS on production**
      
      ```bash
      curl -H "Origin: https://patnafinder.codevixa.com" \
           -H "Access-Control-Request-Method: POST" \
           -X OPTIONS \
           https://patnafinderapi.codevixa.com/api/v1/user/login
      
      # Expected: Access-Control-Allow-Origin: https://patnafinder.codevixa.com
      
      # Test that localhost is REJECTED
      curl -H "Origin: http://localhost:3000" \
           -H "Access-Control-Request-Method: POST" \
           -X OPTIONS \
           https://patnafinderapi.codevixa.com/api/v1/user/login
      
      # Expected: No Access-Control-Allow-Origin header (request blocked)
      ```

- [ ] 22. **Test file upload security**
      
      ```bash
      # Test SVG sanitization (if implemented) or rejection (if removed)
      # Requires admin token
      
      curl -X POST https://patnafinderapi.codevixa.com/api/v1/admin/upload \
           -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
           -F "file=@test-malicious.svg"
      
      # Expected: 
      # - If sanitization: 200 OK, file uploaded with scripts removed
      # - If removed: 422 validation error
      ```

- [ ] 23. **Test user registration privilege escalation prevention**
      
      ```bash
      curl -X POST https://patnafinderapi.codevixa.com/api/v1/user/register \
           -H "Content-Type: application/json" \
           -d '{
             "name": "Security Test",
             "email": "security-test@example.com",
             "password": "ValidPassword123!",
             "password_confirmation": "ValidPassword123!",
             "phone": "1234567890",
             "role": "super_admin",
             "permissions": ["manage_users"]
           }'
      
      # Expected: User created with role='user', NOT 'super_admin'
      # Check response body for user.role value
      ```

- [ ] 24. **Verify security headers**
      
      ```bash
      curl -I https://patnafinderapi.codevixa.com/api/v1/health
      
      # Expected headers:
      # - Content-Security-Policy: ...
      # - X-Content-Type-Options: nosniff
      # - X-Frame-Options: SAMEORIGIN
      # - Access-Control-Allow-Origin: (only on CORS requests)
      ```

- [ ] 25. **Check Laravel logs for errors**
      
      ```bash
      # SSH to production server
      ssh user@production-server
      cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi
      
      tail -n 100 storage/logs/laravel.log
      
      # Look for:
      # - No mass assignment errors
      # - No CORS errors
      # - No file upload errors
      ```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Backup production database
      ```bash
      # On production server
      php artisan db:backup
      # Or via hosting control panel: Create MySQL backup
      ```

- [ ] Backup current codebase
      ```bash
      # On production server
      cd /home/u777317772/domains/codevixa.com/public_html
      tar -czf patnafinderapi-backup-$(date +%Y%m%d).tar.gz patnafinderapi/
      ```

- [ ] Document current .env values (securely)
      ```bash
      # On production server - copy to secure location
      cp /home/u777317772/domains/codevixa.com/public_html/patnafinderapi/.env ~/env-backup.txt
      chmod 600 ~/env-backup.txt
      ```

### Deployment Steps

- [ ] 1. Pull latest code to production server
      ```bash
      cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi
      git pull origin main
      ```

- [ ] 2. Install new dependencies (if SVG sanitizer added)
      ```bash
      composer install --no-dev --optimize-autoloader
      ```

- [ ] 3. Update production .env file
      ```bash
      nano .env
      # Verify FRONTEND_URL=https://patnafinder.codevixa.com
      # Verify APP_ENV=production
      # Verify APP_DEBUG=false
      ```

- [ ] 4. Clear and rebuild caches
      ```bash
      php artisan config:clear
      php artisan cache:clear
      php artisan route:clear
      php artisan view:clear
      
      php artisan config:cache
      php artisan route:cache
      php artisan view:cache
      ```

- [ ] 5. Set proper file permissions
      ```bash
      chmod -R 755 storage bootstrap/cache
      chmod -R 644 .env
      chown -R www-data:www-data storage bootstrap/cache
      ```

- [ ] 6. Restart PHP-FPM (if applicable)
      ```bash
      sudo systemctl restart php8.0-fpm
      # Or via hosting control panel
      ```

### Post-Deployment Verification

- [ ] Test frontend login flow
      - Visit https://patnafinder.codevixa.com/login
      - Attempt login (should work without CORS errors)
      - Check browser console for errors

- [ ] Test admin panel access
      - Visit https://patnafinder.codevixa.com/admin/login
      - Login as admin
      - Try uploading an image (should work)

- [ ] Test API endpoints directly
      ```bash
      curl https://patnafinderapi.codevixa.com/api/v1/health
      # Expected: 200 OK
      ```

- [ ] Monitor logs for 30 minutes
      ```bash
      tail -f storage/logs/laravel.log
      # Watch for errors related to CORS, mass assignment, file uploads
      ```

- [ ] Test from different devices/networks
      - Desktop browser
      - Mobile browser
      - Different ISP/network

### Rollback Plan

If deployment causes issues:

```bash
# On production server
cd /home/u777317772/domains/codevixa.com/public_html

# Restore previous version
rm -rf patnafinderapi
tar -xzf patnafinderapi-backup-YYYYMMDD.tar.gz

# Restore .env if needed
cp ~/env-backup.txt patnafinderapi/.env

# Clear caches
cd patnafinderapi
php artisan config:clear
php artisan cache:clear

# Restart services
sudo systemctl restart php8.0-fpm
```

---

## Risk Assessment

### High Risk Items
1. **Mass assignment changes** - Could break existing controller code
   - Mitigation: Comprehensive code audit before deployment
   - Fallback: $guarded can be temporarily removed if critical issues arise

2. **CORS configuration** - Could break frontend-backend communication
   - Mitigation: Test thoroughly on staging environment first
   - Fallback: Keep localhost in .htaccess temporarily (with big comment)

### Medium Risk Items
3. **SVG sanitization** - Could break existing SVG uploads
   - Mitigation: Test with existing uploaded SVGs
   - Fallback: Remove SVG support entirely (convert existing to PNG)

### Low Risk Items
4. **.env git removal** - Only affects repository, not runtime
   - Mitigation: No runtime impact
   - Fallback: N/A (this is permanent and correct)

---

## Timeline Estimate

| Task | Estimated Time | Complexity |
|------|----------------|------------|
| CRITICAL-001: CORS fix | 30 minutes | Low |
| CRITICAL-002: Mass assignment | 45 minutes | Medium |
| CRITICAL-003: File upload security | 60 minutes | Medium-High |
| CRITICAL-004: Git credential removal | 20 minutes | Low |
| Testing & Verification | 45 minutes | Medium |
| Production Deployment | 30 minutes | Low |
| **Total** | **3.5 hours** | **Medium** |

---

## Additional Recommendations (Future Enhancements)

### Not in Critical Path - Can Be Done Later

1. **Add rate limiting to file upload endpoints**
   ```php
   Route::post('/upload', [MediaController::class, 'store'])
       ->middleware('throttle:10,1'); // 10 uploads per minute
   ```

2. **Implement virus scanning with ClamAV**
   ```bash
   composer require xenolope/quahog
   # Scan files before storage
   ```

3. **Add Content-Security-Policy to frontend Next.js**
   ```javascript
   // next.config.js
   async headers() {
     return [{
       source: '/:path*',
       headers: [
         { key: 'Content-Security-Policy', value: "default-src 'self';" }
       ]
     }];
   }
   ```

4. **Implement httpOnly cookies for auth tokens** (requires frontend changes)
   ```php
   // Return token as httpOnly cookie instead of JSON
   return response()->json([...])->cookie('auth_token', $token, ...);
   ```

5. **Add admin action audit logging**
   ```php
   Schema::create('admin_audit_logs', function (Blueprint $table) {
       $table->id();
       $table->foreignId('admin_id');
       $table->string('action'); // business.approved, user.role_changed
       $table->json('changes');
       $table->ipAddress('ip_address');
       $table->timestamps();
   });
   ```

---

## Success Criteria

### Deployment is successful when:

✅ All 4 CRITICAL vulnerabilities are fixed:
   1. CORS only allows production domain (no localhost)
   2. User model prevents mass assignment of role/permissions
   3. File uploads sanitized or SVG removed
   4. .env removed from git tracking

✅ Frontend can communicate with backend (no CORS errors)

✅ User registration cannot escalate privileges

✅ File uploads work correctly (sanitized or validated)

✅ No sensitive data in git repository

✅ Laravel logs show no errors related to changes

✅ All existing functionality continues to work

---

## Contact & Support

**For Deployment Issues:**
- Check Laravel logs: `tail -f storage/logs/laravel.log`
- Check web server logs: `/var/log/nginx/error.log` or `/var/log/apache2/error.log`
- Test in browser console: F12 → Network tab → Check API responses

**For Questions:**
- Refer to Security Audit Report: `d:\patna-finder\SECURITY_AUDIT_REPORT.md`
- Laravel Security Documentation: https://laravel.com/docs/9.x/security
- OWASP Top 10: https://owasp.org/www-project-top-ten/

---

**Plan Version:** 1.0  
**Last Updated:** January 2026  
**Status:** Ready for Implementation
