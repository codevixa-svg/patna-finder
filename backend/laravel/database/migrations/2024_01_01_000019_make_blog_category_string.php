<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * blog_posts.category was an ENUM limited to 8 hardcoded values.
     * Convert it to a plain string so admin-managed categories
     * (blog_categories table) can be used freely.
     */
    public function up(): void
    {
        Schema::table('blog_posts', function ($table) {
            $table->string('category')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Can't safely restore the enum with dynamic category values,
        // so down() keeps the string column as-is.
    }
};
