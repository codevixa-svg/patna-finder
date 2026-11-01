# Welcome Email - Quick Setup Guide ⚡

## 5-Minute Setup

### Step 1: Configure Email in `.env`

Open: `backend/laravel/.env`

**Option A: Gmail (Easy for Testing)**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@patnafinder.com
MAIL_FROM_NAME="Patna Finder"

APP_FRONTEND_URL=http://localhost:3000
```

**Gmail App Password Kaise Banaye?**
1. Google Account: https://myaccount.google.com/apppasswords
2. "Select app" → Other → Type "Patna Finder"
3. Copy generated password (16 characters)
4. Paste in `MAIL_PASSWORD`

**Option B: Mailtrap (Best for Development)**
1. Sign up: https://mailtrap.io (free)
2. Get credentials from Inbox → SMTP Settings

```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@patnafinder.com
MAIL_FROM_NAME="Patna Finder"

APP_FRONTEND_URL=http://localhost:3000
```

### Step 2: Clear Cache

```bash
cd backend/laravel
php artisan config:clear
php artisan cache:clear
```

### Step 3: Test It!

1. Open admin panel: `http://localhost:3000/admin/businesses/create`
2. Fill form with NEW email (not in database)
3. Submit
4. Check:
   - Success message: "Business created successfully! Welcome email sent to owner."
   - Email inbox (or Mailtrap)
   - Laravel log: `backend/laravel/storage/logs/laravel.log`

### Step 4: Verify Email Received

Email should have:
- ✅ Subject: "Welcome to Patna Finder - Your Business is Live!"
- ✅ Business name and details
- ✅ "Set Your Password" button
- ✅ Professional orange design

## Quick Test Command

Test email sending:
```bash
cd backend/laravel
php artisan tinker
```

```php
Mail::raw('Test from Patna Finder', function ($message) {
    $message->to('your-test-email@gmail.com')
            ->subject('Test Email');
});
```

If this works, welcome emails will work!

## Troubleshooting

**Email not sending?**
```bash
# Check logs
tail -f backend/laravel/storage/logs/laravel.log

# Test SMTP connection
php artisan tinker
# Then run Mail::raw() test above
```

**Gmail says "Less secure app"?**
- Don't use regular password
- Use App Password instead
- Enable 2-factor authentication first

**Mailtrap not working?**
- Check username/password are correct
- Use "sandbox.smtp.mailtrap.io" not "smtp.mailtrap.io"
- Port must be 2525

## Done! 🎉

Ab jab bhi admin new business create karega with owner email, automatically welcome email jayega!
