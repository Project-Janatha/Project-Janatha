#!/bin/bash
# Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
# Remote Deployment Script (runs ON the EC2 instance)
# This script pulls from git and redeploys

set -e

DEPLOY_DIR="/home/ubuntu/project-janatha"
BRANCH="${DEPLOY_BRANCH:-aws-migration}"

echo "🔄 Starting remote deployment from Git..."

cd $DEPLOY_DIR

# Pull latest changes
echo "📥 Pulling latest changes from $BRANCH..."
git pull origin $BRANCH

# Build and restart containers
echo "🔨 Rebuilding containers..."
docker-compose down
docker-compose build
docker-compose up -d

echo "✅ Deployment complete!"
echo ""
echo "Container status:"
docker-compose ps
