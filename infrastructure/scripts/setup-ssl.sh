#!/bin/bash
set -e

EC2_HOST="${EC2_HOST:-}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_KEY="${EC2_KEY:-$HOME/.ssh/janata-ec2.pem}"

if [ -z "$EC2_HOST" ]; then
    echo "Usage: EC2_HOST=... ./infrastructure/scripts/setup-ssl.sh"
    exit 1
fi

echo "🔐 Setting up SSL on $EC2_HOST..."

ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    set -e
    
    # Install Certbot if not present
    if ! command -v certbot &> /dev/null; then
        echo "Installing Certbot..."
        sudo apt-get update
        sudo apt-get install -y certbot
    fi

    # Check if certificates already exist
    if [ -d "/etc/letsencrypt/live/chinmayajanata.org" ]; then
        echo "✅ Certificates already exist."
    else
        echo "🆕 Obtaining new certificates..."
        
        # Stop any running containers on port 80
        if docker ps | grep -q "chinmaya-janata-app"; then
            echo "Stopping Docker container to free port 80..."
            cd /home/ubuntu/chinmaya-janata
            docker-compose down || true
        fi

        # Run Certbot standalone
        # Using --register-unsafely-without-email to avoid prompts
        sudo certbot certonly --standalone \
            --non-interactive \
            --agree-tos \
            --register-unsafely-without-email \
            -d chinmayajanata.org \
            -d app.chinmayajanata.org

        echo "✅ Certificates obtained successfully."
    fi

    # Ensure permissions (Docker needs to read these)
    # This is a bit hacky but necessary for mapped volumes sometimes
    # sudo chmod -R 755 /etc/letsencrypt/live
    # sudo chmod -R 755 /etc/letsencrypt/archive
ENDSSH
