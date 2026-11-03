#!/bin/bash

# Khojya Frontend Deployment Script
# Usage: bash deploy-frontend.sh

echo "🚀 Starting Khojya Frontend Deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/patnafinder"
PM2_APP_NAME="khojya"

echo -e "${YELLOW}📂 Checking project directory...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ Project directory not found: $PROJECT_DIR${NC}"
    exit 1
fi

cd $PROJECT_DIR

echo -e "${YELLOW}🔽 Pulling latest code...${NC}"
git pull origin main

echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install --production

echo -e "${YELLOW}⚙️  Checking environment file...${NC}"
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production file not found!${NC}"
    exit 1
fi

echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Check the errors above.${NC}"
    exit 1
fi

echo -e "${YELLOW}🔄 Restarting PM2 process...${NC}"
if pm2 describe $PM2_APP_NAME > /dev/null 2>&1; then
    pm2 restart $PM2_APP_NAME
    echo -e "${GREEN}✅ PM2 process restarted${NC}"
else
    echo -e "${YELLOW}Starting new PM2 process...${NC}"
    pm2 start npm --name "$PM2_APP_NAME" -- start
    pm2 save
    echo -e "${GREEN}✅ PM2 process started${NC}"
fi

echo -e "${YELLOW}📊 PM2 Status:${NC}"
pm2 status

echo -e "${GREEN}✅ Frontend deployment completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Test site: curl -I https://patnafinder.codevixa.com"
echo "2. Check PM2 logs: pm2 logs $PM2_APP_NAME"
echo "3. Monitor: pm2 monit"
