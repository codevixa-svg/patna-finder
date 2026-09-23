<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Business;
use App\Models\Category;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BusinessController extends Controller
{
    /**
     * Generate a clean, unique kebab-case slug for a business name.
     * Appends a numeric suffix (-2, -3, ...) only when the slug is already taken.
     */
    protected function generateUniqueSlug(string $name): string
    {
        $base = Str::slug($name) ?: 'business';
        $slug = $base;
        $counter = 2;
        while (Business::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $counter;
            $counter++;
        }
        return $slug;
    }

    /**
     * Add a scheme to a URL that is missing one (e.g. "www.example.com"
     * becomes "https://www.example.com") so Laravel's `url` rule accepts
     * the common way users type website addresses.
     */
    protected function normalizeUrl(?string $url): ?string
    {
        if ($url === null) {
            return null;
        }
        $url = trim($url);
        if ($url !== '' && !preg_match('#^[a-z][a-z0-9+.\-]*://#i', $url)) {
            $url = 'https://' . $url;
        }
        return $url;
    }

    public function index(Request $request)
    {
        $user = $request->user();

        $businesses = Business::where('user_id', $user->id)
            ->with(['category:id,name', 'area:id,name'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $businesses
        ]);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();

        $business = Business::where('user_id', $user->id)
            ->where('id', $id)
            ->with(['category', 'area', 'reviews'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $business
        ]);
    }

    public function store(Request $request)
    {
        // Normalize user input before validation
        if ($request->filled('website')) {
            $request->merge(['website' => $this->normalizeUrl($request->website)]);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'area_id' => 'required|exists:areas,id',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'tagline' => 'nullable|string|max:255',
            'established_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            
            // Contact
            'phone' => 'nullable|string|max:20',
            'alternate_phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'website' => 'nullable|url',
            'whatsapp' => 'nullable|string|max:20',
            'inquiry_email' => 'nullable|email',
            'inquiry_preference' => 'nullable|in:email,phone,whatsapp',
            
            // Location
            'address' => 'nullable|string',
            'address_line2' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'pincode' => 'nullable|string|max:10',
            'country' => 'nullable|string',
            'landmark' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'google_map_location' => 'nullable|string',
            
            // Hours
            'opening_hours' => 'nullable|json',
            
            // Media
            'logo' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'gallery' => 'nullable|json',
            'videos' => 'nullable|json',
            
            // Services
            'services' => 'nullable|json',
            
            // Social
            'social_links' => 'nullable|json',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['user_id'] = $request->user()->id;
        $data['slug'] = $this->generateUniqueSlug($request->name);
        $data['status'] = 'pending';

        $business = Business::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Business submitted successfully and is pending approval',
            'data' => $business
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        $business = Business::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        // Normalize user input before validation
        if ($request->filled('website')) {
            $request->merge(['website' => $this->normalizeUrl($request->website)]);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'area_id' => 'sometimes|exists:areas,id',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'tagline' => 'nullable|string|max:255',
            'established_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            
            'phone' => 'nullable|string|max:20',
            'alternate_phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'website' => 'nullable|url',
            'whatsapp' => 'nullable|string|max:20',
            'inquiry_email' => 'nullable|email',
            'inquiry_preference' => 'nullable|in:email,phone,whatsapp',
            
            'address' => 'nullable|string',
            'address_line2' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
            'pincode' => 'nullable|string|max:10',
            'country' => 'nullable|string',
            'landmark' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'google_map_location' => 'nullable|string',
            
            'opening_hours' => 'nullable|json',
            
            'logo' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'gallery' => 'nullable|json',
            'videos' => 'nullable|json',
            
            'services' => 'nullable|json',
            'social_links' => 'nullable|json',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['user_id', 'slug', 'status']);
        
        if ($request->has('name') && $request->name !== $business->name) {
            $data['slug'] = $this->generateUniqueSlug($request->name);
        }

        $business->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Business updated successfully',
            'data' => $business->fresh()
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $business = Business::where('user_id', $user->id)
            ->where('id', $id)
            ->firstOrFail();

        $business->delete();

        return response()->json([
            'success' => true,
            'message' => 'Business deleted successfully'
        ]);
    }

    public function saveDraft(Request $request)
    {
        // Normalize user input before validation
        if ($request->filled('website')) {
            $request->merge(['website' => $this->normalizeUrl($request->website)]);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'area_id' => 'nullable|exists:areas,id',
            'description' => 'nullable|string',
            'short_description' => 'nullable|string|max:500',
            'tagline' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'website' => 'nullable|url',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'opening_hours' => 'nullable',
            'services' => 'nullable',
            'social_links' => 'nullable',
            'gallery' => 'nullable',
            'logo' => 'nullable|string',
            'cover_image' => 'nullable|string',
        ]);

        $data = $validator->validated();
        $data['user_id'] = $request->user()->id;
        $data['status'] = 'draft';

        // The businesses table has NOT NULL columns without defaults — fill
        // placeholders so a partial draft can always be saved (prevents SQL 500s).
        $data['name'] = $data['name'] ?? 'Untitled Business';
        $data['address'] = $data['address'] ?? 'Address not provided';
        $data['category_id'] = $data['category_id'] ?? 1;
        $data['area_id'] = $data['area_id'] ?? 1;

        $data['slug'] = Str::slug($data['name']) . '-' . Str::random(6);

        $business = Business::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Draft saved successfully',
            'data' => $business
        ], 201);
    }
}
