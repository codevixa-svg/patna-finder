# Live Server Fix - CORS & Route Issue

## Problem
```
The POST method is not supported for route api/v1/user/forgot-password. 
Supported methods: OPTIONS.
```

## Solutions (Try in Order)

### Solution 1: Clear Cache via Browser (Easiest)
1. Upload `clear-cache.php` to your server's public directory
2. Open in browser: `https://your-domain.com/clear-cache.php`
3. You should see success messages
4. **IMPORTANT:** Delete `clear-cache.php` file after use for security

### Solution 2: Clear Cache via SSH/Terminal
If you have SSH access to live server:
```bash
cd /path/to/your/laravel/project

# Clear all caches
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear
php artisan optimize:clear

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Solution 3: Check .htaccess File
Make sure `public/.htaccess` has CORS headers. The file has been updated with:
```apache
Header always set Access-Control-Allow-Origin "https://patnafinder.codevixa.com"
Header always set Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, Accept, Origin, X-CSRF-TOKEN"
```

### Solution 4: Check Server Requirements
Ensure Apache modules are enabled on your server:
- `mod_rewrite` (for URL rewriting)
- `mod_headers` (for CORS headers)

Contact your hosting provider if these are not enabled.

### Solution 5: Manual File Deletion
If cache clear doesn't work, manually delete these files/folders via FTP:
```
bootstrap/cache/routes-v7.php
bootstrap/cache/config.php
storage/framework/cache/*
storage/framework/views/*
storage/logs/laravel.log (optional, just to see fresh logs)
```

### Solution 6: Environment Check
Make sure your `.env` file on live server has correct FRONTEND_URL:
```env
FRONTEND_URL=https://patnafinder.codevixa.com
APP_ENV=production
APP_DEBUG=false
```

### Solution 7: Verify Route Registration
Run this via SSH or create a test file:
```php
<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$routes = Route::getRoutes();
foreach ($routes as $route) {
    if (strpos($route->uri(), 'forgot-password') !== false) {
        echo "Found: " . implode('|', $route->methods()) . " " . $route->uri() . "\n";
    }
}
```

## Quick Test After Fix
Use this curl command to test from terminal:
```bash
curl -X POST https://api.patnafinder.codevixa.com/api/v1/user/forgot-password \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Origin: https://patnafinder.codevixa.com" \
  -d '{"email":"test@example.com"}'
```

Expected response: JSON with success message or error (not 405 Method Not Allowed)

## Common Causes
1. ✅ Route cache not cleared after code deployment
2. ✅ CORS preflight OPTIONS request failing
3. ✅ Apache mod_headers not enabled
4. ✅ .htaccess file missing or incorrect
5. ✅ Config cache outdated

## Files Modified
- `backend/laravel/public/.htaccess` - Updated CORS headers
- `backend/laravel/clear-cache.php` - NEW: Cache clear script for browser
- `backend/laravel/app/Services/Security/OtpService.php` - Added error handling
- `backend/laravel/app/Http/Controllers/Api/User/AuthController.php` - Added error handling
