<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Creating Raj Kapur User ===" . PHP_EOL . PHP_EOL;

// Check if user exists
$existingUser = DB::table('users')->where('email', 'rajkapur@gmail.com')->first();

if ($existingUser) {
    echo "✅ Raj Kapur already exists (ID: {$existingUser->id})" . PHP_EOL;
    $userId = $existingUser->id;
} else {
    // Create Raj Kapur
    $userId = DB::table('users')->insertGetId([
        'name' => 'Raj Kapur',
        'email' => 'rajkapur@gmail.com',
        'password' => bcrypt('password'),
        'phone' => '9876543210',
        'role' => 'user',
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    echo "✅ Raj Kapur created (ID: {$userId})" . PHP_EOL;
}

// Assign DK Solutions to Raj Kapur
$dkSolutions = DB::table('businesses')->where('name', 'like', '%DK Solutions%')->first();

if ($dkSolutions) {
    DB::table('businesses')->where('id', $dkSolutions->id)->update(['user_id' => $userId]);
    echo "✅ DK Solutions assigned to Raj Kapur" . PHP_EOL;
} else {
    // Create DK Solutions for Raj
    DB::table('businesses')->insert([
        'user_id' => $userId,
        'name' => 'DK Solutions',
        'slug' => 'dk-solutions-' . uniqid(),
        'category_id' => 1,
        'area_id' => 1,
        'tagline' => 'We provide result-devinded Web Development',
        'short_description' => 'Professional IT services and solutions',
        'description' => 'DK Solutions is a professional IT company providing web development, software solutions, and digital services.',
        'status' => 'pending',
        'phone' => '9876543210',
        'email' => 'contact@dksolutions.com',
        'address' => 'Patna',
        'city' => 'Patna',
        'state' => 'Bihar',
        'pincode' => '800001',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    
    echo "✅ DK Solutions created for Raj Kapur" . PHP_EOL;
}

echo PHP_EOL . "=== Raj Kapur's Businesses ===" . PHP_EOL;
$rajBusinesses = DB::table('businesses')->where('user_id', $userId)->get(['id', 'name', 'status']);
foreach ($rajBusinesses as $business) {
    echo "  ✓ {$business->name} (Status: {$business->status})" . PHP_EOL;
}

echo PHP_EOL . "Total: " . count($rajBusinesses) . " business(es)" . PHP_EOL;
