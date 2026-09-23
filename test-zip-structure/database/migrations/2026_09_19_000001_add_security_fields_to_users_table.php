<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * AWS Cognito-style security fields:
     * - Brute-force lockout tracking
     * - MFA (Email OTP + TOTP authenticator)
     * - Last sign-in audit info
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('failed_login_attempts')->default(0)->after('avatar');
            $table->timestamp('locked_until')->nullable()->after('failed_login_attempts');
            $table->boolean('mfa_enabled')->default(false)->after('locked_until');
            $table->text('mfa_secret')->nullable()->after('mfa_enabled')->comment('Encrypted TOTP secret (Google Authenticator)');
            $table->string('last_login_ip', 45)->nullable()->after('mfa_secret');
            $table->string('last_login_user_agent', 500)->nullable()->after('last_login_ip');
        });

        // Admins & moderators get mandatory MFA by default (AWS Cognito MFA: REQUIRED for admins)
        DB::table('users')
            ->whereIn('role', ['super_admin', 'admin', 'moderator'])
            ->update(['mfa_enabled' => true]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'failed_login_attempts',
                'locked_until',
                'mfa_enabled',
                'mfa_secret',
                'last_login_ip',
                'last_login_user_agent',
            ]);
        });
    }
};
