<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $this->call([
            AdminSeeder::class,           // Super Admin user
            GmbCategorySeeder::class,     // GMB Categories with Lucide icons (3794)
            AreaSeeder::class,            // Areas with banner images
            EventSeeder::class,           // Events with images
            BlogCategoriesSeeder::class,  // Blog categories (News, Events, Guides...)
            BlogPostSeeder::class,        // Blog posts with images
        ]);
    }
}
