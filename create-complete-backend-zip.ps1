# Complete Laravel Backend ZIP Creator
# This includes ALL necessary files and folders

Write-Host "🔧 Creating Complete Backend Deployment ZIP..." -ForegroundColor Cyan

$sourceDir = "d:\patna-finder\backend\laravel"
$tempDir = "d:\patna-finder\temp-backend-deploy"
$zipPath = "d:\patna-finder\patna-finder-backend-complete.zip"

# Delete old ZIP if exists
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "✅ Deleted old ZIP" -ForegroundColor Green
}

# Delete temp directory if exists
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}

# Create temp directory
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
Write-Host "✅ Created temp directory" -ForegroundColor Green

Write-Host "`n📁 Copying files and folders..." -ForegroundColor Yellow

# Copy all necessary folders
$folders = @(
    "app",
    "bootstrap",
    "config",
    "database",
    "lang",
    "public",
    "resources",
    "routes",
    "storage",
    "tests"
)

foreach ($folder in $folders) {
    $source = Join-Path $sourceDir $folder
    $dest = Join-Path $tempDir $folder
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $dest -Recurse -Force
        Write-Host "  ✓ Copied: $folder" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Missing: $folder" -ForegroundColor Yellow
    }
}

# Copy root files
$files = @(
    ".editorconfig",
    ".env.example",
    ".gitattributes",
    ".gitignore",
    "artisan",
    "composer.json",
    "composer.lock",
    "package.json",
    "phpunit.xml",
    "README.md",
    "vite.config.js"
)

Write-Host "`n📄 Copying root files..." -ForegroundColor Yellow
foreach ($file in $files) {
    $source = Join-Path $sourceDir $file
    $dest = Join-Path $tempDir $file
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $dest -Force
        Write-Host "  ✓ Copied: $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ Missing: $file" -ForegroundColor Yellow
    }
}

# Clean storage folder (remove unnecessary files)
Write-Host "`n🧹 Cleaning storage folder..." -ForegroundColor Yellow
$storageCleanup = @(
    "$tempDir\storage\app\public\*.*",
    "$tempDir\storage\logs\*.log"
)

foreach ($path in $storageCleanup) {
    if (Test-Path $path) {
        Remove-Item $path -Force -ErrorAction SilentlyContinue
        Write-Host "  ✓ Cleaned: $path" -ForegroundColor Green
    }
}

# Create .gitkeep files in empty directories
$gitkeepDirs = @(
    "$tempDir\storage\app\public",
    "$tempDir\storage\framework\cache\data",
    "$tempDir\storage\framework\sessions",
    "$tempDir\storage\framework\testing",
    "$tempDir\storage\framework\views",
    "$tempDir\storage\logs"
)

Write-Host "`n📝 Creating .gitkeep files..." -ForegroundColor Yellow
foreach ($dir in $gitkeepDirs) {
    if (Test-Path $dir) {
        $gitkeep = Join-Path $dir ".gitkeep"
        New-Item -Path $gitkeep -ItemType File -Force | Out-Null
        Write-Host "  ✓ Created: $gitkeep" -ForegroundColor Green
    }
}

# Create deployment README
Write-Host "`n📋 Creating deployment instructions..." -ForegroundColor Yellow
$deployReadme = @"
# Patna Finder Backend Deployment

## 📦 Contents
This ZIP contains a complete Laravel 10 application.

## 📂 Folder Structure
- app/          - Application code (Controllers, Models, etc.)
- bootstrap/    - Laravel bootstrap files
- config/       - Configuration files
- database/     - Migrations, Seeders, Factories
- lang/         - Language files
- public/       - Web root (Point domain here!)
- resources/    - Views, assets
- routes/       - Route definitions (api.php, web.php)
- storage/      - File storage, logs, cache
- tests/        - Test files

## 🚀 Deployment Steps

### 1. Upload & Extract
Upload this ZIP to: /public_html/patnafinderapi/
Extract all files

### 2. Set Document Root
Subdomain document root must point to: /public_html/patnafinderapi/public

### 3. Configure .env
Copy .env.example to .env
Edit database credentials and other settings

### 4. Install Dependencies (SSH Required)
cd /home/username/public_html/patnafinderapi
composer install --optimize-autoloader --no-dev

### 5. Set Permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache
chmod 644 .env

### 6. Run Laravel Setup
php artisan key:generate
php artisan storage:link
php artisan migrate --force
php artisan db:seed --force
php artisan config:cache
php artisan route:cache

### 7. Test
https://patnafinderapi.codevixa.com/api/v1/categories

## ⚠️ Important
- vendor/ folder is NOT included (will be installed via composer)
- .env file is NOT included (create from .env.example)
- You MUST run composer install on server

## 📞 Support
Check deployment guides in main project folder.
"@

$deployReadme | Out-File -FilePath "$tempDir\DEPLOYMENT_INSTRUCTIONS.txt" -Encoding UTF8
Write-Host "  ✓ Created: DEPLOYMENT_INSTRUCTIONS.txt" -ForegroundColor Green

# Create ZIP
Write-Host "`n📦 Creating ZIP file..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)

# Get ZIP size
$zipSize = (Get-Item $zipPath).Length / 1MB

# Cleanup temp directory
Remove-Item $tempDir -Recurse -Force

# Show summary
Write-Host "`n✅ ZIP Created Successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📦 File: patna-finder-backend-complete.zip" -ForegroundColor White
Write-Host "📏 Size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor White
Write-Host "📂 Location: d:\patna-finder\" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

Write-Host "`n✅ Folders Included:" -ForegroundColor Green
foreach ($folder in $folders) {
    Write-Host "  ✓ $folder/" -ForegroundColor Gray
}

Write-Host "`n⚠️  NOT Included (Install on Server):" -ForegroundColor Yellow
Write-Host "  ✗ vendor/  (run: composer install)" -ForegroundColor Gray
Write-Host "  ✗ node_modules/  (not needed for API)" -ForegroundColor Gray
Write-Host "  ✗ .env  (create from .env.example)" -ForegroundColor Gray

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Upload ZIP to Hostinger" -ForegroundColor White
Write-Host "2. Extract in /public_html/patnafinderapi/" -ForegroundColor White
Write-Host "3. Set document root to /public_html/patnafinderapi/public" -ForegroundColor White
Write-Host "4. SSH: composer install --optimize-autoloader --no-dev" -ForegroundColor White
Write-Host "5. Configure .env and run migrations" -ForegroundColor White
Write-Host "`n" -ForegroundColor White
