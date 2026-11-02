# Khojya - Production Deployment Guide

## 🚀 Production URLs
- **Frontend**: https://patnafinder.codevixa.com
- **Backend API**: https://patnafinderapi.codevixa.com

---

## 📦 Prerequisites

### Server Requirements
- **PHP**: 8.1 or higher
- **Composer**: Latest version
- **Node.js**: 18.x or higher
- **MySQL**: 5.7 or higher
- **Web Server**: Apache/Nginx with SSL

### Required PHP Extensions
```bash
php -m | grep -E 'mbstring|xml|pdo|tokenizer|json|openssl|bcmath|fileinfo'
```

---

## 🔧 Backend Deployment (Laravel)

### Step 1: Upload Files
```bash
# Upload backend/laravel folder to server
# Path: /home/your-user/patna-finder-api/
```

### Step 2: Install Dependencies
```bash
cd /home/your-user/patna-finder-api
composer install --optimize-autoloader --no-dev
```

### Step 3: Environment Configuration
```bash
# Copy production env
cp .env.production .env

# Edit .env with production values
nano .env
```

**Required Changes in `.env`:**
```env
DB_DATABASE=patna_finder_production
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-digit-app-password
MAIL_FROM_ADDRESS=your-email@gmail.com
```

### Step 4: Application Setup
```bash
# Generate application key (if needed)
php artisan key:generate

# Run migrations
php artisan migrate --force

# Seed initial data (if needed)
php artisan db:seed --force

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set permissions
chmod -R 755 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### Step 5: Apache/Nginx Configuration

**Apache (.htaccess in public/)**
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

**Nginx**
```nginx
server {
    listen 80;
    server_name patnafinderapi.codevixa.com;
    root /home/your-user/patna-finder-api/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### Step 6: SSL Certificate (Let's Encrypt)
```bash
sudo certbot --nginx -d patnafinderapi.codevixa.com
```

---

## 🎨 Frontend Deployment (Next.js)

### Step 1: Build Production Version
```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Output will be in .next/ folder
```

### Step 2: Deployment Options

#### Option A: Node.js Server (Recommended)
```bash
# Upload entire frontend folder to server
# Path: /home/your-user/patnafinder/

cd /home/your-user/patnafinder
npm install --production

# Start with PM2
npm install -g pm2
pm2 start npm --name "khojya-frontend" -- start
pm2 save
pm2 startup
```

#### Option B: Static Export (if using)
```bash
# In package.json, add:
# "export": "next export"

npm run build
npm run export

# Upload out/ folder to web server
# Configure web server to serve static files
```

### Step 3: Nginx Configuration (Frontend)
```nginx
server {
    listen 80;
    server_name patnafinder.codevixa.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 4: SSL Certificate
```bash
sudo certbot --nginx -d patnafinder.codevixa.com
```

---

## ✅ Post-Deployment Checklist

### Backend API Tests
- [ ] Visit https://patnafinderapi.codevixa.com/api/v1/health
- [ ] Test user registration: POST /api/v1/user/auth/register
- [ ] Test business listing: GET /api/v1/businesses
- [ ] Test admin login: POST /api/v1/admin/auth/login
- [ ] Check email sending (OTP, welcome emails)

### Frontend Tests
- [ ] Homepage loads: https://patnafinder.codevixa.com
- [ ] Festival hero section displays correctly
- [ ] Business search works
- [ ] User dashboard accessible
- [ ] Admin dashboard accessible
- [ ] Forms submit successfully
- [ ] Images upload properly

### Security Checks
- [ ] HTTPS enabled on both domains
- [ ] CORS configured properly
- [ ] .env files not publicly accessible
- [ ] Database credentials secure
- [ ] Mail credentials secure
- [ ] File upload restrictions in place
- [ ] Rate limiting active

---

## 🔥 Common Issues & Fixes

### Issue: "500 Internal Server Error"
```bash
# Check Laravel logs
tail -f storage/logs/laravel.log

# Clear cache
php artisan cache:clear
php artisan config:clear
```

### Issue: "CORS Error"
```bash
# Verify in backend/.env
SANCTUM_STATEFUL_DOMAINS=patnafinder.codevixa.com
FRONTEND_URL=https://patnafinder.codevixa.com

# Clear config cache
php artisan config:cache
```

### Issue: "Database Connection Failed"
```bash
# Verify MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u your_user -p -h 127.0.0.1 patna_finder_production
```

### Issue: Frontend API calls failing
```bash
# Check frontend/.env.production
NEXT_PUBLIC_API_URL=https://patnafinderapi.codevixa.com/api/v1

# Rebuild
npm run build
pm2 restart khojya-frontend
```

---

## 📊 Monitoring & Maintenance

### Laravel Queue (if used)
```bash
php artisan queue:work --daemon
# Or with supervisor
```

### PM2 Monitoring
```bash
pm2 status
pm2 logs khojya-frontend
pm2 monit
```

### Backup Strategy
```bash
# Database backup (daily cron)
mysqldump -u user -p patna_finder_production > backup_$(date +%Y%m%d).sql

# File backup (weekly)
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz storage/app/public/
```

### Log Rotation
```bash
# Laravel logs
php artisan log:clear

# Nginx logs
sudo logrotate /etc/logrotate.d/nginx
```

---

## 🆘 Support & Rollback

### Rollback Backend
```bash
cd /home/your-user/patna-finder-api
git checkout previous-commit-hash
composer install
php artisan migrate:rollback
php artisan config:cache
```

### Rollback Frontend
```bash
pm2 stop khojya-frontend
git checkout previous-commit-hash
npm install
npm run build
pm2 restart khojya-frontend
```

---

## 📞 Contact
For deployment support, contact: codevixa@gmail.com

---

**Last Updated**: November 1, 2026
**Version**: 1.0.0
