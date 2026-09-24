# Hostinger Node.js Deployment Guide - Patna Finder

## ✅ Build Complete!
Build successfully created in `frontend/.next` folder

---

## 📋 Deployment Steps for Hostinger Node.js Server

### Step 1: Upload Frontend Files to Hostinger

Upload these folders/files to your subdomain directory (e.g., `/home/username/patna-finder.codevixa.com/`):

```
/home/username/patna-finder.codevixa.com/
├── .next/                  (entire folder - built output)
├── public/                 (entire folder - static assets)
├── node_modules/          (will install on server)
├── package.json
├── package-lock.json
├── next.config.ts
└── .env.production
```

**Important:** DO NOT upload `node_modules/` - it's too large. We'll install it on the server.

### Step 2: SSH into Hostinger

```bash
ssh username@your-server-ip
cd /home/username/patna-finder.codevixa.com/
```

### Step 3: Install Dependencies on Server

```bash
# Install Node.js dependencies
npm install --production

# Or if you want all dependencies
npm install
```

### Step 4: Create/Update .env.production File

```bash
nano .env.production
```

Add:
```env
NEXT_PUBLIC_API_URL=https://patnafinderapi.codevixa.com/api/v1
NEXT_PUBLIC_APP_NAME=Patna Finder
NEXT_PUBLIC_APP_URL=https://patna-finder.codevixa.com
```

### Step 5: Setup Node.js Application in Hostinger Panel

1. Go to Hostinger Control Panel
2. Navigate to **Advanced** → **Node.js**
3. Click **Create Application**
4. Configure:
   - **Node.js version:** 18.x or 20.x (recommended)
   - **Application mode:** Production
   - **Application root:** `/home/username/patna-finder.codevixa.com`
   - **Application URL:** `https://patna-finder.codevixa.com`
   - **Application startup file:** `node_modules/next/dist/bin/next`
   - **Application startup command:** `start -p 3000`
   - **Port:** 3000 (or as assigned by Hostinger)

5. Click **Create**

### Step 6: Start the Application

In Hostinger Node.js panel:
- Click **Start** button for your application
- Check logs to ensure it started successfully

### Step 7: Configure Domain/Subdomain

1. Go to **Domains** in Hostinger panel
2. Select your subdomain `patna-finder.codevixa.com`
3. Point it to the Node.js application:
   - **Document Root:** Should point to Node.js app
   - **SSL:** Enable SSL certificate (Let's Encrypt)

---

## 🔄 Alternative: Manual Node.js Start

If Hostinger's Node.js panel doesn't work, you can start manually via SSH:

```bash
# Install PM2 (process manager)
npm install -g pm2

# Start Next.js with PM2
pm2 start npm --name "patna-finder" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to restart on server reboot
pm2 startup
```

To stop/restart:
```bash
pm2 stop patna-finder
pm2 restart patna-finder
pm2 logs patna-finder
```

---

## 📦 Files to Upload (Summary)

### Essential Files/Folders:
- `.next/` - Built application (created by `npm run build`)
- `public/` - Static assets
- `package.json` - Dependencies list
- `package-lock.json` - Locked dependencies
- `next.config.ts` - Next.js configuration
- `.env.production` - Production environment variables

### Upload Methods:

**Option 1: FTP/SFTP (Recommended for large files)**
- Use FileZilla or similar FTP client
- Connect to your Hostinger SFTP
- Upload files to subdomain directory
- Fastest for `.next` folder

**Option 2: File Manager (Hostinger Panel)**
- Good for small files
- Can be slow for large folders

**Option 3: Git (Best Practice)**
```bash
# On server via SSH
cd /home/username/patna-finder.codevixa.com/
git clone https://github.com/your-repo/patna-finder.git .
cd frontend
npm install
npm run build
```

---

## 🔍 Verify Deployment

1. Visit `https://patna-finder.codevixa.com`
2. Check:
   - Homepage loads ✓
   - API calls work (check Network tab) ✓
   - Images load ✓
   - Login/Register works ✓
   - Dynamic routes work (business pages, areas, etc.) ✓
   - Forgot password feature works ✓

---

## 🐛 Troubleshooting

### Application Won't Start
```bash
# Check Node.js version
node --version

# Should be 18.x or higher

# Check npm version
npm --version

# Rebuild if needed
npm run build
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>
```

### Module Not Found Errors
```bash
# Reinstall all dependencies
rm -rf node_modules
npm install
```

### Environment Variables Not Working
```bash
# Make sure .env.production is in the root of frontend folder
ls -la .env.production

# Check if Next.js is reading it
cat .env.production
```

---

## 📝 Post-Deployment Checklist

- [ ] Frontend accessible at https://patna-finder.codevixa.com
- [ ] Backend API working at https://patnafinderapi.codevixa.com
- [ ] SSL certificates enabled on both
- [ ] Login/Register working
- [ ] OTP emails sending
- [ ] Forgot password working
- [ ] Business listings loading
- [ ] Images displaying correctly
- [ ] Admin panel accessible
- [ ] Search functionality working

---

## 🔄 Future Updates

To update the frontend:

```bash
# On local machine
cd d:\patna-finder\frontend
npm run build

# Upload new .next folder to server
# OR use Git

# On server
git pull origin main
cd frontend
npm install
npm run build
pm2 restart patna-finder
```

---

## 📞 Support

If you face issues:
1. Check application logs in Hostinger panel or via SSH: `pm2 logs patna-finder`
2. Verify environment variables are correct
3. Ensure Node.js version is 18.x or higher
4. Check if port 3000 is open and not blocked by firewall

---

**Ready to deploy! 🚀**
