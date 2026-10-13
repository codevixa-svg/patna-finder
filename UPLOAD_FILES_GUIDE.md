# 📦 Upload Files Guide - Hostinger Deployment

## ✅ Problem Solved!

**Original `.next` folder:** 800 MB (❌ Too large!)  
**Production-only `.next-prod` folder:** 28 MB (✅ Perfect!)

---

## 🎯 Upload These Files ONLY

### **Location:** `d:\patna-finder\frontend\`

### **Upload List:**

```
1. .next-prod\          ← 28 MB (rename to .next on server)
2. public\              ← 5-10 MB
3. package.json         ← 2 KB
4. package-lock.json    ← 500 KB
5. next.config.ts       ← 1 KB
6. .env.production      ← 1 KB
```

**Total Size: ~35-40 MB** (Fast upload! 5-10 minutes)

---

## 📋 Step-by-Step Upload

### **Step 1: Open FileZilla**

Connect to Hostinger:
```
Host: your-server-ip
Username: your-username
Password: your-password
Port: 22
```

### **Step 2: Navigate on Server**

Remote path: `/home/username/patna-finder.codevixa.com/`

### **Step 3: Upload Files**

**From Local (`d:\patna-finder\frontend\`):**

1. **Upload `.next-prod` folder**
   - Drag `.next-prod` to server
   - Wait for upload to complete
   
2. **Rename on Server:**
   - Right-click `.next-prod` on server
   - Rename to `.next`

3. **Upload `public` folder**
   - Drag `public` to server

4. **Upload config files:**
   - `package.json`
   - `package-lock.json`
   - `next.config.ts`
   - `.env.production`

---

## ✅ After Upload - File Structure on Server

```
/home/username/patna-finder.codevixa.com/
│
├── .next/              ← (renamed from .next-prod)
│   ├── server/
│   ├── static/
│   ├── BUILD_ID
│   └── *.json files
│
├── public/
│   └── ... (images, etc.)
│
├── package.json
├── package-lock.json
├── next.config.ts
└── .env.production
```

---

## 🔧 After Upload - Install Dependencies

SSH into server:

```bash
ssh username@your-server-ip
cd /home/username/patna-finder.codevixa.com/

# Install dependencies
npm install --production

# Should take 5-10 minutes
```

---

## 🚀 Start Application

### **Method 1: Hostinger Panel (Recommended)**

1. Go to **Advanced → Node.js**
2. Click **Create Application**
3. Configure:
   - Application root: `/home/username/patna-finder.codevixa.com`
   - URL: `https://patna-finder.codevixa.com`
   - Startup file: `node_modules/next/dist/bin/next`
   - Startup command: `start -p 3000`
   - Node.js version: 18.x or 20.x
4. Click **Create**
5. Click **Start**

### **Method 2: PM2 (Alternative)**

```bash
npm install -g pm2
pm2 start npm --name "patna-finder" -- start
pm2 save
pm2 startup
```

---

## ✅ Test Deployment

Visit these URLs:

```
✓ https://patna-finder.codevixa.com
✓ https://patna-finder.codevixa.com/businesses
✓ https://patna-finder.codevixa.com/dashboard/login
```

Check browser console (F12):
- No errors ✓
- API calls working ✓
- Images loading ✓

---

## ⏱️ Time Estimates

```
FileZilla Connection:      1 minute
Upload .next-prod (28MB):  5-8 minutes
Upload public (10MB):      2-3 minutes
Upload config files:       1 minute
SSH + npm install:         5-10 minutes
Configure & Start:         3-5 minutes
────────────────────────────────────────
Total:                     17-28 minutes
```

Much faster than 800 MB upload! 🚀

---

## 🎯 What's in `.next-prod` folder?

Only production-essential files:

```
✓ server/         - Server-side rendering files (23 MB)
✓ static/         - Static assets & JS bundles (5 MB)
✓ BUILD_ID        - Build identifier
✓ *.json files    - Manifests & configs
✓ *.js files      - Server entry points

✗ dev/            - NOT included (development only)
✗ cache/          - NOT included (cache files)
✗ trace/          - NOT included (debug files)
```

---

## 🐛 Troubleshooting

### **If `.next-prod` folder missing:**

```powershell
cd d:\patna-finder\frontend

# Create clean production folder
New-Item -ItemType Directory -Path .next-prod -Force

# Copy production files
Copy-Item .next\server .next-prod\server -Recurse
Copy-Item .next\static .next-prod\static -Recurse
Copy-Item .next\BUILD_ID .next-prod\
Copy-Item .next\*.json .next-prod\
```

### **If upload fails:**

- Check internet connection
- Try uploading folders separately
- Use Hostinger File Manager as backup
- Compress as ZIP and upload

### **If app won't start:**

```bash
# Check logs
pm2 logs patna-finder

# Or check Hostinger Node.js logs panel

# Verify .env.production
cat .env.production

# Should show:
# NEXT_PUBLIC_API_URL=https://patnafinderapi.codevixa.com/api/v1
```

---

## 📞 Quick Reference

**Upload from:** `d:\patna-finder\frontend\`  
**Upload to:** `/home/username/patna-finder.codevixa.com/`

**Key files:**
1. `.next-prod` → rename to `.next` on server
2. `public`
3. `package.json`
4. `package-lock.json`
5. `next.config.ts`
6. `.env.production`

**After upload:**
```bash
npm install --production
pm2 start npm --name "patna-finder" -- start
```

**Test:** https://patna-finder.codevixa.com

---

**Ready! Upload size reduced from 800 MB to 35 MB! 🎉**
