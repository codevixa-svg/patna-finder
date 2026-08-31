# 💎 Hidden Gems Backend Setup Guide

## Overview
Hidden Gems feature is an admin-managed section showcasing underrated places in Patna with:
- ✅ Image galleries (featured + multiple images)
- ✅ Rich 200-300 word stories
- ✅ Address and location
- ✅ Google My Business (GMB) integration for reviews and ratings
- ✅ Auto-sync GMB data every 24 hours
- ✅ Like, share, and view tracking

---

## 📋 Database Schema

### `hidden_gems` Table Fields:

**Basic Info:**
- `id`, `title`, `slug`
- `category_id`, `area_id` (nullable, foreign keys)
- `story` (text, 200-300 words)
- `address`, `latitude`, `longitude`

**Images:**
- `featured_image` (main image)
- `gallery` (JSON array of additional images)

**GMB Integration:**
- `gmb_place_id` - Google Maps Place ID
- `gmb_url` - Google My Business URL
- `gmb_rating` - Rating from GMB (synced)
- `gmb_review_count` - Review count from GMB (synced)
- `gmb_reviews` - Cached reviews (JSON, top 5)
- `gmb_last_synced` - Last sync timestamp
- `gmb_sync_enabled` - Auto-sync toggle

**Metadata:**
- `badge` (new/trending/popular)
- `view_count`, `like_count`, `share_count`
- `is_featured`, `is_active`
- `display_order` (for admin sorting)
- `meta_title`, `meta_description`
- `tags` (JSON array)

---

## 🚀 Setup Steps

### 1. Run Migration
```bash
cd backend/laravel
php artisan migrate
```

This creates the `hidden_gems` table.

---

### 2. Get Google Places API Key

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Places API"
4. Go to Credentials → Create Credentials → API Key
5. (Optional) Restrict API key to Places API only
6. Copy the API key

**Add to `.env`:**
```env
GOOGLE_PLACES_API_KEY=AIzaSyC_your_actual_api_key_here
```

**Note:** Without API key, GMB sync will fail (but Hidden Gems will still work without GMB data)

---

### 3. Get Google Place ID for Locations

**Method 1: Using Google Maps**
1. Open Google Maps
2. Search for the place
3. Copy URL like: `https://maps.google.com/?q=place_id:ChIJN1t_tDeuEmsRUsoyG83frY4`
4. Extract `ChIJN1t_tDeuEmsRUsoyG83frY4` → This is the Place ID

**Method 2: Using Place ID Finder**
- Visit: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder

---

### 4. Seed Sample Data
```bash
php artisan db:seed --class=HiddenGemsSeeder
```

This creates 4 sample hidden gems:
- Café Hideout - Secret Garden Cafe
- Bihari Rasoi - Authentic Village Kitchen
- The Old Book Café & Library
- Rooftop Sunset Point - Golghar View

---

### 5. Add Real GMB Place IDs (Admin Task)

After seeding, update each hidden gem with actual Place IDs:

**Using Laravel Tinker:**
```bash
php artisan tinker
```

```php
$gem = \App\Models\HiddenGem::where('slug', 'cafe-hideout-secret-garden')->first();
$gem->gmb_place_id = 'ChIJN1t_tDeuEmsRUsoyG83frY4'; // Real Place ID
$gem->gmb_url = 'https://maps.google.com/?cid=123456789';
$gem->gmb_sync_enabled = true;
$gem->save();
```

---

### 6. Test GMB Sync

**Manual Sync via API:**
```bash
curl -X POST http://localhost:8000/api/v1/hidden-gems/cafe-hideout-secret-garden/sync-gmb
```

**Auto Sync:**
- GMB data auto-syncs when a hidden gem is viewed
- Only if 24+ hours have passed since last sync
- Only if `gmb_sync_enabled = true` and `gmb_place_id` exists

---

## 📡 API Endpoints

### List Hidden Gems
```http
GET /api/v1/hidden-gems
GET /api/v1/hidden-gems?category_id=1
GET /api/v1/hidden-gems?area_id=2
GET /api/v1/hidden-gems?is_featured=true
```

### Homepage - Latest 4
```http
GET /api/v1/hidden-gems/latest
```

### Featured Gems
```http
GET /api/v1/hidden-gems/featured
```

### Single Gem Details
```http
GET /api/v1/hidden-gems/{slug}
```

### Like Gem
```http
POST /api/v1/hidden-gems/{slug}/like
```

### Share Gem
```http
POST /api/v1/hidden-gems/{slug}/share
```

### Manual GMB Sync
```http
POST /api/v1/hidden-gems/{slug}/sync-gmb
```

---

