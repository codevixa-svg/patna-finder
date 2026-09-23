# 🚀 Backend Deployment - Complete ZIP Upload Guide

## 📦 **What to Upload to Hostinger**

### **OPTION 1: Direct ZIP Upload (Recommended)**

#### **Files & Folders to Include in ZIP:**

```
patna-finder-backend.zip
├── app/                      ✅ Upload
├── bootstrap/                ✅ Upload
├── config/                   ✅ Upload
├── database/                 ✅ Upload
├── lang/                     ✅ Upload
├── public/                   ✅ Upload (Important!)
│   ├── index.php
│   ├── .htaccess
│   └── (other files)
├── resources/                ✅ Upload
├── routes/                   ✅ Upload
├── storage/                  ✅ Upload
│   ├── app/
│   ├── framework/
│   └── logs/
├── vendor/                   ✅ Upload (if exists locally)
├── .env.example              ✅ Upload (as template)
├── artisan                   ✅ Upload
├── composer.json             ✅ Upload
├── composer.lock             ✅ Upload
├── phpunit.xml               ✅ Upload (optional)
├── vite.config.js            ✅ Upload (optional)
└── package.json              ✅ Upload (optional)
```

#### **Files to EXCLUDE (Don't Upload):**
```
❌ .env                    (will create manually on server)
❌ .env.backup
❌ .env.production
❌ .git/                   (not needed)
❌ .gitignore              (not needed)
❌ node_modules/           (not needed for Laravel API)
❌ .idea/                  (IDE files)
❌ .vscode/                (IDE files)
❌ tests/                  (optional - can skip)
❌ *.md files              (documentation)
❌ .editorconfig
❌ .gitattributes
```

---

## 📋 **Step-by-Step Deployment Process**

### **STEP 1: Prepare ZIP File Locally**

#### **Method A: Using File Explorer (Windows)**
1. Open: `d:\patna-finder\backend\laravel\`
2. Select these folders & files:
   ```
   ✅ app
   ✅ bootstrap
   ✅ config
   ✅ database
   ✅ lang
   ✅ public
   ✅ resources
   ✅ routes
   ✅ storage
   ✅ vendor
   ✅ artisan
   ✅ composer.json
   ✅ composer.lock
   ✅ .env.example
   ```
3. Right-click → "Compress to ZIP file"
4. Name: `patna-finder-backend.zip`

#### **Method B: Using PowerShell**
```powershell
cd d:\patna-finder\backend\laravel

# Create deployment ZIP
Compress-Archive -Path app,bootstrap,config,database,lang,public,resources,routes,storage,vendor,artisan,composer.json,composer.lock,.env.example -DestinationPath ..\..\patna-finder-backend.zip -Force
```

---

### **STEP 2: Upload to Hostinger**

#### **A. Login to Hostinger cPanel**
1. Go to: https://hpanel.hostinger.com
2. Select your hosting account
3. Open "File Manager"

#### **B. Navigate to Subdomain Folder**
```
public_html/patna-finder/
```

#### **C. Upload ZIP File**
1. Click "Upload" button
2. Select `patna-finder-backend.zip`
3. Wait for upload to complete (may take 5-10 minutes)

#### **D. Extract ZIP File**
1. Right-click on `patna-finder-backend.zip`
2. Click "Extract"
3. Destination: `public_html/patna-finder/`
4. Click "Extract File(s)"
5. Wait for extraction
6. **Delete ZIP file** after extraction

---

### **STEP 3: File Structure After Upload**

Your Hostinger structure should look like:
```
public_html/
└── patna-finder/                    ← Subdomain root
    ├── app/
    ├── bootstrap/
    ├── config/
    ├── database/
    ├── lang/
    ├── public/                      ← Laravel public folder
    │   ├── index.php
    │   └── .htaccess
    ├── resources/
    ├── routes/
    ├── storage/
    ├── vendor/
    ├── artisan
    ├── composer.json
    ├── composer.lock
    └── .env.example
