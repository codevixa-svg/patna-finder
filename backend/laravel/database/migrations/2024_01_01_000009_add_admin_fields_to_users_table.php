<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add admin role and permissions to users table
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->enum('role', ['super_admin', 'admin', 'moderator', 'user'])->default('user')->after('phone');
            $table->json('permissions')->nullable()->after('role')->comment('JSON array of specific permissions');
            $table->boolean('is_active')->default(true)->after('permissions');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
            $table->string('avatar')->nullable()->after('last_login_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone', 'role', 'permissions', 'is_active', 'last_login_at', 'avatar']);
        });
    }
};
