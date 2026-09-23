<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Fixing Business Ownership ===" . PHP_EOL . PHP_EOL;

// Set DK Solutions (ID: 4) to Raj Kapur (user_id: 3)
DB::table('businesses')->where('id', 4)->update(['user_id' => 3]);
echo "✅ DK Solutions assigned to Raj Kapur (user_id: 3)" . PHP_EOL;

// Set other businesses (ID: 5-9) to different users
DB::table('businesses')->where('id', 5)->update(['user_id' => 1]); // ABC Digital Solutions -> admin
DB::table('businesses')->where('id', 6)->update(['user_id' => 2]); // Patna Cafe -> Test User
DB::table('businesses')->where('id', 7)->update(['user_id' => 1]); // Wellness Gym -> admin
DB::table('businesses')->where('id', 8)->update(['user_id' => 2]); // Tech Solutions -> Test User
DB::table('businesses')->where('id', 9)->update(['user_id' => 1]); // Style Studio -> admin

echo "✅ Other businesses assigned to different users" . PHP_EOL . PHP_EOL;

// Show current ownership
echo "=== Current Business Ownership ===" . PHP_EOL;
$businesses = DB::table('businesses')
    ->join('users', 'businesses.user_id', '=', 'users.id')
    ->select('businesses.id', 'businesses.name', 'businesses.status', 'users.name as owner_name', 'users.email')
    ->whereNotNull('businesses.user_id')
    ->orderBy('businesses.user_id')
    ->get();

foreach ($businesses as $business) {
    echo "ID: {$business->id} | {$business->name} | Status: {$business->status} | Owner: {$business->owner_name} ({$business->email})" . PHP_EOL;
}

echo PHP_EOL . "=== Raj Kapur's Businesses ===" . PHP_EOL;
$rajBusinesses = DB::table('businesses')
    ->where('user_id', 3)
    ->get(['id', 'name', 'status']);

foreach ($rajBusinesses as $business) {
    echo "✓ ID: {$business->id} | {$business->name} | Status: {$business->status}" . PHP_EOL;
}

echo PHP_EOL . "Total businesses for Raj Kapur: " . $rajBusinesses->count() . PHP_EOL;
