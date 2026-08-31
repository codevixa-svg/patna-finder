# 📊 Data Flow - Complete Guide

## Kaha Save Hoga Data?

### Quick Answer:
**MySQL Database** → **`businesses` table** → **Laravel Backend** → **Frontend ko API se milega**

---

## 🔄 Complete Data Flow

```
User Fill Form (Frontend)
        ↓
React State (formData)
        ↓
API Call (userBusinessApi.create())
        ↓
Laravel Backend (BusinessController)
        ↓
MySQL Database (businesses table)
        ↓
Success Response
        ↓
Redirect to /dashboard/businesses
```

---

## 1️⃣ Frontend - Data Collection

### File: `frontend/app/dashboard/add-business/page.tsx`

#### State Variables:
```typescript
const [formData, setFormData] = useState({
  name: '',
  category_id: '',
  tagline: '',
  short_description: '',
  description: '',
  established_year: '',
  logo: '',
  cover_image: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  city: 'Patna',
  state: 'Bihar',
  pincode: '',
  // ... etc
});

const [services, setServices] = useState<Service[]>([]);
const [openingHours, setOpeningHours] = useState<OpeningHours>({...});
const [socialLinks, setSocialLinks] = useState<SocialLinks>({...});
```

#### Submit Function:
```typescript
const handleSubmit = async () => {
  const submitData = {
    ...formData,
    services: JSON.stringify(services),          // Convert to JSON
    opening_hours: JSON.stringify(openingHours), // Convert to JSON
    social_links: JSON.stringify(socialLinks),   // Convert to JSON
  };

  // API Call
  await userBusinessApi.create(submitData);
};
```

---

## 2️⃣ API Layer - Network Request

### File: `frontend/lib/userApi.ts`

```typescript
export const userBusinessApi = {
  // Create New Business
  create: async (data: any) => {
    const response = await userApi.post('/user/businesses', data);
    return response.data;
  },

  // Update Existing
  update: async (id: number, data: any) => {
    const response = await userApi.put(`/user/businesses/${id}`, data);
    return response.data;
  },

  // Save Draft
  saveDraft: async (data: any) => {
    const response = await userApi.post('/user/businesses/draft', data);
    return response.data;
  },
};
```

**API Endpoints:**
- `POST /api/v1/user/businesses` → Create
- `PUT /api/v1/user/businesses/{id}` → Update
- `POST /api/v1/user/businesses/draft` → Save Draft

---

## 3️⃣ Backend - Laravel API

### File: `backend/laravel/routes/api.php`

```php
Route::middleware('auth:sanctum')->prefix('user')->group(function () {
    Route::apiResource('businesses', BusinessController::class);
    Route::post('businesses/draft', [BusinessController::class, 'saveDraft']);
});
```

