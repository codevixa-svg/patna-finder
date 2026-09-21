<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusinessVerificationDocument extends Model
{
    use HasFactory;

    public const DOC_TYPES = [
        'gst' => 'GST Certificate',
        'fssai' => 'FSSAI License',
        'trade_license' => 'Trade License',
        'id_proof' => 'Owner ID Proof',
        'signboard_photo' => 'Signboard Photo',
        'address_proof' => 'Address Proof',
        'medical_registration' => 'Medical Registration',
        'other' => 'Other Document',
    ];

    protected $fillable = [
        'business_id',
        'doc_type',
        'doc_name',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
        'status',
        'reject_reason',
        'expires_at',
        'reminder_sent_at',
        'expired_notified_at',
        'uploaded_by',
        'reviewed_by',
        'reviewed_at',
        'review_note',
    ];

    protected $casts = [
        'expires_at' => 'date',
        'reviewed_at' => 'datetime',
        'reminder_sent_at' => 'datetime',
        'expired_notified_at' => 'datetime',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function getDocTypeLabelAttribute(): string
    {
        return self::DOC_TYPES[$this->doc_type] ?? ucfirst(str_replace('_', ' ', $this->doc_type));
    }

    /**
     * Days remaining until expiry (negative = expired).
     */
    public function getDaysUntilExpiryAttribute(): ?int
    {
        if (! $this->expires_at) {
            return null;
        }

        return (int) now()->startOfDay()->diffInDays($this->expires_at->copy()->startOfDay(), false);
    }
}
