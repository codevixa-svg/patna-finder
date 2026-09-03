<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessInteraction extends Model
{
    use HasFactory;

    public const EVENTS = ['view', 'call', 'website', 'whatsapp', 'directions', 'share'];

    protected $fillable = [
        'business_id',
        'event_type',
        'ip_address',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