### File: `backend/laravel/app/Http/Controllers/Api/User/BusinessController.php`

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'category_id' => 'required|exists:categories,id',
        'phone' => 'required|string',
        'address' => 'required|string',
        // ... all fields
    ]);

    $validated['user_id'] = auth()->id();
    $validated['slug'] = Str::slug($validated['name']);
    $validated['status'] = 'pending'; // Pending approval

    $business = Business::create($validated);

    return response()->json([
        'message' => 'Business submitted successfully!',
        'data' => $business
    ]);
}
```

---

## 4️⃣ Database - MySQL Storage

### Database: `patna_finder`
### Table: `businesses`

#### Structure:
```sql
CREATE TABLE businesses (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNSIGNED,              -- Logged in user
    
    -- Step 1: Basic Details
    name VARCHAR(255),
    slug VARCHAR(255) UNIQUE,
    category_id BIGINT UNSIGNED,
    area_id BIGINT UNSIGNED,
    tagline VARCHAR(255),
    short_description VARCHAR(500),
    description TEXT,
    established_year YEAR,
    logo VARCHAR(255),
    cover_image VARCHAR(255),
    
    -- Step 2: Contact
    phone VARCHAR(255),
    alternate_phone VARCHAR(255),
    email VARCHAR(255),
    website VARCHAR(255),
    whatsapp VARCHAR(255),
    inquiry_email VARCHAR(255),
    inquiry_preference ENUM('email', 'phone', 'whatsapp'),
    
    -- Step 3: Location
    address TEXT,
    address_line2 VARCHAR(255),
    city VARCHAR(255) DEFAULT 'Patna',
    state VARCHAR(255) DEFAULT 'Bihar',
    pincode VARCHAR(255),
    country VARCHAR(255) DEFAULT 'India',
    landmark VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    google_map_location TEXT,
    
    -- Step 4: Hours (JSON)
    opening_hours JSON,
    
    -- Step 5: Services (JSON)
    services JSON,
    amenities JSON,
    
    -- Step 6: Gallery (JSON)
    gallery JSON,
    videos JSON,
    
    -- Step 7: Social (JSON)
    social_links JSON,
    
    -- Stats
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    
    -- Admin Flags
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_sponsored BOOLEAN DEFAULT FALSE,
    is_trending BOOLEAN DEFAULT FALSE,
    is_popular BOOLEAN DEFAULT FALSE,
    is_hidden_gem BOOLEAN DEFAULT FALSE,
    
    -- Status
    status ENUM('draft', 'pending', 'approved', 'rejected') DEFAULT 'pending',
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Timestamps
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

---

## 📝 JSON Fields Structure

### 1. Opening Hours (Step 4)
```json
{
  "monday": {
    "is_open": true,
    "open_time": "09:00",
    "close_time": "18:00"
  },
  "tuesday": {...},
  ...
}
```

### 2. Services (Step 5)
```json
[
  {
    "id": 1,
    "name": "Digital Marketing",
    "description": "SEO, Social Media, Google Ads",
    "price": "₹15,000",
    "active": true
  },
  ...
]
```

### 3. Gallery (Step 6)
```json
[
  "uploads/businesses/123/photo1.jpg",
  "uploads/businesses/123/photo2.jpg",
  ...
]
```

### 4. Social Links (Step 7)
```json
{
  "facebook": {
    "enabled": true,
    "url": "https://facebook.com/business"
  },
  "instagram": {
    "enabled": true,
    "url": "https://instagram.com/business"
  },
  ...
}
```

---

## 🔐 User Authentication

### How User is Linked:
```php
$validated['user_id'] = auth()->id();
```

**Meaning:**
- Current logged-in user ki ID automatically save hoti hai
- Business usi user ke naam pe register hoga
- User sirf apne businesses dekh/edit kar sakta

---

## 📊 Status Flow

### New Business Submission:
```
User Submits Form
    ↓
status = 'pending'
    ↓
Admin Dashboard me dikhta hai
    ↓
Admin Approve/Reject karta hai
    ↓
status = 'approved' or 'rejected'
    ↓
Approved businesses public site pe dikhengi
```

---

## 🗂️ File Storage (Future)

### Logo & Cover Image:
```
backend/laravel/storage/app/public/uploads/businesses/{business_id}/
    ├── logo.jpg
    ├── cover.jpg
    └── gallery/
        ├── photo1.jpg
        ├── photo2.jpg
        └── photo3.jpg
```

**URL Access:**
```
http://localhost:8000/storage/uploads/businesses/123/logo.jpg
```

---

## 🔍 Data Retrieval

### Get User's Businesses:
```typescript
const businesses = await userBusinessApi.getAll();
```

**API:** `GET /api/v1/user/businesses`

**Returns:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "ABC Digital Solutions",
      "status": "pending",
      "category": {...},
      "area": {...},
      ...
    }
  ]
}
```

### Get Single Business:
```typescript
const business = await userBusinessApi.getOne(id);
```

**API:** `GET /api/v1/user/businesses/{id}`

---

## 🎯 Complete Example

### User Action: Submit Business Form

**1. Frontend (React):**
```typescript
const formData = {
  name: "ABC Digital Solutions",
  category_id: "5",
  phone: "9876543210",
  address: "Boring Road, Patna",
  // ... all fields
};

const services = [
  { name: "SEO", price: "10000", active: true }
];

const submitData = {
  ...formData,
  services: JSON.stringify(services)
};

await userBusinessApi.create(submitData);
```

**2. Backend (Laravel):**
```php
// Validates data
$validated = $request->validate([...]);

// Add user ID
$validated['user_id'] = auth()->id(); // e.g., 42

// Create slug
$validated['slug'] = 'abc-digital-solutions';

// Set status
$validated['status'] = 'pending';

// Save to database
$business = Business::create($validated);
```

**3. Database (MySQL):**
```sql
INSERT INTO businesses (
    user_id,
    name,
    slug,
    category_id,
    phone,
    address,
    services,
    status,
    created_at,
    updated_at
) VALUES (
    42,
    'ABC Digital Solutions',
    'abc-digital-solutions',
    5,
    '9876543210',
    'Boring Road, Patna',
    '[{"name":"SEO","price":"10000","active":true}]',
    'pending',
    NOW(),
    NOW()
);
```

**4. Response to Frontend:**
```json
{
  "message": "Business submitted successfully! Pending approval.",
  "data": {
    "id": 123,
    "name": "ABC Digital Solutions",
    "status": "pending",
    ...
  }
}
```

---

## 📍 Database Location

### Windows:
```
C:\xampp\mysql\data\patna_finder\businesses.ibd
```

### MySQL Command:
```sql
USE patna_finder;
SELECT * FROM businesses WHERE user_id = 42;
```

---

## 🔧 Backup & Export

### Export Database:
```bash
cd C:\xampp\mysql\bin
mysqldump -u root patna_finder > backup.sql
```

### Import Database:
```bash
mysql -u root patna_finder < backup.sql
```

---

## ✅ Summary

**Data Flow:**
1. **Frontend** → User fills form
2. **API** → POST to Laravel backend
3. **Backend** → Validates & processes
4. **Database** → Saves in `businesses` table
5. **Response** → Success message to user

**Storage:**
- **MySQL Database**: `patna_finder.businesses`
- **Files**: `storage/app/public/uploads/businesses/`
- **User Link**: `user_id` field

**Status:**
- New: `pending` (awaiting admin approval)
- Approved: `approved` (visible on site)
- Rejected: `rejected` (not shown)
- Draft: `draft` (incomplete submission)

---

**Database Path:** `C:\xampp\mysql\data\patna_finder\`
**Table:** `businesses`
**Backend:** Laravel API
**Frontend:** React/Next.js
