#!/bin/bash
# Setup Route 53 DNS for EC2 instance

DOMAIN="${1:-}"
EC2_IP="${2:-3.236.142.145}"

if [ -z "$DOMAIN" ]; then
    echo "Usage: ./infrastructure/scripts/setup-route53.sh your-domain.com [ec2-ip]"
    echo "Example: ./infrastructure/scripts/setup-route53.sh chinmayajanata.org"
    exit 1
fi

echo "🌐 Setting up Route 53 for $DOMAIN -> $EC2_IP"

# Get hosted zone ID
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
  --query "HostedZones[?Name=='${DOMAIN}.'].Id" \
  --output text | sed 's/\/hostedzone\///')

if [ -z "$HOSTED_ZONE_ID" ]; then
    echo "❌ Error: Hosted zone for $DOMAIN not found"
    echo "Available hosted zones:"
    aws route53 list-hosted-zones --query 'HostedZones[*].[Name,Id]' --output table
    exit 1
fi

echo "✅ Found hosted zone: $HOSTED_ZONE_ID"

# Create change batch JSON
cat > /tmp/route53-change.json << EOF
{
  "Comment": "Create A record for Chinmaya Janata EC2",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "app.${DOMAIN}",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "${EC2_IP}"
          }
        ]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "${DOMAIN}",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "${EC2_IP}"
          }
        ]
      }
    }
  ]
}
EOF

echo ""
echo "Creating DNS records..."
aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch file:///tmp/route53-change.json

echo ""
echo "✅ DNS records created!"
echo ""
echo "Your app will be available at:"
echo "  http://${DOMAIN}"
echo "  http://app.${DOMAIN}"
echo ""
echo "Note: DNS propagation may take 5-15 minutes"
echo ""
echo "Test with:"
echo "  nslookup ${DOMAIN}"
echo "  curl http://${DOMAIN}"

rm /tmp/route53-change.json