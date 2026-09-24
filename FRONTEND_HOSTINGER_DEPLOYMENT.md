# 🎨 Frontend Deployment Guide - Hostinger

## ✅ Frontend Configuration - Already Done

### **Files Ready:**
```
✓ next.config.ts        - Static export configured
✓ .env.production       - Production environment variables
✓ frontend-htaccess.txt - Apache rewrite rules ready
```

### **Configuration Summary:**
```typescript
// next.config.ts
output: 'export'  ✓
images: { unoptimized: true }  ✓
API URL: https://patnafinderapi.codevixa.com  ✓
```

---

## 🚀 Deployment Steps

### **Step 1: Build Frontend (Local)**

```powershell
# Open PowerShell in project root
cd d:\patna-finder\frontend

# Clean previous builds
Remove-Item -Path "out" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue

# Build for production
npm run build
```

**Wait Time:** 3-5 minutes (depending on your system)

**Expected Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization

Route (app)                              Size
┌ ○ /                                    X kB
├ ○ /about                               X kB
├ ○ /businesses                          X kB
├ ○ /categories                          X kB
└ ○ /events                              X kB

○  (Static)  prerendered as static content

Export successful. Files written to d:\patna-finder\frontend\out
```

### **Step 2: Verify Build Output**

```powershell
cd d:\patna-finder\frontend
Get-ChildItem -Path "out" -Recurse | Measure-Object | Select-Object Count
```

**Should show:** Many files (HTML, CSS, JS, images)

**Important folders in `out/`:**
```
out/
├── _next/           - Next.js assets (JS, CSS, fonts)
├── images/          - Public images
├── index.html       - Homepage
├── about.html       - About page
├── businesses.html  - Businesses listing
├── categories.html  - Categories page
├── events.html      - Events page
└── ... (other pages)
```

---

## 📤 Step 3: Upload to Hostinger

### **Method 1: Direct Upload (Recommended for Large Sites)**

**A. Create Subdomain (if not already created):**
```
1. Hostinger hPanel
2. Domains → Subdomains
3. Create subdomain: patna-finder
4. Document Root: /public_html/patna-finder
5. Save
```

**B. Upload Files:**
```
1. Open Hostinger File Manager
2. Navigate to: /public_html/patna-finder/
3. Delete any existing files (if fresh install)
4. Upload entire "out" folder contents:
   - Select all files inside d:\patna-finder\frontend\out\
   - Upload to /public_html/patna-finder/
   - Wait for upload (5-10 minutes depending on size)
```

**Alternative - FileZilla (Faster for large files):**
```
1. Install FileZilla Client
2. Connect:
   - Host: ftp.codevixa.com (check hPanel for exact)
   - Username: u777317772
   - Password: your-ftp-password
   - Port: 21
3. Navigate remote: /public_html/patna-finder/
4. Upload: All files from d:\patna-finder\frontend\out\
```

---

### **Method 2: ZIP Upload (Alternative)**

**Create ZIP:**
```powershell
cd d:\patna-finder\frontend\out
Compress-Archive -Path * -DestinationPath ..\..\patna-finder-frontend.zip -Force
```

**Upload & Extract:**
```
1. Upload ZIP to: /public_html/patna-finder/
2. Right click → Extract
3. Extract to: /public_html/patna-finder/
4. Delete ZIP after extraction
```

---

## 🔧 Step 4: Create .htaccess File

**Location:** `/public_html/patna-finder/.htaccess`

**Method 1 - File Manager:**
```
1. Navigate to: /public_html/patna-finder/
2. Click "+ File" button
3. Name: .htaccess
4. Right click → Edit
5. Paste content from: d:\patna-finder\frontend-htaccess.txt
6. Save
```

**Method 2 - Upload:**
```
1. Rename: frontend-htaccess.txt → .htaccess
2. Upload to: /public_html/patna-finder/
```

**Important .htaccess Rules:**
```apache
✓ HTTPS redirect
✓ Next.js route handling
✓ Static asset caching
✓ Security headers
✓ Compression enabled
```

---

## ✅ Step 5: Verify Deployment

### **Subdomain Settings:**
```
Domain: patna-finder.codevixa.com
Document Root: /public_html/patna-finder
                               ^^^^^^^^^^^^^^^
                               (NOT /public_html/patna-finder/out)
```

### **File Structure on Server:**
```
/public_html/patna-finder/
├── .htaccess              ← MUST exist
├── _next/                 ← Next.js assets
│   ├── static/
│   └── ...
├── images/                ← Public images
├── index.html             ← Homepage
├── about.html
├── businesses.html
├── categories.html
├── events.html
├── 404.html
└── ... (other pages)
```

---

## 🧪 Step 6: Test Deployment

### **Test 1: Homepage**
```
https://patna-finder.codevixa.com
Expected: Patna Finder homepage loads
```

### **Test 2: Static Pages**
```
✓ https://patna-finder.codevixa.com/about
✓ https://patna-finder.codevixa.com/businesses
✓ https://patna-finder.codevixa.com/categories
✓ https://patna-finder.codevixa.com/events
```

### **Test 3: API Connection**
```
Open browser console (F12)
Check Network tab for API calls to:
https://patnafinderapi.codevixa.com/api/v1/...