```

---

### **STEP 4: Configure Subdomain Document Root**

#### **Check Current Subdomain Setting:**
1. cPanel → Domains → Subdomains
2. Find: `patna-finder.codevixa.com`
3. Check "Document Root"

#### **Two Scenarios:**

**Scenario A: Document Root = `public_html/patna-finder`**
You need to point it to public folder:
1. Click "Manage" on subdomain
2. Change Document Root to: `public_html/patna-finder/public`
3. Save changes

**Scenario B: Document Root = `public_html/patna-finder/public`**
Perfect! Nothing to change.

---

### **STEP 5: Create .env File**

#### **A. Copy from Example:**
1. File Manager → `public_html/patna-finder/`
2. Find `.env.example`
3. Right-click → Copy
4. Paste in same folder
5. Rename to: `.env`

#### **B. Edit .env File:**
Right-click `.env` → Edit

Update these values:
```env
APP_NAME="Patna Finder"
APP_ENV=production
APP_KEY=                              ← Will generate later
APP_DEBUG=false
APP_URL=https://patna-finder.codevixa.com

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# Database - Get from cPanel → MySQL Databases
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name        ← Update this
DB_USERNAME=your_database_user        ← Update this
DB_PASSWORD=your_database_password    ← Update this

# Redis (optional - skip if not using)
BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com    ← Update this
MAIL_PASSWORD=your-app-password       ← Update this (16-digit)
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@patnafinder.com"
MAIL_FROM_NAME="${APP_NAME}"

# CORS & Session
SANCTUM_STATEFUL_DOMAINS=patna-finder.vercel.app,localhost:3000
SESSION_DOMAIN=.codevixa.com

# Trusted Proxies
TRUSTED_PROXIES=*
```

Save the file.

---

### **STEP 6: Set File Permissions**

Via File Manager or SSH:

#### **Using File Manager:**
1. Select `storage` folder
2. Right-click → Permissions
3. Set: `775` (or check all Read/Write/Execute boxes)
4. Check "Recurse into subdirectories"
5. Apply

Repeat for:
- `bootstrap/cache` → 775
- `.env` file → 644

#### **Using SSH (if available):**
```bash
cd public_html/patna-finder
chmod 775 storage -R
chmod 775 bootstrap/cache -R
chmod 644 .env
chmod 755 public
```

---

### **STEP 7: Run Composer Install (If vendor folder not uploaded)**

If you didn't upload `vendor` folder:

#### **Via SSH (Recommended):**
```bash
cd public_html/patna-finder
composer install --optimize-autoloader --no-dev
```

#### **No SSH? Upload vendor folder:**
Compress `vendor` folder locally and upload separately (may be large - 50-100MB).

---

### **STEP 8: Generate Application Key**

#### **Via SSH:**
```bash
cd public_html/patna-finder
php artisan key:generate
```

#### **No SSH? Manual Method:**
1. Use online tool: https://generate-random.org/laravel-key-generator
2. Copy generated key (starts with `base64:`)
3. Edit `.env` file
4. Paste in `APP_KEY=base64:...`

---

### **STEP 9: Create Storage Symlink**

#### **Via SSH:**
```bash
cd public_html/patna-finder
php artisan storage:link
```

#### **No SSH? Manual Method:**
1. File Manager → `public_html/patna-finder/public/`
2. Create symbolic link named `storage` pointing to `../storage/app/public`
3. Or upload images directly to `public/images/` instead

---

### **STEP 10: Run Database Migrations**

#### **Via SSH:**
```bash
cd public_html/patna-finder
php artisan migrate --force
php artisan db:seed --force
```

#### **Via PHPMyAdmin (Manual):**
1. cPanel → phpMyAdmin
2. Select your database
3. Import SQL file (if you have one)

---

### **STEP 11: Cache Configuration (Production)**

#### **Via SSH:**
```bash
cd public_html/patna-finder
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### **No SSH?**
Skip this step - Laravel will work without caching (just slower).

---

### **STEP 12: Test Your Backend API**

Open in browser:

```
✅ Test 1: Root URL
https://patna-finder.codevixa.com

Should show: Laravel welcome page or redirect

✅ Test 2: API Health Check
https://patna-finder.codevixa.com/api/v1/categories

Should return: JSON response with categories

✅ Test 3: Login API (Postman)
POST https://patna-finder.codevixa.com/api/v1/admin/login-with-otp
Body (JSON):
{
  "email": "admin@patnafinder.com",
  "password": "admin123"
}

Should return: OTP sent message
```

