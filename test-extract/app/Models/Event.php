<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'events';

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'description',
        'event_type',
        'event_category',
        'event_mode',
        'venue',
        'address',
        'area',
        'city',
        'latitude',
        'longitude',
        'event_date',
        'start_time',
        'end_time',
        'organizer',
        'department',
        'featured_image',
        'banner_image',
        'gallery',
        'registration_url',
        'contact_phone',
        'contact_email',
        'price_type',
        'price',
        'currency',
        'interested_count',
        'view_count',
        'tags',
        'is_featured',
        'is_trending',
        'is_active',
        'published_at',
        'display_order',
    ];

    protected $casts = [
        'event_date' => 'date',
        'published_at' => 'datetime',
        'is_featured' => 'boolean',
        'is_trending' => 'boolean',
        'is_active' => 'boolean',
        'gallery' => 'array',
        'tags' => 'array',
        'price' => 'decimal:2',
    ];

    protected $appends = [
        'featured_image_url',
    ];

    // Accessors
    public function getFeaturedImageUrlAttribute()
    {
        if ($this->featured_image) {
            // If already a full URL, return as is
            if (str_starts_with($this->featured_image, 'http://') || str_starts_with($this->featured_image, 'https://')) {
                return $this->featured_image;
            }
            
            // If starts with /storage/, return as is
            if (str_starts_with($this->featured_image, '/storage/')) {
                return $this->featured_image;
            }
            
            // If starts with storage/, add leading slash
            if (str_starts_with($this->featured_image, 'storage/')) {
                return '/' . $this->featured_image;
            }
            
            // Otherwise, assume it's just the filename in events folder
            return '/storage/events/' . $this->featured_image;
        }
        return null;
    }

    // Boot - auto generate slug
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($event) {
            if (empty($event->slug)) {
                $event->slug = Str::slug($event->title) . '-' . Str::random(4);
            }
        });

        static::updating(function ($event) {
            if ($event->isDirty('title') && empty($event->slug)) {
                $event->slug = Str::slug($event->title) . '-' . Str::random(4);
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

    public function scopeTrending($query)
    {
        return $query->where('is_trending', true);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>=', now()->toDateString());
    }

    public function scopePast($query)
    {
        return $query->where('event_date', '<', now()->toDateString());
    }

    public function scopeToday($query)
    {
        return $query->whereDate('event_date', now()->toDateString());
    }

    public function scopeThisWeekend($query)
    {
        $friday = now()->next('Friday');
        $sunday = now()->next('Sunday');
        return $query->whereBetween('event_date', [$friday, $sunday]);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('event_category', $category);
    }

    public function scopeByMode($query, $mode)
    {
        return $query->where('event_mode', $mode);
    }

    public function scopeByArea($query, $area)
    {
        return $query->where('area', $area);
    }

    public function scopeFree($query)
    {
        return $query->where('price_type', 'free');
    }

    public function scopePaid($query)
    {
        return $query->where('price_type', 'paid');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('event_date', 'asc')
                    ->orderBy('start_time', 'asc')
                    ->orderBy('display_order', 'asc');
    }

    public function scopePopular($query)
    {
        return $query->orderBy('interested_count', 'desc')
                    ->orderBy('view_count', 'desc');
    }

    // Helper Methods
    public function incrementInterested()
    {
        $this->increment('interested_count');
    }

    public function decrementInterested()
    {
        $this->decrement('interested_count');
    }

    public function incrementViews()
    {
        $this->increment('view_count');
    }

    public function isPast()
    {
        return $this->event_date < now()->toDateString();
    }

    public function isUpcoming()
    {
        return $this->event_date >= now()->toDateString();
    }

    public function isToday()
    {
        return $this->event_date->isToday();
    }

    public function isFree()
    {
        return $this->price_type === 'free';
    }

    public function isPaid()
    {
        return $this->price_type === 'paid';
    }
}
