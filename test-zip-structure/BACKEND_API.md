# Backend API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

---

## 📁 Businesses

### List Businesses
```http
GET /businesses
```

**Query Parameters:**
- `search` - Search by name or description
- `category_id` - Filter by category
- `area_id` - Filter by area
- `is_verified` - Filter verified businesses (true/false)
- `is_featured` - Filter featured businesses (true/false)
- `is_trending` - Filter trending businesses (true/false)
- `is_hidden_gem` - Filter hidden gems (true/false)
- `min_rating` - Minimum rating (0-5)
- `sort_by` - Sort by: `created_at`, `rating`, `review_count`, `popular`
- `sort_order` - `asc` or `desc`
- `per_page` - Results per page (default: 12)

**Example:**
```bash
GET /businesses?category_id=1&min_rating=4&sort_by=rating&sort_order=desc
```

---

### Get Business Details
```http
GET /businesses/{slug}
```

**Response includes:**
- Business details
- Category and area
- Latest 10 reviews
- Awards
- FAQs

---

### Submit Business
```http
POST /businesses
```

**Request Body:**
```json
{
  "name": "Dr. Sharma's Dental Clinic",
  "category_id": 2,
  "area_id": 1,
  "description": "Best dental care in Patna",
  "owner_name": "Dr. Rajesh Sharma",
  "phone": "9876543210",
  "email": "sharma@example.com",
  "address": "123 Boring Road, Patna",
  "website": "https://example.com",
  "whatsapp": "9876543210"
}
```

**Response:**
- Status: `pending` (requires admin approval)
- Success message

---

### Get Trending Businesses
```http
GET /businesses/trending
```

Returns 12 trending businesses

---

### Get Featured Businesses
```http
GET /businesses/featured
```

Returns 12 featured businesses

---

### Get Hidden Gems
```http
GET /businesses/hidden-gems
```

Returns 12 hidden gem businesses

---

### Get Nearby Businesses
```http
GET /businesses/{slug}/nearby
```

Returns businesses within 1km radius

---

## 📂 Categories

### List Categories
```http
GET /categories
```

Returns all active categories with icons

---

### Get Category Details
```http
GET /categories/{slug}
```

Returns single category

---

### Get Businesses by Category
```http
GET /categories/{slug}/businesses?per_page=12
```

Returns paginated businesses for a category

---

## 🗺️ Areas

### List Areas
```http
GET /areas
```

Returns all active areas (Patna localities)

---

### Get Area Details
```http
GET /areas/{slug}
```

Returns single area with coordinates

---

### Get Businesses by Area
```http
GET /areas/{slug}/businesses?per_page=12
```

Returns paginated businesses for an area

---

## ⭐ Reviews

### List Reviews
```http
GET /businesses/{slug}/reviews
```

**Query Parameters:**
- `sort_by` - `created_at`, `likes`, `rating_high`, `rating_low`
- `per_page` - Results per page (default: 10)

---

### Submit Review
```http
POST /businesses/{slug}/reviews
```

**Request Body:**
```json
{
  "author_name": "Amit Kumar",
  "author_email": "amit@example.com",
  "rating": 5,
  "content": "Excellent service! Highly recommended.",
  "photos": ["url1.jpg", "url2.jpg"]
}
```

**Response:**
- Status: `pending` (requires moderation)
- Success message

---

### Like Review
```http
POST /reviews/{id}/like
```

Increments like count

---

## 📰 Blog (Patna Pulse)

### List Blog Posts
```http
GET /blog
```

**Query Parameters:**
- `search` - Search by title or content
- `category` - Filter by category
- `tag` - Filter by tag
- `per_page` - Results per page (default: 12)

---

### Get Latest Posts
```http
GET /blog/latest
```

Returns 6 latest published posts

---

### Get Blog Post
```http
GET /blog/{slug}
```

Returns single blog post (increments view count)

---

### Get Blog Categories
```http
GET /blog/categories
```

Returns available blog categories:
- News
- Events
- Guides
- Festivals
- Lifestyle
- Food
- Education
- Tourism

---

## 🔍 Search

### Search Businesses
```http
GET /search?q={query}
```

Searches across:
- Business name
- Description
- Address
- Category name
- Area name

Returns top 20 results

---

### Get Popular Searches
```http
GET /popular-searches
```

Returns array of popular search terms

---

## 💎 Hidden Gems (Admin Managed)

### List Hidden Gems
```http
GET /hidden-gems
```

**Query Parameters:**
- `category_id` - Filter by category
- `area_id` - Filter by area
- `is_featured` - Filter featured gems (true/false)
- `per_page` - Results per page (default: 12)

**Response includes:**
- Title and story (200-300 words)
- Address and location
- Featured image and gallery
- GMB rating and review count (if synced)
- Category and area info
- View, like, and share counts

---

### Get Latest Hidden Gems (Homepage)
```http
GET /hidden-gems/latest
```

Returns 4 latest hidden gems for homepage display

---

### Get Featured Hidden Gems
```http
GET /hidden-gems/featured
```

Returns 8 featured hidden gems

---

### Get Hidden Gem Details
```http
GET /hidden-gems/{slug}
```

**Response includes:**
- Complete gem details
- GMB reviews (if available)
- Image gallery
- Category and area
- Auto-syncs GMB data if due (24 hours since last sync)

---

### Like Hidden Gem
```http
POST /hidden-gems/{slug}/like
```

Increments like count

**Response:**
```json
{
  "message": "Liked successfully",
  "like_count": 45
}
```

---

### Share Hidden Gem
```http
POST /hidden-gems/{slug}/share
```

Increments share count

---

### Sync GMB Data (Manual)
```http
POST /hidden-gems/{slug}/sync-gmb
```

Manually trigger Google My Business data sync
- Fetches rating and review count
- Caches top 5 GMB reviews
- Updates last sync timestamp

**Requirements:**
- `GOOGLE_PLACES_API_KEY` in `.env`
- Valid `gmb_place_id` configured for gem

**Response:**
```json
{
  "message": "GMB data synced successfully",
  "data": {
    "gmb_rating": 4.7,
    "gmb_review_count": 156,
    "gmb_last_synced": "2024-01-15T10:30:00"
  }
}
```

---

## 📊 Response Format

### Success Response
```json
{
  "id": 1,
  "name": "Business Name",
  "slug": "business-name",
  "category": {
    "id": 1,
    "name": "Category"
  }
}
```

### Paginated Response
```json
{
  "current_page": 1,
  "data": [...],
  "total": 100,
  "per_page": 12,
  "last_page": 9
}
```

### Error Response
```json
{
  "errors": {
    "field": ["Error message"]
  }
}
```

---

## 🔒 Status Codes

- `200` - Success
- `201` - Created
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

---

## 🛡️ CORS

CORS is enabled for frontend at `http://localhost:3000`

Configure in: `backend/laravel/config/cors.php`

---

## 📝 Notes

- All `GET` endpoints support caching
- Soft deletes enabled for businesses
- Auto slug generation from names
- Approval workflow for businesses and reviews
- View counting for businesses and blog posts
- Nearby search uses geolocation (1km radius)
