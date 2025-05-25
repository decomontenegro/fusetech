#!/bin/bash

# FUSEtech Setup Script
set -e

echo "🔧 Setting up FUSEtech development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check and install Node.js
echo -e "${YELLOW}Checking Node.js installation...${NC}"

if ! command_exists node; then
    echo -e "${RED}Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${RED}Node.js version $NODE_VERSION is too old. Required: $REQUIRED_VERSION+${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $NODE_VERSION is installed${NC}"

# Check npm
if ! command_exists npm; then
    echo -e "${RED}npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm is installed${NC}"

# Install global dependencies
echo -e "${YELLOW}Installing global dependencies...${NC}"

GLOBAL_DEPS=(
    "vercel"
    "@supabase/cli"
    "firebase-tools"
)

for dep in "${GLOBAL_DEPS[@]}"; do
    if ! npm list -g "$dep" >/dev/null 2>&1; then
        echo -e "${YELLOW}Installing $dep...${NC}"
        npm install -g "$dep"
    else
        echo -e "${GREEN}✓ $dep is already installed${NC}"
    fi
done

# Install project dependencies
echo -e "${YELLOW}Installing project dependencies...${NC}"
npm install

# Setup environment variables
echo -e "${YELLOW}Setting up environment variables...${NC}"

if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✓ Created .env.local from .env.example${NC}"
        echo -e "${YELLOW}Please edit .env.local with your actual values${NC}"
    else
        echo -e "${YELLOW}Creating basic .env.local file...${NC}"
        cat > .env.local << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Development
NODE_ENV=development
EOF
        echo -e "${GREEN}✓ Created basic .env.local file${NC}"
    fi
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

# Setup Git hooks
echo -e "${YELLOW}Setting up Git hooks...${NC}"

if [ -d ".git" ]; then
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Run linter
npm run lint
if [ $? -ne 0 ]; then
    echo "Linting failed. Please fix the issues before committing."
    exit 1
fi

# Run type check
npm run type-check
if [ $? -ne 0 ]; then
    echo "Type checking failed. Please fix the issues before committing."
    exit 1
fi

echo "Pre-commit checks passed!"
EOF

    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✓ Git pre-commit hook installed${NC}"
else
    echo -e "${YELLOW}⚠ Not a Git repository - skipping Git hooks${NC}"
fi

# Setup Supabase (if CLI is available)
if command_exists supabase; then
    echo -e "${YELLOW}Setting up Supabase...${NC}"
    
    if [ ! -f "supabase/config.toml" ]; then
        echo -e "${YELLOW}Initializing Supabase project...${NC}"
        supabase init
        echo -e "${GREEN}✓ Supabase project initialized${NC}"
    else
        echo -e "${GREEN}✓ Supabase project already initialized${NC}"
    fi
    
    echo -e "${BLUE}To start local Supabase: supabase start${NC}"
    echo -e "${BLUE}To link to remote project: supabase link --project-ref your-project-ref${NC}"
fi

# Setup Firebase (if CLI is available)
if command_exists firebase; then
    echo -e "${YELLOW}Setting up Firebase...${NC}"
    
    if [ ! -f "firebase.json" ]; then
        echo -e "${YELLOW}Firebase not initialized. Run 'firebase init' to set up.${NC}"
    else
        echo -e "${GREEN}✓ Firebase project already initialized${NC}"
    fi
fi

# Create necessary directories
echo -e "${YELLOW}Creating necessary directories...${NC}"

DIRS=(
    "public/icons"
    "public/images"
    "apps/web/src/components/ui"
    "apps/web/src/lib/utils"
    "docs"
    "logs"
)

for dir in "${DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo -e "${GREEN}✓ Created directory: $dir${NC}"
    fi
done

# Setup VS Code settings (if VS Code is being used)
if [ -d ".vscode" ] || command_exists code; then
    echo -e "${YELLOW}Setting up VS Code configuration...${NC}"
    
    mkdir -p .vscode
    
    # VS Code settings
    cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/.next": true,
    "**/node_modules": true,
    "**/.git": true
  },
  "search.exclude": {
    "**/.next": true,
    "**/node_modules": true
  }
}
EOF

    # VS Code extensions recommendations
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
EOF

    echo -e "${GREEN}✓ VS Code configuration created${NC}"
fi

# Run initial build to verify setup
echo -e "${YELLOW}Running initial build to verify setup...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Initial build successful${NC}"
else
    echo -e "${RED}✗ Initial build failed${NC}"
    echo -e "${YELLOW}Please check the error messages above and fix any issues${NC}"
    exit 1
fi

# Setup complete
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "${BLUE}1. Edit .env.local with your actual API keys${NC}"
echo -e "${BLUE}2. Start development server: npm run dev${NC}"
echo -e "${BLUE}3. Open http://localhost:3000 in your browser${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "${BLUE}  npm run dev          - Start development server${NC}"
echo -e "${BLUE}  npm run build        - Build for production${NC}"
echo -e "${BLUE}  npm run lint         - Run linter${NC}"
echo -e "${BLUE}  npm run type-check   - Run TypeScript checks${NC}"
echo -e "${BLUE}  npm run test         - Run tests${NC}"
echo ""
echo -e "${YELLOW}Documentation:${NC}"
echo -e "${BLUE}  README.md            - Project overview${NC}"
echo -e "${BLUE}  docs/                - Detailed documentation${NC}"
echo -e "${BLUE}  .env.example         - Environment variables reference${NC}"
