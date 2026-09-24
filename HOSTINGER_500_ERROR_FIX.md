# 🔧 Fix 500 Internal Server Error - Laravel on Hostinger

## ✅ Progress: 403 → 500
Good! Document Root fix ho gaya. Ab 500 error fix karte hain.

---

## 🚨 500 Error ke Common Causes

1. ❌ APP_KEY missing in .env
2. ❌ Wrong folder permissions
3. ❌ Database connection issue
4. ❌ PHP version mismatch
5. ❌ Missing PHP extensions

---

## 🔧 **Fix 1: Generate APP_KEY (Most Common)**

### **Via SSH (Recommended):**
```bash
cd /home/username/public_html/patnafinderapi
php artisan key:generate
```

### **Via File Manager (If no SSH):**
```
1. Open: /public_html/patnafinderapi/.env
2. Find line: APP_KEY=
3. Generate key online: https://generate-random.org/laravel-key-generator
4. Paste: APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxx
5. Save file
```

### **Manual Key Generation (PowerShell):**
```powershell
# Run this locally to get a key
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$key = "base64:" + [Convert]::ToBase64String($bytes)
Write-Host $key
```

---

## 🔧 **Fix 2: Set Correct Permissions**

### **Via SSH:**
```bash
cd /home/username/public_html/patnafinderapi

# Storage writable
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# Owner fix
chown -R $USER:$USER storage
chown -R $USER:$USER bootstrap/cache
```

### **Via File Manager:**
```
1. Right click on "storage" folder
2. Change Permissions → 775
3. Check "Recurse into subdirectories"
4. Click "Change Permissions"

5. Repeat for "bootstrap/cache" folder
```

---

## 🔧 **Fix 3: Check .env Configuration**

Open `.env` file and verify:

```bash
# Application
APP_NAME="Patna Finder"
APP_ENV=production
APP_KEY=base64:xxxxxxxxxxxxxxxxxxxxxxxxxx  ← Must be set!
APP_DEBUG=false  ← Must be false in production
APP_URL=https://patnafinderapi.codevixa.com

# Database - CHECK THESE!
DB_CONNECTION=mysql
DB_HOST=localhost  ← या जो आपका है
DB_PORT=3306
DB_DATABASE=your_database_name  ← cPanel से match करो
DB_USERNAME=your_database_user  ← cPanel से match करो
DB_PASSWORD=your_database_password  ← cPanel से match करो

# CORS
SANCTUM_STATEFUL_DOMAINS=patna-finder.codevixa.com
SESSION_DOMAIN=.codevixa.com
```

---

## 🔧 **Fix 4: Clear & Cache Config**

### **Via SSH:**
```bash
cd /home/username/public_html/patnafinderapi

# Clear everything
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Cache config
php artisan config:cache
```

### **Via File Manager (If no SSH):**
```
Delete these folders manually:
- bootstrap/cache/config.php
- bootstrap/cache/routes-v7.php
- bootstrap/cache/services.php
```

---

## 🔧 **Fix 5: Check PHP Version**

Laravel 10 needs **PHP 8.1 or higher**.

### **Change PHP Version:**
```
1. cPanel → Software section
2. "Select PHP Version" या "MultiPHP Manager"
3. Select: PHP 8.2 (recommended) या PHP 8.1
4. Enable these extensions:
   ✓ bcmath
   ✓ ctype
   ✓ fileinfo
   ✓ json
   ✓ mbstring
   ✓ openssl
   ✓ pdo
   ✓ pdo_mysql
   ✓ tokenizer
   ✓ xml
   ✓ curl
   ✓ zip
```

---

## 🔧 **Fix 6: Check Laravel Logs**

Error logs में exact problem dikhega:

### **View Logs:**
```
File: storage/logs/laravel.log

Location in cPanel File Manager:
/public_html/patnafinderapi/storage/logs/laravel.log
```

### **Common Errors in Log:**

**Error 1: APP_KEY not set**
```
RuntimeException: No application encryption key has been specified.
```
**Fix:** Run `php artisan key:generate`

**Error 2: Permission denied**
```
UnexpectedValueException: The stream or file "storage/logs/laravel.log" could not be opened
```
**Fix:** `chmod -R 775 storage`

