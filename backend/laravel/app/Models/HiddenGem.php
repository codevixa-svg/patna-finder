<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class HiddenGem extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'category_id',
        'area_id',
        'story',
        'address',
        'latitude',
        'longitude',
        'featured_image',
        'gallery',
        'gmb_place_id',
        'gmb_url',
        'gmb_rating',
        'gmb_review_count',
        'gmb_reviews',
        'gmb_last_synced',
        'gmb_sync_enabled',
        'badge',
        'view_count',
        'like_count',
        'share_count',
        'is_featured',
        'is_active',
        'display_order',
        'meta_title',
        'meta_description',
        'tags',
    ];

    protected $casts = [
        'gallery' => 'array',
        'gmb_reviews' => 'array',
        'tags' => 'array',
        'gmb_rating' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'gmb_last_synced' => 'datetime',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'gmb_sync_enabled' => 'boolean',
    ];

    protected $appends = [
        'featured_image_url',
        'gallery_urls',
    ];

    // Relationships
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    // Accessors
    public function getFeaturedImageUrlAttribute()
    {
        if ($this->featured_image) {
            return asset('storage/hidden-gems/' . $this->featured_image);
        }
        return asset('images/hidden-gems/default.jpg');
    }

    public function getGalleryUrlsAttribute()
    {
        if (!$this->gallery) {
            return [];
        }

        return array_map(function ($image) {
            return asset('storage/hidden-gems/' . $image);
        }, $this->gallery);
    }

    // Methods
    public static function boot()
    {
        parent::boot();

        static::creating(function ($hiddenGem) {
            if (empty($hiddenGem->slug)) {
                $hiddenGem->slug = Str::slug($hiddenGem->title);
            }
        });

        static::updating(function ($hiddenGem) {
            if ($hiddenGem->isDirty('title') && empty($hiddenGem->slug)) {
                $hiddenGem->slug = Str::slug($hiddenGem->title);
            }
        });
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order', 'asc')
                    ->orderBy('created_at', 'desc');
    }

    // Increment view count
    public function incrementViewCount()
    {
        $this->increment('view_count');
    }

    // Increment like count
    public function incrementLikeCount()
    {
        $this->increment('like_count');
    }

    // Increment share count
    public function incrementShareCount()
    {
        $this->increment('share_count');
    }

    // Check if GMB sync is due (sync every 24 hours)
    public function isGmbSyncDue()
    {
        if (!$this->gmb_sync_enabled || !$this->gmb_place_id) {
            return false;
        }

        if (!$this->gmb_last_synced) {
            return true;
        }

        return $this->gmb_last_synced->diffInHours(now()) >= 24;
    }
}
