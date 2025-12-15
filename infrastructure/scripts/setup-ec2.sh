#!/bin/bash
# Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
# Initial EC2 Setup Script
# Run this ONCE on a fresh EC2 instance to set up Docker and dependencies

set -e

echo "🔧 Setting up EC2 instance for Project Janatha..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "🐋 Installing Docker..."
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up Docker repository
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add current user to docker group
echo "👤 Adding user to docker group..."
sudo usermod -aG docker $USER

# Configure Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# Create application directory
echo "📁 Creating application directory..."
mkdir -p /home/ubuntu/project-janatha/packages/backend

# Set up log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/docker-containers > /dev/null << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
}
EOF

# Configure firewall (if UFW is installed)
if command -v ufw &> /dev/null; then
    echo "🔥 Configuring firewall..."
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw --force enable
fi

# Verify installations
echo ""
echo "✅ Setup complete!"
echo ""
echo "Installed versions:"
docker --version
docker-compose --version
echo ""
echo "⚠️  IMPORTANT: You need to log out and log back in for Docker group changes to take effect"
echo "   Run: exit"
echo "   Then reconnect via SSH"
echo ""
echo "Next steps:"
echo "1. Configure AWS credentials for DynamoDB access (use IAM role)"
echo "2. Create .env file in /home/ubuntu/project-janatha/packages/backend/"
echo "3. Run deployment from your local machine: npm run deploy"
