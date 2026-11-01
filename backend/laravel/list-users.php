<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Active Users in Database:\n\n";
$users = App\Models\User::where('role', 'user')->where('is_active', 1)->get(['id', 'email', 'name']);
foreach ($users as $user) {
    echo "{$user->id}: {$user->email} ({$user->name})\n";
}
