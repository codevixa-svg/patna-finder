# 🔗 ADMIN DASHBOARD - ACCESS URLS

## 📍 Backend API URLs (Laravel)

### Base URL
```
http://localhost:8000/api/v1
```

---

## 🔐 Authentication Endpoints

### Admin Login
```
POST http://localhost:8000/api/v1/admin/login
```

**Request Body:**
```json
{
  "email": "admin@patnafinder.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "Super Admin",
    "email": "admin@patnafinder.com",
    "role": "super_admin",
    "permissions": null,
    "avatar": null
  },
  "token": "1|xxxxxxxxxxxxxxxxxxxx"
}
```

---

### Get Current Admin User
```
GET http://localhost:8000/api/v1/admin/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### Admin Logout
```
POST http://localhost:8000/api/v1/admin/logout
Authorization: Bearer YOUR_TOKEN_HERE
```

---

### Change Password
```
POST http://localhost:8000/api/v1/admin/change-password
Authorization: Bearer YOUR_TOKEN_HERE

Body:
{
  "current_password": "admin123",
  "new_password": "newpassword123",
  "new_password_confirmation": "newpassword123"
}
```

---

## 📊 Dashboard Endpoints

### Full Dashboard Analytics
```
GET http://localhost:8000/api/v1/admin/dashboard
Authorization: Bearer YOUR_TOKEN_HERE
```

**Returns:**
- Overview statistics (all counts)
- Recent activity (businesses, reviews, hidden gems)
- Top performers (businesses, categories, areas)
- Chart data (monthly trends, rating distribution)

---

### Quick Stats (For Dashboard Cards)
```
GET http://localhost:8000/api/v1/admin/dashboard/quick-stats
Authorization: Bearer YOUR_TOKEN_HERE
```

**Returns:**
```json
{
  "businesses": {
    "total": 150,
    "pending": 12,
    "today": 3,
    "this_month": 25
  },
  "reviews": {
    "total": 850,
    "pending": 23,
    "today": 15,
    "average_rating": 4.3
  },
  "hidden_gems": {
    "total": 15,
    "active": 15,
    "featured": 8,
    "total_views": 12500
  },
  "blog": {
    "total": 45,
    "published": 38,
    "draft": 7,
    "total_views": 45000
  }
}
```

---

## 🌐 Frontend Dashboard URLs (Next.js)

### Base URL
```
http://localhost:3000
```

---

### Admin Routes Structure

```
http://localhost:3000/admin/login                    # Login page
http://localhost:3000/admin                          # Dashboard home
http://localhost:3000/admin/dashboard                # Same as above

http://localhost:3000/admin/businesses               # All businesses
http://localhost:3000/admin/businesses/pending       # Pending approval
http://localhost:3000/admin/businesses/create        # Add new business
http://localhost:3000/admin/businesses/123           # View business
http://localhost:3000/admin/businesses/123/edit      # Edit business

http://localhost:3000/admin/hidden-gems              # All hidden gems
http://localhost:3000/admin/hidden-gems/create       # Add new gem
http://localhost:3000/admin/hidden-gems/123          # View gem
http://localhost:3000/admin/hidden-gems/123/edit     # Edit gem
http://localhost:3000/admin/hidden-gems/reorder      # Reorder gems

http://localhost:3000/admin/reviews                  # All reviews
http://localhost:3000/admin/reviews/pending          # Pending reviews
http://localhost:3000/admin/reviews/123              # View review

http://localhost:3000/admin/blog                     # All blog posts
http://localhost:3000/admin/blog/create              # Create new post
http://localhost:3000/admin/blog/drafts              # Draft posts
http://localhost:3000/admin/blog/123                 # View post
http://localhost:3000/admin/blog/123/edit            # Edit post

http://localhost:3000/admin/categories               # Manage categories
http://localhost:3000/admin/categories/123/edit      # Edit category

http://localhost:3000/admin/areas                    # Manage areas
http://localhost:3000/admin/areas/123/edit           # Edit area

http://localhost:3000/admin/users                    # User management (Super Admin)
http://localhost:3000/admin/users/create             # Create new user
http://localhost:3000/admin/users/123/edit           # Edit user

http://localhost:3000/admin/settings                 # Admin settings
http://localhost:3000/admin/profile                  # Admin profile
```

---

## 🧪 Testing URLs (Development)

### Using Browser (GET requests)

**Dashboard Stats:**
```
http://localhost:8000/api/v1/admin/dashboard
```
⚠️ Note: Browser won't include Authorization header. Use Postman or curl.

---

### Using Postman

1. **Login:**
   - Method: POST
   - URL: `http://localhost:8000/api/v1/admin/login`
   - Body (JSON):
     ```json
     {
       "email": "admin@patnafinder.com",
       "password": "admin123"
     }
     ```
   - Copy the `token` from response

