#!/bin/bash
# Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
# EC2 Initial Setup Script
# This script installs Docker and Docker Compose on a fresh EC2 instance

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   EC2 Setup for Chinmaya Janata${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Configuration
EC2_HOST="${EC2_HOST:-}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_KEY="${EC2_KEY:-$HOME/.ssh/janata-ec2.pem}"

# Check EC2_HOST
if [ -z "$EC2_HOST" ]; then
    echo -e "${RED}❌ Error: EC2_HOST environment variable is not set${NC}"
    echo "Usage: EC2_HOST=your-ec2-ip.compute.amazonaws.com ./infrastructure/scripts/setup-ec2.sh"
    exit 1
fi

# Expand key path
EC2_KEY="${EC2_KEY/#\~/$HOME}"

if [ ! -f "$EC2_KEY" ]; then
    echo -e "${RED}❌ Error: EC2 key file not found at $EC2_KEY${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Using key: $EC2_KEY"
echo -e "${GREEN}✓${NC} Setting up: $EC2_USER@$EC2_HOST\n"

# Run setup commands on EC2
echo -e "${YELLOW}📦 Installing Docker and Docker Compose...${NC}"

ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    set -e
    
    echo "Updating system packages..."
    sudo apt-get update
    
    echo "Installing prerequisites..."
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    echo "Adding Docker's official GPG key..."
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    echo "Setting up Docker repository..."
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    echo "Installing Docker Engine..."
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    echo "Adding current user to docker group..."
    sudo usermod -aG docker $USER
    
    echo "Installing Docker Compose standalone..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    echo "Creating symbolic link..."
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    echo "Verifying installations..."
    docker --version
    docker-compose --version
    
    echo "✅ Docker and Docker Compose installed successfully!"
    echo ""
    echo "⚠️  IMPORTANT: You need to log out and back in for group changes to take effect"
    echo "   Or run: newgrp docker"
ENDSSH

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}   ✓ EC2 Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Log out and back into EC2 for Docker group to take effect:"
echo -e "   ${BLUE}ssh -i $EC2_KEY $EC2_USER@$EC2_HOST${NC}"
echo -e "   ${BLUE}exit${NC}"
echo ""
echo "2. Or activate the docker group immediately:"
echo -e "   ${BLUE}ssh -i $EC2_KEY $EC2_USER@$EC2_HOST 'newgrp docker'${NC}"
echo ""
echo "3. Then run deployment:"
echo -e "   ${BLUE}EC2_HOST=$EC2_HOST npm run deploy${NC}"
echo ""
echo -e "${BLUE}Jai Gurudev! 🙏${NC}"