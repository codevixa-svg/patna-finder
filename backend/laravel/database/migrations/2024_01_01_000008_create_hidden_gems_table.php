<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Hidden Gems - Admin managed underrated places
     */
    public function up(): void
    {
        Schema::create('hidden_gems', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Place name/title
            $table->string('slug')->unique();
            $table->foreignId('category_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('area_id')->nullable()->constrained()->onDelete('set null');
            
            // Main Content
            $table->text('story'); // 200-300 words description
            $table->text('address');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Images
            $table->string('featured_image')->nullable(); // Main image
            $table->json('gallery')->nullable(); // Array of additional images
            
            // Google My Business Integration
            $table->string('gmb_place_id')->nullable()->comment('Google Maps Place ID');
            $table->string('gmb_url')->nullable()->comment('Google My Business URL');
            $table->decimal('gmb_rating', 3, 2)->nullable()->comment('GMB Rating (synced)');
            $table->integer('gmb_review_count')->default(0)->comment('GMB Review Count (synced)');
            $table->json('gmb_reviews')->nullable()->comment('Cached GMB reviews');
            $table->timestamp('gmb_last_synced')->nullable()->comment('Last GMB sync timestamp');
            $table->boolean('gmb_sync_enabled')->default(true)->comment('Enable auto GMB sync');
            
            // Metadata
            $table->string('badge')->nullable()->comment('Badge: new, trending, popular');
            $table->integer('view_count')->default(0);
            $table->integer('like_count')->default(0);
            $table->integer('share_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('display_order')->default(0)->comment('For admin sorting');
            
            // SEO
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->json('tags')->nullable(); // Array of tags
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('is_active');
            $table->index('is_featured');
            $table->index('display_order');
            $table->index('gmb_place_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hidden_gems');
    }
};