**Error 3: Database connection**
```
SQLSTATE[HY000] [1045] Access denied for user
```
**Fix:** Check DB credentials in .env

**Error 4: Class not found**
```
Class 'XXX' not found
```
**Fix:** Run `composer dump-autoload` (via SSH)

---

## 🔧 **Fix 7: Storage Link**

Create symbolic link for storage:

### **Via SSH:**
```bash
cd /home/username/public_html/patnafinderapi
php artisan storage:link
```

### **Via File Manager (If no SSH):**
```
Create symbolic link manually:
From: /public_html/patnafinderapi/storage/app/public
To:   /public_html/patnafinderapi/public/storage

In Linux: ln -s ../storage/app/public public/storage
```

---

## 📋 **Step-by-Step Fix Order**

Execute in this order:

### **Step 1: Generate APP_KEY**
```bash
cd /home/username/public_html/patnafinderapi
php artisan key:generate
```

### **Step 2: Fix Permissions**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
chmod 644 .env
```

### **Step 3: Clear Cache**
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### **Step 4: Test Database Connection**
```bash
php artisan migrate --force
```
If error, check DB credentials in .env

### **Step 5: Cache Config**
```bash
php artisan config:cache
php artisan route:cache
```

### **Step 6: Create Storage Link**
```bash
php artisan storage:link
```

### **Step 7: Test**
```
https://patnafinderapi.codevixa.com/api/v1/categories
```

---

## 🧪 Quick Test Commands

### **Test 1: Check PHP Version**
```bash
php -v
```
Should show: PHP 8.1.x or higher

### **Test 2: Check Laravel Installation**
```bash
php artisan --version
```
Should show: Laravel Framework 10.x.x

### **Test 3: Check Database Connection**
```bash
php artisan tinker
>>> DB::connection()->getPdo();
```
Should connect without error

### **Test 4: Check .env is loaded**
```bash
php artisan tinker
>>> config('app.name');
```
Should show: "Patna Finder"

---

## 🚨 Still 500 Error? Do This:

### **1. Enable Debug Mode Temporarily**
```
In .env:
APP_DEBUG=true  ← Change to true
```
Refresh browser - error message dikhega

**⚠️ IMPORTANT:** Debug mode enable karne ke baad error fix karo, phir:
```
APP_DEBUG=false  ← Change back to false
```

### **2. Check Apache Error Logs**
```
cPanel → Metrics → Errors
या
/home/username/logs/patnafinderapi.codevixa.com-error_log
```

### **3. Check .htaccess in public folder**
```
File: /public_html/patnafinderapi/public/.htaccess
Should exist and have Laravel rewrite rules
```

### **4. Test with Simple PHP File**
```
Create: /public_html/patnafinderapi/public/test.php

<?php
phpinfo();
?>

Visit: https://patnafinderapi.codevixa.com/test.php
```
If this works, PHP is fine. Issue is Laravel config.

---

## 📊 Checklist

- [ ] APP_KEY generated in .env
- [ ] APP_DEBUG=false in .env
- [ ] Database credentials correct in .env
- [ ] PHP version 8.1+ selected in cPanel
- [ ] Required PHP extensions enabled
- [ ] storage permissions: 775
- [ ] bootstrap/cache permissions: 775
- [ ] .env permissions: 644
- [ ] Config cached: php artisan config:cache
- [ ] Storage linked: php artisan storage:link
- [ ] Migrations run: php artisan migrate --force
- [ ] Tested: /api/v1/categories

---

## 💡 Most Common Fix (90% cases)

```bash
cd /home/username/public_html/patnafinderapi
php artisan key:generate
chmod -R 775 storage
chmod -R 775 bootstrap/cache
php artisan config:cache
```

**Then test:** https://patnafinderapi.codevixa.com/api/v1/categories

---

## 📞 If Still Not Working

**Send me:**
1. Last 20 lines of: `storage/logs/laravel.log`
2. Screenshot of .env file (hide passwords)
3. PHP version from cPanel

**Or temporarily enable:**
```
APP_DEBUG=true in .env
```
And share the error message.

---

**Good luck! 🚀**
