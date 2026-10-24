# Deployment Guide: Security Fixes for Patna Finder

**Created:** January 2026  
**Target Environment:** Production (https://patnafinderapi.codevixa.com)  
**Server Path:** `/home/u777317772/domains/codevixa.com/public_html/patnafinderapi`  
**Related Documents:** [security-review.md](./security-review.md)  
**Deployment Type:** Security patch deployment (zero downtime expected)

---

## Overview

This guide covers the deployment of 4 CRITICAL security fixes to the production Patna Finder application:

1. **CRITICAL-001:** CORS Configuration - Remove localhost fallback
2. **CRITICAL-002:** Mass Assignment Protection - Protect User model sensitive fields
3. **CRITICAL-003:** File Upload Security - Remove SVG, add MIME validation
4. **CRITICAL-004:** Credential Protection - Ensure .env is not exposed

**Expected Deployment Time:** 10-15 minutes  
**Downtime:** None (changes are backward compatible)  
**Risk Level:** Low (all changes tested and reviewed)

---

## 1. Pre-Deployment Checklist

### 1.1 Access Verification
```bash
# Verify SSH access to production server
ssh u777317772@your-server-hostname
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi
```

✅ **Checkpoint:** You should be in the patnafinderapi directory

### 1.2 Record Current State
```bash
# Record current git commit (for rollback reference)
git log -1 --oneline > ~/deployment-backup-$(date +%Y%m%d-%H%M%S).txt
cat ~/deployment-backup-$(date +%Y%m%d-%H%M%S).txt

# Check current branch
git branch --show-current

# Record current Laravel version
php artisan --version
```

✅ **Checkpoint:** Save the commit hash and branch name

### 1.3 Database Backup
```bash
# Navigate to home directory
cd ~

# Create backup directory if it doesn't exist
mkdir -p backups/$(date +%Y%m%d)

# Backup database (adjust credentials from .env)
# Option 1: Using mysqldump (if available)
mysqldump -u [DB_USER] -p[DB_PASSWORD] [DB_NAME] > backups/$(date +%Y%m%d)/patna_finder_pre_security_$(date +%H%M%S).sql

# Option 2: Using Laravel backup command (if configured)
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi
php artisan backup:run
```

✅ **Checkpoint:** Verify backup file exists and has reasonable size (not 0 bytes)

### 1.4 File System Backup
```bash
# Backup critical configuration files
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi

# Create backup of current state
tar -czf ~/backups/$(date +%Y%m%d)/patnafinderapi_files_$(date +%H%M%S).tar.gz \
  public/.htaccess \
  app/Models/User.php \
  app/Http/Controllers/Api/Admin/MediaController.php \
  app/Http/Controllers/Api/User/ImageUploadController.php \
  .gitignore \
  .env.example \
  2>/dev/null

# Verify backup created
ls -lh ~/backups/$(date +%Y%m%d)/
```

✅ **Checkpoint:** Backup tar.gz file should exist

### 1.5 Verify .env Exists on Server
```bash
# Check .env file exists (DO NOT cat or display it in logs)
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi
test -f .env && echo ".env exists ✓" || echo ".env MISSING - CRITICAL!"

# Verify .env has proper permissions (should be 600 or 644)
ls -la .env
```

✅ **Checkpoint:** .env file must exist with appropriate permissions

⚠️ **CRITICAL:** If .env is missing, DO NOT PROCEED. The deployment will break the application.

---

## 2. Deployment Steps

### 2.1 Pull Latest Security Fixes
```bash
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi

# Stash any local changes (if any)
git stash

# Fetch latest changes
git fetch origin

# Pull the security fixes (adjust branch name if different)
git pull origin main

# Or checkout specific security fix commit
# git checkout 8830f3b364fe75dce6f0486099cb02866e5759d0
```

✅ **Checkpoint:** Git should report "Already up to date" or show files updated

**Expected files changed:**
- `public/.htaccess` (CORS + security headers)
- `app/Models/User.php` (mass assignment protection)
- `app/Http/Controllers/Api/Admin/MediaController.php` (file upload security)
- `app/Http/Controllers/Api/User/ImageUploadController.php` (file upload security)
- `.gitignore` (.env protection)
- `.env.example` (template updates)

### 2.2 Install/Update Dependencies
```bash
# Check if composer.lock was updated
git diff HEAD@{1} composer.lock

# If composer.lock changed, run composer install
# composer install --no-dev --optimize-autoloader

# For this security patch, composer changes are NOT expected
# Skip this step unless composer.lock was modified
```

✅ **Checkpoint:** Dependencies up to date

### 2.3 Clear Laravel Caches
```bash
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi

# Clear configuration cache
php artisan config:clear

# Clear application cache
php artisan cache:clear

# Clear route cache
php artisan route:clear

# Clear view cache
php artisan view:clear

# Rebuild optimized cache (optional, for performance)
php artisan config:cache
php artisan route:cache
```

✅ **Checkpoint:** All cache commands should complete without errors

**Note:** If you see error about `NewsletterController` not found, this is unrelated to security fixes. Clear route cache resolves it.

### 2.4 Verify .env Is NOT in Git
```bash
# This should return empty (no output)
git ls-files | grep "\.env$"

# Double-check git history doesn't contain .env
git log --all --full-history -- .env

# Both commands should produce NO OUTPUT
```

✅ **Checkpoint:** No output = .env is properly protected

⚠️ **If .env appears in output:** Contact security team immediately. Credentials may be exposed.

### 2.5 Set Proper File Permissions
```bash
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi

# Ensure storage and bootstrap/cache are writable
chmod -R 775 storage bootstrap/cache

# Ensure .env is readable only by owner and web server
chmod 644 .env

# Verify .htaccess permissions (should be 644)
chmod 644 public/.htaccess
```

✅ **Checkpoint:** No permission errors

### 2.6 Restart PHP/Web Server (If Needed)
```bash
# For cPanel/Hostinger shared hosting, this may not be needed
# If using PHP-FPM or OPcache, restart to clear cached code:

# Option 1: Touch a file to trigger reload (cPanel)
touch /home/u777317772/domains/codevixa.com/public_html/patnafinderapi/public/index.php

# Option 2: If you have restart permission
# php artisan config:cache forces autoload rebuild
```

✅ **Checkpoint:** Application should still be accessible

---

## 3. Post-Deployment Verification

### 3.1 Basic Health Check
```bash
# Check Laravel logs for errors
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi
tail -n 50 storage/logs/laravel.log

# Should NOT see any new errors related to:
# - CORS
# - Mass assignment
# - File uploads
# - Missing .env
```

✅ **Checkpoint:** No critical errors in logs

### 3.2 CORS Verification

**Test from Frontend Domain:**
Open https://patnafinder.codevixa.com in browser and open DevTools Console.

```javascript
// In browser console, test API call from frontend
fetch('https://patnafinderapi.codevixa.com/api/v1/user/forgot-password', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com' })
})
.then(r => console.log('Status:', r.status))
.catch(e => console.error('Error:', e));
```

✅ **Expected:** No CORS errors in console  
❌ **Failure:** "has been blocked by CORS policy" error

**Test from Unauthorized Origin:**
```bash
# From your local machine or different domain
curl -X OPTIONS https://patnafinderapi.codevixa.com/api/v1/user/forgot-password \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should NOT return Access-Control-Allow-Origin header
# or should return 403/blocked
```

✅ **Expected:** No Access-Control-Allow-Origin header for localhost  
❌ **Failure:** Returns Access-Control-Allow-Origin: http://localhost:3000

### 3.3 Mass Assignment Protection Verification

**Test User Registration (creates role='user'):**
```bash
curl -X POST https://patnafinderapi.codevixa.com/api/v1/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Security Test User",
    "email": "sectest@example.com",
    "password": "ValidPassword123!",
    "phone": "9876543210",
    "role": "super_admin"
  }'

# Check response - user should be created with role='user', NOT 'super_admin'
# Then verify in database:
```

On server:
```bash
# Check the created user's role in database
php artisan tinker
>>> User::where('email', 'sectest@example.com')->first()->role;
# Should output: "user"
>>> exit

# Clean up test user
php artisan tinker
>>> User::where('email', 'sectest@example.com')->delete();
>>> exit
```

✅ **Expected:** User created with role='user' (hardcoded), ignores request  
❌ **Failure:** User created with role='super_admin' from request

### 3.4 File Upload Security Verification

**Test SVG Upload Rejection (Admin):**

Create test file on your local machine:
```svg
<!-- malicious.svg -->
<svg xmlns="http://www.w3.org/2000/svg">
  <script>alert('XSS')</script>
  <rect width="100" height="100" fill="red"/>
</svg>
```

Upload via admin panel:
```bash
# Using curl with authentication token
curl -X POST https://patnafinderapi.codevixa.com/api/v1/admin/media/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@malicious.svg"

# Expected response:
# {"message": "The file must be a file of type: jpg, jpeg, png, webp."}
```

✅ **Expected:** 422 error, SVG rejected  
❌ **Failure:** 200 success, SVG accepted

**Test MIME Type Spoofing Prevention:**

Rename SVG to .jpg and try again:
```bash
cp malicious.svg fake.jpg
curl -X POST https://patnafinderapi.codevixa.com/api/v1/admin/media/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@fake.jpg"

# Expected response:
# {"message": "File type mismatch. File content does not match extension."}
```

✅ **Expected:** 422 error, MIME mismatch detected  
❌ **Failure:** File accepted despite being SVG

**Test Valid Upload (JPEG/PNG):**
```bash
# Upload valid JPEG
curl -X POST https://patnafinderapi.codevixa.com/api/v1/admin/media/upload \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@test-image.jpg"

# Should succeed with 200 status
```

✅ **Expected:** 200 success, file uploaded  
❌ **Failure:** Valid image rejected

### 3.5 .env Protection Verification

**Test Direct .env Access (Should Fail):**
```bash
# Try to access .env via HTTP
curl https://patnafinderapi.codevixa.com/.env -v

# Expected response: 403 Forbidden
# Should NOT return file contents
```

✅ **Expected:** 403 Forbidden or 404 Not Found  
❌ **Failure:** Returns .env file contents

**Verify .env Not in Git:**
```bash
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi

# This should return EMPTY (no output)
git log --all --full-history -- .env

# Verify .gitignore contains .env
grep "^\.env$" .gitignore
```

✅ **Expected:** No git history, .env in .gitignore  
❌ **Failure:** .env appears in git log

### 3.6 Security Headers Verification
```bash
# Check security headers are present
curl -I https://patnafinderapi.codevixa.com/api/v1/user/login

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: SAMEORIGIN
# Content-Security-Policy: default-src 'self'; ...
# Access-Control-Allow-Origin: https://patnafinder.codevixa.com (only for valid CORS requests)
```

✅ **Expected:** All security headers present  
❌ **Failure:** Headers missing

---

## 4. Credential Rotation (CRITICAL)

⚠️ **IMPORTANT:** Your .env file was previously committed to git or shared. ALL credentials must be rotated.

### 4.1 Credentials Requiring Immediate Rotation

From the original user messages, the following were exposed:

1. **APP_KEY** (base64:CWHBQC084/ysmQkHqzCaO7hcEoCu+EviFuhiDJ9QDkc=)
2. **Gmail MAIL_PASSWORD** (app-specific password)
3. **Database credentials** (if in .env)
4. **Any API keys** (payment gateways, third-party services)

### 4.2 Gmail App Password Rotation

**Step 1: Revoke Old App Password**
```
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in with your Gmail account
3. Find "Patna Finder" or mail app password
4. Click "Remove" or "Revoke"
```

**Step 2: Generate New App Password**
```
1. Still at: https://myaccount.google.com/apppasswords
2. Click "Generate new app password"
3. Name it: "Patna Finder Production"
4. Copy the 16-character password (e.g., "abcd efgh ijkl mnop")
```

**Step 3: Update .env on Server**
```bash
# SSH to production server
ssh u777317772@your-server-hostname
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi

# Edit .env file (use nano or vi)
nano .env

# Update line (remove spaces from generated password):
MAIL_PASSWORD=abcdefghijklmnop

# Save and exit (Ctrl+X, Y, Enter in nano)

# Clear config cache to reload .env
php artisan config:clear
php artisan config:cache

# Test email sending
php artisan tinker
>>> Mail::raw('Test email after credential rotation', function($msg) {
...   $msg->to('your-test-email@example.com')->subject('Test');
... });
>>> exit
```

✅ **Checkpoint:** Test email received successfully

### 4.3 Laravel APP_KEY Rotation

**Step 1: Generate New APP_KEY**
```bash
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi

# Generate new key
php artisan key:generate --show

# Copy the generated key (starts with base64:...)
```

**Step 2: Update .env**
```bash
nano .env

# Update line with new generated key:
APP_KEY=base64:NEW_GENERATED_KEY_HERE

# Save and exit

# Clear cache
php artisan config:clear
php artisan config:cache
```

⚠️ **WARNING:** Rotating APP_KEY will:
- Invalidate all existing user sessions (users must re-login)
- Invalidate encrypted data (if any)

**Best Practice:** Rotate during low-traffic hours and notify users.

### 4.4 Database Password Rotation (If Exposed)

**Via cPanel/Hostinger Control Panel:**
```
1. Log in to your hosting control panel
2. Go to MySQL Databases
3. Find database user: [your_db_user]
4. Click "Change Password"
5. Generate strong password (20+ characters)
6. Save the new password
```

**Update .env:**
```bash
nano .env

# Update lines:
DB_USERNAME=your_db_user
DB_PASSWORD=new_strong_password_here

# Save and test connection
php artisan tinker
>>> DB::connection()->getPdo();
# Should return PDO object without errors
>>> exit
```

### 4.5 Credential Rotation Checklist

- [ ] Gmail app password rotated and tested
- [ ] Laravel APP_KEY rotated
- [ ] Database password rotated (if exposed)
- [ ] Payment gateway API keys rotated (if any)
- [ ] Third-party service tokens rotated (SMS, storage, etc.)
- [ ] All credentials updated in .env on production server
- [ ] Config cache cleared after each update
- [ ] Application tested after all rotations

---

## 5. Rollback Procedure

**If issues occur after deployment, follow these steps:**

### 5.1 Immediate Rollback to Previous Commit
```bash
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi

# Find the commit hash you saved in step 1.2
# Example: abc1234

# Rollback to previous commit
git reset --hard abc1234

# Or rollback to previous state
git reset --hard HEAD@{1}

# Clear all caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

✅ **Checkpoint:** Application should return to previous state

### 5.2 Restore Database from Backup (If Needed)
```bash
# Database changes are NOT expected for this deployment
# Only restore if data corruption occurred

cd ~/backups/$(date +%Y%m%d)

# Restore from backup
mysql -u [DB_USER] -p[DB_PASSWORD] [DB_NAME] < patna_finder_pre_security_*.sql
```

### 5.3 Restore File Backup (If Git Rollback Failed)
```bash
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi

# Extract backup
tar -xzf ~/backups/$(date +%Y%m%d)/patnafinderapi_files_*.tar.gz -C .

# Clear caches
php artisan config:clear
php artisan cache:clear
```

### 5.4 Notify Team and Debug
```bash
# Collect error logs for debugging
tail -n 200 storage/logs/laravel.log > ~/rollback-debug-$(date +%Y%m%d-%H%M%S).log

# Send logs to development team
```

---

## 6. Monitoring Checklist

**Monitor the following for 24-48 hours after deployment:**

### 6.1 Laravel Application Logs
```bash
# SSH to server and tail logs
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi
tail -f storage/logs/laravel.log

# Watch for:
# - CORS errors (should be none from patnafinder.codevixa.com)
# - File upload validation errors (expected for SVG/GIF attempts)
# - Mass assignment errors (should be none)
# - Unexpected 500 errors
```

**Alert Thresholds:**
- ❌ Any errors related to missing .env values
- ❌ Spike in 500 errors after deployment
- ⚠️ Multiple CORS errors from legitimate frontend domain

### 6.2 Frontend Console Errors

**Browser DevTools Console Check:**
```
1. Open https://patnafinder.codevixa.com
2. Open DevTools (F12)
3. Go to Console tab
4. Navigate through app (login, search, upload)

Watch for:
- CORS errors (should be ZERO)
- API request failures
- Failed resource loads
```

**Alert Thresholds:**
- ❌ Any CORS policy errors
- ❌ API endpoints returning 403/500
- ⚠️ Increased 422 validation errors

### 6.3 File Upload Functionality

**Test User Upload:**
```
1. Log in as regular user
2. Try uploading valid JPEG/PNG (should succeed)
3. Try uploading SVG (should fail with clear message)
4. Verify uploaded images display correctly
```

**Test Admin Upload:**
```
1. Log in as admin
2. Upload media (JPEG/PNG/WebP - should succeed)
3. Verify media appears in admin panel
4. Verify media displays on frontend
```

**Alert Thresholds:**
- ❌ Valid JPEG/PNG uploads failing
- ⚠️ Users confused by SVG rejection messages

### 6.4 Email Functionality (If Credentials Rotated)

**Test Forgot Password:**
```
1. Go to https://patnafinder.codevixa.com/forgot-password
2. Enter valid email address
3. Submit form

Expected:
- No 500 error (should be fixed from original issue)
- Email received within 1-2 minutes
```

**Alert Thresholds:**
- ❌ Forgot password returns 500 error
- ❌ Emails not being delivered
- ⚠️ Emails going to spam folder

### 6.5 User Authentication & Sessions

**Test Login/Logout:**
```
1. Log in as user (should work normally)
2. Access protected pages (should work)
3. Log out (should clear session)
4. Try accessing protected pages after logout (should redirect to login)
```

**If APP_KEY was rotated:**
- All users will be logged out (expected)
- May receive user reports of "session expired"
- This is NORMAL and one-time only

### 6.6 Error Rate Monitoring

**Baseline Metrics (Before Deployment):**
Record current error rates from logs or monitoring tools.

**Post-Deployment Monitoring:**
```bash
# Count errors per hour for 24 hours
cd /home/u777317772/domains/codevixa.com/public_html/patnafinderapi

# Errors in last hour
grep "$(date -d '1 hour ago' '+%Y-%m-%d %H')" storage/logs/laravel.log | grep -c "ERROR"

# Compare to baseline
```

**Alert Thresholds:**
- ❌ Error rate increased by >50% from baseline
- ❌ New critical errors not seen before
- ⚠️ Error rate increased by 20-50% (investigate)

---

## 7. Known Impacts & User-Facing Changes

### 7.1 File Upload Changes (Admins)
**Impact:** Admins can no longer upload SVG or GIF files

**User Message:**
> "For security reasons, only JPEG, PNG, and WebP formats are now supported. SVG and GIF uploads are disabled to prevent XSS attacks."

**Workarounds:**
- Convert SVG to PNG using online tools (e.g., CloudConvert)
- Convert GIF to WebP for better compression
- Use PNG for logos and graphics

**Likelihood of Support Tickets:** Medium  
**Recommended Response:** Link to PNG converter, explain security benefits

### 7.2 Session Expiration (If APP_KEY Rotated)
**Impact:** All users logged out immediately after APP_KEY rotation

**User Message:**
> "For security reasons, all sessions have been reset. Please log in again."

**Workarounds:** None - users must re-login

**Likelihood of Support Tickets:** High (if rotated during peak hours)  
**Recommended Response:** Apologize for inconvenience, explain security improvement

### 7.3 CORS Restrictions (Developers)
**Impact:** Localhost development no longer works via production API

**Developer Solution:**
```bash
# Local Laravel development must use config/cors.php
# In backend/laravel/config/cors.php:
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:3000'),
],

