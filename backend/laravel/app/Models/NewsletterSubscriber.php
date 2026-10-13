<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class NewsletterSubscriber extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_UNSUBSCRIBED = 'unsubscribed';

    protected $fillable = [
        'email',
        'name',
        'source',
        'status',
        'token',
        'subscribed_at',
        'unsubscribed_at',
    ];

    protected $casts = [
        'subscribed_at' => 'datetime',
        'unsubscribed_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($subscriber) {
            if (empty($subscriber->token)) {
                $subscriber->token = static::generateToken();
            }
            if (empty($subscriber->subscribed_at)) {
                $subscriber->subscribed_at = now();
            }
        });
    }

    public static function generateToken(): string
    {
        do {
            $token = Str::random(64);
        } while (static::where('token', $token)->exists());

        return $token;
    }

    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    public function is_active(): bool
    {
        return $this->status === self::STATUS_ACTIVE;
    }
}
