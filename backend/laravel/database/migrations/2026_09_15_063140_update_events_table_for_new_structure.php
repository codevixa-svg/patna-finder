<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Add new columns for the enhanced events system
            $table->string('event_category')->nullable()->after('event_type'); // Cultural, Sports, etc.
            $table->string('event_mode')->default('offline')->after('event_category'); // offline, online, hybrid
            $table->string('area')->nullable()->after('city'); // Area/locality in Patna
            $table->decimal('latitude', 10, 7)->nullable()->after('area');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->string('price_type')->default('free')->after('registration_url'); // free, paid
            $table->decimal('price', 10, 2)->nullable()->after('price_type');
            $table->string('currency')->default('INR')->after('price');
            $table->integer('interested_count')->default(0)->after('currency');
            $table->integer('view_count')->default(0)->after('interested_count');
            $table->text('tags')->nullable()->after('view_count'); // JSON array of tags
            $table->text('gallery')->nullable()->after('tags'); // JSON array of images
            $table->string('banner_image')->nullable()->after('featured_image');
            $table->boolean('is_trending')->default(false)->after('is_featured');
            $table->timestamp('published_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'event_category',
                'event_mode',
                'area',
                'latitude',
                'longitude',
                'price_type',
                'price',
                'currency',
                'interested_count',
                'view_count',
                'tags',
                'gallery',
                'banner_image',
                'is_trending',
                'published_at',
            ]);
        });
    }
};
