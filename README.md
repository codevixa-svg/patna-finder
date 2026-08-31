# Patna Finder 📍

**Discover Patna's Best Businesses & Hidden Gems**

A premium local discovery platform built with Next.js and Laravel. Modern, minimal, and designed for exceptional user experience.

---

## 🎨 Design Philosophy

- **Premium Startup Aesthetic** - Inspired by Airbnb, CRED, Stripe, and Apple
- **Glassmorphism** - Translucent surfaces with blur effects
- **Smooth Animations** - Micro-interactions and hover effects
- **Mobile-First** - Fully responsive design
- **Dark Hero Sections** - Light content sections for contrast

### Color Palette
- **Primary**: `#FFC107` (Amber)
- **Dark**: `#081C3A` (Navy Blue)
- **Background**: `#F8FAFC` (Light Gray)
- **White**: `#FFFFFF`
- **Border**: `#E9EDF3`

### Typography
- **Headings**: Poppins ExtraBold
- **Body**: Inter

---

## 🚀 Features

### For Users
- ✅ Discover businesses by category and area
- ✅ Read trusted reviews with photos
- ✅ Compare businesses side-by-side
- ✅ Find hidden gems and trending places
- ✅ Explore Patna by locality
- ✅ Read local blog (Patna Pulse)
- ✅ Advanced search and filtering
- ✅ Interactive maps

### For Businesses
- ✅ Free business listing
- ✅ Business profile management
- ✅ Review management
- ✅ Featured/Sponsored listings
- ✅ Awards and badges
- ✅ Analytics dashboard

### Admin Features
- ✅ Business approval workflow
- ✅ Review moderation
- ✅ Blog management
- ✅ Category & area management
- ✅ Awards management
- ✅ User management

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Hooks
- **HTTP Client**: Fetch API

### Backend
- **Framework**: Laravel 9
- **Language**: PHP 8.0+
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **API**: RESTful API

---

## 📦 Installation

### Prerequisites
- **Node.js** 20+ and npm
- **PHP** 8.0+
- **Composer**
- **MySQL** 5.7+

### Backend Setup (Laravel)

1. Navigate to backend directory:
```bash
cd backend/laravel
```

2. Install dependencies:
```bash
composer install
```

3. Configure environment:
```bash
# .env file is already configured
# Update database credentials if needed
```

