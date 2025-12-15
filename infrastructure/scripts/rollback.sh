#!/bin/bash
# Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
# Rollback to previous deployment

set -e

EC2_HOST="${EC2_HOST:-}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_KEY="${EC2_KEY:-~/.ssh/janatha-ec2.pem}"
DEPLOY_DIR="/home/ubuntu/project-janatha"

if [ -z "$EC2_HOST" ]; then
    echo "❌ Error: EC2_HOST environment variable is not set"
    exit 1
fi

echo "⏮️  Rolling back deployment on $EC2_HOST..."

ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    set -e
    cd /home/ubuntu/project-janatha
    
    echo "Stopping current containers..."
    docker-compose down
    
    echo "Reverting to previous git commit..."
    git reset --hard HEAD~1
    
    echo "Rebuilding containers..."
    docker-compose build
    docker-compose up -d
    
    echo "✅ Rollback complete!"
    docker-compose ps
ENDSSH

echo "✅ Rollback successful!"