---

## 🔧 **Troubleshooting Common Issues**

### **1. 403 Forbidden Error**
**Cause:** Subdomain not pointing to `public` folder
**Fix:**
- cPanel → Subdomains → Change Document Root to `/public_html/patna-finder/public`

### **2. 500 Internal Server Error**
**Causes & Fixes:**

**A. Storage Permission Issue:**
```bash
chmod 775 storage -R
chmod 775 bootstrap/cache -R
```

**B. APP_KEY Not Set:**
```bash
php artisan key:generate
```

**C. Database Connection Error:**
- Check `.env` database credentials
- Verify database exists in cPanel → MySQL Databases

**D. Check Laravel Logs:**
```
File: storage/logs/laravel.log
Look for actual error message
```

### **3. 404 Not Found (Routes not working)**
**Cause:** .htaccess not working
**Fix:**
- Ensure `.htaccess` exists in `public/` folder
- Check Apache `mod_rewrite` is enabled (ask Hostinger support)

### **4. CORS Error (from Frontend)**
**Fix:** Update `.env`:
```env
SANCTUM_STATEFUL_DOMAINS=patna-finder.vercel.app,localhost:3000
SESSION_DOMAIN=.codevixa.com
```
Then:
```bash
php artisan config:clear
php artisan config:cache
```

### **5. Database Tables Not Created**
**Fix:** Run migrations via SSH:
```bash
php artisan migrate:fresh --seed --force
```

---

## 📦 **Quick ZIP Creation PowerShell Script**

Create file: `create-deployment-zip.ps1`
```powershell
# Navigate to Laravel folder
cd d:\patna-finder\backend\laravel

# Remove old ZIP if exists
Remove-Item ..\..\patna-finder-backend.zip -ErrorAction SilentlyContinue

# Create deployment ZIP
$files = @(
    "app",
    "bootstrap", 
    "config",
    "database",
    "lang",
    "public",
    "resources",
    "routes",
    "storage",
    "vendor",
    "artisan",
    "composer.json",
    "composer.lock",
    ".env.example"
)

Compress-Archive -Path $files -DestinationPath ..\..\patna-finder-backend.zip -Force

Write-Host "✅ Deployment ZIP created: patna-finder-backend.zip" -ForegroundColor Green
Write-Host "📦 Size: $((Get-Item ..\..\patna-finder-backend.zip).Length / 1MB) MB" -ForegroundColor Cyan
```

Run:
```powershell
.\create-deployment-zip.ps1
```

---

## ✅ **Final Checklist**

Before going live:

- [ ] ZIP file created with correct files
- [ ] Uploaded to `public_html/patna-finder/`
- [ ] Extracted successfully
- [ ] Subdomain document root = `/public_html/patna-finder/public`
- [ ] `.env` file created and configured
- [ ] Database credentials added to `.env`
- [ ] APP_KEY generated
- [ ] File permissions set (storage 775, .env 644)
- [ ] Migrations run successfully
- [ ] Database seeded with test data
- [ ] Storage symlink created
- [ ] Config cached (if SSH available)
- [ ] API endpoints tested and working
- [ ] CORS configured for frontend

---

## 🚀 **What Files to Upload Summary**

### **Essential (Must Upload):**
```
✅ app/
✅ bootstrap/
✅ config/
✅ database/
✅ public/
✅ resources/
✅ routes/
✅ storage/
✅ artisan
✅ composer.json
✅ .env.example
```

### **Optional (Can Upload Later):**
```
⚪ vendor/         (can run composer install instead)
⚪ lang/           (if using translations)
⚪ tests/          (not needed in production)
```

### **Never Upload:**
```
❌ .env           (security risk - create manually)
❌ .git/          (not needed)
❌ node_modules/  (not needed for API)
❌ .idea/         (IDE files)
❌ .vscode/       (IDE files)
```

---

**Total ZIP Size:** Approximately 30-100 MB (depending on vendor folder inclusion)

**Upload Time:** 5-15 minutes (depends on internet speed)

**Setup Time:** 15-30 minutes (after upload)

---

Ready to create the ZIP and upload? Let me know if you need help with any step! 🚀
