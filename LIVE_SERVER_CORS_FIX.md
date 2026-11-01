# 🔴 URGENT: Live Server CORS Fix

## Error
```
Access-Control-Allow-Origin header has value 'http://localhost:3000' 
that is not equal to the supplied origin.
```

## ✅ Quick Fix (2 Steps)

### Step 1: Update .env File on Live Server

**Location:** `/path/to/laravel/.env`

**Change this line:**
```env
# ❌ WRONG
FRONTEND_URL=http://localhost:3000

# ✅ CORRECT
FRONTEND_URL=https://patnafinder.codevixa.com
```

**How to Edit:**
- Via cPanel: File Manager → Edit `.env`
- Via SSH: `nano .env`
- Via FTP: Download, edit, re-upload

---

### Step 2: Update .htaccess on Live Server

**Option A: Upload New .htaccess (Recommended)**

Upload this file to live server:
```
Source: backend/laravel/public/.htaccess
Target: /public/.htaccess
```

The updated file now supports both local and live dynamically!

**Option B: Manual Edit**

Edit `/public/.htaccess` line 11:

```apache
# ❌ WRONG (Line 11)
Header always set Access-Control-Allow-Origin "http://localhost:3000"

# ✅ CORRECT (Replace with this block)
SetEnvIf Origin "^https://patnafinder\.codevixa\.com$" ORIGIN=$0
SetEnvIf Origin "^http://localhost:3000$" ORIGIN=$0
Header always set Access-Control-Allow-Origin "%{ORIGIN}e" env=ORIGIN
```

**Option C: Live-Only Version**

If you want ONLY live domain (no localhost), upload:
```
Source: backend/laravel/public/.htaccess.live
Target: /public/.htaccess (rename during upload)
```

---

### Step 3: Clear Cache

**Via Browser:**
```
https://your-domain.com/clear-cache.php
```

**Via SSH:**
```bash
cd /path/to/laravel
php artisan config:clear
php artisan cache:clear
php artisan optimize:clear
```

**Manual (FTP):**
Delete:
- `bootstrap/cache/config.php`
- `storage/framework/cache/data/*`

---

### Step 4: Restart Web Server (If Possible)

**Via cPanel:**
- PHP Selector → Restart

**Via SSH:**
```bash
sudo systemctl restart apache2
# OR
sudo systemctl restart nginx
```

---

## 🧪 Test After Fix

### Test 1: Check CORS Header
```bash
curl -I https://patnafinderapi.codevixa.com/api/v1/user/forgot-password \
  -H "Origin: https://patnafinder.codevixa.com"
```

**Expected Response:**
```
Access-Control-Allow-Origin: https://patnafinder.codevixa.com
```

**❌ NOT:**
```
Access-Control-Allow-Origin: http://localhost:3000
```

### Test 2: Frontend
1. Open: https://patnafinder.codevixa.com/dashboard/forgot-password
2. Open Browser Console (F12)
3. Enter email and submit
4. Should NOT see CORS error

---

## 🎯 What Changed

### File 1: `.env`
```diff
- FRONTEND_URL=http://localhost:3000
+ FRONTEND_URL=https://patnafinder.codevixa.com
```

### File 2: `.htaccess`
```diff
- Header always set Access-Control-Allow-Origin "http://localhost:3000"
+ SetEnvIf Origin "^https://patnafinder\.codevixa\.com$" ORIGIN=$0
+ Header always set Access-Control-Allow-Origin "%{ORIGIN}e" env=ORIGIN
```

---

## ⚠️ Important Notes

1. **Both files must be updated** - .env AND .htaccess
2. **Cache must be cleared** - Old config will persist
3. **Test in incognito** - Browser cache can cause confusion
4. **Check both domains:**
   - API: `patnafinderapi.codevixa.com`
   - Frontend: `patnafinder.codevixa.com`

---

## 🔄 If Still Not Working

### Check 1: Apache mod_headers Enabled
```bash
# SSH
a2enmod headers
sudo systemctl restart apache2
```

### Check 2: .htaccess Override Allowed
In Apache config, check:
```apache
<Directory /path/to/public>
    AllowOverride All
</Directory>
```

### Check 3: Config Cache
```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
```

### Check 4: Browser Cache
- Open Incognito/Private window
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## ✅ Success Indicators

You know it's fixed when:
- ✅ No CORS error in browser console
- ✅ API calls complete successfully
- ✅ Forgot password form submits without error
- ✅ OTP email arrives

---

**Fixed Date:** October 24, 2026  
**Issue:** CORS pointing to localhost instead of live domain  
**Solution:** Updated .env + .htaccess on live server
