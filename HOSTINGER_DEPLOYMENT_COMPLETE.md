# 🚀 Hostinger Deployment Guide - Patna Finder

## 🔴 **Current Problem**
403 Forbidden error aa raha hai kyunki:
- Document root galat configure hai
- Root `.htaccess` missing hai
- Sirf backend upload karne se frontend nahi chalega

---

## ✅ **Complete Solution**

### **Architecture:**
```
Hostinger Setup:
├── Backend API: https://patna-finder.codevixa.com/api/v1/
├── Frontend: Vercel/Netlify (recommended) ya Hostinger subdomain
```

---

## 📁 **Option 1: Backend on Hostinger + Frontend on Vercel (RECOMMENDED)**

### **Backend Setup (Hostinger)**

#### **1. File Upload Structure**
Upload files to Hostinger via FTP:
```
public_html/
├── .htaccess                    ← NEW FILE (redirect to Laravel public)
├── backend/
│   └── laravel/
│       ├── app/
│       ├── bootstrap/
│       ├── config/
│       ├── database/
│       ├── public/
│       │   ├── index.php
│       │   └── .htaccess
│       ├── routes/
│       ├── storage/            ← chmod 775
│       ├── bootstrap/cache/    ← chmod 775
│       ├── vendor/
│       ├── .env
│       └── artisan
```

#### **2. Create Root .htaccess File**
Create: `public_html/.htaccess`
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Redirect all requests to Laravel's public folder
    RewriteRule ^(.*)$ backend/laravel/public/$1 [L]
</IfModule>

# Disable directory browsing
Options -Indexes

# Prevent viewing of .htaccess file
<Files .htaccess>
    Order allow,deny
    Deny from all
</Files>
```

#### **3. Set File Permissions**
SSH mein ya File Manager se:
```bash
chmod 775 backend/laravel/storage -R
chmod 775 backend/laravel/bootstrap/cache -R
chmod 644 backend/laravel/.env
```

#### **4. Update .env File**
`backend/laravel/.env`:
```env
APP_NAME="Patna Finder"
APP_ENV=production
APP_KEY=base64:your-app-key-here
APP_DEBUG=false
APP_URL=https://patna-finder.codevixa.com

# Database (Hostinger MySQL)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

# Mail (Gmail SMTP)
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

# CORS (Allow Vercel frontend)
SANCTUM_STATEFUL_DOMAINS=patna-finder.vercel.app,localhost:3000
SESSION_DOMAIN=.codevixa.com
```

#### **5. Run Artisan Commands (via SSH)**
```bash
cd public_html/backend/laravel

# Install dependencies (if not uploaded)
composer install --optimize-autoloader --no-dev

# Generate app key (if not set)
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed database (if needed)
php artisan db:seed --force

# Clear & cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage symlink
php artisan storage:link
```

#### **6. Test Backend API**
```
✅ Health Check: https://patna-finder.codevixa.com/api/v1/categories
✅ Admin Login: https://patna-finder.codevixa.com/api/v1/admin/login
```

---

### **Frontend Setup (Vercel - FREE)**

#### **1. Create Account on Vercel**
- Go to: https://vercel.com
- Sign up with GitHub

#### **2. Import Project**
```bash
# Push frontend to GitHub (if not already)
git add .
git commit -m "frontend ready for deployment"
git push origin main
```

#### **3. Deploy on Vercel**
- Click "New Project"
- Import GitHub repo: `codevixa-svg/patna-finder`
- Root Directory: `frontend`
- Framework: Next.js (auto-detect)
- Build Command: `npm run build`
- Output Directory: `.next`

#### **4. Environment Variables (Vercel)**
Add in Vercel dashboard:
```env
NEXT_PUBLIC_API_URL=https://patna-finder.codevixa.com/api/v1
NODE_ENV=production
```

#### **5. Deploy**
- Click "Deploy"
- Wait 2-3 minutes
- Your site will be live: `https://patna-finder.vercel.app`

#### **6. Custom Domain (Optional)**
Vercel dashboard mein:
- Settings → Domains
- Add: `patnafinder.com`
- Follow DNS instructions