Should NOT show CORS errors
```

### **Test 4: Images Loading**
```
Check if images load from:
- Local: /_next/static/media/...
- Backend: https://patnafinderapi.codevixa.com/storage/...
```

### **Test 5: Routes Work**
```
Click navigation links
Routes should work without 404 errors
Clean URLs (no .html in browser address bar)
```

---

## 🚨 Common Issues & Fixes

### **Issue 1: 404 on Routes**
**Problem:** /businesses works but /businesses/123 shows 404
**Fix:**
- Check .htaccess exists
- Verify RewriteEngine On
- Check document root is correct

### **Issue 2: Images Not Loading**
**Problem:** Homepage loads but images broken
**Fix:**
- Check images/ folder uploaded
- Verify _next/static/ folder exists
- Check image paths in HTML

### **Issue 3: CORS Error**
**Problem:** API calls blocked by CORS
**Fix:**
- Backend .env: SANCTUM_STATEFUL_DOMAINS=patna-finder.codevixa.com
- Backend: php artisan config:cache
- Check API URL in frontend

### **Issue 4: Blank Page**
**Problem:** URL loads but shows blank page
**Fix:**
- Check browser console (F12) for errors
- Verify all _next/ files uploaded
- Check .htaccess rewrite rules

### **Issue 5: CSS Not Loading**
**Problem:** Page loads but no styling
**Fix:**
- Verify _next/static/css/ folder exists
- Check .htaccess allows CSS files
- Clear browser cache

---

## 📋 Deployment Checklist

### **Pre-Deployment:**
- [ ] Backend API working: https://patnafinderapi.codevixa.com/api/v1/categories
- [ ] .env.production has correct API URL
- [ ] next.config.ts has output: 'export'
- [ ] npm run build completed successfully
- [ ] out/ folder generated with all files

### **Deployment:**
- [ ] Subdomain created: patna-finder.codevixa.com
- [ ] Document root: /public_html/patna-finder
- [ ] All files from out/ uploaded
- [ ] .htaccess created with correct rules
- [ ] SSL certificate active for subdomain

### **Post-Deployment:**
- [ ] Homepage loads: https://patna-finder.codevixa.com
- [ ] All pages accessible (about, businesses, etc.)
- [ ] Navigation works (no 404s)
- [ ] Images loading
- [ ] API calls working (check console)
- [ ] No CORS errors
- [ ] Mobile responsive
- [ ] SSL working (green padlock)

---

## 🔄 Future Updates

### **To Update Frontend:**
```powershell
# 1. Make changes to code
# 2. Build again
cd d:\patna-finder\frontend
npm run build

# 3. Upload new out/ folder
# Replace files in /public_html/patna-finder/

# 4. Clear browser cache
# Or version assets in next.config.ts
```

---

## 📊 File Size Expectations

**After Build:**
```
out/ folder: ~50-150 MB (depending on images/assets)
_next/static/: ~10-50 MB (JS, CSS, fonts)
Images: Variable (your uploaded images)
HTML files: ~1-5 MB total
```

**Upload Time:**
```
Direct upload: 10-30 minutes
FTP (FileZilla): 5-15 minutes
ZIP method: 5-10 minutes
```

---

## 💡 Pro Tips

1. **Use FileZilla for faster uploads** (especially for many small files)
2. **Keep a local backup** of out/ folder
3. **Test on staging first** if possible
4. **Monitor browser console** for errors after deployment
5. **Clear CDN cache** if using Cloudflare
6. **Enable gzip compression** in .htaccess (already included)
7. **Set proper cache headers** for static assets (already included)

---

## 📞 Support

**Hostinger Issues:**
- Live Chat in hPanel
- Email: support@hostinger.com

**Backend Not Working:**
- Check: HOSTINGER_500_ERROR_FIX.md
- Check: HOSTINGER_SSL_FIX.md

**Build Errors:**
- Check Next.js docs
- Verify all dependencies installed
- Check node version (should be 18+)

---

## ✅ Summary Commands

```powershell
# Complete deployment in one go:

# 1. Build
cd d:\patna-finder\frontend
npm run build

# 2. Create ZIP (optional)
cd out
Compress-Archive -Path * -DestinationPath ..\..\patna-finder-frontend.zip

# 3. Upload to Hostinger
# Use File Manager or FileZilla

# 4. Create .htaccess
# Copy from frontend-htaccess.txt

# 5. Test
# https://patna-finder.codevixa.com
```

---

**Ready to deploy! 🚀**

Build karke out/ folder upload kar do aur .htaccess create kar do. Done!
