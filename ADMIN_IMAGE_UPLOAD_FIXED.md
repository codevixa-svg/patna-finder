# Admin Business Creation - Image Upload Fixed

## Problem
Logo, cover image, and gallery photos were not saving to database when creating a business through admin panel.

## Root Cause
The `adminBusinessesApi.uploadImageBase64()` function was posting to the wrong endpoint:
- **Wrong**: `POST /admin/businesses` with parameters `{image_base64, image_type}`
- **Correct**: `POST /user/upload-image-base64` with parameters `{image, type}`

The wrong endpoint was actually the business creation endpoint, not an image upload endpoint.

## Solution

### 1. Fixed API Endpoint (`frontend/lib/adminApi.ts`)
```typescript
// BEFORE (WRONG)
uploadImageBase64: async (base64: string, type: string = 'logo') => {
  const response = await adminApi.post('/admin/businesses', { 
    image_base64: base64, 
    image_type: type 
  });
  return response.data;
}

// AFTER (CORRECT)
uploadImageBase64: async (base64: string, type: string = 'logo') => {
  const response = await adminApi.post('/user/upload-image-base64', { 
    image: base64, 
    type: type 
  });
  return response.data;
}
```

### 2. Fixed State Updates (`frontend/app/admin/businesses/create/page.tsx`)
Changed from direct object spread to functional state updates to ensure proper re-renders:

```typescript
// BEFORE (PROBLEMATIC)
setFormData({ ...formData, logo: uploadResponse.url });

// AFTER (CORRECT)
setFormData(prev => ({ ...prev, logo: uploadResponse.url }));
```

Applied to:
- Logo upload (line ~850)
- Cover image upload (line ~895)

### 3. Added Debug Logging
Console logs added to track upload responses:
- `[Logo Upload] Response:` - Shows logo upload result
- `[Cover Upload] Response:` - Shows cover upload result  
- `[Gallery Upload] Response:` - Shows gallery upload result

## Backend Endpoint Details

**Endpoint**: `POST /api/v1/user/upload-image-base64`

**Controller**: `App\Http\Controllers\Api\User\ImageUploadController@uploadBase64`

**Request Body**:
```json
{
  "image": "data:image/jpeg;base64,...",
  "type": "logo|cover|gallery|update"
}
```

**Response**:
```json
{
  "success": true,
  "url": "/storage/businesses/logo/1234567890_abc123.jpg",
  "path": "businesses/logo/1234567890_abc123.jpg",
  "filename": "1234567890_abc123.jpg"
}
```

**Features**:
- Stores to `storage/app/public/businesses/{type}/`
- Also copies to `public/storage/` for servers without symlink support
- Validates file types (JPEG, PNG, JPG only)
- Generates unique filenames with timestamp + random string
- Returns full URL for immediate use

## Testing Steps

1. Go to Admin Dashboard → Businesses → Create New Business
2. Fill in Owner Email and other required fields
3. Upload Logo - should see "Logo uploaded successfully!" toast
4. Upload Cover Image - should see "Cover image uploaded successfully!" toast
5. Upload Gallery Photos - should see "X photos uploaded successfully!" toast
6. Check browser console for `[Logo/Cover/Gallery Upload] Response:` logs
7. Verify preview images appear in the form
8. Submit form - business should save with all images

## Files Modified
- `frontend/lib/adminApi.ts` - Fixed upload endpoint and parameters
- `frontend/app/admin/businesses/create/page.tsx` - Fixed state updates, added logging

## Status
✅ **FIXED** - Image uploads now use correct backend endpoint with proper parameters
