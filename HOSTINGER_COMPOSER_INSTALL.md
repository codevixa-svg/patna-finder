# 🔧 Install Composer Dependencies on Hostinger

## 🚨 Problem
`vendor` folder missing hai server pe, isliye Laravel nahi chal raha.

## ✅ Solution: Run Composer Install

---

## **Method 1: Via SSH (Recommended - Fast)**

### **Step 1: Enable SSH Access**
```
1. Hostinger hPanel login karo
2. Advanced → SSH Access
3. Enable SSH
4. Copy SSH details (Host, Port, Username, Password)
```

### **Step 2: Connect via SSH**

**Windows (PowerShell):**
```powershell
ssh u777317772@ssh.codevixa.com
# Password enter karo when prompted
```

**Or use PuTTY:**
- Host: ssh.codevixa.com
- Port: 22 (usually)
- Username: u777317772
- Password: your-hosting-password

### **Step 3: Navigate to Laravel Directory**
```bash
cd domains/codevixa.com/public_html/patnafinderapi
ls -la
```

### **Step 4: Install Composer Dependencies**
```bash
composer install --optimize-autoloader --no-dev
```

**Note:** This will take 2-5 minutes. Wait for completion.

### **Step 5: Set Permissions**
```bash
chmod -R 775 storage
chmod -R 775 bootstrap/cache
chmod 644 .env
```

### **Step 6: Generate Key & Migrate**
```bash
php artisan key:generate
php artisan storage:link
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

### **Step 7: Test**
```
https://patnafinderapi.codevixa.com/api/v1/categories
```

---

## **Method 2: Upload Vendor Folder (Slow - Not Recommended)**

Agar SSH access nahi hai, to vendor folder upload karna padega.

### **Step 1: Generate Vendor Locally**
```powershell
cd d:\patna-finder\backend\laravel
composer install --optimize-autoloader --no-dev
```

### **Step 2: Create Vendor ZIP**
```powershell
cd vendor
Compress-Archive -Path * -DestinationPath ..\..\patna-finder-vendor.zip
```

**Warning:** Vendor ZIP will be **HUGE** (100-200 MB)!

### **Step 3: Upload & Extract**
```
1. Upload patna-finder-vendor.zip to: /public_html/patnafinderapi/
2. Extract to: /public_html/patnafinderapi/vendor/
3. Delete ZIP
```

### **Step 4: Set Permissions**
```bash
chmod -R 755 vendor
```

---

## **Method 3: Use Hostinger's Composer (If Available)**

Some Hostinger plans have Composer in cPanel.

### **Check if Composer Available:**
```
cPanel → Terminal (if available)
OR
cPanel → Software → PHP Composer
```

If Terminal available:
```bash
cd ~/domains/codevixa.com/public_html/patnafinderapi
composer install --optimize-autoloader --no-dev
```

---

## 🎯 **Recommended: Method 1 (SSH)**

SSH is **fastest and safest** method.

### **Quick SSH Commands (Copy-Paste):**
```bash
# 1. Navigate
cd ~/domains/codevixa.com/public_html/patnafinderapi

# 2. Install dependencies
composer install --optimize-autoloader --no-dev

# 3. Set permissions
chmod -R 775 storage bootstrap/cache
chmod 644 .env

# 4. Setup Laravel
php artisan key:generate
php artisan storage:link
php artisan config:clear
php artisan cache:clear
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache

# 5. Verify
php artisan --version
```

---

## 📋 **After Installation Checklist**

- [ ] `vendor` folder exists
- [ ] `vendor/autoload.php` exists
- [ ] APP_KEY generated
- [ ] storage permissions: 775
- [ ] bootstrap/cache permissions: 775
- [ ] migrations run successfully
- [ ] Test: https://patnafinderapi.codevixa.com/debug.php
- [ ] Test: https://patnafinderapi.codevixa.com/api/v1/categories

---

## 🚨 **Common Errors During Composer Install**

### **Error: "composer: command not found"**
```bash
# Use full path
/usr/local/bin/composer install --optimize-autoloader --no-dev

# Or
php /usr/local/bin/composer.phar install --optimize-autoloader --no-dev
```

### **Error: "Your requirements could not be resolved"**
```bash
# Update composer first
composer self-update

# Then install
composer install --optimize-autoloader --no-dev
```

### **Error: "Memory limit exceeded"**
```bash
# Increase memory limit
php -d memory_limit=-1 /usr/local/bin/composer install --optimize-autoloader --no-dev
```

### **Error: "PHP version mismatch"**
```bash
# Check PHP version
php -v

# Should be 8.1+
# If not, contact Hostinger support to change PHP version
```

---

## 🔍 **Verify Installation**

### **Check vendor folder:**
```bash
ls -la vendor/
ls -la vendor/autoload.php
```

Should show vendor directory with autoload.php

### **Check Laravel:**
```bash
php artisan --version
```

Should show: Laravel Framework 10.x.x

### **Test debug.php:**
```
https://patnafinderapi.codevixa.com/debug.php
```

All tests should pass ✅

---

## 💡 **Why vendor was missing?**

`.gitignore` file me `vendor/` excluded hai:
```
/vendor
```

So GitHub pe vendor folder push nahi hua.

**That's correct!** vendor folder ko git me nahi rakhte.

**Proper workflow:**
1. Code upload karo (without vendor)
2. Server pe `composer install` run karo
3. Dependencies install ho jayengi

---

## 📞 **Next Steps**

1. **Enable SSH** in Hostinger hPanel
2. **Connect via SSH**
3. **Run:** `composer install --optimize-autoloader --no-dev`
4. **Run:** Setup commands (permissions, migrate, cache)
5. **Test:** API endpoints

**SSH access enable karo aur commands run karo! 🚀**
