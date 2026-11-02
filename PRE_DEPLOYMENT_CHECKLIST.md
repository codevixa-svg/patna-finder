# Pre-Deployment Checklist - Khojya

## ✅ Completed Items

### Branding
- [x] "Patna Finder" replaced with "Khojya" across all files
- [x] Email templates updated
- [x] Meta tags and SEO updated
- [x] Admin dashboard branded
- [x] User dashboard branded

### Features
- [x] Festival-based hero section (automatic detection)
- [x] Typewriter animation for hero title
- [x] Background image support for festivals
- [x] Admin business creation with email
- [x] Welcome email system
- [x] 7-step business creation/edit forms
- [x] Clean URL slugs
- [x] Security fixes (mass assignment, XSS, path traversal)

### Environment Files
- [x] frontend/.env.production created
- [x] backend/laravel/.env.production created
- [x] Production URLs configured

---

## 📋 TODO Before Deployment

### 1. Upload Hero Images
```
frontend/public/images/
├── hero/
│   └── hanuman-bg.jpg (Default homepage background)
└── festivals/
    ├── diwali-banner.jpg
    ├── holi-banner.jpg
    ├── chhath-banner.jpg
    ├── christmas-banner.jpg
    ├── newyear-banner.jpg
    └── independence-banner.jpg
```

### 2. Database Setup
- [ ] Create production database: `patna_finder_production`
- [ ] Create database user with secure password
- [ ] Update backend/.env.production with credentials
- [ ] Run migrations: `php artisan migrate --force`
- [ ] Seed initial data: `php artisan db:seed --force`

### 3. Email Configuration
- [ ] Create Gmail App Password (16-digit)
- [ ] Update MAIL_USERNAME in backend/.env.production
- [ ] Update MAIL_PASSWORD in backend/.env.production
- [ ] Test email sending (registration OTP)

### 4. SSL Certificates
- [ ] Install SSL for patnafinderapi.codevixa.com
- [ ] Install SSL for patnafinder.codevixa.com
- [ ] Force HTTPS redirects

### 5. Security
- [ ] Change APP_KEY in production
- [ ] Secure database credentials
- [ ] Set APP_DEBUG=false in production
- [ ] Review file upload permissions
- [ ] Test rate limiting

### 6. Performance
- [ ] Run `php artisan config:cache`
- [ ] Run `php artisan route:cache`
- [ ] Run `php artisan view:cache`
- [ ] Run `npm run build` for frontend
- [ ] Enable gzip compression in Nginx/Apache

### 7. Testing
- [ ] Test user registration
- [ ] Test admin login
- [ ] Test business creation
- [ ] Test image uploads
- [ ] Test email sending
- [ ] Test API endpoints
- [ ] Test responsive design

---

## 🚀 Deployment Steps

### Backend (Laravel)
```bash
cd backend/laravel
composer install --optimize-autoloader --no-dev
cp .env.production .env
php artisan migrate --force
php artisan config:cache
php artisan route:cache
chmod -R 755 storage bootstrap/cache
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run build
pm2 start npm --name "khojya-frontend" -- start
pm2 save
```

---

## 🔍 Post-Deployment Verification

### API Health Check
```bash
curl https://patnafinderapi.codevixa.com/api/v1/health
```

### Frontend Check
```bash
curl -I https://patnafinder.codevixa.com
```

### Test Registration
```bash
POST https://patnafinderapi.codevixa.com/api/v1/user/auth/register
{
  "email": "test@example.com",
  "password": "Test@1234"
}
```

### Test Business Listing
```bash
GET https://patnafinderapi.codevixa.com/api/v1/businesses
```

---

## ⚠️ Important Notes

1. **Database Backup**: Take backup before deployment
2. **Maintenance Mode**: Enable during deployment
   ```bash
   php artisan down
   # Deploy changes
   php artisan up
   ```
3. **Git Ignore**: Never commit .env files
4. **Logs**: Monitor logs after deployment
   ```bash
   tail -f storage/logs/laravel.log
   pm2 logs khojya-frontend
   ```

---

## 📞 Emergency Rollback

If something goes wrong:
```bash
# Backend
git checkout previous-commit
composer install
php artisan migrate:rollback

# Frontend
pm2 stop khojya-frontend
git checkout previous-commit
npm install && npm run build
pm2 restart khojya-frontend
```

---

**Ready for deployment once all checkboxes are complete!** ✅
