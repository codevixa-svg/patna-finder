# ✅ Quick Deployment Checklist - Patna Finder

## 🎯 Deployment URLs
```
Backend API:  https://patnafinderapi.codevixa.com
Frontend Web: https://patna-finder.codevixa.com
```

---

## ✅ **BACKEND - COMPLETED!** 

### Status: DEPLOYED ✓
- [x] Laravel deployed at https://patnafinderapi.codevixa.com
- [x] Database configured and working
- [x] All APIs tested and functional
- [x] Forgot password feature working
- [x] OTP email system working
- [x] SSL certificate active

---

## 🎨 **FRONTEND - READY TO DEPLOY!**

### ✅ **Build Status: COMPLETED!**
```
✓ Build successful - 59 pages generated
✓ TypeScript compilation passed
✓ All dynamic routes configured
✓ Environment variables set
✓ .next folder ready for deployment
```

### 📦 **Files Ready for Upload:**
Location: `d:\patna-finder\frontend\`

**MUST UPLOAD:**
```
✓ .next/              (built application - 50MB+)
✓ public/             (static assets - images, etc.)
✓ package.json
✓ package-lock.json  
✓ next.config.ts
✓ .env.production
```

**DO NOT UPLOAD:**
```
✗ node_modules/       (install on server)
✗ app/                (source code - not needed)
✗ components/         (source code - not needed)
✗ lib/                (source code - not needed)
```

---

## 🚀 Deployment Steps (Hostinger Node.js)

### **Step 1: Upload Files via SFTP**
```
Upload to: /home/username/patna-finder.codevixa.com/
Method: FileZilla or Hostinger File Manager

Files to upload:
- .next/              ← IMPORTANT! The built app
- public/
- package.json
- package-lock.json
- next.config.ts
- .env.production
```

### **Step 2: SSH into Server**
```bash
ssh username@your-server-ip
cd /home/username/patna-finder.codevixa.com/
```

### **Step 3: Install Dependencies**
```bash
npm install --production
```

### **Step 4: Setup Node.js App (Hostinger Panel)**
Go to: **Advanced → Node.js → Create Application**

Configure:
- **Application root:** `/home/username/patna-finder.codevixa.com`
- **Application URL:** `https://patna-finder.codevixa.com`
- **Application startup file:** `node_modules/next/dist/bin/next`
- **Application startup command:** `start -p 3000`
- **Node.js version:** 18.x or 20.x
- **Environment:** Production

Click **Create** then **Start**

### **Step 5: Configure Domain & SSL**
1. Go to **Domains** in Hostinger panel
2. Select `patna-finder.codevixa.com`
3. Point to Node.js application
4. Enable SSL (Let's Encrypt)

---

## ✅ Alternative: PM2 Manual Start

If Hostinger Node.js panel doesn't work:

```bash
# Install PM2
npm install -g pm2

# Start application
cd /home/username/patna-finder.codevixa.com/
pm2 start npm --name "patna-finder" -- start

# Save configuration
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs patna-finder
```

**PM2 Commands:**
```bash
pm2 restart patna-finder   # Restart app
pm2 stop patna-finder      # Stop app
pm2 logs patna-finder      # View logs
pm2 monit                  # Monitor
```

---

## 🧪 Testing After Deployment

### **Frontend Tests:**
- [ ] https://patna-finder.codevixa.com (homepage loads)
- [ ] Login/Register works
- [ ] Forgot password works
- [ ] OTP emails arrive
- [ ] Business pages load (dynamic routes)
- [ ] Images display correctly
- [ ] API calls successful (check Network tab)
- [ ] No CORS errors

### **Integration Tests:**
- [ ] Frontend ↔ Backend communication working
- [ ] Categories loading from API
- [ ] Businesses listing working
- [ ] Events loading
- [ ] Search functionality works
- [ ] Image uploads working

---

## 📊 Current Status

```
✅ Backend:  DEPLOYED & WORKING
✅ Build:    COMPLETED
⏳ Upload:   PENDING
⏳ Config:   PENDING
⏳ Start:    PENDING
⏳ Test:     PENDING
```

---

## 🔧 Upload Methods

### **Method 1: SFTP (Recommended)**
1. Open FileZilla
2. Connect to Hostinger SFTP:
   - Host: your-server-ip
   - Username: your-username
   - Password: your-password
   - Port: 22
3. Navigate to `/home/username/patna-finder.codevixa.com/`
4. Upload: .next, public, package files, .env.production

### **Method 2: Git (Best for future updates)**
```bash
# On server
ssh username@server-ip
cd /home/username/
git clone https://github.com/your-repo/patna-finder.git patna-finder.codevixa.com
cd patna-finder.codevixa.com/frontend
npm install
npm run build
```

---

## 🐛 Troubleshooting

### **App Won't Start:**
```bash
# Check Node.js version
node --version  # Should be 18+ or 20+

# Rebuild
npm run build

# Check logs
pm2 logs patna-finder
```

### **Port Issues:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### **Module Not Found:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

---

## 📁 Important Documentation

Created files:
- ✅ `HOSTINGER_NODEJS_DEPLOYMENT.md` - Full detailed guide
- ✅ `QUICK_DEPLOYMENT_CHECKLIST.md` - This file
- ✅ `.env.production` - Environment variables configured

---

## ⏱️ Estimated Timeline

```
Upload Files:      15-20 minutes (depending on internet)
Install npm:        5-10 minutes
Configure App:       5 minutes
Start & Test:        5 minutes
────────────────────────────────────────────────────
Total:             30-40 minutes
```

---

## 🎯 Success Criteria

When deployment is successful, you should see:

```
✅ https://patna-finder.codevixa.com
   → Homepage loads with design
   
✅ https://patna-finder.codevixa.com/businesses
   → Business listings appear
   
✅ https://patna-finder.codevixa.com/dashboard/login
   → Login page works
   
✅ https://patna-finder.codevixa.com/dashboard/forgot-password
   → Forgot password flow works
   
✅ Browser Console (F12)
   → No CORS errors
   → API calls returning data
   → No 404 errors on assets
```

---

## 📞 Need Help?

### **If stuck at any step:**
1. Read `HOSTINGER_NODEJS_DEPLOYMENT.md` for detailed instructions
2. Check PM2 logs: `pm2 logs patna-finder`
3. Check Node.js logs in Hostinger panel
4. Verify .env.production has correct API URL
5. Contact Hostinger support for Node.js setup help

---

## 🔄 Future Updates

To update frontend after initial deployment:

```bash
# Local machine
cd d:\patna-finder\frontend
npm run build

# Upload new .next folder
# OR

# Server (if using Git)
ssh username@server-ip
cd /home/username/patna-finder.codevixa.com/
git pull origin main
cd frontend
npm install
npm run build
pm2 restart patna-finder
```

---

**STATUS: Ready to Deploy! 🚀**

**NEXT ACTION: Upload files to Hostinger via SFTP**

See: `HOSTINGER_NODEJS_DEPLOYMENT.md` for step-by-step guide
