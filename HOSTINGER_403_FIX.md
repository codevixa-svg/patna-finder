# 🔧 Fix 403 Forbidden Error - Laravel on Hostinger

## ❌ Problem
403 Forbidden error aa raha hai kyunki subdomain ka Document Root galat set hai.

---

## ✅ Solution: Document Root Change Karo

### **Step 1: cPanel me jaao**
```
1. Hostinger cPanel login karo
2. "Domains" section me jaao
3. "Subdomains" pe click karo
```

### **Step 2: Document Root Fix Karo**
```
Subdomain: patnafinderapi.codevixa.com

Current Document Root (WRONG):
/home/username/public_html/patnafinderapi

Change to (CORRECT):
/home/username/public_html/patnafinderapi/public
                                          ^^^^^^^^
```

**Important:** `/public` folder zaroor add karo end me!

### **Step 3: Save & Wait**
```
1. Save changes
2. Wait 2-3 minutes for DNS propagation
3. Test: https://patnafinderapi.codevixa.com/api/v1/categories
```

---

## 🔐 Permission Check (After Document Root Fix)

### **SSH se Permissions Set Karo:**
```bash
cd /home/username/public_html/patnafinderapi

# Storage permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# .env permissions
chmod 644 .env

# All directories 755
find . -type d -exec chmod 755 {} \;

# All files 644
find . -type f -exec chmod 644 {} \;
```

### **Ya File Manager se:**
```
1. File Manager open karo
2. patnafinderapi folder me jaao
3. Right click on "storage" → Change Permissions
   - Set to: 775
   - Check: "Recurse into subdirectories"
4. Right click on "bootstrap/cache" → Change Permissions
   - Set to: 775
   - Check: "Recurse into subdirectories"
```

---

## ⚙️ Laravel Setup (After Permissions)

### **Step 1: Generate Application Key**
```bash
cd /home/username/public_html/patnafinderapi
php artisan key:generate
```

### **Step 2: Create Symbolic Link for Storage**
```bash
php artisan storage:link
```

### **Step 3: Run Migrations**
```bash
php artisan migrate --force
```

### **Step 4: Seed Database (Optional)**
```bash
php artisan db:seed --force
```

### **Step 5: Clear & Cache Config**
```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan config:cache
php artisan route:cache
```

---

## 🧪 Testing

### **Test 1: Check if Laravel is working**
```
URL: https://patnafinderapi.codevixa.com
Expected: JSON response or Laravel page (not 403)
```

### **Test 2: Check API Endpoint**
```
URL: https://patnafinderapi.codevixa.com/api/v1/categories
Expected: JSON array with categories
```

### **Test 3: Check Storage Access**
```
URL: https://patnafinderapi.codevixa.com/storage
Expected: Directory listing or 404 (not 403)
```

---

## 🚨 Still Getting 403? Check These:

### **1. Check .htaccess exists in public folder**
```bash
ls -la /home/username/public_html/patnafinderapi/public/.htaccess
```
If missing, check next section.

### **2. Check Apache mod_rewrite is enabled**
Hostinger me by default enabled hota hai, but agar nahi hai to support se contact karo.

### **3. Check .env file permissions**
```bash
chmod 644 .env
```

### **4. Check if files are owned by correct user**
```bash
# SSH se run karo
cd /home/username/public_html/patnafinderapi
chown -R $USER:$USER .
```

### **5. Check PHP version**
```
cPanel → Select PHP Version
Minimum required: PHP 8.1
Recommended: PHP 8.2
```

---

## 📝 .htaccess for public folder (If Missing)

If `public/.htaccess` file missing hai, to create karo:

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

## 📊 Quick Checklist

- [ ] Document Root changed to `/public_html/patnafinderapi/public`
- [ ] Wait 2-3 minutes
- [ ] storage folder permission: 775
- [ ] bootstrap/cache permission: 775
- [ ] .env permission: 644
- [ ] php artisan key:generate
- [ ] php artisan storage:link
- [ ] php artisan migrate --force
- [ ] php artisan config:cache
- [ ] Test: https://patnafinderapi.codevixa.com/api/v1/categories

---

## 🎯 Summary

**Main Issue:** Document Root should point to `public` folder, not root folder.

**Fix:**
```
Change subdomain document root from:
/home/username/public_html/patnafinderapi

To:
/home/username/public_html/patnafinderapi/public
```

**After fix:**
1. Set permissions
2. Run artisan commands
3. Test API endpoints

---

## 💡 Alternative: If Can't Change Document Root

Agar Document Root change nahi kar sakte, to public folder ke contents ko root me move karna padega:

```bash
# DON'T DO THIS IF YOU CAN CHANGE DOCUMENT ROOT
# Only use if subdomain settings locked hai

cd /home/username/public_html/patnafinderapi
mv public/.htaccess .
mv public/index.php .
mv public/* .
rmdir public

# Then edit index.php:
# Change: require __DIR__.'/../vendor/autoload.php';
# To:     require __DIR__.'/vendor/autoload.php';

# Change: $app = require_once __DIR__.'/../bootstrap/app.php';
# To:     $app = require_once __DIR__.'/bootstrap/app.php';
```

**But this is NOT recommended!** Better to fix Document Root.

---

**Good luck! 🚀**
