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
        'title',
        'slug',
        'description',
        'event_type',
        'venue',
        'address',
        'city',
        'event_date',
        'start_time',
        'end_time',
        'organizer',
        'department',
        'featured_image',
        'registration_url',
        'contact_phone',
        'contact_email',
        'is_featured',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'event_date' => 'date',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'featured_image_url',
    ];

    // Accessors
    public function getFeaturedImageUrlAttribute()
    {
        if ($this->featured_image) {
            return asset('storage/events/' . $this->featured_image);
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

    public function scopeUpcoming($query)
    {
        return $query->where('event_date', '>=', now()->toDateString());
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('event_date', 'desc')
                    ->orderBy('display_order', 'asc')
                    ->orderBy('created_at', 'desc');
    }
}
