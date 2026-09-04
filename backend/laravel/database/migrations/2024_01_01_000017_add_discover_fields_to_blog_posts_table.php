<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Google Discover optimization fields for blog posts:
     * - image_alt: descriptive alt text for the featured image (accessibility + image SEO)
     * - author_bio: short author bio for E-E-A-T (Experience, Expertise, Authoritativeness, Trust)
     * - reading_time: estimated reading time in minutes
     */
    public function up(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->string('image_alt')->nullable()->after('featured_image');
            $table->text('author_bio')->nullable()->after('author_name');
            $table->unsignedInteger('reading_time')->nullable()->after('content');
        });
    }

    public function down(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn(['image_alt', 'author_bio', 'reading_time']);
        });
    }
};
