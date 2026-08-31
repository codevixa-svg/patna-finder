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

    public function isOpenNow()
    {
        if (empty($this->opening_hours)) {
            return null;
        }

        $day = strtolower(now()->format('l'));
        $currentTime = now()->format('H:i');

        if (isset($this->opening_hours[$day])) {
            $hours = $this->opening_hours[$day];
            if (isset($hours['is_open']) && !$hours['is_open']) {
                return false;
            }
            $open = $hours['open_time'] ?? $hours['open'] ?? null;
            $close = $hours['close_time'] ?? $hours['close'] ?? null;
            if ($open && $close) {
                return $currentTime >= $open && $currentTime <= $close;
            }
        }

        return false;
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
