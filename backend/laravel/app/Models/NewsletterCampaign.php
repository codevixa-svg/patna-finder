<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsletterCampaign extends Model
{
    use HasFactory;

    public const STATUS_SENDING = 'sending';
    public const STATUS_SENT = 'sent';
    public const STATUS_FAILED = 'failed';

    protected $fillable = [
        'subject',
        'body',
        'status',
        'total_subscribers',
        'sent_count',
        'failed_count',
        'sent_by',
        'sent_at',
    ];

    protected $casts = [
        'total_subscribers' => 'integer',
        'sent_count' => 'integer',
        'failed_count' => 'integer',
        'sent_at' => 'datetime',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
