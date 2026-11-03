#!/bin/bash

# Khojya Backend Deployment Script
# Usage: bash deploy-backend.sh

echo "🚀 Starting Khojya Backend Deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/patna-finder-api"
BACKUP_DIR="/var/backups/khojya"

echo -e "${YELLOW}📂 Checking project directory...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

cd $PROJECT_DIR

echo -e "${YELLOW}🔽 Pulling latest code...${NC}"
git pull origin main

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
composer install --optimize-autoloader --no-dev

echo -e "${YELLOW}⚙️  Checking environment file...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ .env file not found! Copy .env.production and configure it.${NC}"
    exit 1
fi

echo -e "${YELLOW}🗄️  Taking database backup...${NC}"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p patna_finder_production > $BACKUP_DIR/backup_$TIMESTAMP.sql
echo -e "${GREEN}✅ Backup saved: $BACKUP_DIR/backup_$TIMESTAMP.sql${NC}"

echo -e "${YELLOW}📊 Running migrations...${NC}"
php artisan migrate --force

echo -e "${YELLOW}🗑️  Clearing caches...${NC}"
php artisan cache:clear
php artisan config:clear
php artisan view:clear
php artisan route:clear

echo -e "${YELLOW}⚡ Optimizing application...${NC}"
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo -e "${YELLOW}🔐 Setting permissions...${NC}"
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 755 storage bootstrap/cache

echo -e "${GREEN}✅ Backend deployment completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Test API: curl https://patnafinderapi.codevixa.com/api/v1/health"
echo "2. Check logs: tail -f storage/logs/laravel.log"
echo "3. Monitor errors: sudo tail -f /var/log/nginx/error.log"
