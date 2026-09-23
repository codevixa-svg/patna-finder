# ✅ Backend ZIP Created - Ready to Upload!

## 📦 **ZIP File Details**

```
✅ File Created: patna-finder-backend.zip
📁 Location: d:\patna-finder\patna-finder-backend.zip
📊 Size: 50.8 MB
📋 Total Files: 8,121 files
```

---

## 📤 **Upload Instructions for Hostinger**

### **Step 1: Login to Hostinger**
1. Go to: https://hpanel.hostinger.com
2. Login with your credentials
3. Select your hosting account
4. Click "File Manager"

---

### **Step 2: Navigate to Subdomain Folder**
```
File Manager → public_html → patna-finder/
```

---

### **Step 3: Upload ZIP File**
1. Click "Upload" button (top right)
2. Select file: `d:\patna-finder\patna-finder-backend.zip`
3. Wait for upload (may take 5-10 minutes for 50MB)
4. Check upload progress bar

---

### **Step 4: Extract ZIP File**
1. In File Manager, find `patna-finder-backend.zip`
2. Right-click on ZIP file
3. Select "Extract"
4. Extraction Path: `/public_html/patna-finder/`
5. Click "Extract Files"
6. Wait for extraction (1-2 minutes)

---

### **Step 5: Delete ZIP File (After Extraction)**
1. Right-click on `patna-finder-backend.zip`
2. Select "Delete"
3. Confirm deletion

---

### **Step 6: Verify File Structure**

After extraction, you should see:
```
public_html/patna-finder/
├── app/
├── bootstrap/
├── config/
├── database/
├── lang/
├── public/          ← Important!
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

### **Step 7: Configure Subdomain Document Root**

#### **Option A: Using Hostinger cPanel**
1. Go to: Domains → Subdomains
2. Find: `patna-finder.codevixa.com`
3. Click "Manage"
4. Set Document Root to: `/public_html/patna-finder/public`
5. Save changes

#### **Option B: Already Configured?**
Check if subdomain already points to correct folder. Test URL:
```
https://patna-finder.codevixa.com
```
If you see "Laravel" or blank page (not 403), it's correct!

---

### **Step 8: Create .env File**

1. Navigate to: `public_html/patna-finder/`
2. Find file: `.env.example`
3. Right-click → Copy
4. Paste in same folder
5. Right-click copied file → Rename to `.env`
6. Right-click `.env` → Edit

---

### **Step 9: Configure .env File**

Replace these values:

```env
APP_NAME="Patna Finder"
APP_ENV=production
APP_KEY=                                    ← Will generate later
APP_DEBUG=false
APP_URL=https://patna-finder.codevixa.com

LOG_CHANNEL=stack
LOG_LEVEL=error

# ===== DATABASE CONFIGURATION =====
# Get these from: cPanel → MySQL Databases
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name              ← UPDATE THIS
DB_USERNAME=your_database_user              ← UPDATE THIS
DB_PASSWORD=your_database_password          ← UPDATE THIS

# ===== MAIL CONFIGURATION =====
# Gmail SMTP Setup
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com          ← UPDATE THIS
MAIL_PASSWORD=your-16-digit-app-password    ← UPDATE THIS
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@patnafinder.com"
MAIL_FROM_NAME="${APP_NAME}"

# ===== SESSION & CACHE =====
SESSION_DRIVER=file
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_LIFETIME=120

# ===== CORS CONFIGURATION =====
# Allow Vercel frontend to access API
SANCTUM_STATEFUL_DOMAINS=patna-finder.vercel.app,localhost:3000
SESSION_DOMAIN=.codevixa.com

# ===== SECURITY =====
TRUSTED_PROXIES=*
```

**Important Fields to Update:**
- `DB_DATABASE` - Database name from cPanel
- `DB_USERNAME` - Database username from cPanel
- `DB_PASSWORD` - Database password from cPanel
- `MAIL_USERNAME` - Your Gmail address
- `MAIL_PASSWORD` - Gmail App Password (16 digits)

Save the file!

---

### **Step 10: Set File Permissions**

#### **Method A: Via File Manager**
1. Select `storage` folder
2. Right-click → Permissions
3. Set to: `775` (or check all boxes)
4. Check "Recurse into subdirectories"
5. Click "Change Permissions"

Repeat for:
- `bootstrap/cache` → 775

For `.env` file:
- Right-click → Permissions → Set to 644

#### **Method B: Via SSH (if available)**
```bash
cd public_html/patna-finder
chmod 775 storage -R
chmod 775 bootstrap/cache -R
chmod 644 .env
```

---

### **Step 11: Run Artisan Commands (SSH Required)**

If you have SSH access:

```bash
# Navigate to project
cd public_html/patna-finder

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate --force

