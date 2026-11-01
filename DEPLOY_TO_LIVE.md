# 🚀 Deploy Forgot Password Fix to Live Server

## Quick Deployment Checklist

### ☑️ Pre-Deployment
- [x] Local testing complete ✅
- [x] All files identified
- [ ] Backup live server files
- [ ] Test on staging (if available)

---

## 📦 Files to Upload

Copy these files from local to live server:

### 1. Backend Files (Laravel)
```
backend/laravel/routes/api.php
backend/laravel/app/Services/Security/OtpService.php
backend/laravel/app/Http/Controllers/Api/User/AuthController.php
backend/laravel/public/.htaccess
backend/laravel/app/Http/Kernel.php
```

### 2. Cache Clear Script (Upload & Delete After Use)
```
backend/laravel/clear-cache.php
```

---

## 🔧 Deployment Steps

### Step 1: Backup Live Files
```bash
# Via SSH
cd /path/to/laravel
cp routes/api.php routes/api.php.backup
cp app/Services/Security/OtpService.php app/Services/Security/OtpService.php.backup
cp app/Http/Controllers/Api/User/AuthController.php app/Http/Controllers/Api/User/AuthController.php.backup
cp public/.htaccess public/.htaccess.backup
cp app/Http/Kernel.php app/Http/Kernel.php.backup
```

Or download them via FTP/SFTP before uploading new files.

---

### Step 2: Upload Files

#### Via FTP/SFTP:
1. Connect to your server
2. Navigate to Laravel root directory
3. Upload files maintaining directory structure
4. Overwrite existing files

#### Via Git (Recommended):
```bash
# Local
git add .
git commit -m "Fix: Forgot password CORS middleware issue"
git push origin main

# Live Server
cd /path/to/laravel
git pull origin main
```

---

### Step 3: Clear Cache

#### Option A: Via Browser (Easiest)
1. Upload `clear-cache.php` to server root
2. Open in browser: `https://your-domain.com/clear-cache.php`
3. You should see:
   ```
   ✓ Route cache cleared
   ✓ Config cache cleared
   ✓ Application cache cleared
   ✓ View cache cleared
   ✓ Compiled classes cleared
   ✓ Optimization cache cleared
   ```
4. **IMPORTANT:** Delete `clear-cache.php` file immediately

#### Option B: Via SSH
```bash
cd /path/to/laravel
php artisan optimize:clear
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```

#### Option C: Manual (No SSH Access)
Delete these folders via FTP:
```
bootstrap/cache/config.php
bootstrap/cache/routes-v7.php
bootstrap/cache/packages.php
bootstrap/cache/services.php
storage/framework/cache/data/* (all files)
storage/framework/views/* (all files)
```

---

### Step 4: Test Live Server

#### Test 1: API Endpoint
```bash
curl -X POST https://api.patnafinder.codevixa.com/api/v1/user/forgot-password \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"test@example.com"}' \
  -v
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "If an account exists with this email, you will receive a password reset code."
}
```

**❌ Not Expected:** 500 error or "Target class [cors] does not exist"

#### Test 2: Frontend Flow
1. Open: `https://patnafinder.codevixa.com/dashboard/forgot-password`
2. Enter any email
3. Click "Send Reset Code"
4. Should show success message (no error)
5. Check email inbox for OTP

#### Test 3: Complete Flow (With Real User)
1. Go to forgot password page
2. Enter a registered user's email
3. Check email for 6-digit OTP
4. Enter OTP on verification screen
5. Set new password
6. Login with new password ✅

---

## 🐛 Troubleshooting

### Problem: Still getting 500 error

**Solution 1:** Cache not cleared properly
```bash
# SSH
rm -rf bootstrap/cache/*
php artisan optimize:clear

# Or manually delete via FTP
```

**Solution 2:** File permissions
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

**Solution 3:** Check error logs
```bash
tail -f storage/logs/laravel.log
```

Look for:
- "Target class [cors] does not exist" → Cache not cleared
- "Failed to send email" → SMTP configuration issue
- Database errors → Check .env DATABASE settings

---

### Problem: Email not sending

**Check 1:** SMTP Credentials
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=codevixa@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
```

**Check 2:** Gmail App Password
- Go to: https://myaccount.google.com/apppasswords
- Generate new app password
- Update `.env` MAIL_PASSWORD

**Check 3:** Test Email Manually
```bash
php artisan tinker
>>> use App\Mail\MfaCodeMail;
>>> use Illuminate\Support\Facades\Mail;
>>> Mail::to('your-email@example.com')->send(new MfaCodeMail('Test', '123456', 10));
>>> exit
```

---

### Problem: Frontend can't connect to API

**Check 1:** .env.local (Frontend)
```env
NEXT_PUBLIC_API_URL=https://api.patnafinder.codevixa.com
```

**Check 2:** CORS Headers
Verify `.htaccess` has:
```apache
Header always set Access-Control-Allow-Origin "https://patnafinder.codevixa.com"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
```

**Check 3:** SSL Certificate
Make sure both domains have valid SSL:
- https://patnafinder.codevixa.com ✅
- https://api.patnafinder.codevixa.com ✅

---

## 📊 Post-Deployment Verification

### ✅ Checklist
- [ ] API endpoint returns 200 (not 500)
- [ ] Email is being sent successfully
- [ ] OTP code arrives in inbox
- [ ] Password reset completes successfully
- [ ] User can login with new password
- [ ] Rate limiting works (max 3 requests/minute)
- [ ] No errors in Laravel logs
- [ ] Frontend displays success messages
- [ ] Deleted `clear-cache.php` file

---

## 🔄 Rollback Plan (If Something Breaks)

### Quick Rollback via FTP
1. Delete new files
2. Rename backup files:
   ```
   api.php.backup → api.php
   OtpService.php.backup → OtpService.php
   AuthController.php.backup → AuthController.php
   .htaccess.backup → .htaccess
   Kernel.php.backup → Kernel.php
   ```
3. Clear cache again
4. Test

### Rollback via Git
```bash
cd /path/to/laravel
git log  # Find commit hash before changes
git reset --hard <commit-hash>
php artisan optimize:clear
```

---

## 📞 Support

If deployment fails:
1. Check Laravel logs: `storage/logs/laravel.log`
2. Check Apache/Nginx error logs
3. Test API with curl (see Test 1 above)
4. Verify all files uploaded correctly
5. Confirm cache cleared successfully

---

## ✅ Success Indicators

**You know it's working when:**
- ✅ API returns 200 instead of 500
- ✅ No "cors" errors in logs
- ✅ Emails arrive within 30 seconds
- ✅ Complete password reset flow works
- ✅ Frontend shows no errors

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Rollback If Needed:** YES / NO  
**Status:** SUCCESS / FAILED / PARTIAL
