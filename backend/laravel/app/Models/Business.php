<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Business extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        // Basic Info
        'user_id',
        'name',
        'slug',
        'category_id',
        'area_id',
        
        // Step 1: Business Details
        'tagline',
        'short_description',
        'description',
        'established_year',
        'logo',
        'cover_image',
        'featured_image',
        
        // Step 2: Contact Information
        'phone',
        'alternate_phone',
        'email',
        'website',
        'whatsapp',
        'inquiry_email',
        'inquiry_preference',
        
        // Step 3: Location
        'address',
        'address_line2',
        'city',
        'state',
        'pincode',
        'country',
        'landmark',
        'latitude',
        'longitude',
        'google_map_location',
        
        // Step 4: Business Hours
        'opening_hours',
        
        // Step 5: Services & Amenities
        'services',
        'amenities',
        
        // Step 6: Photos & Videos
        'gallery',
        'videos',
        
        // Step 7: Social Links
        'social_links',
        
        // Analytics & Stats
        'rating',
        'review_count',
        'view_count',
        
        // Admin Flags
        'is_verified',
        'is_featured',
        'is_sponsored',
        'is_trending',
        'is_popular',
        'is_hidden_gem',
        
        // Status & SEO
        'status',
        'meta_title',
        'meta_description'
    ];

    protected $casts = [
        'gallery' => 'array',
        'videos' => 'array',
        'opening_hours' => 'array',
        'social_links' => 'array',
        'amenities' => 'array',
        'services' => 'array',
        'rating' => 'decimal:2',
        'is_verified' => 'boolean',
        'is_featured' => 'boolean',
        'is_sponsored' => 'boolean',
        'is_trending' => 'boolean',
        'is_popular' => 'boolean',
        'is_hidden_gem' => 'boolean',
    ];

    // Computed attributes included in every JSON response
    protected $appends = ['is_open_now'];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($business) {
            if (empty($business->slug)) {
                $business->slug = Str::slug($business->name);
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function awards()
    {
        return $this->hasMany(Award::class);
    }

    public function faqs()
    {
        return $this->hasMany(Faq::class);
    }

    /**
     * Normalize opening_hours on write so the database always stores ONE canonical format:
     * { "monday": { "is_open": true, "open_time": "09:00", "close_time": "18:00" }, ... }
     * Accepts JSON strings (also accidentally double-encoded ones) or arrays,
     * and legacy keys (open/close/closed).
     */
    public function setOpeningHoursAttribute($value)
    {
        if (empty($value)) {
            $this->attributes['opening_hours'] = null;
            return;
        }

        $hours = $value;

        // Decode JSON strings — loop handles accidentally double-encoded values
        for ($i = 0; $i < 2 && is_string($hours); $i++) {
            $decoded = json_decode($hours, true);
            $hours = json_last_error() === JSON_ERROR_NONE ? $decoded : null;
        }

        if (!is_array($hours)) {
            $this->attributes['opening_hours'] = null;
            return;
        }

        $normalized = [];
        foreach ($hours as $day => $dayHours) {
            if (!is_array($dayHours)) {
                continue;
            }
            $isOpen = array_key_exists('is_open', $dayHours)
                ? (bool) $dayHours['is_open']
                : !($dayHours['closed'] ?? false);
            $normalized[strtolower($day)] = [
                'is_open'    => $isOpen,
                'open_time'  => $dayHours['open_time'] ?? $dayHours['open'] ?? null,
                'close_time' => $dayHours['close_time'] ?? $dayHours['close'] ?? null,
            ];
        }

        $this->attributes['opening_hours'] = json_encode($normalized);
    }

    /**
     * Whether the business is open right now.
     * Always evaluated against Asia/Kolkata time (Patna) so the result is
     * correct even when the server timezone is UTC.
     */
    public function isOpenNow()
    {
        if (empty($this->opening_hours)) {
            return null;
        }

        $now = now('Asia/Kolkata');
        $day = strtolower($now->format('l'));
        $minutesNow = ((int) $now->format('H')) * 60 + (int) $now->format('i');

        $todayHours = $this->opening_hours[$day] ?? null;
        if (!is_array($todayHours)) {
            return false;
        }

        $isOpenDay = array_key_exists('is_open', $todayHours)
            ? (bool) $todayHours['is_open']
            : !($todayHours['closed'] ?? false);
        if (!$isOpenDay) {
            return false;
        }

        $open = $todayHours['open_time'] ?? $todayHours['open'] ?? null;
        $close = $todayHours['close_time'] ?? $todayHours['close'] ?? null;
        if (!$open || !$close) {
            return false;
        }

        $toMinutes = function ($time) {
            $parts = explode(':', $time);
            return ((int) ($parts[0] ?? 0)) * 60 + (int) ($parts[1] ?? 0);
        };

        $openM = $toMinutes($open);
        $closeM = $toMinutes($close);

        // Overnight hours (e.g. 21:00 - 02:00)
        if ($closeM <= $openM) {
            return $minutesNow >= $openM || $minutesNow <= $closeM;
        }

        return $minutesNow >= $openM && $minutesNow <= $closeM;
    }

    public function getIsOpenNowAttribute()
    {
        return $this->isOpenNow();
    }

    public function getRouteKeyName()
    {
        return 'slug';
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeHiddenGems($query)
    {
        return $query->where('is_hidden_gem', true);
    }

    public function scopeTrending($query)
    {
        return $query->where('is_trending', true);
    }

    public function recalculateRating(): void
    {
        $approvedReviews = $this->reviews()->approved()->get();
        $this->update([
            'review_count' => $approvedReviews->count(),
            'rating' => $approvedReviews->count() > 0
                ? round($approvedReviews->avg('rating'), 2)
                : 0,
        ]);
    }
}