# Set in local .env:
FRONTEND_URL=http://localhost:3000
```

**Likelihood of Support Tickets:** Low (only affects developers)

---

## 8. Success Criteria

Deployment is considered **successful** when:

✅ **Critical Checks (Must Pass)**
- [ ] Application is accessible at https://patnafinderapi.codevixa.com
- [ ] Frontend at https://patnafinder.codevixa.com can make API calls (no CORS errors)
- [ ] User registration creates users with role='user' only
- [ ] Valid JPEG/PNG uploads work in both user and admin panels
- [ ] SVG uploads are rejected with clear error message
- [ ] .env file returns 403 when accessed via URL
- [ ] No new critical errors in Laravel logs

✅ **Security Validations (Must Pass)**
- [ ] CORS only allows https://patnafinder.codevixa.com (not localhost)
- [ ] Mass assignment cannot set role/permissions/is_active
- [ ] MIME type verification rejects spoofed files
- [ ] .env not in git history: `git log --all -- .env` returns empty

✅ **Functional Validations (Should Pass)**
- [ ] Login/logout works normally
- [ ] Forgot password sends email (no 500 error)
- [ ] User can upload profile images (JPEG/PNG)
- [ ] Admin can upload media (JPEG/PNG/WebP)
- [ ] Existing images still display on frontend

✅ **Post-Rotation Checks (If Credentials Rotated)**
- [ ] Emails are being delivered (MAIL_PASSWORD updated)
- [ ] Database connections working (DB_PASSWORD updated)
- [ ] No "invalid key" errors (APP_KEY updated)

---

## 9. Deployment Sign-Off

**Deployed By:** _________________________  
**Date & Time:** _________________________  
**Git Commit Deployed:** _________________________  
**Backup Location:** _________________________

**Post-Deployment Verification:**
- [ ] All items in Section 3 (Post-Deployment Verification) completed
- [ ] All items in Section 8 (Success Criteria) passed
- [ ] Monitoring enabled for 24-48 hours
- [ ] Team notified of deployment completion

**Issues Encountered:** (if any)
```
[Describe any issues and how they were resolved]
```

**Rollback Required:** ☐ Yes  ☐ No  
**If Yes, Reason:** _________________________

---

## 10. Reference Information

### 10.1 Key File Locations on Server
```
Application Root:  /home/u777317772/domains/codevixa.com/public_html/patnafinderapi
Public Directory:  /home/u777317772/domains/codevixa.com/public_html/patnafinderapi/public
Laravel Logs:      /home/u777317772/domains/codevixa.com/public_html/patnafinderapi/storage/logs
Environment File:  /home/u777317772/domains/codevixa.com/public_html/patnafinderapi/.env
Backups:           ~/backups/[DATE]/
```

### 10.2 Important URLs
```
Production API:    https://patnafinderapi.codevixa.com
Production Frontend: https://patnafinder.codevixa.com
cPanel/Hosting:    [Your hosting control panel URL]
Gmail App Passwords: https://myaccount.google.com/apppasswords
```

### 10.3 Critical Commands Reference
```bash
# Clear all Laravel caches
php artisan config:clear && php artisan cache:clear && php artisan route:clear && php artisan view:clear

