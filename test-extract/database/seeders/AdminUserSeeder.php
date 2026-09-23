<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the database with admin users.
     */
    public function run(): void
    {
        // Super Admin
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@patnafinder.com',
            'password' => Hash::make('admin123'), // CHANGE THIS IN PRODUCTION!
            'role' => 'super_admin',
            'permissions' => null, // Super admin has all permissions
            'is_active' => true,
        ]);

        $this->command->info('✅ Super Admin created: admin@patnafinder.com / admin123');

        // Regular Admin
        User::create([
            'name' => 'Admin User',
            'email' => 'moderator@patnafinder.com',
            'password' => Hash::make('moderator123'),
            'role' => 'admin',
            'permissions' => [
                'manage_businesses',
                'manage_hidden_gems',
                'manage_reviews',
                'manage_blog',
                'manage_categories',
                'manage_areas',
            ],
            'is_active' => true,
        ]);

        $this->command->info('✅ Admin created: moderator@patnafinder.com / moderator123');

        // Moderator (Limited permissions)
        User::create([
            'name' => 'Content Moderator',
            'email' => 'mod@patnafinder.com',
            'password' => Hash::make('mod123'),
            'role' => 'moderator',
            'permissions' => [
                'manage_reviews',
                'manage_blog',
            ],
            'is_active' => true,
        ]);

        $this->command->info('✅ Moderator created: mod@patnafinder.com / mod123');
        $this->command->warn('⚠️  IMPORTANT: Change these default passwords in production!');
    }
}
