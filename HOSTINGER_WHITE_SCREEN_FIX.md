# 🔧 Fix White Screen / 500 Error - Laravel Hostinger

## 🚨 Current Issue
- APP_DEBUG=true hai but error show nahi ho raha
- White screen ya "500 Internal Server Error" message
- Error PHP logs me hai, browser me nahi

---

## 🔍 Problem in .env File

Aapke .env me issue hai:
```
FRONTEND_URL=why some of my shorts are showing Ads Off
                    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                    ⚠️ This is WRONG!
```

Ye line corrupt ho gayi hai!

---

## ✅ **Fix 1: Correct .env File**

### **Complete Correct .env Configuration:**

```bash
APP_NAME="Patna Finder"
APP_ENV=production
APP_KEY=base64:CWHBQC084/ysmQkHqzCaO7hcEoCu+EviFuhiDJ9QDkc=
APP_DEBUG=false
APP_URL=https://patnafinderapi.codevixa.com

FRONTEND_URL=https://patna-finder.codevixa.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u777317772_patna_finder
DB_USERNAME=u777317772_patna_user
DB_PASSWORD=your_database_password_here

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
MAIL_PASSWORD=your-app-password-here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
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

SANCTUM_STATEFUL_DOMAINS=patna-finder.codevixa.com
SESSION_DOMAIN=.codevixa.com
```

---

## ✅ **Fix 2: Clear All Cache**

### **Via SSH (Best Method):**
```bash
cd /home/u777317772/public_html/patnafinderapi

# Clear everything
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Re-cache
php artisan config:cache
php artisan route:cache
```

### **Via File Manager (No SSH):**
```
Delete these files:
1. bootstrap/cache/config.php
2. bootstrap/cache/routes-v7.php
3. bootstrap/cache/services.php
4. bootstrap/cache/*.php (all files)
```

---

## ✅ **Fix 3: Check Permissions**

```bash
cd /home/u777317772/public_html/patnafinderapi

chmod -R 775 storage
chmod -R 775 bootstrap/cache
chmod 644 .env

# Fix owner
chown -R u777317772:u777317772 storage
chown -R u777317772:u777317772 bootstrap/cache
```

---

## ✅ **Fix 4: Check PHP Error Logs**

### **Method 1: cPanel Errors**
```
cPanel → Metrics → Errors
या
cPanel → File Manager → logs folder
```

### **Method 2: Laravel Logs**
```
File: storage/logs/laravel.log

Path: /home/u777317772/public_html/patnafinderapi/storage/logs/laravel.log
```

### **Method 3: Apache Error Log**
```
File: /home/u777317772/logs/patnafinderapi.codevixa.com-error_log
या
File: /home/u777317772/public_html/patnafinderapi/error_log
```

**Last 50 lines check karo:**
```bash
tail -50 storage/logs/laravel.log
```

---

## ✅ **Fix 5: Enable Display Errors (Temporarily)**

### **Create: public/debug.php**
```php
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

echo "<h1>PHP is working!</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";

// Test Laravel autoload
require __DIR__.'/../vendor/autoload.php';
echo "<p>✅ Autoload working!</p>";

// Test Laravel app
$app = require_once __DIR__.'/../bootstrap/app.php';
echo "<p>✅ Laravel app loading!</p>";

phpinfo();
?>
```

**Visit:** https://patnafinderapi.codevixa.com/debug.php

This will show exact error!

---

## ✅ **Fix 6: Check .htaccess**

### **File: public/.htaccess**

Should contain:
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

---

## ✅ **Fix 7: Test Database Connection**

### **Via SSH:**
```bash
php artisan tinker
>>> DB::connection()->getPdo();
>>> exit
```

Should connect without error.

### **Via debug.php:**
```php
<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

try {
    $pdo = DB::connection()->getPdo();
    echo "✅ Database connected!";
    echo "<br>Database: " . DB::connection()->getDatabaseName();
} catch (\Exception $e) {
    echo "❌ Database error: " . $e->getMessage();
}
?>
```

---

## 🧪 **Testing Steps**

### **Test 1: PHP Works**
```
URL: https://patnafinderapi.codevixa.com/debug.php
Expected: PHP info page
```

### **Test 2: Laravel Works**
```
URL: https://patnafinderapi.codevixa.com
Expected: Laravel welcome or JSON
```

### **Test 3: API Endpoint**
```
URL: https://patnafinderapi.codevixa.com/api/v1/categories
Expected: JSON array
```

---

## 📋 **Complete Fix Checklist**

Execute in order:

### **Step 1: Fix .env**
```
1. Open .env in File Manager
2. Fix FRONTEND_URL line
3. Set APP_DEBUG=false (after fixing)
4. Verify DB_PASSWORD is correct
5. Save
```

### **Step 2: Clear Cache**
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

### **Step 3: Set Permissions**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
chmod 644 .env
```

### **Step 4: Cache Config**
```bash
php artisan config:cache
php artisan route:cache
```

### **Step 5: Run Migrations**
```bash
php artisan migrate --force
```

### **Step 6: Test**
```
https://patnafinderapi.codevixa.com/api/v1/categories
```

---

## 🚨 **Common Errors & Solutions**

### **Error: Class not found**
```bash
composer dump-autoload
php artisan config:clear
```

### **Error: Permission denied**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### **Error: Database connection**
```
Check DB_PASSWORD in .env
Test with: php artisan tinker >>> DB::connection()->getPdo();
```

### **Error: Syntax error in .env**
```
Look for:
- Unquoted values with spaces
- Missing equals signs
- Random text (like "why some of my shorts...")
```

---

## 💡 **Quick Commands (Copy-Paste)**

```bash
# All in one fix
cd /home/u777317772/public_html/patnafinderapi && \
chmod -R 775 storage bootstrap/cache && \
chmod 644 .env && \
php artisan config:clear && \
php artisan cache:clear && \
php artisan route:clear && \
php artisan view:clear && \
php artisan config:cache && \
php artisan route:cache && \
echo "✅ All done! Test now."
```

---

## 📞 **Next Steps**

1. **Fix .env file** - Remove that wrong FRONTEND_URL text
2. **Upload debug.php** to public folder
3. **Visit debug.php** - Screenshot bhejo
4. **Check storage/logs/laravel.log** - Last 20 lines bhejo

---

**Let me know what you see! 🚀**