# Rebuild caches
php artisan config:cache && php artisan route:cache

# View Laravel logs
tail -f storage/logs/laravel.log

# Check git status
git status && git log -1 --oneline

# Verify .env not tracked
git ls-files | grep "\.env$"

# Test database connection
php artisan tinker
>>> DB::connection()->getPdo();
>>> exit
```

### 10.4 Emergency Contacts
```
Development Team:  [Contact information]
Server Admin:      [Contact information]
Security Team:     [Contact information]
```

---

## Appendix A: Security Fix Details

### CRITICAL-001: CORS Configuration
**File:** `public/.htaccess`  
**Change:** Removed localhost fallback, only allows `https://patnafinder.codevixa.com`  
**Risk:** Low - No breaking changes for production users  
**Testing:** CORS headers visible in browser DevTools Network tab

### CRITICAL-002: Mass Assignment Protection
**Files:** 
- `app/Models/User.php` - Added $guarded array
- `app/Http/Controllers/Api/User/AuthController.php` - Hardcoded role='user'

**Change:** Prevents mass assignment of sensitive fields (role, permissions, is_active, etc.)  
**Risk:** Low - Registration already hardcoded role assignment  
**Testing:** Attempt to register with `"role": "admin"` should create user with role='user'

### CRITICAL-003: File Upload Security
**Files:**
- `app/Http/Controllers/Api/Admin/MediaController.php`
- `app/Http/Controllers/Api/User/ImageUploadController.php`

