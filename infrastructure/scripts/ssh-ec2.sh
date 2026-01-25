#!/bin/bash
# Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
# Quick SSH into EC2

EC2_HOST="${EC2_HOST:-}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_KEY="${EC2_KEY:-~/.ssh/janatha-ec2.pem}"

if [ -z "$EC2_HOST" ]; then
    echo "❌ Error: EC2_HOST environment variable is not set"
    echo "Usage: EC2_HOST=your-ec2-ip.compute.amazonaws.com bash infrastructure/scripts/ssh-ec2.sh"
    exit 1
fi

ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST"