4. Create database:
```sql
CREATE DATABASE patna_finder CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

5. Run migrations:
```bash
php artisan migrate
```

6. Seed initial data:
```bash
php artisan db:seed --class=InitialDataSeeder
```

7. Start Laravel server:
```bash
php artisan serve
```

Backend will run at: **http://localhost:8000**

### Frontend Setup (Next.js)

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment (already created):
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Patna Finder
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Start development server:
```bash
npm run dev
```

Frontend will run at: **http://localhost:3000**

---

## 📁 Project Structure

```
patna-finder/
├── backend/
│   └── laravel/
│       ├── app/
│       │   ├── Models/
│       │   │   ├── Business.php
│       │   │   ├── Category.php
│       │   │   ├── Area.php
│       │   │   ├── Review.php
│       │   │   ├── BlogPost.php
│       │   │   ├── Award.php
│       │   │   └── Faq.php
│       │   └── Http/
│       │       └── Controllers/
│       │           └── Api/
│       │               ├── BusinessController.php
│       │               ├── CategoryController.php
│       │               ├── AreaController.php
│       │               ├── ReviewController.php
│       │               ├── BlogController.php
│       │               └── SearchController.php
│       ├── database/
│       │   ├── migrations/
│       │   └── seeders/
│       └── routes/
│           └── api.php
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── BusinessCard.tsx
│   ├── lib/
│   │   └── api.ts
│   └── .env.local
│
└── README.md
```

---

## 🔗 API Endpoints

### Businesses
- `GET /api/v1/businesses` - List all businesses
- `GET /api/v1/businesses/trending` - Trending businesses
- `GET /api/v1/businesses/featured` - Featured businesses
- `GET /api/v1/businesses/hidden-gems` - Hidden gems
- `GET /api/v1/businesses/{slug}` - Business details
- `GET /api/v1/businesses/{slug}/nearby` - Nearby businesses
- `POST /api/v1/businesses` - Submit business

### Categories & Areas
- `GET /api/v1/categories` - List categories
- `GET /api/v1/categories/{slug}` - Category details
- `GET /api/v1/categories/{slug}/businesses` - Businesses by category
- `GET /api/v1/areas` - List areas
- `GET /api/v1/areas/{slug}` - Area details
- `GET /api/v1/areas/{slug}/businesses` - Businesses by area

### Reviews
- `GET /api/v1/businesses/{slug}/reviews` - List reviews
- `POST /api/v1/businesses/{slug}/reviews` - Submit review
- `POST /api/v1/reviews/{id}/like` - Like review

### Blog
- `GET /api/v1/blog` - List blog posts
- `GET /api/v1/blog/latest` - Latest posts
- `GET /api/v1/blog/{slug}` - Blog post details
- `GET /api/v1/blog/categories` - Blog categories

### Search
- `GET /api/v1/search?q={query}` - Search businesses
- `GET /api/v1/popular-searches` - Popular searches

---

## 🎯 Key Features Implemented

### ✅ Database Schema
- Categories table with icons and display order
- Areas table with geolocation
- Businesses table with all required fields
- Reviews with photos and moderation
- Blog posts (Patna Pulse)
- Awards system
- FAQs for businesses

### ✅ Backend API
- Full RESTful API
- Business CRUD operations
- Review system with likes
- Search and filtering
- Sorting (rating, reviews, newest)
- Nearby businesses (geolocation-based)
- Slug-based URLs
- Status-based approval workflow

### ✅ Frontend
- Premium homepage with hero section
- Business cards with hover effects
- Glassmorphism design elements
- Responsive navigation
- Search functionality
- Category grid
- Trending businesses section
- Hidden gems section
- Blog posts preview
- Footer with newsletter

### ✅ Design System
- Custom CSS variables
- Premium card styles
- Glassmorphism effects
- Badge components
- Button styles
- Animation utilities
- Custom scrollbar
- Rating stars

---

## 🚧 Next Steps (To Be Implemented)

### Pages to Create
1. **Business Listing Page** - Full business profile
2. **Category Pages** - Businesses by category
3. **Area Pages** - Businesses by locality
4. **Compare Page** - Side-by-side comparison
5. **Hidden Gems Page** - Special curated list
6. **Best of Patna** - Award-winning businesses
7. **Blog Pages** - Individual blog posts
8. **Add Business Form** - Free listing submission
9. **Search Results** - Advanced search page
10. **Admin Dashboard** - Management interface

### Additional Features
- User authentication
- Wishlist/Save businesses
- Advanced filtering
- Map integration (Google Maps/Mapbox)
- Image upload functionality
- Email notifications
- Business analytics
- Review photos
- Social sharing
- Awards voting system

---

## 📝 Database Seeding

Initial categories and areas are seeded automatically. To add more data:

```bash
php artisan db:seed --class=InitialDataSeeder
```

**Seeded Categories** (19):
- Coaching Institutes, Dentists, Doctors, Hospitals, Restaurants, Gyms, Schools, Lawyers, Hotels, Cafés, Beauty Salons, Shopping, Real Estate, Travel, Photography, Event Planners, Pet Clinics, Repair Services, Home Services

**Seeded Areas** (14):
- Boring Road, Kankarbagh, Patliputra, Bailey Road, Rajendra Nagar, Danapur, Ashok Rajpath, Fraser Road, Patna City, Kurji, Digha, Anisabad, Phulwari Sharif, Khagaul

---

## 🎨 Design Guidelines

- **Rounded Corners**: 16-24px for cards
- **Spacing**: 8px grid system
- **Shadows**: Soft (0 4px 20px rgba(8, 28, 58, 0.06))
- **Hover Effects**: Transform translateY(-4px) + shadow increase
- **Animation Duration**: 0.3s for quick interactions
- **Font Sizes**: 
  - Hero: 4-5rem
  - H2: 2.5rem
  - Body: 1rem
  - Small: 0.875rem

---

## 🤝 Contributing

This is a complete project setup. To add new features:

1. Create necessary database migrations
2. Update models with relationships
3. Add API endpoints in controllers
4. Update routes in `api.php`
5. Create frontend components
6. Add pages in Next.js app directory
7. Update API client in `lib/api.ts`

---

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

---

## 🙏 Credits

**Designed & Developed with ❤️ for Patna**

Built with modern web technologies to deliver a premium user experience.

---

## 📞 Support

For issues or questions, please create an issue in the repository.

**Made with Next.js 16, Laravel 9, TypeScript, and Tailwind CSS 4**