# Seed database with initial data
php artisan db:seed --force

# Create storage symlink
php artisan storage:link

# Cache configuration (production optimization)
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**No SSH Access?**
1. Contact Hostinger support to run these commands
2. OR use online Laravel key generator for APP_KEY
3. Run migrations via phpMyAdmin (manual)

---

### **Step 12: Test Backend API**

Open these URLs in browser:

#### **Test 1: Root URL**
```
https://patna-finder.codevixa.com
```
Expected: Laravel welcome page or API response

#### **Test 2: API Health Check**
```
https://patna-finder.codevixa.com/api/v1/categories
```
Expected: JSON response with categories list

#### **Test 3: Admin Login API (Postman)**
```
Method: POST
URL: https://patna-finder.codevixa.com/api/v1/admin/login-with-otp
Headers:
  Content-Type: application/json
  Accept: application/json
Body (JSON):
{
  "email": "admin@patnafinder.com",
  "password": "admin123"
}
```
Expected: OTP sent message + challenge_token

---

## 🔧 **Troubleshooting**

### **403 Forbidden Error**
**Fix:** 
- Check subdomain document root points to `/public_html/patna-finder/public`
- Verify `.htaccess` exists in `public/` folder

### **500 Internal Server Error**
**Fixes:**
1. Check file permissions: `storage` and `bootstrap/cache` = 775
2. Generate APP_KEY: `php artisan key:generate`
3. Check `.env` database credentials
4. View error log: `storage/logs/laravel.log`

### **Database Connection Error**
**Fix:**
- Verify database exists in cPanel → MySQL Databases
- Check DB_* credentials in `.env`
- Ensure database user has all privileges

### **"No application encryption key"**
**Fix:**
```bash
php artisan key:generate
```
OR manually generate at: https://generate-random.org/laravel-key-generator

### **Routes Not Working (404)**
**Fix:**
- Check `.htaccess` in `public/` folder exists
- Verify Apache mod_rewrite is enabled

---

## ✅ **Verification Checklist**

Before going live:

- [ ] ZIP uploaded to Hostinger
- [ ] ZIP extracted successfully
- [ ] Subdomain points to `public/` folder
- [ ] `.env` file created from `.env.example`
- [ ] Database credentials configured in `.env`
- [ ] Gmail SMTP configured in `.env`
- [ ] File permissions set (storage 775, .env 644)
- [ ] APP_KEY generated
- [ ] Database migrations run
- [ ] Storage symlink created
- [ ] Root URL accessible (no 403)
- [ ] API endpoints working
- [ ] Admin can login via API

---

## 📋 **Quick Reference**

### **Hostinger URLs:**
```
🌐 Control Panel: https://hpanel.hostinger.com
📁 File Manager: cPanel → File Manager
🗄️ Database: cPanel → phpMyAdmin
🔐 Email: cPanel → Email Accounts
```

### **Project URLs:**
```
🔙 Backend API: https://patna-finder.codevixa.com
📡 API Base: https://patna-finder.codevixa.com/api/v1
🔐 Admin Login: POST /api/v1/admin/login-with-otp
👤 User Login: POST /api/v1/user/login-with-otp
```

### **Important Files:**
```
📄 .env - Configuration (must edit)
📄 public/.htaccess - URL rewriting
📁 storage/ - Logs, cache, uploads (775)
📁 bootstrap/cache/ - Framework cache (775)
```

---

## 🚀 **Next Steps After Backend Setup**

1. ✅ Backend deployed and tested
2. ⏭️ Deploy frontend to Vercel (follow DEPLOYMENT_SETUP_GUIDE.md)
3. ⏭️ Test frontend → backend connection
4. ⏭️ Configure Gmail SMTP (generate App Password)
5. ⏭️ Test OTP login flow end-to-end
6. ⏭️ Purchase domain (future)
7. ⏭️ Point domain to Vercel (future)

---

## 📞 **Support**

**Hostinger Issues:**
- cPanel → Support → Live Chat
- Email: support@hostinger.com

**Laravel Issues:**
- Check: `storage/logs/laravel.log`
- Documentation: https://laravel.com/docs

**Need Help?**
- Share error message from `storage/logs/laravel.log`
- Share URL where error occurs
- Share relevant section of `.env` (without passwords!)

---

**Good luck with deployment! 🎉**

Follow each step carefully and test after each major step.
