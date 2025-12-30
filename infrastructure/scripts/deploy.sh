#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 Starting deployment to EC2..."
echo "📁 Project root: $PROJECT_ROOT"

EC2_HOST="${EC2_HOST:-}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_KEY="${EC2_KEY:-$HOME/.ssh/janata-ec2.pem}"
DEPLOY_DIR="/home/ubuntu/chinmaya-janata"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$EC2_HOST" ]; then
    echo -e "${RED}❌ Error: EC2_HOST environment variable is not set${NC}"
    echo "Usage: EC2_HOST=your-ec2-ip.compute.amazonaws.com npm run deploy"
    exit 1
fi

EC2_KEY="${EC2_KEY/#\~/$HOME}"

if [ ! -f "$EC2_KEY" ]; then
    echo -e "${RED}❌ Error: EC2 key file not found at $EC2_KEY${NC}"
    exit 1
fi

KEY_PERMS=$(stat -f "%A" "$EC2_KEY" 2>/dev/null || stat -c "%a" "$EC2_KEY" 2>/dev/null)
if [ "$KEY_PERMS" != "400" ] && [ "$KEY_PERMS" != "0400" ]; then
    echo -e "${YELLOW}⚠️  Warning: Key file has incorrect permissions ($KEY_PERMS)${NC}"
    chmod 400 "$EC2_KEY"
fi

echo -e "${GREEN}✓${NC} Using key: $EC2_KEY"
echo -e "${GREEN}✓${NC} Deploying to: $EC2_USER@$EC2_HOST"

if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml not found in project root${NC}"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Error: Dockerfile not found in project root${NC}"
    exit 1
fi

echo -e "\n${YELLOW}🔐 Testing SSH connection...${NC}"
if ! ssh -i "$EC2_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${RED}❌ Error: Cannot connect to EC2 instance${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} SSH connection successful"

echo -e "\n${YELLOW}📦 Building Docker image...${NC}"
docker-compose build

echo -e "\n${YELLOW}💾 Saving Docker image...${NC}"
IMAGE_NAME=$(docker-compose config | grep 'image:' | head -1 | awk '{print $2}')
if [ -z "$IMAGE_NAME" ]; then
    IMAGE_NAME="chinmaya-janata-app:latest"
fi
echo "Image name: $IMAGE_NAME"
docker save "$IMAGE_NAME" | gzip > /tmp/janata-app.tar.gz

echo -e "\n${YELLOW}📤 Copying files to EC2...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "mkdir -p $DEPLOY_DIR/packages/backend"

echo "Copying docker-compose.yml..."
scp -i "$EC2_KEY" docker-compose.yml "$EC2_USER@$EC2_HOST:$DEPLOY_DIR/"

echo "Copying Docker image..."
scp -i "$EC2_KEY" /tmp/janata-app.tar.gz "$EC2_USER@$EC2_HOST:$DEPLOY_DIR/"

if [ -f "nginx.conf" ]; then
    echo "Copying nginx.conf..."
    scp -i "$EC2_KEY" nginx.conf "$EC2_USER@$EC2_HOST:$DEPLOY_DIR/"
fi

# Create or copy .env file
if [ -f "packages/backend/.env" ]; then
    echo -e "${YELLOW}📋 Copying environment file...${NC}"
    scp -i "$EC2_KEY" packages/backend/.env "$EC2_USER@$EC2_HOST:$DEPLOY_DIR/packages/backend/"
else
    echo -e "${YELLOW}⚠️  Creating default .env file on EC2...${NC}"
    ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'ENVEOF'
cat > /home/ubuntu/chinmaya-janata/packages/backend/.env << 'EOF'
NODE_ENV=production
PORT=8008
AWS_REGION=us-east-1
USERS_TABLE=ChinmayaJanata-Users
CENTERS_TABLE=ChinmayaJanata-Centers
EVENTS_TABLE=ChinmayaJanata-Events
JWT_SECRET=CHANGE-THIS-SECRET-IN-PRODUCTION
SESSION_SECRET=CHANGE-THIS-SECRET-IN-PRODUCTION
ADMIN_NAME=Brahman
CORS_ORIGIN=*
EOF
ENVEOF
fi

echo -e "\n${YELLOW}🚢 Deploying on EC2...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    set -e
    cd /home/ubuntu/chinmaya-janata
    
    echo "Loading Docker image..."
    docker load < janata-app.tar.gz
    
    echo "Stopping existing containers..."
    docker-compose down || true
    
    echo "Starting new containers..."
    docker-compose up -d
    
    echo "Waiting for containers to start..."
    sleep 5
    
    echo "Checking container status..."
    docker-compose ps
    
    echo "Recent logs:"
    docker-compose logs --tail=30
    
    echo "Cleaning up..."
    rm janata-app.tar.gz
    
    echo "✅ Deployment complete!"
ENDSSH

rm /tmp/janata-app.tar.gz

echo -e "\n${GREEN}✅ Deployment successful!${NC}"
echo -e "Your app should be running at: http://$EC2_HOST"
echo -e "\nTo view logs, run:"
echo -e "  ssh -i $EC2_KEY $EC2_USER@$EC2_HOST 'cd $DEPLOY_DIR && docker-compose logs -f'"