2. **Dashboard:**
   - Method: GET
   - URL: `http://localhost:8000/api/v1/admin/dashboard`
   - Headers:
     - `Authorization`: `Bearer YOUR_TOKEN_HERE`
     - `Accept`: `application/json`

---

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:8000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@patnafinder.com","password":"admin123"}'
```

**Dashboard (Replace TOKEN):**
```bash
curl http://localhost:8000/api/v1/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

**Quick Stats:**
```bash
curl http://localhost:8000/api/v1/admin/dashboard/quick-stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

---

## 🔑 Default Login Credentials

### Super Admin
```
URL: http://localhost:3000/admin/login
Email: admin@patnafinder.com
Password: admin123
```

### Admin
```
URL: http://localhost:3000/admin/login
Email: moderator@patnafinder.com
Password: moderator123
```

### Moderator
```
URL: http://localhost:3000/admin/login
Email: mod@patnafinder.com
Password: mod123
```

⚠️ **IMPORTANT**: Change these passwords in production!

---

## 🚀 Quick Start Commands

### Start Backend (Laravel)
```bash
cd d:\patna-finder\backend\laravel
php artisan serve
```
Backend runs at: `http://localhost:8000`

---

### Start Frontend (Next.js)
```bash
cd d:\patna-finder\frontend
npm run dev
```
Frontend runs at: `http://localhost:3000`

---

## 📱 Production URLs (Future)

### Backend API
```
https://api.patnafinder.com/api/v1
```

### Admin Dashboard
```
https://admin.patnafinder.com
```

### Frontend Website
```
https://patnafinder.com
```

---

## 🔒 Security Notes

1. **HTTPS Required in Production**
   - Never use HTTP for admin panel in production
   - SSL certificate required

2. **Token Storage**
   - Store token in localStorage or httpOnly cookie
   - Token expires after session timeout
   - Include in all admin API requests

3. **CORS Configuration**
   - Backend allows frontend origin
   - Configured in `config/cors.php`

4. **Rate Limiting**
   - Login attempts limited to prevent brute force
   - API rate limits apply

---

## 🧪 Testing Workflow

### Step 1: Start Servers
```bash
# Terminal 1 - Backend
cd d:\patna-finder\backend\laravel
php artisan serve

# Terminal 2 - Frontend
cd d:\patna-finder\frontend
npm run dev
```

### Step 2: Access Admin Login
Open browser: `http://localhost:3000/admin/login`

### Step 3: Login with Super Admin
- Email: `admin@patnafinder.com`
- Password: `admin123`

### Step 4: View Dashboard
After login, redirected to: `http://localhost:3000/admin`

### Step 5: Test API Directly
Use Postman/curl to test backend APIs

---

## 📊 API Response Format

### Success Response
```json
{
  "id": 1,
  "name": "Business Name",
  "status": "approved"
}
```

### Paginated Response
```json
{
  "data": [...],
  "current_page": 1,
  "last_page": 10,
  "per_page": 15,
  "total": 150
}
```

### Error Response
```json
{
  "message": "Unauthenticated.",
  "errors": {
    "field": ["Error message"]
  }
}
```

---

## 🎯 Complete URL Reference

| Resource | URL | Method | Auth Required |
|----------|-----|--------|---------------|
| Login | `/api/v1/admin/login` | POST | No |
| Logout | `/api/v1/admin/logout` | POST | Yes |
| Me | `/api/v1/admin/me` | GET | Yes |
| Dashboard | `/api/v1/admin/dashboard` | GET | Yes |
| Quick Stats | `/api/v1/admin/dashboard/quick-stats` | GET | Yes |
| Change Password | `/api/v1/admin/change-password` | POST | Yes |

---

## ✅ Checklist Before Testing

- [ ] Laravel server running on port 8000
- [ ] Database migrated with admin fields
- [ ] Admin users seeded
- [ ] Middleware registered in Kernel.php
- [ ] Routes added to api.php
- [ ] Test login with Postman/curl
- [ ] Verify token received
- [ ] Test dashboard API with token

---

## 🆘 Troubleshooting

### "Connection refused"
- Check Laravel server is running
- Verify port 8000 is not in use

### "404 Not Found"
- Check route exists in `routes/api.php`
- Clear route cache: `php artisan route:clear`

### "401 Unauthenticated"
- Login first to get token
- Include `Authorization: Bearer {token}` header

### "403 Unauthorized"
- User role must be admin/super_admin
- Check user `is_active = true`

### "500 Internal Server Error"
- Check Laravel logs: `storage/logs/laravel.log`
- Verify database connection

---

## 📧 Need Help?

Check documentation:
- `ADMIN_SETUP_QUICK_START.md`
- `ADMIN_DASHBOARD_COMPLETE.md`

---

**Dashboard is ready! Happy coding! 🎉**
