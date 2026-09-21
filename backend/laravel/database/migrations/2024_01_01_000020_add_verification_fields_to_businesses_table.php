<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            // Physical / manual verification tracking
            $table->timestamp('verified_at')->nullable()->after('is_verified');
            $table->foreignId('verified_by')->nullable()->after('verified_at')->constrained('users')->nullOnDelete();
            $table->enum('verification_method', ['onsite_visit', 'google_details', 'phone_call', 'documents'])->nullable()->after('verified_by');
            $table->text('verification_note')->nullable()->after('verification_method');

            $table->index('verified_by');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn(['verified_at', 'verified_by', 'verification_method', 'verification_note']);
        });
    }
};
