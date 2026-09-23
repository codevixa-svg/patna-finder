# 🚀 Complete Hostinger Deployment - Backend + Frontend

## 📍 **Architecture**

```
Backend API (Subdomain 1):
├── URL: https://patnafinderapi.codevixa.com
├── Location: public_html/patnafinderapi/
└── Type: Laravel REST API

Frontend (Subdomain 2):
├── URL: https://patna-finder.codevixa.com
├── Location: public_html/patna-finder/
└── Type: Next.js Static Export
```

---

## 📦 **PART 1: Backend Deployment**

### **Step 1: Upload Backend ZIP**

#### **A. Create Subdomain (if not exists)**
```
cPanel → Domains → Subdomains
Subdomain: patnafinderapi
Domain: codevixa.com
Document Root: /public_html/patnafinderapi/public
```

#### **B. Upload ZIP**
```
1. File Manager → public_html/patnafinderapi/
2. Upload: patna-finder-backend.zip (68MB)
3. Wait for upload
4. Right-click → Extract
5. Extract to: /public_html/patnafinderapi/
6. Delete ZIP file
```

#### **C. Verify Structure**
```
public_html/patnafinderapi/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/          ← Subdomain points here
│   ├── index.php
│   └── .htaccess
├── routes/
├── storage/
├── vendor/
└── artisan
```

---

### **Step 2: Configure Backend .env**

Create `.env` file:
```
public_html/patnafinderapi/.env
```

Content:
```env
APP_NAME="Patna Finder"
APP_ENV=production
APP_KEY=                              # Generate later
APP_DEBUG=false
APP_URL=https://patnafinderapi.codevixa.com

LOG_CHANNEL=stack
LOG_LEVEL=error

# Database (from cPanel MySQL)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name        # UPDATE
DB_USERNAME=your_database_user        # UPDATE
DB_PASSWORD=your_database_password    # UPDATE

# Mail (Gmail SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com    # UPDATE
MAIL_PASSWORD=your-app-password       # UPDATE (16-digit)
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@patnafinder.com"
MAIL_FROM_NAME="${APP_NAME}"

# Session & Cache
SESSION_DRIVER=file
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_LIFETIME=120

# CORS (Allow Frontend Subdomain)
SANCTUM_STATEFUL_DOMAINS=patna-finder.codevixa.com,localhost:3000
SESSION_DOMAIN=.codevixa.com

# Security
TRUSTED_PROXIES=*
```

---

### **Step 3: Set Permissions**

Via File Manager or SSH:
```bash
chmod 775 storage -R
chmod 775 bootstrap/cache -R
chmod 644 .env
```

---

### **Step 4: Run Artisan Commands (SSH)**

```bash
cd public_html/patnafinderapi

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database
php artisan db:seed --force

# Create storage link
php artisan storage:link

# Cache for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**No SSH?** Contact Hostinger support to run these commands.

---

### **Step 5: Test Backend API**

```
✅ Test URLs:
https://patnafinderapi.codevixa.com
https://patnafinderapi.codevixa.com/api/v1/categories
https://patnafinderapi.codevixa.com/api/v1/areas
```

---

## 📦 **PART 2: Frontend Deployment**

### **Step 1: Build Frontend for Static Export**

On your local machine:

#### **A. Update Frontend Configuration**

Edit: `frontend/next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // ← Add this for static export
  images: {
    unoptimized: true,  // ← Required for static export
  },
  // ... rest of config
};

export default nextConfig;
```

#### **B. Update API URL**

Edit: `frontend/.env.production` (create if not exists)
```env
NEXT_PUBLIC_API_URL=https://patnafinderapi.codevixa.com/api/v1
NODE_ENV=production
```

#### **C. Build Static Export**

```powershell
cd d:\patna-finder\frontend

# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Output will be in: frontend/out/
```

This creates a **static HTML/CSS/JS** version in `frontend/out/` folder.

---

### **Step 2: Create Frontend ZIP**

```powershell
cd d:\patna-finder\frontend

# Create ZIP of out folder
Compress-Archive -Path out\* -DestinationPath ..\patna-finder-frontend.zip -Force
```

---

### **Step 3: Upload Frontend to Hostinger**

#### **A. Create Subdomain (if not exists)**
```
cPanel → Domains → Subdomains
Subdomain: patna-finder
Domain: codevixa.com
Document Root: /public_html/patna-finder/
```

#### **B. Upload ZIP**
```
1. File Manager → public_html/patna-finder/
2. Upload: patna-finder-frontend.zip
3. Wait for upload
4. Right-click → Extract
5. Extract to: /public_html/patna-finder/
6. Delete ZIP file
```

#### **C. Expected Structure**
```
public_html/patna-finder/
├── _next/              (Next.js assets)
├── images/             (static images)
├── 404.html
├── index.html
├── about.html
├── businesses.html
└── ... (all other HTML files)
```

---

### **Step 4: Create .htaccess for Frontend**

Create: `public_html/patna-finder/.htaccess`

```apache
# Frontend .htaccess for Next.js Static Export

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Redirect to HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Handle Next.js static routes
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.+)$ /$1.html [L,QSA]

    # Handle index
    RewriteRule ^$ /index.html [L]

    # Handle trailing slashes
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)/$ /$1 [L,R=301]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

---

### **Step 5: Test Frontend**

