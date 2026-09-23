<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GmbCategorySeeder extends Seeder
{
    /**
     * Import the official Google Business Profile category list (2025) with
     * Lucide icon assignments. Idempotent: refreshes icons of existing
     * categories (matched by slug or name, plural-aware) and inserts the
     * missing ones in bulk. Existing slugs are never changed so public
     * category URLs stay stable.
     */
    public function run(): void
    {
        $rows = json_decode(
            file_get_contents(database_path('seeders/data/gmb-categories.json')),
            true,
        );

        if (!is_array($rows) || empty($rows)) {
            $this->command->error('gmb-categories.json could not be parsed.');

            return;
        }

        $categories = Category::all();

        // Index existing categories by slug and by (plural-aware) name so
        // legacy categories like "Restaurants" match the GMB "Restaurant".
        $bySlug = $categories->keyBy(fn ($c) => $c->slug);
        $byName = collect();
        foreach ($categories as $category) {
            $name = strtolower(trim($category->name));
            $byName->put($name, $category);
            // Secondary singular key ("restaurants" -> "restaurant",
            // "accessories" -> "accessory") so both sides align.
            $singular = preg_replace('/ies$/', 'y', preg_replace('/s$/', '', $name));
            if ($singular !== $name && !$byName->has($singular)) {
                $byName->put($singular, $category);
            }
        }

        $updated = 0;
        $batch = [];
        $now = now();
        // New categories sort after the curated ones (which keep their
        // existing display_order), then alphabetically by name.
        $sortIndex = 1000;

        foreach ($rows as $row) {
            $name = trim($row['name']);
            $slug = $row['slug'];
            $icon = $row['icon'] ?: 'store';

            $existing = $bySlug->get($slug) ?? $byName->get(strtolower($name));

            if ($existing) {
                if ($existing->icon !== $icon) {
                    $existing->update(['icon' => $icon, 'is_active' => true]);
                    $updated++;
                }

                continue;
            }

            $batch[] = [
                'name' => $name,
                'slug' => $slug,
                'icon' => $icon,
                'display_order' => $sortIndex++,
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        $inserted = 0;
        foreach (array_chunk($batch, 500) as $chunk) {
            $inserted += DB::table('categories')->insertOrIgnore($chunk);
        }

        $this->command->info("GMB categories: {$updated} icons updated, {$inserted} categories inserted.");
    }
}
