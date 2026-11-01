<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Services\Security\OtpService;

try {
    $user = User::where('role', 'user')->where('is_active', 1)->first();
    
    if (!$user) {
        echo "ERROR: No active user found\n";
        exit(1);
    }
    
    echo "Testing forgot password for user: {$user->email}\n";
    echo "User name: {$user->name}\n";
    echo "Mail config: " . config('mail.default') . "\n";
    echo "Mail host: " . config('mail.mailers.smtp.host') . "\n";
    
    $otpService = app(OtpService::class);
    
    echo "\nCreating password reset challenge...\n";
    $result = $otpService->createChallenge($user, 'password_reset', '127.0.0.1', 'Test Script');
    
    echo "SUCCESS!\n";
    echo "Token: " . $result['token'] . "\n";
    echo "Method: " . $result['method'] . "\n";
    
    if (isset($result['dev_code'])) {
        echo "Dev Code: " . $result['dev_code'] . "\n";
    }
    
} catch (\Exception $e) {
    echo "\n\nERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "\nStack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
