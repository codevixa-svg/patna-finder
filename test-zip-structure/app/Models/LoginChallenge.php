<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoginChallenge extends Model
{
    protected $fillable = [
        'token', 'user_id', 'method', 'code_hash', 'otp_sent_at',
        'attempts', 'expires_at', 'consumed_at', 'ip_address', 'user_agent',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'consumed_at' => 'datetime',
        'otp_sent_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeActive($query)
    {
        return $query->whereNull('consumed_at')->where('expires_at', '>', now());
    }
}
