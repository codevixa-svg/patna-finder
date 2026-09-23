# Deployment Guide — https://patna-finder.codevixa.com

Stack: **Next.js (frontend)** + **Laravel API (backend)** + **MySQL**, served on one
domain via nginx reverse proxy:

- `https://patna-finder.codevixa.com` → Next.js (pm2, port 3000)
- `https://patna-finder.codevixa.com/api/v1/...` → Laravel (`/api` location)
- `https://patna-finder.codevixa.com/storage/...` → Laravel uploaded files

---

## 1. Server requirements

- Ubuntu 22.04+ / Debian 12
- Nginx, PHP 8.2 + php-fpm (extensions: `mbstring xml curl mysql zip bcmath gd intl`)
- Composer 2, Node.js 20+, MySQL 8
- pm2 (`npm i -g pm2`), certbot (`apt install certbot python3-certbot-nginx`)

## 2. Get the code

```bash
sudo mkdir -p /var/www/patna-finder
sudo chown $USER /var/www/patna-finder
git clone https://github.com/codevixa-svg/patna-finder.git /var/www/patna-finder
```

## 3. Backend (Laravel)

```bash
cd /var/www/patna-finder/backend/laravel

composer install --no-dev --optimize-autoloader

cp .env.production.example .env
nano .env            # set DB_PASSWORD, MAIL creds, RAZORPAY keys
php artisan key:generate

# Database
mysql -e "CREATE DATABASE patna_finder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  CREATE USER 'patna_user'@'localhost' IDENTIFIED BY '<password>';
  GRANT ALL ON patna_finder.* TO 'patna_user'@'localhost';"

php artisan migrate --force
php artisan db:seed --force          # optional: seed categories/areas
php artisan storage:link             # exposes storage/app/public at /storage

chmod -R 775 storage bootstrap/cache
```

### Verify API
```bash
curl http://127.0.0.1:8000/api/v1/categories   # if testing via artisan serve
```

## 4. Frontend (Next.js)

```bash
cd /var/www/patna-finder/frontend

# .env.production is already committed with:
#   NEXT_PUBLIC_API_URL=https://patna-finder.codevixa.com/api/v1
#   NEXT_PUBLIC_APP_URL=https://patna-finder.codevixa.com
# Override here only if values differ:
# cp .env.production .env.local.local-run

npm ci
npm run build
pm2 start npm --name patna-finder-web -- start
pm2 save && pm2 startup
```

> `NEXT_PUBLIC_*` vars are baked in at **build time** — always run
> `npm run build` AFTER the env values are final.

## 5. Nginx + SSL

```bash
sudo cp /var/www/patna-finder/deploy/nginx/patna-finder.conf \
        /etc/nginx/sites-available/patna-finder
sudo ln -s /etc/nginx/sites-available/patna-finder /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d patna-finder.codevixa.com
```

## 6. Post-deploy checklist

- [ ] `https://patna-finder.codevixa.com` loads the homepage
- [ ] `https://patna-finder.codevixa.com/api/v1/categories` returns JSON
- [ ] Business images load from `/storage/...`
- [ ] Login / OTP emails send (MAIL_* configured)
- [ ] Admin panel `/admin` login works
- [ ] DNS A record for `patna-finder.codevixa.com` → server IP

## 7. SEO / indexing — IMPORTANT

The site is currently **noindex, nofollow site-wide**
(`frontend/app/layout.tsx` → `robots: { index: false, follow: false }`, plus an
explicit override in `frontend/app/blog/[slug]/page.tsx`).

Before going live for search engines:

1. In `frontend/app/layout.tsx` set `index: true, follow: true` (and googleBot).
2. In `frontend/app/blog/[slug]/page.tsx` do the same.
3. Rebuild + redeploy.
4. Check `https://patna-finder.codevixa.com/robots.txt` and submit the sitemap
   (`/sitemap.xml`, if configured) in Google Search Console.

## 8. Updates / redeploy

```bash
cd /var/www/patna-finder && git pull
cd backend/laravel && composer install --no-dev --optimize-autoloader \
  && php artisan migrate --force \
  && php artisan config:cache && php artisan route:cache
cd ../../frontend && npm ci && npm run build && pm2 restart patna-finder-web
```

## 9. Optional hardening

- `php artisan config:cache && php artisan route:cache && php artisan view:cache`
- MySQL daily dump: `mysqldump patna_finder | gzip > backup-$(date +%F).sql.gz`
- Fail2ban + ufw (`allow 22, 80, 443`)
- Move mail to a transactional provider (SES/Postmark) for reliability