**Change:** 
- Removed SVG from allowed types
- Added MIME type verification via finfo_file()

**Risk:** Medium - Admins can no longer upload SVG graphics  
**Testing:** SVG upload should return 422 with "file must be a file of type: jpg,jpeg,png,webp"

### CRITICAL-004: .env Protection
**Files:**
- `.gitignore` - Ensures .env not tracked
- `.env.example` - Template with no actual credentials
- `public/.htaccess` - Blocks direct HTTP access to .env

**Change:** Multiple layers preventing .env exposure  
**Risk:** None - .env was already not tracked  
**Testing:** `curl https://patnafinderapi.codevixa.com/.env` should return 403

---

## Appendix B: Troubleshooting Common Issues

### Issue: CORS errors after deployment
**Symptom:** Frontend shows "blocked by CORS policy" in console

**Diagnosis:**
```bash
# Check .htaccess CORS configuration
grep -A5 "Access-Control-Allow-Origin" public/.htaccess

# Should show only: https://patnafinder.codevixa.com
```

**Solution:**
- Verify frontend is accessing from correct domain (https, not http)
- Clear browser cache
- Check .htaccess was actually updated on server

### Issue: File uploads failing for valid JPEG/PNG
**Symptom:** Even valid images return "File type mismatch" error

**Diagnosis:**
```bash
# Check if finfo PHP extension is enabled
php -m | grep fileinfo

# Should show: fileinfo
```

