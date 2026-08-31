<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== USERS ===" . PHP_EOL;
$users = App\Models\User::all(['id', 'name', 'email']);
foreach ($users as $user) {
    echo "ID: {$user->id} | Name: {$user->name} | Email: {$user->email}" . PHP_EOL;
}

echo PHP_EOL . "=== BUSINESSES ===" . PHP_EOL;
$businesses = App\Models\Business::with(['category', 'area'])->get();
foreach ($businesses as $business) {
    $category = $business->category ? $business->category->name : 'N/A';
    $area = $business->area ? $business->area->name : 'N/A';
    echo "ID: {$business->id} | Name: {$business->name} | User ID: {$business->user_id} | Status: {$business->status} | Category: {$category} | Area: {$area}" . PHP_EOL;
}

echo PHP_EOL . "Total Users: " . $users->count() . PHP_EOL;
echo "Total Businesses: " . $businesses->count() . PHP_EOL;
