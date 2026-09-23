<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Area;
use App\Models\Business;
use Illuminate\Support\Str;

class InitialDataSeeder extends Seeder
{
    public function run(): void
    {
        // Categories
        $categories = [
            ['name' => 'Coaching Institutes', 'icon' => '📚', 'display_order' => 1],
            ['name' => 'Dentists', 'icon' => '🦷', 'display_order' => 2],
            ['name' => 'Doctors', 'icon' => '👨‍⚕️', 'display_order' => 3],
            ['name' => 'Hospitals', 'icon' => '🏥', 'display_order' => 4],
            ['name' => 'Restaurants', 'icon' => '🍽️', 'display_order' => 5],
            ['name' => 'Gyms', 'icon' => '💪', 'display_order' => 6],
            ['name' => 'Schools', 'icon' => '🏫', 'display_order' => 7],
            ['name' => 'Lawyers', 'icon' => '⚖️', 'display_order' => 8],
            ['name' => 'Hotels', 'icon' => '🏨', 'display_order' => 9],
            ['name' => 'Cafés', 'icon' => '☕', 'display_order' => 10],
            ['name' => 'Beauty Salons', 'icon' => '💇', 'display_order' => 11],
            ['name' => 'Shopping', 'icon' => '🛍️', 'display_order' => 12],
            ['name' => 'Real Estate', 'icon' => '🏘️', 'display_order' => 13],
            ['name' => 'Travel', 'icon' => '✈️', 'display_order' => 14],
            ['name' => 'Photography', 'icon' => '📸', 'display_order' => 15],
            ['name' => 'Event Planners', 'icon' => '🎉', 'display_order' => 16],
            ['name' => 'Pet Clinics', 'icon' => '🐾', 'display_order' => 17],
            ['name' => 'Repair Services', 'icon' => '🔧', 'display_order' => 18],
            ['name' => 'Home Services', 'icon' => '🏠', 'display_order' => 19],
        ];

        foreach ($categories as $category) {
            Category::create([
                'name' => $category['name'],
                'slug' => Str::slug($category['name']),
                'icon' => $category['icon'],
                'display_order' => $category['display_order'],
                'is_active' => true,
            ]);
        }

        // Areas
        $areas = [
            'Boring Road',
            'Kankarbagh',
            'Patliputra',
            'Bailey Road',
            'Rajendra Nagar',
            'Danapur',
            'Ashok Rajpath',
            'Fraser Road',
            'Patna City',
            'Kurji',
            'Digha',
            'Anisabad',
            'Phulwari Sharif',
            'Khagaul',
        ];

        foreach ($areas as $area) {
            Area::create([
                'name' => $area,
                'slug' => Str::slug($area),
                'is_active' => true,
            ]);
        }

        echo "Categories and Areas seeded successfully!\n";
    }
}
