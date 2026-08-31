<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->index('status');
            $table->index('is_featured');
            $table->index('is_trending');
            $table->index('is_hidden_gem');
            $table->index('is_verified');
            $table->index('rating');
            $table->index('review_count');
            $table->index('view_count');
            $table->index('user_id');
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->index('status');
            $table->index('business_id');
        });
    }

    public function down(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['is_featured']);
            $table->dropIndex(['is_trending']);
            $table->dropIndex(['is_hidden_gem']);
            $table->dropIndex(['is_verified']);
            $table->dropIndex(['rating']);
            $table->dropIndex(['review_count']);
            $table->dropIndex(['view_count']);
            $table->dropIndex(['user_id']);
        });

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['business_id']);
        });
    }
};
