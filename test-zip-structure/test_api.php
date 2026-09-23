<?php

// Test API endpoint to check authentication
// Access: http://localhost:8000/test_api.php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get Authorization header
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (empty($authHeader)) {
    echo json_encode([
        'error' => 'No Authorization header',
        'headers' => $headers
    ]);
    exit;
}

// Extract token
$token = str_replace('Bearer ', '', $authHeader);

// Find user by token
$personalAccessToken = DB::table('personal_access_tokens')
    ->where('token', hash('sha256', $token))
    ->first();

if (!$personalAccessToken) {
    echo json_encode([
        'error' => 'Invalid token',
        'token_preview' => substr($token, 0, 20) . '...'
    ]);
    exit;
}

// Get user
$user = DB::table('users')
    ->where('id', $personalAccessToken->tokenable_id)
    ->first();

// Get user's businesses
$businesses = DB::table('businesses')
    ->where('user_id', $user->id)
    ->get(['id', 'name', 'status', 'created_at']);

echo json_encode([
    'success' => true,
    'authenticated_user' => [
        'id' => $user->id,
        'name' => $user->name,
        'email' => $user->email
    ],
    'businesses' => $businesses,
    'total_businesses' => count($businesses)
], JSON_PRETTY_PRINT);
