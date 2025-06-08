#!/bin/bash

# FUSEtech Staging Branch Setup Script
# This script sets up the staging branch and its configuration

set -e

echo "🌿 Setting up FUSEtech staging branch..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if staging branch exists
if git rev-parse --verify staging >/dev/null 2>&1; then
    echo -e "${YELLOW}Staging branch already exists${NC}"
    echo "Do you want to reset it? (y/n)"
    read -r response
    if [ "$response" = "y" ]; then
        git branch -D staging
        git push origin --delete staging 2>/dev/null || true
    else
        echo "Switching to existing staging branch..."
        git checkout staging
        git pull origin staging
        exit 0
    fi
fi

# Create staging branch from main
echo "📝 Creating staging branch from main..."
git checkout main
git pull origin main
git checkout -b staging

# Push staging branch to remote
echo "📤 Pushing staging branch to remote..."
git push -u origin staging

# Create staging-specific files if they don't exist
if [ ! -f .env.staging.local ]; then
    echo "📄 Creating .env.staging.local from template..."
    cp .env.staging .env.staging.local
    echo -e "${YELLOW}⚠️  Please update .env.staging.local with your staging credentials${NC}"
fi

# Set up git hooks for staging
echo "🪝 Setting up git hooks..."
mkdir -p .git/hooks

# Pre-push hook for staging
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
# Pre-push hook for staging branch

protected_branch='staging'
current_branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

if [ "$current_branch" = "$protected_branch" ]; then
    echo "🔍 Running pre-push checks for staging..."
    
    # Run tests
    npm run test
    
    # Run type check
    npm run type-check
    
    echo "✅ All checks passed!"
fi

exit 0
EOF

chmod +x .git/hooks/pre-push

echo -e "${GREEN}✅ Staging branch setup complete!${NC}"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env.staging.local with your staging credentials"
echo "   2. Configure Vercel project settings for staging branch"
echo "   3. Set up staging domain (staging.fusetech.app)"
echo "   4. Configure staging environment variables in Vercel"
echo ""
echo "🚀 To deploy to staging:"
echo "   npm run deploy:staging"
echo ""
echo "📌 Current branch: $(git branch --show-current)"