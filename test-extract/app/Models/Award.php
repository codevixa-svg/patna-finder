<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Award extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'award_name',
        'award_year',
        'description',
        'badge_image'
    ];

    protected $casts = [
        'award_year' => 'integer',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
