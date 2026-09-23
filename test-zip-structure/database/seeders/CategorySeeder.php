<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            [
                'name' => 'Restaurants & Food',
                'slug' => 'restaurants-food',
                'description' => 'Restaurants, cafes, food courts, and eateries',
                'icon' => 'restaurant',
            ],
            [
                'name' => 'Digital Marketing',
                'slug' => 'digital-marketing',
                'description' => 'Digital marketing agencies and services',
                'icon' => 'marketing',
            ],
            [
                'name' => 'Healthcare',
                'slug' => 'healthcare',
                'description' => 'Hospitals, clinics, doctors, and medical services',
                'icon' => 'health',
            ],
            [
                'name' => 'Education',
                'slug' => 'education',
                'description' => 'Schools, colleges, coaching centers',
                'icon' => 'education',
            ],
            [
                'name' => 'Real Estate',
                'slug' => 'real-estate',
                'description' => 'Property dealers, builders, real estate agents',
                'icon' => 'home',
            ],
            [
                'name' => 'Shopping & Retail',
                'slug' => 'shopping-retail',
                'description' => 'Shops, malls, retail stores',
                'icon' => 'shop',
            ],
            [
                'name' => 'Salons & Spa',
                'slug' => 'salons-spa',
                'description' => 'Beauty salons, spas, grooming services',
                'icon' => 'spa',
            ],
            [
                'name' => 'Hotels & Hospitality',
                'slug' => 'hotels-hospitality',
                'description' => 'Hotels, guest houses, lodges',
                'icon' => 'hotel',
            ],
            [
                'name' => 'Automotive',
                'slug' => 'automotive',
                'description' => 'Car dealers, repair shops, service centers',
                'icon' => 'car',
            ],
            [
                'name' => 'Home Services',
                'slug' => 'home-services',
                'description' => 'Plumbers, electricians, carpenters',
                'icon' => 'tools',
            ],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert([
                'name' => $category['name'],
                'slug' => $category['slug'],
                'description' => $category['description'],
                'icon' => $category['icon'],
                'is_active' => true,
                'display_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
