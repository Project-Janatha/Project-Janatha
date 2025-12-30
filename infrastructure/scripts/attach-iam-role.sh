#!/bin/bash
# Attach IAM role with DynamoDB permissions to EC2 instance

set -e

INSTANCE_ID="${1:-}"

if [ -z "$INSTANCE_ID" ]; then
    echo "Getting EC2 instance ID..."
    INSTANCE_ID=$(aws ec2 describe-instances \
        --filters "Name=ip-address,Values=3.236.142.145" \
        --query 'Reservations[0].Instances[0].InstanceId' \
        --output text)
fi

echo "🔧 Setting up IAM role for instance: $INSTANCE_ID"

# Create IAM role for EC2
ROLE_NAME="ChinmayaJanataEC2DynamoDBRole"

echo "Creating IAM role..."
aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "ec2.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }' 2>/dev/null || echo "Role already exists"

# Attach DynamoDB policy
echo "Attaching DynamoDB policy..."
aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name "DynamoDBAccess" \
    --policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:BatchGetItem",
                "dynamodb:BatchWriteItem",
                "dynamodb:DescribeTable"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/ChinmayaJanata-*"
            ]
        }]
    }'

# Create instance profile
echo "Creating instance profile..."
aws iam create-instance-profile \
    --instance-profile-name "$ROLE_NAME" 2>/dev/null || echo "Instance profile exists"

# Add role to instance profile
echo "Adding role to instance profile..."
aws iam add-role-to-instance-profile \
    --instance-profile-name "$ROLE_NAME" \
    --role-name "$ROLE_NAME" 2>/dev/null || echo "Role already in profile"

# Wait a bit for IAM to propagate
echo "Waiting for IAM propagation..."
sleep 10

# Check if instance already has a profile
echo "Checking current instance profile..."
CURRENT_PROFILE=$(aws ec2 describe-iam-instance-profile-associations \
    --filters "Name=instance-id,Values=$INSTANCE_ID" \
    --query 'IamInstanceProfileAssociations[0].AssociationId' \
    --output text 2>/dev/null)

if [ "$CURRENT_PROFILE" != "None" ] && [ -n "$CURRENT_PROFILE" ]; then
    echo "Removing existing instance profile association..."
    aws ec2 disassociate-iam-instance-profile \
        --association-id "$CURRENT_PROFILE"
    echo "Waiting for disassociation..."
    sleep 5
fi

# Attach instance profile to EC2
echo "Attaching instance profile to EC2..."
aws ec2 associate-iam-instance-profile \
    --instance-id "$INSTANCE_ID" \
    --iam-instance-profile "Name=$ROLE_NAME"

echo ""
echo "✅ IAM role attached successfully!"
echo ""
echo "Instance Profile ARN:"
aws iam get-instance-profile \
    --instance-profile-name "$ROLE_NAME" \
    --query 'InstanceProfile.Arn' \
    --output text

echo ""
echo "Now restart the Docker container on EC2:"
echo "  ssh -i ~/.ssh/janata-ec2.pem ubuntu@ec2-3-236-142-145.compute-1.amazonaws.com 'cd ~/chinmaya-janata && docker-compose restart'"
echo ""
echo "Or redeploy to pick up credentials:"
echo "  EC2_HOST=ec2-3-236-142-145.compute-1.amazonaws.com npm run deploy"