# Khojya - Quick Start Guide

## 🚀 5-Minute Production Deployment

### Prerequisites on Server
```bash
# Install required packages
sudo apt update
sudo apt install -y nginx mysql-server php8.1-fpm php8.1-mysql php8.1-mbstring php8.1-xml php8.1-bcmath nodejs npm git certbot python3-certbot-nginx

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install PM2
sudo npm install -g pm2
```

---

## 📂 Step 1: Clone & Setup

```bash
# Clone repository
cd /var/www
git clone https://github.com/codevixa-svg/patna-finder.git
mv patna-finder patna-finder-api

# Clone again for frontend
git clone https://github.com/codevixa-svg/patna-finder.git
mv patna-finder patnafinder
```

---

## 🗄️ Step 2: Database Setup

```bash
sudo mysql

CREATE DATABASE patna_finder_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'khojya_user'@'localhost' IDENTIFIED BY 'YourSecurePassword123!';
GRANT ALL PRIVILEGES ON patna_finder_production.* TO 'khojya_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🔧 Step 3: Backend Setup

```bash
cd /var/www/patna-finder-api/backend/laravel

# Install dependencies
composer install --optimize-autoloader --no-dev

# Environment setup
cp .env.production .env
nano .env  # Update these lines:
```

**Edit .env:**
```env
DB_DATABASE=patna_finder_production
DB_USERNAME=khojya_user
DB_PASSWORD=YourSecurePassword123!

MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-digit-app-password
MAIL_FROM_ADDRESS=your-email@gmail.com
```

**Continue setup:**
```bash
# Run migrations
php artisan key:generate
php artisan migrate --force
php artisan db:seed --force

# Cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Permissions
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 755 storage bootstrap/cache

# Create storage link
php artisan storage:link
```

---

## 🎨 Step 4: Frontend Setup

```bash
cd /var/www/patnafinder/frontend

# Install dependencies
npm install

# Build
npm run build

# Start with PM2
pm2 start npm --name "khojya" -- start
pm2 save
pm2 startup
```

---

## 🌐 Step 5: Nginx Configuration

**Backend:**
```bash
sudo nano /etc/nginx/sites-available/patnafinderapi.codevixa.com
# Copy content from nginx-backend.conf

sudo ln -s /etc/nginx/sites-available/patnafinderapi.codevixa.com /etc/nginx/sites-enabled/
```

**Frontend:**
```bash
sudo nano /etc/nginx/sites-available/patnafinder.codevixa.com
# Copy content from nginx-frontend.conf

sudo ln -s /etc/nginx/sites-available/patnafinder.codevixa.com /etc/nginx/sites-enabled/
```

**Test & Reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 Step 6: SSL Certificates

```bash
# Backend
sudo certbot --nginx -d patnafinderapi.codevixa.com

# Frontend
sudo certbot --nginx -d patnafinder.codevixa.com

# Test auto-renewal
sudo certbot renew --dry-run
```

---

## ✅ Step 7: Verify Deployment

```bash
# Test API
curl https://patnafinderapi.codevixa.com/api/v1/health

# Test Frontend
curl -I https://patnafinder.codevixa.com

# Check PM2
pm2 status
pm2 logs khojya

# Check Laravel logs
tail -f /var/www/patna-finder-api/backend/laravel/storage/logs/laravel.log
```

---

## 🎯 Quick Commands

### Redeploy Frontend
```bash
cd /var/www/patnafinder/frontend
git pull origin main
npm install
npm run build
pm2 restart khojya
```

### Redeploy Backend
```bash
cd /var/www/patna-finder-api/backend/laravel
git pull origin main
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### View Logs
```bash
# Frontend
pm2 logs khojya

# Backend
tail -f /var/www/patna-finder-api/backend/laravel/storage/logs/laravel.log

# Nginx
sudo tail -f /var/log/nginx/khojya-api-error.log
sudo tail -f /var/log/nginx/khojya-frontend-error.log
```

---

## 🆘 Troubleshooting

### Frontend not loading
```bash
pm2 restart khojya
pm2 logs khojya --lines 50
```

### API 500 error
```bash
cd /var/www/patna-finder-api/backend/laravel
php artisan cache:clear
php artisan config:clear
tail -f storage/logs/laravel.log
```

### Database connection failed
```bash
mysql -u khojya_user -p patna_finder_production
# If fails, check credentials in .env
```

### CORS error
```bash
# Verify in backend/.env
SANCTUM_STATEFUL_DOMAINS=patnafinder.codevixa.com
FRONTEND_URL=https://patnafinder.codevixa.com

php artisan config:cache
```

---

## 📊 Monitoring

```bash
# Server resources
htop

# Nginx status
sudo systemctl status nginx

# PHP-FPM status
sudo systemctl status php8.1-fpm

# MySQL status
sudo systemctl status mysql

# PM2 monitoring
pm2 monit

# Disk space
df -h
```

---

## 🔄 Automated Backups

**Daily database backup cron:**
```bash
crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * mysqldump -u khojya_user -pYourPassword patna_finder_production > /var/backups/khojya/db_$(date +\%Y\%m\%d).sql
```

---

## 🎉 Done!

Your Khojya platform is now live at:
- **Frontend**: https://patnafinder.codevixa.com
- **Admin**: https://patnafinder.codevixa.com/admin/dashboard
- **API**: https://patnafinderapi.codevixa.com

**Default Admin Credentials** (if seeded):
- Email: admin@khojya.com
- Password: Check database or seed file
