<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\AuthEvent;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'permissions',
        'is_active',
        'last_login_at',
        'avatar',
        'failed_login_attempts',
        'locked_until',
        'mfa_enabled',
        'mfa_secret',
        'last_login_ip',
        'last_login_user_agent',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'mfa_secret',
        'locked_until',
        'failed_login_attempts',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'locked_until' => 'datetime',
        'permissions' => 'array',
        'is_active' => 'boolean',
        'mfa_enabled' => 'boolean',
    ];

    // Role Constants
    const ROLE_SUPER_ADMIN = 'super_admin';
    const ROLE_ADMIN = 'admin';
    const ROLE_MODERATOR = 'moderator';
    const ROLE_USER = 'user';

    // Permission Checks
    public function businesses()
    {
        return $this->hasMany(Business::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, [self::ROLE_SUPER_ADMIN, self::ROLE_ADMIN]);
    }

    public function isModerator(): bool
    {
        return in_array($this->role, [self::ROLE_SUPER_ADMIN, self::ROLE_ADMIN, self::ROLE_MODERATOR]);
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true; // Super admin has all permissions
        }

        if (!$this->permissions) {
            return false;
        }

        return in_array($permission, $this->permissions);
    }

    public function canManage(string $resource): bool
    {
        $permissions = [
            'businesses' => 'manage_businesses',
            'hidden_gems' => 'manage_hidden_gems',
            'categories' => 'manage_categories',
            'areas' => 'manage_areas',
            'reviews' => 'manage_reviews',
            'blog' => 'manage_blog',
            'users' => 'manage_users',
        ];

        return $this->hasPermission($permissions[$resource] ?? $resource);
    }

    // Update last login timestamp
    public function updateLastLogin(): void
    {
        $this->update(['last_login_at' => now()]);
    }

    // ── Account Lockout (AWS Cognito-style brute-force protection) ──
    public const MAX_FAILED_ATTEMPTS = 5;
    public const LOCKOUT_MINUTES = 15;

    public function isLockedOut(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }

    public function secondsUntilUnlock(): int
    {
        if (!$this->isLockedOut()) {
            return 0;
        }
        return max(0, (int) now()->diffInSeconds($this->locked_until));
    }

    public function recordFailedLogin(): void
    {
        $attempts = $this->failed_login_attempts + 1;
        $this->update([
            'failed_login_attempts' => $attempts,
            'locked_until' => $attempts >= self::MAX_FAILED_ATTEMPTS ? now()->addMinutes(self::LOCKOUT_MINUTES) : $this->locked_until,
        ]);
    }

    public function clearFailedLogins(): void
    {
        $this->forceFill([
            'failed_login_attempts' => 0,
            'locked_until' => null,
        ])->save();
    }

    // ── Auth Events (audit trail) ──
    public function logAuthEvent(string $event, ?string $email = null): void
    {
        AuthEvent::create([
            'user_id' => $this->id,
            'email' => $email ?? $this->email,
            'event' => $event,
            'ip_address' => request()?->ip(),
            'user_agent' => substr((string) request()?->userAgent(), 0, 500),
        ]);
    }

    public function authEvents()
    {
        return $this->hasMany(AuthEvent::class)->latest()->limit(20);
    }
}

