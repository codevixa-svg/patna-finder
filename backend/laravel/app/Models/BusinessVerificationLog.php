<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessVerificationLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'business_id',
        'admin_id',
        'action',
        'method',
        'note',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    /**
     * Human readable method label shown in admin panel & emails.
     */
    public function getMethodLabelAttribute(): string
    {
        return self::methodLabels()[$this->method] ?? 'Manual';
    }

    public static function methodLabels(): array
    {
        return [
            'onsite_visit' => 'On-site Visit',
            'google_details' => 'As per Google Details',
            'phone_call' => 'Phone Call',
            'documents' => 'Documents Check',
        ];
    }
}
