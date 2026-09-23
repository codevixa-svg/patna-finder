# 🚀 Patna Finder - Complete Deployment Setup

## 📍 **Current Architecture**

```
Backend API (Hostinger Subdomain):
├── Location: public_html/patna-finder/
├── URL: https://patna-finder.codevixa.com
└── Purpose: Laravel REST API

Frontend (Vercel - Temporary):
├── URL: https://patna-finder.vercel.app
└── Future: https://patnafinder.com (after domain purchase)
```

---

## 🔧 **PART 1: Fix Backend (Hostinger Subdomain)**

### **Current Structure:**
```
public_html/
└── patna-finder/              ← Subdomain folder
    ├── .htaccess              ← Must exist
    ├── index.php              ← Laravel's public/index.php
    ├── .env                   ← Configuration
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── public/                ← ⚠️ Contents should be in root
    ├── routes/
    ├── storage/               ← chmod 775
    ├── vendor/
    └── artisan
```

### **Problem: 403 Forbidden Fix**

#### **Option A: Subdomain Already Points to patna-finder folder**
Agar subdomain directly `public_html/patna-finder/` pe point kar raha hai:

**1. Move public folder contents to root:**
```bash
# SSH se ya File Manager se
cd public_html/patna-finder/

# Public folder contents ko root mein move karo
mv public/index.php ./
mv public/.htaccess ./
mv public/* ./

# Optional: public folder delete karo (empty ho gaya)
rm -rf public/
```

**2. Update index.php paths:**
Edit: `public_html/patna-finder/index.php`
```php
<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Change these paths (remove one level up)
require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Kernel::class);
// ... rest of file
```

**3. Ensure .htaccess exists:**
`public_html/patna-finder/.htaccess`
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

#### **Option B: Subdomain Points to patna-finder/public/**
Agar Hostinger subdomain settings mein document root `public_html/patna-finder/public/` set hai:

**Nothing to change! Just ensure .htaccess exists in public folder.**

---

### **Set File Permissions:**
```bash
# Via SSH or File Manager
chmod 755 public_html/patna-finder
chmod 775 public_html/patna-finder/storage -R
chmod 775 public_html/patna-finder/bootstrap/cache -R
chmod 644 public_html/patna-finder/.env
```

---

### **Update .env File:**
`public_html/patna-finder/.env`
```env
APP_NAME="Patna Finder"
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://patna-finder.codevixa.com

# Database (Hostinger MySQL)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# Mail Configuration (Gmail)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-digit-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@patnafinder.com"
MAIL_FROM_NAME="Patna Finder"

# Session & Cache
SESSION_DRIVER=file
CACHE_DRIVER=file
QUEUE_CONNECTION=sync

# CORS Configuration (Allow Vercel frontend)
SANCTUM_STATEFUL_DOMAINS=patna-finder.vercel.app,localhost:3000
SESSION_DOMAIN=.codevixa.com

# Trusted Proxies (Hostinger/Cloudflare)
TRUSTED_PROXIES=*
```

---

### **Run Artisan Commands (SSH):**
```bash
cd public_html/patna-finder

# Generate app key if not set
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database with initial data
php artisan db:seed --force

# Cache configuration for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage symlink (if needed)
php artisan storage:link
```

---

### **Test Backend API:**
Open in browser or Postman:
```
✅ Health Check:
https://patna-finder.codevixa.com/api/v1/categories

✅ Should return JSON response
```

---

## 🚀 **PART 2: Deploy Frontend on Vercel**

### **Step 1: Prepare Frontend Code**

Update API URL in `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://patna-finder.codevixa.com/api/v1
NODE_ENV=production
```

### **Step 2: Create Vercel Account**
1. Go to: https://vercel.com
2. Sign up with GitHub account
3. Authorize Vercel to access your repos

### **Step 3: Import Project**

**A. Via Vercel Dashboard:**
1. Click "Add New" → "Project"
2. Import Git Repository → Select `codevixa-svg/patna-finder`
3. Configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

**B. Environment Variables:**
Add in Vercel:
```
NEXT_PUBLIC_API_URL=https://patna-finder.codevixa.com/api/v1
NODE_ENV=production
```

4. Click "Deploy"
5. Wait 2-3 minutes

### **Step 4: Get Vercel URL**
After deployment:
```
Your site is live at:
https://patna-finder.vercel.app
```

---

## 🔗 **PART 3: Connect Frontend to Backend**

### **Update Backend CORS:**
Backend `.env` already updated above with:
```env
SANCTUM_STATEFUL_DOMAINS=patna-finder.vercel.app,localhost:3000
```

### **Test Connection:**
1. Open: https://patna-finder.vercel.app
2. Try login: Should connect to backend API
3. Check browser console for any CORS errors

