#!/bin/bash

# FUSEtech Deployment Script
set -e

echo "🚀 Starting FUSEtech deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Environment check
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV=production
fi

echo -e "${BLUE}Environment: $NODE_ENV${NC}"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"

if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

if ! command_exists git; then
    echo -e "${RED}Error: git is not installed${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${RED}Error: Node.js version $NODE_VERSION is too old. Required: $REQUIRED_VERSION+${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Dependencies check passed${NC}"

# Environment variables check
echo -e "${YELLOW}Checking environment variables...${NC}"

REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "NEXT_PUBLIC_APP_URL"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}Error: Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "${RED}  - $var${NC}"
    done
    echo -e "${YELLOW}Please set these variables in your .env file or environment${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Environment variables check passed${NC}"

# Clean previous builds
echo -e "${YELLOW}Cleaning previous builds...${NC}"
rm -rf .next
rm -rf apps/web/.next
rm -rf apps/web/out
rm -rf dist

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm ci --production=false

# Type checking
echo -e "${YELLOW}Running type checks...${NC}"
npm run type-check

# Linting
echo -e "${YELLOW}Running linter...${NC}"
npm run lint

# Testing
if [ "$NODE_ENV" != "production" ]; then
    echo -e "${YELLOW}Running tests...${NC}"
    npm run test
fi

# Build application
echo -e "${YELLOW}Building application...${NC}"
npm run build

# Check build output
if [ ! -d "apps/web/.next" ]; then
    echo -e "${RED}Error: Build failed - .next directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully${NC}"

# Deploy to Vercel (if vercel CLI is available)
if command_exists vercel; then
    echo -e "${YELLOW}Deploying to Vercel...${NC}"
    
    if [ "$NODE_ENV" = "production" ]; then
        vercel --prod --yes
    else
        vercel --yes
    fi
    
    echo -e "${GREEN}✓ Deployment completed${NC}"
else
    echo -e "${YELLOW}Vercel CLI not found. Skipping deployment.${NC}"
    echo -e "${BLUE}To deploy manually:${NC}"
    echo -e "${BLUE}1. Install Vercel CLI: npm i -g vercel${NC}"
    echo -e "${BLUE}2. Run: vercel --prod${NC}"
fi

# Health check
if [ -n "$NEXT_PUBLIC_APP_URL" ]; then
    echo -e "${YELLOW}Running health check...${NC}"
    
    # Wait a bit for deployment to be ready
    sleep 10
    
    HEALTH_URL="$NEXT_PUBLIC_APP_URL/api/health"
    
    if command_exists curl; then
        if curl -f -s "$HEALTH_URL" > /dev/null; then
            echo -e "${GREEN}✓ Health check passed${NC}"
        else
            echo -e "${YELLOW}⚠ Health check failed - app might still be starting${NC}"
        fi
    else
        echo -e "${YELLOW}curl not available - skipping health check${NC}"
    fi
fi

# Database migrations (if needed)
if [ -f "scripts/migrate.sh" ]; then
    echo -e "${YELLOW}Running database migrations...${NC}"
    ./scripts/migrate.sh
fi

# Post-deployment tasks
echo -e "${YELLOW}Running post-deployment tasks...${NC}"

# Clear CDN cache (if using Cloudflare or similar)
if [ -n "$CLOUDFLARE_ZONE_ID" ] && [ -n "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${YELLOW}Clearing Cloudflare cache...${NC}"
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
         -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
         -H "Content-Type: application/json" \
         --data '{"purge_everything":true}' \
         --silent > /dev/null
    echo -e "${GREEN}✓ Cache cleared${NC}"
fi

# Send deployment notification
if [ -n "$SLACK_WEBHOOK_URL" ]; then
    echo -e "${YELLOW}Sending deployment notification...${NC}"
    
    COMMIT_HASH=$(git rev-parse --short HEAD)
    COMMIT_MESSAGE=$(git log -1 --pretty=%B)
    
    curl -X POST "$SLACK_WEBHOOK_URL" \
         -H "Content-Type: application/json" \
         -d "{
             \"text\": \"🚀 FUSEtech deployed successfully!\",
             \"attachments\": [{
                 \"color\": \"good\",
                 \"fields\": [
                     {\"title\": \"Environment\", \"value\": \"$NODE_ENV\", \"short\": true},
                     {\"title\": \"Commit\", \"value\": \"$COMMIT_HASH\", \"short\": true},
                     {\"title\": \"Message\", \"value\": \"$COMMIT_MESSAGE\", \"short\": false}
                 ]
             }]
         }" \
         --silent > /dev/null
    
    echo -e "${GREEN}✓ Notification sent${NC}"
fi

# Performance budget check
echo -e "${YELLOW}Checking performance budget...${NC}"

BUNDLE_SIZE=$(du -sh apps/web/.next/static 2>/dev/null | cut -f1 || echo "unknown")
echo -e "${BLUE}Bundle size: $BUNDLE_SIZE${NC}"

# Security scan (if available)
if command_exists npm-audit; then
    echo -e "${YELLOW}Running security audit...${NC}"
    npm audit --audit-level moderate
fi

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${BLUE}App URL: $NEXT_PUBLIC_APP_URL${NC}"
echo -e "${BLUE}Environment: $NODE_ENV${NC}"
echo -e "${BLUE}Build time: $(date)${NC}"

# Show next steps
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${BLUE}1. Monitor application logs${NC}"
echo -e "${BLUE}2. Check error tracking (Sentry)${NC}"
echo -e "${BLUE}3. Verify analytics are working${NC}"
echo -e "${BLUE}4. Test critical user flows${NC}"
echo -e "${BLUE}5. Monitor performance metrics${NC}"
