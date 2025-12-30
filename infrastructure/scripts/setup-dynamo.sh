#!/bin/bash
# Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.
# DynamoDB Setup Script
# Deploys DynamoDB tables using CloudFormation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

STACK_NAME="ChinmayaJanata-DynamoDB"
TEMPLATE_FILE="$(dirname "$0")/../dynamo.yml"
REGION="${AWS_REGION:-us-east-1}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   DynamoDB Setup for Chinmaya Janata${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ Error: AWS CLI is not installed${NC}"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

echo -e "${GREEN}✓${NC} AWS CLI found"

# Check if template file exists
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}❌ Error: CloudFormation template not found at $TEMPLATE_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} CloudFormation template found"

# Check AWS credentials
echo -e "\n${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity --region $REGION &> /dev/null; then
    echo -e "${RED}❌ Error: AWS credentials not configured${NC}"
    echo "Run: aws configure"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✓${NC} AWS Account: $ACCOUNT_ID"
echo -e "${GREEN}✓${NC} Region: $REGION"

# Check if stack already exists
echo -e "\n${YELLOW}Checking for existing stack...${NC}"
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
    STACK_STATUS=$(aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION --query 'Stacks[0].StackStatus' --output text)
    
    if [ "$STACK_STATUS" == "ROLLBACK_COMPLETE" ]; then
        echo -e "${YELLOW}⚠️  Stack exists in ROLLBACK_COMPLETE state${NC}"
        echo -e "${YELLOW}Deleting old stack...${NC}"
        aws cloudformation delete-stack --stack-name $STACK_NAME --region $REGION
        echo "Waiting for stack deletion..."
        aws cloudformation wait stack-delete-complete --stack-name $STACK_NAME --region $REGION
        echo -e "${GREEN}✓${NC} Old stack deleted"
    elif [ "$STACK_STATUS" == "CREATE_COMPLETE" ] || [ "$STACK_STATUS" == "UPDATE_COMPLETE" ]; then
        echo -e "${GREEN}✓${NC} Stack already exists with status: $STACK_STATUS"
        echo -e "\n${YELLOW}Do you want to update the stack? (y/n)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo -e "\n${YELLOW}Updating stack...${NC}"
            if aws cloudformation update-stack \
                --stack-name $STACK_NAME \
                --template-body file://$TEMPLATE_FILE \
                --region $REGION 2>&1 | tee /tmp/cf-output.txt; then
                
                if grep -q "No updates are to be performed" /tmp/cf-output.txt; then
                    echo -e "${BLUE}ℹ️  No changes detected in template${NC}"
                else
                    echo "Waiting for stack update to complete..."
                    aws cloudformation wait stack-update-complete --stack-name $STACK_NAME --region $REGION
                    echo -e "${GREEN}✓${NC} Stack updated successfully"
                fi
            else
                if grep -q "No updates are to be performed" /tmp/cf-output.txt; then
                    echo -e "${BLUE}ℹ️  No changes detected in template${NC}"
                else
                    echo -e "${RED}❌ Stack update failed${NC}"
                    exit 1
                fi
            fi
        else
            echo -e "${BLUE}Skipping stack update${NC}"
        fi
        
        # Show table names
        echo -e "\n${GREEN}✓${NC} DynamoDB tables:"
        aws dynamodb list-tables --region $REGION --query 'TableNames[?starts_with(@, `ChinmayaJanata`)]' --output table
        exit 0
    else
        echo -e "${RED}❌ Stack exists with status: $STACK_STATUS${NC}"
        echo "Please resolve the stack status manually in AWS Console"
        exit 1
    fi
fi

# Create new stack
echo -e "\n${YELLOW}Creating DynamoDB stack...${NC}"
echo "Stack Name: $STACK_NAME"
echo "Region: $REGION"

aws cloudformation create-stack \
    --stack-name $STACK_NAME \
    --template-body file://$TEMPLATE_FILE \
    --region $REGION

echo -e "${YELLOW}Waiting for stack creation to complete...${NC}"
echo "(This usually takes 2-3 minutes)"

if aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $REGION; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}   ✓ Stack Created Successfully!${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    
    # Get stack outputs
    echo -e "${BLUE}Stack Outputs:${NC}"
    aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
        --output table
    
    echo -e "\n${BLUE}DynamoDB Tables Created:${NC}"
    aws dynamodb list-tables --region $REGION --query 'TableNames[?starts_with(@, `ChinmayaJanata`)]' --output table
    
    echo -e "\n${GREEN}✓${NC} Tables are ready to use!"
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo "1. Update your .env file with these table names"
    echo "2. Configure AWS credentials or IAM role on EC2"
    echo "3. Deploy your application"
    
else
    echo -e "\n${RED}========================================${NC}"
    echo -e "${RED}   ✗ Stack Creation Failed${NC}"
    echo -e "${RED}========================================${NC}\n"
    
    echo "Getting error details..."
    aws cloudformation describe-stack-events \
        --stack-name $STACK_NAME \
        --region $REGION \
        --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`].[LogicalResourceId,ResourceStatusReason]' \
        --output table
    
    exit 1
fi

echo -e "\n${BLUE}Jai Gurudev! 🙏${NC}"
