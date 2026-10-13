# 🔧 Backend .env Update Guide - Fix CORS Issue

## ❌ **Problem:**
Frontend dynamic data nahi dikha raha kyunki backend CORS allow nahi kar raha.

**Current backend .env:**
```
FRONTEND_URL=http://localhost:3000
```

**Should be:**
```
FRONTEND_URL=https://patnafinder.codevixa.com
```

---

## ✅ **Solution - Server Pe .env Update Karein:**

### **Step 1: SSH Login**
```bash
ssh -p 65002 u777317772@145.79.212.11
```

### **Step 2: Navigate to Backend**
```bash
cd domains/patnafinderapi.codevixa.com/public_html
```

*(Ya jaha backend deployed hai)*

### **Step 3: Edit .env File**
```bash
nano .env
```

### **Step 4: Update FRONTEND_URL**

Find:
```
FRONTEND_URL=http://localhost:3000
```

Change to:
```
FRONTEND_URL=https://patnafinder.codevixa.com
```

**Save:** `Ctrl + O`, `Enter`, `Ctrl + X`

### **Step 5: Clear Config Cache**
```bash
php artisan config:cache
php artisan cache:clear
```

---

## 🧪 **Test API:**

```bash
# Test API endpoint
curl https://patnafinderapi.codevixa.com/api/v1/categories
```

Should return JSON with categories.

---

## 🌐 **Test Frontend:**

1. Open: https://patnafinder.codevixa.com
2. Press F12 (Developer Console)
3. Go to **Console** tab
4. Check for errors:
   - ✅ Should see successful API calls
   - ❌ No CORS errors

---

## 📝 **Complete Backend .env Settings:**

```env
APP_NAME="Patna Finder API"
APP_ENV=production
APP_KEY=base64:your-app-key
APP_DEBUG=false
APP_URL=https://patnafinderapi.codevixa.com

# Frontend URL for CORS
FRONTEND_URL=https://patnafinder.codevixa.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Mail settings
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="${APP_NAME}"

# Session & Cache
SESSION_DRIVER=file
CACHE_DRIVER=file
QUEUE_CONNECTION=database
```

---

## 🔍 **Troubleshooting:**

### **Issue 1: Still CORS Error**
```bash
# Clear all caches
php artisan config:cache
php artisan route:cache
php artisan cache:clear
php artisan view:clear

# Restart web server (if you have access)
sudo systemctl restart apache2
# OR
sudo systemctl restart nginx
```

### **Issue 2: API Not Responding**
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Check web server logs
tail -f /var/log/apache2/error.log
# OR
tail -f /var/log/nginx/error.log
```

### **Issue 3: Permission Issues**
```bash
# Fix permissions
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

---

## ✅ **Quick Fix Summary:**

1. SSH: `ssh -p 65002 u777317772@145.79.212.11`
2. Go to backend: `cd domains/patnafinderapi.codevixa.com/public_html`
3. Edit: `nano .env`
4. Change: `FRONTEND_URL=https://patnafinder.codevixa.com`
5. Save: `Ctrl+O`, `Enter`, `Ctrl+X`
6. Cache: `php artisan config:cache`
7. Test: Open https://patna-finder.codevixa.com

---

**After updating, frontend will show dynamic data!** 🎉
