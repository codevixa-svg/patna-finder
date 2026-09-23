<?php

namespace Database\Seeders;

use App\Models\BlogCategory;
use Illuminate\Database\Seeder;

class BlogCategoriesSeeder extends Seeder
{
    /**
     * Seed the categories that were previously a hardcoded enum
     * on blog_posts.category.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'News', 'description' => 'Latest news & updates from Patna', 'display_order' => 1],
            ['name' => 'Events', 'description' => 'City events, festivals & programmes', 'display_order' => 2],
            ['name' => 'Guides', 'description' => 'How-to guides & local tips', 'display_order' => 3],
            ['name' => 'Festivals', 'description' => 'Festivals & cultural celebrations', 'display_order' => 4],
            ['name' => 'Lifestyle', 'description' => 'Lifestyle stories from Patna', 'display_order' => 5],
            ['name' => 'Food', 'description' => 'Food, restaurants & street food', 'display_order' => 6],
            ['name' => 'Education', 'description' => 'Education, coaching & careers', 'display_order' => 7],
            ['name' => 'Tourism', 'description' => 'Tourist places & travel guides', 'display_order' => 8],
        ];

        foreach ($categories as $category) {
            BlogCategory::updateOrCreate(
                ['name' => $category['name']],
                $category
            );
        }
    }
}
