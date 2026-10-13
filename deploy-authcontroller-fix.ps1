# Quick Deploy Script - Fix AuthController Duplicate Function
# Run this from: d:\patna-finder

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "AuthController Fix Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$SERVER = "u777317772@145.79.212.11"
$PORT = "65002"
$REMOTE_PATH = "/home/u777317772/domains/patnafinderapi.codevixa.com/public_html"
$LOCAL_FILE = "backend\laravel\app\Http\Controllers\Api\User\AuthController.php"

# Step 1: Verify local file exists
Write-Host "[1/5] Checking local file..." -ForegroundColor Yellow
if (!(Test-Path $LOCAL_FILE)) {
    Write-Host "ERROR: Local file not found: $LOCAL_FILE" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Local file found" -ForegroundColor Green
Write-Host ""

# Step 2: Create backup on server
Write-Host "[2/5] Creating backup on server..." -ForegroundColor Yellow
$BACKUP_CMD = "cd $REMOTE_PATH && cp app/Http/Controllers/Api/User/AuthController.php app/Http/Controllers/Api/User/AuthController.php.backup-`$(date +%Y%m%d-%H%M%S)"
ssh -p $PORT $SERVER $BACKUP_CMD
Write-Host "✓ Backup created" -ForegroundColor Green
Write-Host ""

# Step 3: Upload fixed file
Write-Host "[3/5] Uploading fixed AuthController.php..." -ForegroundColor Yellow
scp -P $PORT $LOCAL_FILE "${SERVER}:${REMOTE_PATH}/app/Http/Controllers/Api/User/"
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ File uploaded successfully" -ForegroundColor Green
} else {
    Write-Host "ERROR: File upload failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Verify PHP syntax
Write-Host "[4/5] Verifying PHP syntax..." -ForegroundColor Yellow
$VERIFY_CMD = "cd $REMOTE_PATH && php -l app/Http/Controllers/Api/User/AuthController.php"
ssh -p $PORT $SERVER $VERIFY_CMD
Write-Host ""

# Step 5: Clear Laravel cache
Write-Host "[5/5] Clearing Laravel cache..." -ForegroundColor Yellow
$CACHE_CMD = "cd $REMOTE_PATH && php artisan config:cache && php artisan route:cache && php artisan cache:clear"
ssh -p $PORT $SERVER $CACHE_CMD
Write-Host "✓ Cache cleared" -ForegroundColor Green
Write-Host ""

Write-Host "=====================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open: https://patnafinder.codevixa.com" -ForegroundColor White
Write-Host "2. Clear browser cache or use Incognito mode" -ForegroundColor White
Write-Host "3. Try registering a new user" -ForegroundColor White
Write-Host "4. Should work without CORS error!" -ForegroundColor White
Write-Host ""
Write-Host "To monitor logs:" -ForegroundColor Cyan
Write-Host "ssh -p $PORT $SERVER 'cd $REMOTE_PATH && tail -f storage/logs/laravel.log'" -ForegroundColor White