---

## 📁 **Option 2: Both Backend + Frontend on Hostinger**

### **File Structure**
```
public_html/
├── .htaccess          ← Route requests properly
├── api/               ← Backend (Laravel public folder contents)
│   ├── index.php
│   └── .htaccess
├── _next/             ← Next.js static export
├── index.html         ← Frontend entry
└── backend/           ← Laravel source (outside public_html)
    └── laravel/
        ├── app/
        ├── storage/
        └── ...
```

### **Build Frontend as Static**
```bash
cd frontend

# Update next.config.mjs
# Add: output: 'export'

# Build
npm run build

# Copy to Hostinger
# Upload 'out' folder contents to public_html/
```

### **Root .htaccess for Dual Setup**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # API requests go to Laravel
    RewriteRule ^api/(.*)$ api/index.php [L]
    
    # Frontend static files
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.html [L]
</IfModule>
```

⚠️ **Note:** Next.js ka full SSR nahi chalega Hostinger shared hosting pe. Sirf static export chalega.

---

## 🔍 **Debugging 403 Error**

### **Check 1: File Permissions**
```bash
# SSH se check karo
ls -la public_html/
ls -la public_html/backend/laravel/public/

# Correct permissions:
# Directories: 755
# Files: 644
# Storage: 775
```

### **Check 2: .htaccess exists?**
```bash
ls -la public_html/.htaccess
ls -la public_html/backend/laravel/public/.htaccess
```

### **Check 3: Apache mod_rewrite enabled?**
Contact Hostinger support agar enabled nahi hai.

### **Check 4: PHP Version**
Hostinger cPanel → PHP Version → Select 8.1 or 8.2

---

## 📊 **Recommended Setup Summary**

| Component | Platform | URL | Cost |
|-----------|----------|-----|------|
| Backend API | Hostinger | https://patna-finder.codevixa.com/api | Paid |
| Frontend | Vercel | https://patna-finder.vercel.app | FREE |
| Database | Hostinger MySQL | localhost | Included |
| Email | Gmail SMTP | - | FREE |
| Domain | Hostinger/Cloudflare | patnafinder.com | Paid |

---

## 🚀 **Quick Fix for Current 403 Error**

### **Immediate Steps:**

1. **Upload Root .htaccess**
   ```
   Location: public_html/.htaccess
   Content: (see above)
   ```

2. **Set Permissions**
   ```bash
   chmod 775 storage -R
   chmod 775 bootstrap/cache -R
   ```

3. **Check Laravel public folder**
   ```
   Ensure: backend/laravel/public/index.php exists
   ```

4. **Test URL**
   ```
   https://patna-finder.codevixa.com
   Should show Laravel welcome or API response
   ```

---

## 📝 **Next Steps**

### **Priority 1: Fix Backend (Current)**
- ✅ Upload root .htaccess
- ✅ Set correct permissions
- ✅ Configure .env
- ✅ Run migrations
- ✅ Test API endpoints

### **Priority 2: Deploy Frontend**
- ✅ Deploy to Vercel (recommended)
- ✅ Set API URL in env
- ✅ Test complete flow

### **Priority 3: Production Ready**
- ✅ Setup Gmail SMTP
- ✅ Configure CORS
- ✅ Enable caching
- ✅ Setup monitoring

---

## 🆘 **Need Help?**

**Hostinger Support:**
- cPanel → Support → Live Chat
- Ask: "How to deploy Laravel application?"

**Common Issues:**
1. 403 Forbidden → .htaccess & permissions
2. 500 Error → Check storage permissions & .env
3. Database error → Check DB credentials
4. CORS error → Update SANCTUM_STATEFUL_DOMAINS

---

## ✅ **Verification Checklist**

After deployment, test:
- [ ] Root URL loads (no 403)
- [ ] API health check works
- [ ] Admin login API works
- [ ] Database connected
- [ ] Email sending works
- [ ] Frontend loads
- [ ] Frontend → Backend API calls work
- [ ] OTP login works end-to-end

---

**Choose Option 1 (Vercel) for best performance & ease!** 🎯