**Solution:**
```bash
# If fileinfo missing, enable in php.ini
# Contact hosting support to enable fileinfo extension

# Temporary workaround (NOT RECOMMENDED): Comment out MIME check
# Only use if fileinfo cannot be enabled
```

### Issue: "Class NewsletterController does not exist" error
**Symptom:** Error in Laravel logs about missing NewsletterController

**Diagnosis:**
This is unrelated to security fixes. Route cache references a deleted controller.

**Solution:**
```bash
php artisan route:clear
php artisan route:cache
```

### Issue: Forgot password still returns 500 error
**Symptom:** POST to /api/v1/user/forgot-password returns 500

**Diagnosis:**
```bash
# Check Laravel logs for specific error
tail -n 50 storage/logs/laravel.log

# Look for: "Undefined constant AuthEvent::PASSWORD_RESET_REQUESTED"
```

**Solution:**
```bash
# Verify AuthEvent model has constant defined
grep "PASSWORD_RESET_REQUESTED" app/Models/AuthEvent.php

# Should contain:
# public const PASSWORD_RESET_REQUESTED = 'password_reset_requested';

# If missing, add it and redeploy
```

### Issue: All users logged out unexpectedly
**Symptom:** Users report "session expired" en masse

**Diagnosis:**
This occurs if APP_KEY was changed without notifying users.

**Solution:**
- This is EXPECTED behavior after APP_KEY rotation
- Users simply need to log in again
- Prepare user communication: "For security reasons, all sessions have been reset. Please log in again."

### Issue: Emails not sending after deployment
**Symptom:** Forgot password hangs, emails not received

**Diagnosis:**
```bash
# Check MAIL_PASSWORD in .env
# DO NOT echo or cat .env in production logs

# Test email sending
php artisan tinker
>>> Mail::raw('Test', function($m) { $m->to('test@example.com')->subject('Test'); });
# Check for errors
>>> exit
```

**Solution:**
- Verify MAIL_PASSWORD was updated with new app password (no spaces)
- Check Gmail account hasn't blocked the app password
- Verify MAIL_USERNAME is correct Gmail address
- Clear config cache: `php artisan config:clear && php artisan config:cache`

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Security Team | Initial deployment guide for CRITICAL-001 through CRITICAL-004 fixes |

---

**End of Deployment Guide**
