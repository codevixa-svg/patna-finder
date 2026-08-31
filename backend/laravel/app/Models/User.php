<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

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
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'permissions' => 'array',
        'is_active' => 'boolean',
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
}

