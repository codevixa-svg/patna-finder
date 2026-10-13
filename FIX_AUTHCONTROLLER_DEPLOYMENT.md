# Fix AuthController Duplicate Function - Deployment Guide

## Problem
Server has duplicate `maskEmail()` function at line 631 in User/AuthController.php causing PHP Fatal Error:
```
Cannot redeclare App\Http\Controllers\Api\User\AuthController::maskEmail()
```

This prevents the entire controller from loading, so CORS headers are never sent and user registration fails.

## Solution
The **local file is already fixed** (duplicate removed). We just need to upload it to the server.

## Deployment Steps

### 1. Connect to Server
```bash
ssh -p 65002 u777317772@145.79.212.11
cd domains/patnafinderapi.codevixa.com/public_html
```

### 2. Backup Current File (Important!)
```bash
cp app/Http/Controllers/Api/User/AuthController.php app/Http/Controllers/Api/User/AuthController.php.backup-$(date +%Y%m%d-%H%M%S)
```

### 3. Upload Fixed File
From your **local machine** (Windows PowerShell):
```powershell
# Navigate to project directory
cd d:\patna-finder

# Upload the fixed AuthController.php
scp -P 65002 backend\laravel\app\Http\Controllers\Api\User\AuthController.php u777317772@145.79.212.11:/home/u777317772/domains/patnafinderapi.codevixa.com/public_html/app/Http/Controllers/Api/User/
```

### 4. Clear Laravel Cache (On Server)
```bash
ssh -p 65002 u777317772@145.79.212.11
cd domains/patnafinderapi.codevixa.com/public_html

php artisan config:cache
php artisan route:cache
php artisan cache:clear
```

### 5. Verify Fix
Check if PHP can now parse the file without errors:
```bash
php -l app/Http/Controllers/Api/User/AuthController.php
```

Should return: **"No syntax errors detected"**

### 6. Test Registration
1. Open: https://patnafinder.codevixa.com
2. Clear browser cache or use Incognito mode
3. Try registering a new user
4. Should work without CORS error!

### 7. Monitor Logs
```bash
# Check for any new errors
tail -f storage/logs/laravel.log
```

## What Was Fixed
- **Removed:** Duplicate `maskEmail()` function declaration at line 631
- **Kept:** Original `maskEmail()` function at line 587 (works for both MFA and password reset)

## Verification
The local file has:
- ✅ Only ONE `maskEmail()` function (line 587)
- ✅ All forgot password, verify OTP, and reset password methods working
- ✅ File ends cleanly at line ~838

## Rollback (If Needed)
If something goes wrong:
```bash
cd domains/patnafinderapi.codevixa.com/public_html
cp app/Http/Controllers/Api/User/AuthController.php.backup-YYYYMMDD-HHMMSS app/Http/Controllers/Api/User/AuthController.php
php artisan config:cache
php artisan route:cache
```

## Expected Result
✅ User registration works on live server
✅ No more PHP fatal errors in logs
✅ CORS headers properly sent
✅ OPTIONS and POST requests both succeed