---

## 📋 **PART 4: Verification Checklist**

### **Backend Checks:**
```bash
# Test these URLs:

✅ API Health:
https://patna-finder.codevixa.com/api/v1/categories

✅ Admin Login API:
POST https://patna-finder.codevixa.com/api/v1/admin/login-with-otp
Body: {"email": "admin@patnafinder.com", "password": "admin123"}

✅ User Login API:
POST https://patna-finder.codevixa.com/api/v1/user/login-with-otp
Body: {"email": "test@test.com", "password": "password"}
```

### **Frontend Checks:**
```
✅ Homepage loads: https://patna-finder.vercel.app
✅ Categories page: https://patna-finder.vercel.app/categories
✅ Admin login: https://patna-finder.vercel.app/admin/login
✅ User login: https://patna-finder.vercel.app/dashboard/login
✅ API calls working (check Network tab)
```

---

## 🔧 **Common Issues & Fixes**

### **1. 403 Forbidden Error**
**Solution:**
- Check subdomain document root setting
- Ensure .htaccess exists
- Set correct file permissions (755 folders, 644 files)

### **2. 500 Internal Server Error**
**Solution:**
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Common fixes:
chmod 775 storage -R
chmod 775 bootstrap/cache -R
php artisan config:clear
php artisan cache:clear
```

### **3. Database Connection Error**
**Solution:**
- Verify DB credentials in .env
- Check if MySQL database exists in cPanel
- Test connection: `php artisan migrate --pretend`

### **4. CORS Error (Frontend → Backend)**
**Solution:**
Update backend `.env`:
```env
SANCTUM_STATEFUL_DOMAINS=patna-finder.vercel.app,localhost:3000
```
Then:
```bash
php artisan config:clear
php artisan config:cache
```

### **5. Vercel Deployment Failed**
**Solution:**
- Check build logs in Vercel dashboard
- Verify `next.config.mjs` is correct
- Ensure all dependencies in `package.json`
- Check Node.js version (18.x recommended)

---

## 🎯 **Future: Custom Domain Setup**

### **After Purchasing Domain (patnafinder.com):**

#### **Vercel Side:**
1. Vercel Dashboard → Project → Settings → Domains
2. Add Custom Domain: `patnafinder.com` and `www.patnafinder.com`
3. Get DNS records from Vercel

#### **DNS Configuration:**
Add these records at your domain provider:
```
Type    Name    Value                           TTL
A       @       76.76.21.21 (Vercel IP)        Auto
CNAME   www     cname.vercel-dns.com           Auto
```

#### **Backend API Subdomain:**
Keep backend as:
```
api.patnafinder.com → points to patna-finder.codevixa.com
```

Update frontend `.env`:
```env
NEXT_PUBLIC_API_URL=https://api.patnafinder.com/api/v1
```

---

## 📊 **Final Architecture**

### **Current (Development):**
```
Frontend: https://patna-finder.vercel.app
Backend:  https://patna-finder.codevixa.com/api/v1
Database: Hostinger MySQL
Email:    Gmail SMTP
```

### **Future (Production with Domain):**
```
Frontend: https://patnafinder.com (Vercel)
Backend:  https://api.patnafinder.com/api/v1 (Hostinger)
Database: Hostinger MySQL
Email:    Gmail SMTP / SendGrid
```

---

## ✅ **Quick Start Commands**

### **Backend (Hostinger SSH):**
```bash
cd public_html/patna-finder
php artisan migrate:fresh --seed --force
php artisan config:cache
php artisan route:cache
```

### **Frontend (Local Testing):**
```bash
cd frontend
npm run dev
# Test at: http://localhost:3000
```

### **Deploy Frontend:**
```bash
git add .
git commit -m "update"
git push origin main
# Vercel auto-deploys
```

---

## 🆘 **Need Help?**

### **Hostinger Issues:**
- cPanel → Support → Live Chat
- Check: storage/logs/laravel.log

### **Vercel Issues:**
- Dashboard → Deployments → View Logs
- Community: https://github.com/vercel/vercel/discussions

### **Database Issues:**
- cPanel → phpMyAdmin
- Check database exists and user has permissions

---

## 📝 **Status Tracking**

- [x] Backend code uploaded to Hostinger
- [ ] Fix 403 error (add .htaccess / set permissions)
- [ ] Configure .env file
- [ ] Run migrations & seeders
- [ ] Test backend API endpoints
- [ ] Deploy frontend to Vercel
- [ ] Test frontend → backend connection
- [ ] Configure Gmail SMTP
- [ ] Test OTP login flow
- [ ] Purchase domain (future)
- [ ] Configure custom domain (future)

---

**Start with fixing the 403 error first, then move to Vercel deployment!** 🚀
