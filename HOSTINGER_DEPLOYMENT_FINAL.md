# 🚀 Hostinger Deployment - Final Guide

## 🎯 Your URLs
```
Frontend:    https://patna-finder.codevixa.com
Backend API: https://patnafinderapi.codevixa.com
```

---

## ✅ What's Ready

### **Backend:**
- ✅ Forgot password feature complete
- ✅ OTP-based email verification
- ✅ All routes configured
- ✅ Security features implemented
- ✅ Code committed to Git

### **Frontend:**
- ✅ Forgot password page created
- ✅ Login fixed (with password parameter)
- ✅ Dynamic routes fixed (force-dynamic)
- ✅ Static export configured
- ✅ Production environment ready

---

## 📦 Step 1: Build Frontend

```powershell
cd d:\patna-finder\frontend

# Clean previous builds
Remove-Item -Path "out" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# Build for production
npm run build
```

**Wait:** 3-5 minutes for build to complete

**Expected Output:**
```
✓ Compiled successfully
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Export successful. Files written to out/
```

---

## 📤 Step 2: Upload Frontend

### **Option A: Direct Upload (Recommended)**
```
1. Open: d:\patna-finder\frontend\out\
2. Select ALL files (Ctrl+A)
3. Hostinger File Manager → /public_html/patna-finder/
4. Upload all files
5. Wait 10-20 minutes
```

### **Option B: ZIP Upload (Faster)**
```powershell
cd d:\patna-finder\frontend\out
Compress-Archive -Path * -DestinationPath ..\..\patna-finder-frontend.zip -Force
```
Then upload ZIP to Hostinger and extract.

---

## 🔧 Step 3: Create .htaccess for Frontend

**Location:** `/public_html/patna-finder/.htaccess`

**Content:**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Redirect to HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Handle Next.js static routes
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} !^/_next/
    RewriteCond %{REQUEST_URI} !\.(jpg|jpeg|png|gif|svg|css|js|ico|woff|woff2|ttf|eot)$
    RewriteRule ^(.+)$ /$1.html [L,QSA]

    # Handle index
    RewriteRule ^$ /index.html [L]

    # Remove trailing slashes
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)/$ /$1 [L,R=301]
</IfModule>

<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

Options -Indexes
ErrorDocument 404 /404.html
```

---

## 🔄 Step 4: Update Backend (If Needed)

### **A. Upload New Backend Code**

If you need to update backend with forgot password feature:

```bash
# SSH to Hostinger
cd /home/u777317772/public_html/patnafinderapi

# Pull latest code from Git
git pull origin main

# Clear cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear

# Cache for production
php artisan config:cache
php artisan route:cache
```

### **B. Verify Backend Routes**
```bash
php artisan route:list | grep forgot

# Should show:
# POST user/forgot-password
# POST user/verify-reset-otp
# POST user/reset-password
# POST user/resend-reset-otp
```

---

## 🧪 Step 5: Test Deployment

### **Frontend Tests:**
```
✅ Homepage:
https://patna-finder.codevixa.com

✅ About Page:
https://patna-finder.codevixa.com/about

✅ Businesses:
https://patna-finder.codevixa.com/businesses

✅ Login:
https://patna-finder.codevixa.com/dashboard/login

✅ Forgot Password:
https://patna-finder.codevixa.com/dashboard/forgot-password
```

### **Backend API Tests:**
```
✅ Categories:
https://patnafinderapi.codevixa.com/api/v1/categories

✅ Areas:
https://patnafinderapi.codevixa.com/api/v1/areas

