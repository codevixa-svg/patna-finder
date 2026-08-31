# 🚀 ADMIN DASHBOARD - QUICK START GUIDE

## ✅ What's Been Created

### Backend Files:
1. **Migration**: `2024_01_01_000009_add_admin_fields_to_users_table.php`
2. **Middleware**: `IsAdmin.php`, `IsSuperAdmin.php`
3. **Controllers**:
   - `Admin/AuthController.php` (Login, Logout, Profile)
   - `Admin/DashboardController.php` (Stats & Analytics)
4. **Seeder**: `AdminUserSeeder.php`
5. **Routes**: Admin routes in `routes/api.php`
6. **Model**: Updated `User.php` with roles & permissions

---

## 🎯 Setup in 5 Steps

### Step 1: Run Migration
```bash
cd d:\patna-finder\backend\laravel
php artisan migrate
```

This adds admin fields to users table:
- `role` (super_admin, admin, moderator, user)
- `permissions` (JSON array)
- `is_active` (boolean)
- `last_login_at` (timestamp)
- `avatar` (string)

---

### Step 2: Create Admin Users
```bash
php artisan db:seed --class=AdminUserSeeder
```

**Creates 3 users:**
1. **Super Admin**
   - Email: `admin@patnafinder.com`
   - Password: `admin123`
   - Full access to everything

2. **Admin**
   - Email: `moderator@patnafinder.com`
   - Password: `moderator123`
   - Can manage businesses, hidden gems, blog, reviews

3. **Moderator**
   - Email: `mod@patnafinder.com`
   - Password: `mod123`
   - Can only approve reviews and manage blog

⚠️ **IMPORTANT**: Change these passwords in production!

---

### Step 3: Start Laravel Server
```bash
php artisan serve
```

Backend will run at: `http://localhost:8000`

---

### Step 4: Test Admin Login API

**Using cURL:**
```bash
curl -X POST http://localhost:8000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@patnafinder.com\",\"password\":\"admin123\"}"
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
  "token": "1|xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

**Save the token!** You'll need it for all admin API calls.

---

### Step 5: Test Dashboard API

**Get Dashboard Stats:**
```bash
curl http://localhost:8000/api/v1/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Quick Stats:**
```bash
curl http://localhost:8000/api/v1/admin/dashboard/quick-stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📡 Available Admin API Endpoints

### Authentication
```
POST   /api/v1/admin/login             # Login
POST   /api/v1/admin/logout            # Logout
GET    /api/v1/admin/me                # Get current user
POST   /api/v1/admin/change-password   # Change password
```

### Dashboard
```
GET    /api/v1/admin/dashboard          # Full dashboard data
GET    /api/v1/admin/dashboard/quick-stats  # Quick stats
```

---

## 🎨 Next: Build Frontend Admin Dashboard

### Create Admin Pages in Next.js

```bash
cd d:\patna-finder\frontend
mkdir -p app/admin
mkdir -p app/admin/login
mkdir -p app/admin/businesses
mkdir -p app/admin/hidden-gems
mkdir -p app/admin/reviews
mkdir -p app/admin/blog
```

### Install Required Packages
```bash
npm install @tanstack/react-query zustand recharts react-hook-form zod
npm install @heroicons/react lucide-react
npm install axios
```

---

## 🔐 Admin Dashboard Features Ready

### ✅ Authentication System
- Login with email/password
- JWT token via Laravel Sanctum
- Role-based access control
- Auto logout on token expiry

### ✅ Dashboard Analytics
- Total counts (businesses, reviews, hidden gems, blog)
- Pending items count
- Recent activity feed
- Monthly growth charts
- Top performers
- Rating distribution

### ✅ Security
- Middleware protection (`admin`, `super_admin`)
- Role-based permissions
- Active/inactive user toggle
- Password change functionality
- Last login tracking

---

## 📊 Dashboard Data Available

The `/admin/dashboard` endpoint provides:

**Stats:**
- Total/Pending/Approved businesses
- Verified/Featured businesses
- Hidden gems (total/active/featured)
- Reviews (total/pending/approved)
- Blog posts (total/published/draft)
- Categories & Areas counts
- User counts

**Recent Activity:**
- Latest 5 businesses
- Latest 5 reviews
- Latest 5 hidden gems

**Top Performers:**
- Top 10 businesses by rating
- Top 10 categories by business count
- Top 10 areas by business count

**Charts Data:**
- Monthly businesses (last 6 months)
- Monthly reviews (last 6 months)
- Rating distribution

---

## 🛠️ What's Next?

### Immediate Tasks:
1. ✅ Backend setup (Done!)
2. ⏳ Build admin login page in Next.js
3. ⏳ Build admin dashboard page
4. ⏳ Create admin layout with sidebar
5. ⏳ Build CRUD pages for:
   - Businesses
   - Hidden Gems
   - Reviews
   - Blog Posts
   - Categories
   - Areas
   - Users

### Advanced Features (Future):
- Image upload functionality
- Rich text editor for blog
- GMB sync interface
- Activity logs
- Email notifications
- Two-factor authentication
- Audit trail
- Export data to CSV/Excel

---

## 🎯 Testing Checklist

- [ ] Run migration successfully
- [ ] Seed admin users
- [ ] Start Laravel server
- [ ] Login as super admin via API
- [ ] Get dashboard stats
- [ ] Login as regular admin
- [ ] Login as moderator
- [ ] Verify role-based access
- [ ] Change password
- [ ] Logout

---

## 📝 Important Notes

1. **Default Passwords**: 
   - All default passwords are weak
   - Change them immediately in production
   - Use strong passwords (min 12 characters)

2. **API Token**:
   - Save the token from login response
   - Include in all admin API calls: `Authorization: Bearer {token}`
   - Token expires based on Laravel Sanctum config

3. **Roles Hierarchy**:
   - `super_admin` > `admin` > `moderator` > `user`
   - Super admin bypasses all permission checks
   - Admin has predefined permissions
   - Moderator has limited permissions

4. **Permissions Array**:
   ```json
   [
     "manage_businesses",
     "manage_hidden_gems",
     "manage_reviews",
     "manage_blog",
     "manage_categories",
     "manage_areas",
     "manage_users"
   ]
   ```

---

## 🚨 Troubleshooting

### Error: "Route [login] not defined"
**Fix**: Admin routes use API authentication, not web login route.

### Error: "Unauthenticated"
**Fix**: Include `Authorization: Bearer {token}` header in requests.

### Error: "Unauthorized. Admin access required"
**Fix**: User role must be `admin` or `super_admin`.

### Token Not Working
**Fix**: 
1. Check token is correct
2. Verify user is active (`is_active = true`)
3. Check Laravel Sanctum config

---

## 📞 Quick Commands Reference

```bash
# Create super admin manually
php artisan tinker
User::create(['name'=>'Admin','email'=>'admin@test.com','password'=>Hash::make('pass'),'role'=>'super_admin','is_active'=>true]);

# Check admin users
User::whereIn('role', ['super_admin', 'admin'])->get();

# Reset admin password
$user = User::find(1);
$user->password = Hash::make('newpassword');
$user->save();

# Deactivate user
User::find(1)->update(['is_active' => false]);
```

---

## ✅ You're Ready!

Backend admin system is fully functional. Now you can:
1. Login as admin
2. Get dashboard statistics
3. Start building frontend admin pages

Next step: **Create admin UI in Next.js** 🎨
