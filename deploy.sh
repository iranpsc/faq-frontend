#!/bin/bash

# Production Deployment Script for FAQ Frontend
# Usage: ./deploy.sh [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default environment
ENVIRONMENT=${1:-production}

echo -e "${GREEN}🚀 Starting deployment for environment: $ENVIRONMENT${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js version: $(node -v)${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci --only=production

# Run linting
echo -e "${YELLOW}🔍 Running linting...${NC}"
npm run lint

# Run type checking
echo -e "${YELLOW}🔍 Running type checking...${NC}"
npm run type-check

# Build the application
echo -e "${YELLOW}🏗️  Building application...${NC}"
if [ "$ENVIRONMENT" = "production" ]; then
    npm run build:prod
else
    npm run build
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Create deployment directory
DEPLOY_DIR="./deploy"
echo -e "${YELLOW}📁 Creating deployment directory...${NC}"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy necessary files
echo -e "${YELLOW}📋 Copying files to deployment directory...${NC}"
cp -r .next $DEPLOY_DIR/
cp -r public $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp package-lock.json $DEPLOY_DIR/
cp next.config.ts $DEPLOY_DIR/

# Create production environment file
cat > $DEPLOY_DIR/.env.local << 'EOF'
NODE_ENV=production
PORT=3005
NEXT_PUBLIC_API_URL=https://api.faqhub.ir/api
EOF

# Create production start script
cat > $DEPLOY_DIR/start.sh << 'EOF'
#!/bin/bash
export NODE_ENV=production
export PORT=${PORT:-3005}
export NEXT_PUBLIC_API_URL=https://api.faqhub.ir/api
exec node .next/standalone/server.js
EOF

chmod +x $DEPLOY_DIR/start.sh

echo -e "${GREEN}✅ Deployment package created in $DEPLOY_DIR${NC}"
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "   1. Upload the contents of $DEPLOY_DIR to your server"
echo -e "   2. Run: cd $DEPLOY_DIR && npm ci --only=production"
echo -e "   3. Run: ./start.sh"
echo -e "   4. Or use PM2: pm2 start start.sh --name faq-frontend"
