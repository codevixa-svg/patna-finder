<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            // Verification level: basic (google_details/phone_call),
            // standard (documents), premium (onsite_visit)
            $table->enum('verification_level', ['basic', 'standard', 'premium'])->nullable()->after('verification_method');

            // Owner clicked "Get Verified" — admin sees this in queue
            $table->timestamp('verification_requested_at')->nullable()->after('verification_level');

            // Re-verification: verified_at + 1 year
            $table->date('reverify_due_at')->nullable()->after('verification_requested_at');
            $table->timestamp('reverify_notified_at')->nullable()->after('reverify_due_at');

            $table->index('reverify_due_at');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropColumn(['verification_level', 'verification_requested_at', 'reverify_due_at', 'reverify_notified_at']);
        });
    }
};
