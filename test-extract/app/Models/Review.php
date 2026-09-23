<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'author_name',
        'author_email',
        'rating',
        'content',
        'photos',
        'likes_count',
        'is_verified',
        'ip_address',
        'status'
    ];

    protected $casts = [
        'photos' => 'array',
        'is_verified' => 'boolean',
        'rating' => 'integer',
        'likes_count' => 'integer',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }
}
