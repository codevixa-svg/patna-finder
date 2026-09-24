<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

echo "<h1>🔍 Laravel Debug Tool</h1>";
echo "<hr>";

// Test 1: PHP Version
echo "<h2>✅ Test 1: PHP Version</h2>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
echo "<p><strong>Required:</strong> PHP 8.1 or higher</p>";
if (version_compare(phpversion(), '8.1.0', '>=')) {
    echo "<p style='color: green;'>✅ PHP version is compatible</p>";
} else {
    echo "<p style='color: red;'>❌ PHP version too old! Need 8.1+</p>";
}
echo "<hr>";

// Test 2: Laravel Autoload
echo "<h2>Test 2: Laravel Autoload</h2>";
try {
    require __DIR__.'/../vendor/autoload.php';
    echo "<p style='color: green;'>✅ Autoloader working!</p>";
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Autoload failed: " . $e->getMessage() . "</p>";
    exit;
}
echo "<hr>";

// Test 3: Laravel App Bootstrap
echo "<h2>Test 3: Laravel App Bootstrap</h2>";
try {
    $app = require_once __DIR__.'/../bootstrap/app.php';
    echo "<p style='color: green;'>✅ Laravel app loaded!</p>";
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ App bootstrap failed: " . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
    exit;
}
echo "<hr>";

// Test 4: Environment
echo "<h2>Test 4: Environment Configuration</h2>";
try {
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    
    echo "<p><strong>APP_NAME:</strong> " . config('app.name') . "</p>";
    echo "<p><strong>APP_ENV:</strong> " . config('app.env') . "</p>";
    echo "<p><strong>APP_DEBUG:</strong> " . (config('app.debug') ? 'true' : 'false') . "</p>";
    echo "<p><strong>APP_URL:</strong> " . config('app.url') . "</p>";
    echo "<p style='color: green;'>✅ Environment config loaded!</p>";
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Config failed: " . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
echo "<hr>";

// Test 5: Database Connection
echo "<h2>Test 5: Database Connection</h2>";
try {
    $pdo = DB::connection()->getPdo();
    echo "<p style='color: green;'>✅ Database connected!</p>";
    echo "<p><strong>Database:</strong> " . DB::connection()->getDatabaseName() . "</p>";
    echo "<p><strong>Driver:</strong> " . DB::connection()->getDriverName() . "</p>";
    
    // Test query
    $result = DB::select('SELECT DATABASE() as db');
    echo "<p><strong>Current DB:</strong> " . $result[0]->db . "</p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Database connection failed!</p>";
    echo "<p><strong>Error:</strong> " . $e->getMessage() . "</p>";
    echo "<p><strong>Check:</strong></p>";
    echo "<ul>";
    echo "<li>DB_HOST: " . env('DB_HOST') . "</li>";
    echo "<li>DB_DATABASE: " . env('DB_DATABASE') . "</li>";
    echo "<li>DB_USERNAME: " . env('DB_USERNAME') . "</li>";
    echo "<li>DB_PASSWORD: " . (env('DB_PASSWORD') ? '***set***' : '❌ NOT SET') . "</li>";
    echo "</ul>";
}
echo "<hr>";

// Test 6: Storage Permissions
echo "<h2>Test 6: Storage Permissions</h2>";
$storagePath = __DIR__.'/../storage/logs';
if (is_writable($storagePath)) {
    echo "<p style='color: green;'>✅ Storage is writable!</p>";
} else {
    echo "<p style='color: red;'>❌ Storage not writable!</p>";
    echo "<p>Run: chmod -R 775 storage</p>";
}
echo "<hr>";

// Test 7: Routes
echo "<h2>Test 7: Routes Check</h2>";
try {
    $routes = Route::getRoutes();
    echo "<p style='color: green;'>✅ Routes loaded!</p>";
    echo "<p><strong>Total routes:</strong> " . $routes->count() . "</p>";
    
    // Check for API routes
    $apiRoutes = 0;
    foreach ($routes as $route) {
        if (strpos($route->uri(), 'api/') === 0) {
            $apiRoutes++;
        }
    }
    echo "<p><strong>API routes:</strong> " . $apiRoutes . "</p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Routes failed: " . $e->getMessage() . "</p>";
}
echo "<hr>";

// Test 8: Check Key Files
echo "<h2>Test 8: File Existence Check</h2>";
$files = [
    '.env' => __DIR__.'/../.env',
    'composer.json' => __DIR__.'/../composer.json',
    'artisan' => __DIR__.'/../artisan',
    'public/index.php' => __DIR__.'/index.php',
];

foreach ($files as $name => $path) {
    if (file_exists($path)) {
        echo "<p>✅ <strong>$name</strong> exists</p>";
    } else {
        echo "<p style='color: red;'>❌ <strong>$name</strong> NOT FOUND</p>";
    }
}
echo "<hr>";

// Summary
echo "<h2>🎯 Summary</h2>";
echo "<p>If all tests pass ✅, Laravel should work!</p>";
echo "<p><strong>Next test:</strong> <a href='/api/v1/categories'>Test API Endpoint</a></p>";
echo "<hr>";
echo "<p style='font-size: 12px; color: gray;'>Debug tool - Delete this file after fixing!</p>";
?>
