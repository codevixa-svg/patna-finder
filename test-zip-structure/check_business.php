<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$businesses = App\Models\Business::with(['category', 'area'])->get();

echo "Total Businesses: " . $businesses->count() . "\n\n";

foreach ($businesses as $business) {
    echo "==================================\n";
    echo "ID: " . $business->id . "\n";
    echo "Name: " . $business->name . "\n";
    echo "User ID: " . $business->user_id . "\n";
    echo "Logo: " . ($business->logo ?? 'NULL') . "\n";
    echo "Cover Image: " . ($business->cover_image ?? 'NULL') . "\n";
    echo "Featured Image: " . ($business->featured_image ?? 'NULL') . "\n";
    echo "Category: " . ($business->category->name ?? 'NULL') . "\n";
    echo "Area: " . ($business->area->name ?? 'NULL') . "\n";
    echo "==================================\n\n";
}