```
✅ Test URLs:
https://patna-finder.codevixa.com
https://patna-finder.codevixa.com/about
https://patna-finder.codevixa.com/businesses
https://patna-finder.codevixa.com/admin/login
https://patna-finder.codevixa.com/dashboard/login
```

---

## 🔗 **PART 3: Connect Frontend to Backend**

Backend `.env` already configured with CORS:
```env
SANCTUM_STATEFUL_DOMAINS=patna-finder.codevixa.com
```

Test connection:
1. Open: https://patna-finder.codevixa.com
2. Try login or browse categories
3. Check browser console for API calls
4. Should call: https://patnafinderapi.codevixa.com/api/v1/...

---

## ⚠️ **Important Notes for Next.js Static Export**

### **What Works:**
✅ Static pages (Home, About, Contact)
✅ Dynamic routes with getStaticPaths
✅ Client-side navigation
✅ API calls to backend
✅ Image optimization (with unoptimized: true)

### **What Doesn't Work:**
❌ Server-side rendering (SSR)
❌ API routes (/api/*)
❌ Incremental Static Regeneration (ISR)
❌ Image optimization (must use unoptimized)
❌ Middleware
❌ getServerSideProps

### **Workaround:**
All dynamic data should come from Backend API:
- Categories → GET /api/v1/categories
- Businesses → GET /api/v1/businesses
- Login → POST /api/v1/user/login-with-otp

---

## 📋 **Complete Deployment Checklist**

### **Backend:**
- [ ] Subdomain created: patnafinderapi.codevixa.com
- [ ] Document root: /public_html/patnafinderapi/public
- [ ] ZIP uploaded and extracted
- [ ] .env file configured
- [ ] Database credentials added
- [ ] APP_KEY generated
- [ ] Permissions set (storage 775)
- [ ] Migrations run
- [ ] API endpoints tested

### **Frontend:**
- [ ] next.config.mjs updated (output: 'export')
- [ ] .env.production created
- [ ] API URL updated to backend subdomain
- [ ] Build completed (npm run build)
- [ ] out/ folder created
- [ ] ZIP created from out folder
- [ ] Subdomain created: patna-finder.codevixa.com
- [ ] Document root: /public_html/patna-finder/
- [ ] Frontend ZIP uploaded
- [ ] Extracted properly
- [ ] .htaccess created
- [ ] Frontend loads correctly
- [ ] API calls working

### **Integration:**
- [ ] CORS configured in backend
- [ ] Frontend can call backend APIs
- [ ] Login flow works end-to-end
- [ ] OTP emails sending
- [ ] Images loading
- [ ] Navigation working

---

## 🔧 **Troubleshooting**

### **Backend Issues:**

**403 Forbidden:**
- Check document root = /public_html/patnafinderapi/public
- Verify .htaccess exists in public/

**500 Error:**
- Check storage permissions: chmod 775 storage -R
- Check .env file exists and APP_KEY is set
- View logs: storage/logs/laravel.log

**Database Error:**
- Verify DB credentials in .env
- Ensure database exists in cPanel

**CORS Error:**
- Update SANCTUM_STATEFUL_DOMAINS in .env
- Run: php artisan config:clear

### **Frontend Issues:**

**404 on Routes:**
- Check .htaccess exists
- Verify RewriteRule is correct

**Blank Page:**
- Check browser console for errors
- Verify API URL in build
- Check _next/ folder exists

**API Not Connecting:**
- Verify NEXT_PUBLIC_API_URL in build
- Check CORS in backend
- Test API URL directly in browser

**Images Not Loading:**
- Verify images/ folder uploaded
- Check image paths in HTML
- Ensure unoptimized: true in config

---

## 📊 **Final Architecture**

```
┌─────────────────────────────────────────┐
│   User Browser                          │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   Frontend (Hostinger)                  │
│   https://patna-finder.codevixa.com     │
│   - Static HTML/CSS/JS                  │
│   - Next.js Export                      │
│   Location: public_html/patna-finder/   │
└─────────────────────────────────────────┘
              │ API Calls
              ▼
┌─────────────────────────────────────────┐
│   Backend API (Hostinger)               │
│   https://patnafinderapi.codevixa.com   │
│   - Laravel REST API                    │
│   - MySQL Database                      │
│   Location: public_html/patnafinderapi/ │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│   MySQL Database (Hostinger)            │
│   - Categories, Businesses, Users, etc. │
└─────────────────────────────────────────┘
```

---

## 🚀 **Deployment Steps Summary**

### **Quick Steps:**

**Backend (30 mins):**
1. Create subdomain: patnafinderapi.codevixa.com
2. Upload & extract backend ZIP
3. Configure .env
4. Set permissions
5. Run migrations
6. Test API

**Frontend (20 mins):**
1. Update next.config.mjs
2. Update .env.production
3. Build: npm run build
4. Create ZIP from out/
5. Upload to patna-finder subdomain
6. Create .htaccess
7. Test site

**Total Time:** ~50 minutes

---

## 📞 **Support**

**Backend Issues:**
- Check: storage/logs/laravel.log
- SSH Commands: php artisan cache:clear

**Frontend Issues:**
- Check: Browser Console (F12)
- Verify: _next/ folder exists

**Hostinger Support:**
- Live Chat in cPanel
- Ask about: "Subdomain configuration" or "File permissions"

---

Ready to deploy! Follow step-by-step and test after each major step. 🎉
