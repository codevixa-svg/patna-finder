<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // User who owns this business
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('area_id')->constrained()->onDelete('cascade');
            
            // Step 1: Basic Details
            $table->string('tagline')->nullable();
            $table->string('short_description', 500)->nullable();
            $table->text('description')->nullable();
            $table->year('established_year')->nullable();
            $table->text('logo')->nullable(); // Changed to TEXT to support URLs
            $table->text('cover_image')->nullable(); // Changed to TEXT to support URLs
            $table->text('featured_image')->nullable(); // Changed to TEXT to support URLs
            
            // Step 2: Contact Information
            $table->string('phone')->nullable();
            $table->string('alternate_phone')->nullable();
            $table->string('email')->nullable();
            $table->string('website')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('inquiry_email')->nullable();
            $table->enum('inquiry_preference', ['email', 'phone', 'whatsapp'])->default('email');
            
            // Step 3: Location
            $table->text('address');
            $table->string('address_line2')->nullable();
            $table->string('city')->default('Patna');
            $table->string('state')->default('Bihar');
            $table->string('pincode')->nullable();
            $table->string('country')->default('India');
            $table->string('landmark')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->text('google_map_location')->nullable();
            
            // Step 4: Business Hours (JSON)
            $table->json('opening_hours')->nullable();
            
            // Step 5: Services & Products (JSON)
            $table->json('services')->nullable();
            $table->json('amenities')->nullable();
            
            // Step 6: Photos & Videos (JSON)
            $table->json('gallery')->nullable();
            $table->json('videos')->nullable();
            
            // Step 7: Social Links (JSON)
            $table->json('social_links')->nullable();
            
            // Analytics & Stats
            $table->decimal('rating', 3, 2)->default(0);
            $table->integer('review_count')->default(0);
            $table->integer('view_count')->default(0);
            
            // Admin Flags
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_sponsored')->default(false);
            $table->boolean('is_trending')->default(false);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_hidden_gem')->default(false);
            
            // Status & SEO
            $table->enum('status', ['draft', 'pending', 'approved', 'rejected'])->default('pending');
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('businesses');
    }
};