✅ Businesses:
https://patnafinderapi.codevixa.com/api/v1/businesses
```

### **Forgot Password Flow:**
```
1. Go to: https://patna-finder.codevixa.com/dashboard/forgot-password
2. Enter email
3. Check email for OTP (or check laravel.log if MAIL_MAILER=log)
4. Enter OTP
5. Set new password
6. Redirects to login
7. Login with new password
8. Success! ✅
```

---

## 🔐 Step 6: Configure Email (Important!)

### **Backend .env on Hostinger:**

```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="Patna Finder"
```

**Important:** Generate Gmail App Password:
1. Google Account → Security
2. 2-Step Verification → Enable
3. App Passwords → Generate
4. Copy 16-character password
5. Use in MAIL_PASSWORD

---

## 📋 Deployment Checklist

### **Pre-Deployment:**
- [x] Code committed to Git
- [x] Frontend configured for production
- [x] Backend routes added
- [x] All features tested locally

### **Frontend Deployment:**
- [ ] `npm run build` completed successfully
- [ ] `out/` folder generated (50-150 MB)
- [ ] All files uploaded to /public_html/patna-finder/
- [ ] .htaccess created
- [ ] Test: https://patna-finder.codevixa.com loads

### **Backend Deployment:**
- [ ] Latest code pulled from Git
- [ ] Composer dependencies installed
- [ ] .env configured (DB + Email)
- [ ] Routes cached
- [ ] Test: https://patnafinderapi.codevixa.com/api/v1/categories

### **Integration Tests:**
- [ ] Frontend can load categories from backend
- [ ] Login works (email + password + OTP)
- [ ] Forgot password works (email + OTP + reset)
- [ ] No CORS errors
- [ ] Images loading from backend

---

## 🚨 Common Issues & Fixes

### **Issue 1: Frontend Shows Blank Page**
```
Fix:
- Check browser console (F12)
- Verify _next/ folder uploaded
- Check .htaccess exists
```

### **Issue 2: API Calls Not Working**
```
Fix:
- Check CORS in backend config/cors.php
- Verify SANCTUM_STATEFUL_DOMAINS in .env
- Test API URL directly in browser
```

### **Issue 3: 404 on Routes**
```
Fix:
- Create .htaccess in /public_html/patna-finder/
- Verify RewriteEngine On
- Check document root
```

### **Issue 4: Email Not Sending**
```
Fix:
- Generate Gmail App Password
- Update MAIL_PASSWORD in .env
- Run: php artisan config:clear
- Run: php artisan config:cache
```

---

## ⏱️ Deployment Timeline

```
Frontend Build:     5 minutes
Frontend Upload:   15 minutes (direct) or 5 minutes (ZIP)
Backend Update:     5 minutes
Testing:           10 minutes
────────────────────────────────
Total:            35-40 minutes
```

---

## 🎯 Quick Commands

### **Frontend Build:**
```powershell
cd d:\patna-finder\frontend
npm run build
```

### **Frontend ZIP:**
```powershell
cd d:\patna-finder\frontend\out
Compress-Archive -Path * -DestinationPath ..\..\patna-finder-frontend.zip -Force
```

### **Backend Update (SSH):**
```bash
cd /home/u777317772/public_html/patnafinderapi
git pull origin main
php artisan config:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

---

## ✅ Success Criteria

### **Frontend:**
```
✅ https://patna-finder.codevixa.com loads
✅ All pages accessible
✅ Navigation works
✅ No 404 errors on routes
✅ Images loading
```

### **Backend:**
```
✅ https://patnafinderapi.codevixa.com/api/v1/categories returns JSON
✅ No 500 errors
✅ CORS working
✅ Email sending (OTP)
```

### **Features:**
```
✅ User can login
✅ User can reset password
✅ OTP verification works
✅ Dashboard accessible
✅ All features working
```

---

## 📞 Support

**If Stuck:**
- Check browser console (F12)
- Check backend logs: storage/logs/laravel.log
- Test API endpoints directly
- Contact Hostinger support for server issues

---

## 🎉 Ready to Deploy!

**Next Steps:**
1. Run `npm run build` in frontend folder
2. Upload `out/` folder to Hostinger
3. Create `.htaccess` file
4. Update backend via Git (if needed)
5. Test all URLs
6. Configure email settings

**Estimated Time:** 35-40 minutes

**Let's deploy! 🚀**
