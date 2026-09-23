# Patna Finder - Backend Deployment ZIP Creator
# Run this from project root: d:\patna-finder\

Write-Host "🚀 Creating Backend Deployment ZIP..." -ForegroundColor Cyan
Write-Host ""

# Navigate to Laravel folder
$laravelPath = "backend\laravel"
Set-Location $laravelPath

# Output path
$zipPath = "..\..\patna-finder-backend.zip"

# Remove old ZIP if exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "🗑️  Removed old ZIP file" -ForegroundColor Yellow
}

Write-Host "📦 Compressing files..." -ForegroundColor Cyan

# Files and folders to include
$items = @(
    "app",
    "bootstrap", 
    "config",
    "database",
    "lang",
    "public",
    "resources",
    "routes",
    "storage",
    "vendor",
    "artisan",
    "composer.json",
    "composer.lock",
    ".env.example"
)

# Check if vendor exists
if (-Not (Test-Path "vendor")) {
    Write-Host "⚠️  Warning: 'vendor' folder not found!" -ForegroundColor Yellow
    Write-Host "   You'll need to run 'composer install' on server" -ForegroundColor Yellow
    $items = $items | Where-Object { $_ -ne "vendor" }
}

# Create ZIP
try {
    Compress-Archive -Path $items -DestinationPath $zipPath -Force -ErrorAction Stop
    
    # Get file size
    $zipSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    
    Write-Host ""
    Write-Host "✅ SUCCESS! Deployment ZIP created" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Location: patna-finder-backend.zip" -ForegroundColor White
    Write-Host "📊 Size: $zipSize MB" -ForegroundColor White
    Write-Host ""
    Write-Host "📋 Files Included:" -ForegroundColor Cyan
    foreach ($item in $items) {
        Write-Host "   ✓ $item" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "🎯 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Login to Hostinger cPanel" -ForegroundColor White
    Write-Host "   2. Go to File Manager" -ForegroundColor White
    Write-Host "   3. Navigate to: public_html/patna-finder/" -ForegroundColor White
    Write-Host "   4. Upload patna-finder-backend.zip" -ForegroundColor White
    Write-Host "   5. Extract the ZIP file" -ForegroundColor White
    Write-Host "   6. Follow BACKEND_DEPLOYMENT_ZIP_GUIDE.md" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: Failed to create ZIP file" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}

# Return to original directory
Set-Location ..\..

Write-Host "✨ Done!" -ForegroundColor Green
Write-Host ""
