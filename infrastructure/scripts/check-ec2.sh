#!/bin/bash

EC2_HOST="${1:-}"

if [ -z "$EC2_HOST" ]; then
    echo "Usage: ./infrastructure/scripts/check-ec2.sh your-ec2-dns"
    exit 1
fi

echo "🔍 Checking EC2 connectivity..."
echo "Target: $EC2_HOST"
echo ""

# Extract IP if DNS provided
if [[ $EC2_HOST == ec2-* ]]; then
    EC2_IP=$(echo $EC2_HOST | sed 's/ec2-\([0-9-]*\).*/\1/' | tr '-' '.')
else
    EC2_IP=$EC2_HOST
fi

echo "📍 IP Address: $EC2_IP"
echo ""

echo "1️⃣ Testing ICMP (ping)..."
if ping -c 2 -W 3 $EC2_IP > /dev/null 2>&1; then
    echo "   ✅ Ping successful"
else
    echo "   ❌ Ping failed (might be blocked by security group)"
fi

echo ""
echo "2️⃣ Testing SSH (port 22)..."
if timeout 5 bash -c "cat < /dev/null > /dev/tcp/$EC2_IP/22" 2>/dev/null; then
    echo "   ✅ SSH port is open"
else
    echo "   ❌ SSH port is closed or timing out"
fi

echo ""
echo "3️⃣ Testing HTTP (port 80)..."
if timeout 5 bash -c "cat < /dev/null > /dev/tcp/$EC2_IP/80" 2>/dev/null; then
    echo "   ✅ HTTP port is open"
else
    echo "   ❌ HTTP port is closed"
fi

echo ""
echo "4️⃣ Testing Backend API (port 8008)..."
if timeout 5 bash -c "cat < /dev/null > /dev/tcp/$EC2_IP/8008" 2>/dev/null; then
    echo "   ✅ Backend port is open"
else
    echo "   ❌ Backend port is closed"
fi

echo ""
echo "5️⃣ Attempting SSH connection..."
if ssh -i ~/.ssh/janata-ec2.pem -o ConnectTimeout=10 -o StrictHostKeyChecking=no ubuntu@$EC2_HOST "echo 'SSH OK'" 2>/dev/null; then
    echo "   ✅ SSH authentication successful"
else
    echo "   ❌ SSH authentication failed"
    echo "   Trying verbose SSH for details..."
    ssh -v -i ~/.ssh/janata-ec2.pem -o ConnectTimeout=10 ubuntu@$EC2_HOST 2>&1 | tail -20
fi

echo ""
echo "📊 Diagnostics Complete"