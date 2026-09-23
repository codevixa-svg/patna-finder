<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Checking Business Images ===" . PHP_EOL . PHP_EOL;

$businesses = DB::table('businesses')
    ->whereNotNull('user_id')
    ->get(['id', 'name', 'logo', 'cover_image', 'user_id']);

foreach ($businesses as $business) {
    echo "ID: {$business->id} | {$business->name}" . PHP_EOL;
    echo "  Logo: " . ($business->logo ?: 'NULL') . PHP_EOL;
    echo "  Cover: " . ($business->cover_image ?: 'NULL') . PHP_EOL;
    echo "  User ID: {$business->user_id}" . PHP_EOL;
    echo PHP_EOL;
}

echo "Total businesses: " . count($businesses) . PHP_EOL;

// Check if storage directory exists
echo PHP_EOL . "=== Storage Directories ===" . PHP_EOL;
$storagePath = __DIR__ . '/storage/app/public/businesses';
echo "Path: {$storagePath}" . PHP_EOL;
echo "Exists: " . (file_exists($storagePath) ? 'YES' : 'NO') . PHP_EOL;

if (file_exists($storagePath)) {
    echo PHP_EOL . "Logo directory: " . (file_exists($storagePath . '/logo') ? 'YES' : 'NO') . PHP_EOL;
    echo "Cover directory: " . (file_exists($storagePath . '/cover') ? 'YES' : 'NO') . PHP_EOL;
    echo "Gallery directory: " . (file_exists($storagePath . '/gallery') ? 'YES' : 'NO') . PHP_EOL;
    
    // Count files
    if (file_exists($storagePath . '/logo')) {
        $logoFiles = glob($storagePath . '/logo/*');
        echo PHP_EOL . "Logo files: " . count($logoFiles) . PHP_EOL;
        foreach ($logoFiles as $file) {
            echo "  - " . basename($file) . PHP_EOL;
        }
    }
    
    if (file_exists($storagePath . '/cover')) {
        $coverFiles = glob($storagePath . '/cover/*');
        echo PHP_EOL . "Cover files: " . count($coverFiles) . PHP_EOL;
        foreach ($coverFiles as $file) {
            echo "  - " . basename($file) . PHP_EOL;
        }
    }
}

// Check public storage link
$publicStorage = __DIR__ . '/public/storage';
echo PHP_EOL . "=== Public Storage Link ===" . PHP_EOL;
echo "Path: {$publicStorage}" . PHP_EOL;
echo "Exists: " . (file_exists($publicStorage) ? 'YES' : 'NO') . PHP_EOL;
if (file_exists($publicStorage)) {
    echo "Is link: " . (is_link($publicStorage) ? 'YES' : 'NO') . PHP_EOL;
    if (is_link($publicStorage)) {
        echo "Points to: " . readlink($publicStorage) . PHP_EOL;
    }
}
