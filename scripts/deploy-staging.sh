#!/bin/bash

# FUSEtech Staging Deployment Script
# This script handles the deployment to the staging environment

set -e

echo "🚀 Starting FUSEtech Staging Deployment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're on the staging branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "staging" ]; then
    echo -e "${YELLOW}Warning: You're not on the staging branch. Current branch: $CURRENT_BRANCH${NC}"
    echo "Do you want to continue? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}Error: You have uncommitted changes. Please commit or stash them before deploying.${NC}"
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin staging

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests
echo "🧪 Running tests..."
npm run test

# Run type checking
echo "🔍 Running type check..."
npm run type-check

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy to Vercel staging
echo "🚀 Deploying to Vercel staging..."
if [ -f .env.staging.local ]; then
    # Load staging environment variables
    export $(cat .env.staging.local | grep -v '^#' | xargs)
fi

# Deploy with staging configuration
vercel deploy --prod --env-file .env.staging --scope fusetech --yes

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls --scope fusetech | grep staging | head -1 | awk '{print $2}')

echo -e "${GREEN}✅ Staging deployment complete!${NC}"
echo -e "🌐 Deployment URL: ${DEPLOYMENT_URL}"
echo ""
echo "📋 Post-deployment checklist:"
echo "   □ Check deployment at https://staging.fusetech.app"
echo "   □ Verify environment variables in Vercel dashboard"
echo "   □ Test critical user flows"
echo "   □ Check error monitoring (Sentry)"
echo "   □ Verify API endpoints"
echo ""
echo "🏷️  To create a release tag:"
echo "   git tag -a staging-v$(date +%Y%m%d-%H%M%S) -m 'Staging deployment'"
echo "   git push origin --tags"