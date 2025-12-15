#!/bin/bash
# Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
# EC2 Deployment Script
# This script deploys the application to EC2 using Docker

set -e  # Exit on error

echo "🚀 Starting deployment to EC2..."

# Configuration
EC2_HOST="${EC2_HOST:-}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_KEY="${EC2_KEY:-~/.ssh/janatha-ec2.pem}"
DEPLOY_DIR="/home/ubuntu/project-janatha"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check required environment variables
if [ -z "$EC2_HOST" ]; then
    echo -e "${RED}❌ Error: EC2_HOST environment variable is not set${NC}"
    echo "Usage: EC2_HOST=your-ec2-ip.compute.amazonaws.com npm run deploy"
    exit 1
fi

if [ ! -f "$EC2_KEY" ]; then
    echo -e "${RED}❌ Error: EC2 key file not found at $EC2_KEY${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Deploying to: $EC2_USER@$EC2_HOST"

# Build Docker image locally
echo -e "\n${YELLOW}📦 Building Docker image...${NC}"
docker-compose build

# Save Docker image to tar file
echo -e "\n${YELLOW}💾 Saving Docker image...${NC}"
docker save project-janatha-app:latest | gzip > /tmp/janatha-app.tar.gz

# Copy files to EC2
echo -e "\n${YELLOW}📤 Copying files to EC2...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "mkdir -p $DEPLOY_DIR"

# Copy docker-compose and necessary files
scp -i "$EC2_KEY" docker-compose.yml "$EC2_USER@$EC2_HOST:$DEPLOY_DIR/"
scp -i "$EC2_KEY" nginx.conf "$EC2_USER@$EC2_HOST:$DEPLOY_DIR/"
scp -i "$EC2_KEY" /tmp/janatha-app.tar.gz "$EC2_USER@$EC2_HOST:$DEPLOY_DIR/"

# Copy environment file if it exists
if [ -f "packages/backend/.env" ]; then
    echo -e "${YELLOW}📋 Copying environment file...${NC}"
    scp -i "$EC2_KEY" packages/backend/.env "$EC2_USER@$EC2_HOST:$DEPLOY_DIR/packages/backend/"
fi

# Deploy on EC2
echo -e "\n${YELLOW}🚢 Deploying on EC2...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    set -e
    cd /home/ubuntu/project-janatha
    
    echo "Loading Docker image..."
    docker load < janatha-app.tar.gz
    
    echo "Stopping existing containers..."
    docker-compose down || true
    
    echo "Starting new containers..."
    docker-compose up -d
    
    echo "Cleaning up..."
    rm janatha-app.tar.gz
    
    echo "Checking container status..."
    docker-compose ps
    
    echo "✅ Deployment complete!"
ENDSSH

# Clean up local temp file
rm /tmp/janatha-app.tar.gz

echo -e "\n${GREEN}✅ Deployment successful!${NC}"
echo -e "Your app should be running at: http://$EC2_HOST"
echo -e "\nTo view logs, run:"
echo -e "  ssh -i $EC2_KEY $EC2_USER@$EC2_HOST 'cd $DEPLOY_DIR && docker-compose logs -f'"
