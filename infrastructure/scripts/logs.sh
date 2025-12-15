#!/bin/bash
# Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
# View logs from EC2 deployment

EC2_HOST="${EC2_HOST:-}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_KEY="${EC2_KEY:-~/.ssh/janatha-ec2.pem}"
DEPLOY_DIR="/home/ubuntu/project-janatha"

if [ -z "$EC2_HOST" ]; then
    echo "❌ Error: EC2_HOST environment variable is not set"
    echo "Usage: EC2_HOST=your-ec2-ip.compute.amazonaws.com bash infrastructure/scripts/logs.sh"
    exit 1
fi

echo "📋 Fetching logs from $EC2_HOST..."

ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "cd $DEPLOY_DIR && docker-compose logs -f --tail=100"
