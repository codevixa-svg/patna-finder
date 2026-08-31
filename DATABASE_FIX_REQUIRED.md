# 🔴 DATABASE NOT RUNNING - FIX REQUIRED

## Error: Categories API Returning 500

**Error Message:**
```
SQLSTATE[HY000] [2002] No connection could be made because 
the target machine actively refused it
```

---

## Problem:

**MySQL/Database server is NOT running!**

The backend Laravel server is running, but it cannot connect to MySQL database.

---

## Solution: Start MySQL/Database Server

### If using XAMPP:
1. Open **XAMPP Control Panel**
2. Click **Start** button next to **MySQL**
3. Wait for it to turn green
4. MySQL should now be running on port 3306

### If using standalone MySQL:
```bash
# Start MySQL service
net start mysql
```

### Alternative - Start XAMPP MySQL via command:
```bash
"C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini"
```

---

## Verification:

After starting MySQL, test the categories API:

```bash
curl http://localhost:8000/api/v1/categories
```

**Expected Response:** Array of categories (10 items)

---

## Current Status:

- ❌ **MySQL:** NOT Running
- ✅ **Backend:** Running (port 8000)
- ✅ **Frontend:** Running (port 3000)
- ✅ **Categories:** Seeded in database (10 entries)
- ❌ **Categories API:** Failing due to MySQL not running

---

## After MySQL is Running:

1. ✅ Categories will load in dropdown
2. ✅ Draft save will work
3. ✅ Add business form will work completely

---

## Quick Test Script:

```powershell
# Test MySQL connection
Test-NetConnection -ComputerName localhost -Port 3306

# If successful, test categories API
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/categories"
```

---

## Next Steps:

1. **START MYSQL** (via XAMPP or service)
2. Verify connection with Test-NetConnection
3. Test categories API
4. Refresh add-business page
5. Categories should now load in dropdown!

---

**Priority:** HIGH - Nothing will work without database connection!
