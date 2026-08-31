# 🚀 Quick Setup Guide

## Step-by-Step Installation

### 1. Database Setup

Open MySQL and create the database:

```sql
CREATE DATABASE patna_finder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Backend Setup (5 minutes)

```bash
# Navigate to backend
cd backend/laravel

# Install PHP dependencies
composer install

# The .env file is already configured
# Just verify database credentials match your MySQL setup:
# DB_DATABASE=patna_finder
# DB_USERNAME=root
# DB_PASSWORD=(your password)

# Run migrations
php artisan migrate

# Seed initial data (categories and areas)
php artisan db:seed --class=InitialDataSeeder

# Start Laravel server
php artisan serve
```

✅ Backend running at: **http://localhost:8000**

### 3. Frontend Setup (3 minutes)

Open a **new terminal** and run:

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install

# The .env.local file is already configured
# No changes needed

# Start Next.js development server
npm run dev
```

✅ Frontend running at: **http://localhost:3000**

---

## ✅ Verify Installation

1. Open browser: **http://localhost:3000**
2. You should see the premium homepage with:
   - Dark hero section with search bar
   - Top categories grid
   - Sections for trending businesses
   - Footer with links

3. Test API: **http://localhost:8000/api/v1/categories**
   - Should return JSON with 19 categories

---

## 🎯 What's Included

### ✅ Fully Working:
- Homepage with premium design
- Header with navigation
- Footer with links
- Category and Area APIs
- Business listing API
- Review system API
- Blog (Patna Pulse) API
- Search API
- Database schema (7 tables)
- 19 categories seeded
- 14 areas seeded

### 🚧 To Be Built (Next Phase):
- Individual business page
- Category listing pages
- Area listing pages
- Search results page
- Add business form
- Admin dashboard
- Image upload functionality
- Map integration

---

## 📊 Database Tables Created

1. **categories** - Business categories with icons
2. **areas** - Patna localities with geolocation
3. **businesses** - Full business profiles
4. **reviews** - User reviews with photos
5. **blog_posts** - Patna Pulse articles
6. **awards** - Business awards
7. **faqs** - Business FAQs

---

## 🔗 API Testing

### Get Categories
```bash
curl http://localhost:8000/api/v1/categories
```

### Get Areas
```bash
curl http://localhost:8000/api/v1/areas
```

### Search Businesses
```bash
curl "http://localhost:8000/api/v1/search?q=doctor"
```

### Submit Business (POST)
```bash
curl -X POST http://localhost:8000/api/v1/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Business",
    "category_id": 1,
    "area_id": 1,
    "owner_name": "John Doe",
    "phone": "1234567890",
    "email": "john@example.com",
    "address": "123 Main St, Patna"
  }'
```

---

## 🐛 Common Issues

### Issue: Database connection error
**Solution**: Check MySQL credentials in `backend/laravel/.env`

### Issue: Port 3000 already in use
**Solution**: Stop other Next.js apps or use: `npm run dev -- -p 3001`

### Issue: Port 8000 already in use
**Solution**: Stop other Laravel apps or use: `php artisan serve --port=8001`

### Issue: Composer dependencies fail
**Solution**: Ensure PHP 8.0+ is installed: `php --version`

---

## 📝 Next Development Steps

1. **Add Sample Businesses**
   - Create businesses manually via API or PHPMyAdmin
   - Add cover images and logos

2. **Build Business Detail Page**
   - Create `/frontend/app/business/[slug]/page.tsx`
   - Show full business profile

3. **Build Category Pages**
   - Create `/frontend/app/categories/[slug]/page.tsx`
   - List businesses by category

4. **Add Image Upload**
   - Configure Laravel filesystem
   - Add image upload API endpoint
   - Build upload UI component

5. **Build Admin Dashboard**
   - Create admin routes
   - Build approval workflow
   - Add authentication

---

## 🎉 You're All Set!

The project foundation is complete with:
- ✅ Premium design system
- ✅ Full API backend
- ✅ Modern Next.js frontend
- ✅ Database schema
- ✅ Initial data seeded

Now you can start building additional pages and features!

**Happy Coding! 🚀**