## 🖼️ Image Storage Setup

### Create Storage Directories
```bash
cd backend/laravel
mkdir -p storage/app/public/hidden-gems
php artisan storage:link
```

### Image Upload Structure
```
storage/
  app/
    public/
      hidden-gems/
        cafe-hideout-1.jpg (featured image)
        cafe-hideout-2.jpg (gallery)
        cafe-hideout-3.jpg (gallery)
        ...
```

### Access Images
- Stored: `storage/app/public/hidden-gems/image.jpg`
- URL: `http://localhost:8000/storage/hidden-gems/image.jpg`

---

## 🔄 GMB Data Sync Logic

### Automatic Sync
- Triggers when viewing a hidden gem (`GET /hidden-gems/{slug}`)
- Only if 24+ hours since last sync
- Only if `gmb_sync_enabled = true`
- Only if `gmb_place_id` exists

### Manual Sync
- Admin can trigger anytime via API
- Useful for immediate updates

### What Gets Synced
- Overall GMB rating
- Total review count
- Top 5 reviews (cached as JSON)
- Sync timestamp

### GMB Reviews Structure
```json
{
  "gmb_reviews": [
    {
      "author_name": "John Doe",
      "author_url": "https://...",
      "profile_photo_url": "https://...",
      "rating": 5,
      "text": "Amazing place!",
      "time": 1673876543,
      "relative_time_description": "2 weeks ago"
    }
  ]
}
```

---

## 🛠️ Admin Management (TODO)

Currently no admin panel. Hidden Gems managed via:
- Database directly
- Laravel Tinker
- Future: Admin panel/dashboard

**CRUD Operations via Tinker:**
```php
// Create
$gem = \App\Models\HiddenGem::create([
    'title' => 'New Hidden Gem',
    'story' => '200-300 words description...',
    'address' => 'Full address',
    // ... other fields
]);

// Update
$gem = \App\Models\HiddenGem::find(1);
$gem->is_featured = true;
$gem->save();

// Delete (soft delete)
$gem->delete();
```

---

## 📊 Response Example

```json
{
  "id": 1,
  "title": "Café Hideout - The Secret Garden Cafe",
  "slug": "cafe-hideout-secret-garden",
  "category": {
    "id": 5,
    "name": "Cafes"
  },
  "area": {
    "id": 1,
    "name": "Boring Road"
  },
  "story": "Tucked away in a quiet lane off Boring Road...",
  "address": "Lane 3, Behind Dujana House, Boring Road, Patna - 800001",
  "latitude": "25.60930000",
  "longitude": "85.13760000",
  "featured_image_url": "http://localhost:8000/storage/hidden-gems/cafe-hideout-1.jpg",
  "gallery_urls": [
    "http://localhost:8000/storage/hidden-gems/cafe-hideout-2.jpg",
    "http://localhost:8000/storage/hidden-gems/cafe-hideout-3.jpg"
  ],
  "gmb_rating": "4.70",
  "gmb_review_count": 156,
  "gmb_reviews": [...],
  "gmb_last_synced": "2024-01-15T10:30:00",
  "badge": "trending",
  "view_count": 1245,
  "like_count": 89,
  "share_count": 34,
  "is_featured": true,
  "tags": ["cafe", "coffee", "cozy", "quiet", "books"],
  "created_at": "2024-01-10T08:00:00"
}
```

---

## ⚠️ Important Notes

1. **Google Places API is paid** (after free tier)
   - Free: 28,500 requests/month
   - Monitor usage in Google Cloud Console

2. **Rate Limiting**
   - Don't sync too frequently
   - 24-hour auto-sync is recommended

3. **Place ID Persistence**
   - Google Place IDs are stable
   - Safe to cache long-term

4. **Review Caching**
   - GMB reviews cached in database
   - Reduces API calls
   - Updates every 24 hours

5. **Error Handling**
   - API failures logged to Laravel logs
   - Hidden Gems work without GMB data
   - Frontend should handle missing GMB fields gracefully

---

## 🔐 Security

- Hidden Gems are read-only for public
- Only admin can create/update/delete
- Future: Add admin authentication/authorization
- API key should be kept secure in `.env`

---

## 🎯 Next Steps

1. ✅ Run migration
2. ✅ Seed sample data
3. ⏳ Get Google Places API key
4. ⏳ Add real Place IDs
5. ⏳ Upload images to storage
6. ⏳ Test GMB sync
7. ⏳ Build frontend component
8. ⏳ Create admin panel (future)

---

## 📞 Support

For questions or issues:
- Check Laravel logs: `storage/logs/laravel.log`
- GMB API errors logged there
- Test API endpoints with Postman/cURL
