#!/bin/bash

# Khojya Quick Health Check Script
# Usage: bash quick-check.sh

echo "🔍 Khojya Health Check"
echo "======================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# API Health Check
echo -e "${YELLOW}Checking API...${NC}"
API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://patnafinderapi.codevixa.com/api/v1/health)
if [ "$API_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ API is running (HTTP $API_RESPONSE)${NC}"
else
    echo -e "${RED}❌ API is down (HTTP $API_RESPONSE)${NC}"
fi

# Frontend Check
echo -e "${YELLOW}Checking Frontend...${NC}"
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://patnafinder.codevixa.com)
if [ "$FRONTEND_RESPONSE" -eq 200 ]; then
    echo -e "${GREEN}✅ Frontend is running (HTTP $FRONTEND_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Frontend is down (HTTP $FRONTEND_RESPONSE)${NC}"
fi

# SSL Certificate Check
echo -e "${YELLOW}Checking SSL Certificates...${NC}"
API_SSL=$(curl -vI https://patnafinderapi.codevixa.com 2>&1 | grep "expire date" | awk '{print $4,$5,$6,$7}')
FRONTEND_SSL=$(curl -vI https://patnafinder.codevixa.com 2>&1 | grep "expire date" | awk '{print $4,$5,$6,$7}')

if [ ! -z "$API_SSL" ]; then
    echo -e "${GREEN}✅ API SSL expires: $API_SSL${NC}"
else
    echo -e "${YELLOW}⚠️  Could not check API SSL${NC}"
fi

if [ ! -z "$FRONTEND_SSL" ]; then
    echo -e "${GREEN}✅ Frontend SSL expires: $FRONTEND_SSL${NC}"
else
    echo -e "${YELLOW}⚠️  Could not check Frontend SSL${NC}"
fi

echo ""
echo "Database Connection (run on server):"
echo "  mysql -u khojya_user -p patna_finder_production"
echo ""
echo "PM2 Status (run on server):"
echo "  pm2 status"
echo ""
echo "Recent API Logs (run on server):"
echo "  tail -n 50 /var/www/patna-finder-api/storage/logs/laravel.log"
