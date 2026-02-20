#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo "🚀 Starting deployment to EC2..."
echo "📁 Project root: $PROJECT_ROOT"

EC2_HOST="${EC2_HOST:-}"
EC2_USER="${EC2_USER:-ubuntu}"
EC2_KEY="${EC2_KEY:-$HOME/.ssh/janata-ec2.pem}"
DEPLOY_DIR="/home/ubuntu/chinmaya-janata"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$EC2_HOST" ]; then
    echo -e "${RED}❌ Error: EC2_HOST environment variable is not set${NC}"
    echo "Usage: EC2_HOST=your-ec2-ip.compute.amazonaws.com npm run deploy"
    exit 1
fi

EC2_KEY="${EC2_KEY/#\~/$HOME}"

if [ ! -f "$EC2_KEY" ]; then
    echo -e "${RED}❌ Error: EC2 key file not found at $EC2_KEY${NC}"
    exit 1
fi

KEY_PERMS=$(stat -f "%A" "$EC2_KEY" 2>/dev/null || stat -c "%a" "$EC2_KEY" 2>/dev/null)
if [ "$KEY_PERMS" != "400" ] && [ "$KEY_PERMS" != "0400" ]; then
    echo -e "${YELLOW}⚠️  Warning: Key file has incorrect permissions ($KEY_PERMS)${NC}"
    chmod 400 "$EC2_KEY"
fi

echo -e "${GREEN}✓${NC} Using key: $EC2_KEY"
echo -e "${GREEN}✓${NC} Deploying to: $EC2_USER@$EC2_HOST"

if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml not found in project root${NC}"
    exit 1
fi

if [ ! -f "Dockerfile" ]; then
    echo -e "${RED}❌ Error: Dockerfile not found in project root${NC}"
    exit 1
fi

load_env_file() {
    local file="$1"
    if [ -f "$file" ]; then
        echo -e "${YELLOW}📋 Loading environment from $file...${NC}"
        set -a
        # shellcheck source=/dev/null
        . "$file"
        set +a
    fi
}

require_env_vars() {
    local missing=0
    for var_name in "$@"; do
        if [ -z "${!var_name}" ]; then
            echo -e "${RED}❌ Error: ${var_name} is not set${NC}"
            missing=1
        fi
    done
    if [ "$missing" -ne 0 ]; then
        echo -e "${YELLOW}Set these as environment variables before running deploy.${NC}"
        exit 1
    fi
}

generate_secret() {
    if command -v openssl >/dev/null 2>&1; then
        openssl rand -hex 32
        return 0
    fi
    # Fallback: /dev/urandom with tr
    tr -dc 'a-f0-9' </dev/urandom | head -c 64
}

set_env_var_in_file() {
    local file="$1"
    local key="$2"
    local value="$3"

    if grep -qE "^${key}=" "$file"; then
        # Replace existing (including empty) value
        sed -i.bak "s|^${key}=.*|${key}=${value}|" "$file"
        rm -f "${file}.bak"
    else
        echo "${key}=${value}" >> "$file"
    fi
}

# Ensure required secrets exist locally if .env is present
if [ -f "packages/backend/.env" ]; then
    if ! grep -qE "^JWT_SECRET=.+$" packages/backend/.env; then
        echo -e "${YELLOW}⚠️  JWT_SECRET missing in packages/backend/.env. Generating...${NC}"
        set_env_var_in_file "packages/backend/.env" "JWT_SECRET" "$(generate_secret)"
    fi
    if ! grep -qE "^SESSION_SECRET=.+$" packages/backend/.env; then
        echo -e "${YELLOW}⚠️  SESSION_SECRET missing in packages/backend/.env. Generating...${NC}"
        set_env_var_in_file "packages/backend/.env" "SESSION_SECRET" "$(generate_secret)"
    fi
fi

# Load only well-formed KEY=VALUE lines from packages/backend/.env
if [ -f "packages/backend/.env" ]; then
    echo -e "${YELLOW}📋 Loading environment from packages/backend/.env (key=value only)...${NC}"
    set -a
    # shellcheck source=/dev/null
    . <(rg -N "^[A-Za-z_][A-Za-z0-9_]*=.*$" packages/backend/.env)
    set +a
fi

echo -e "\n${YELLOW}🔐 Testing SSH connection...${NC}"
if ! ssh -i "$EC2_KEY" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$EC2_USER@$EC2_HOST" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${RED}❌ Error: Cannot connect to EC2 instance${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} SSH connection successful"

ECR_REPO="${ECR_REPO:-}"
AWS_REGION="${AWS_REGION:-us-east-1}"

require_env_vars ECR_REPO AWS_REGION JWT_SECRET SESSION_SECRET CORS_ORIGIN

IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)}"
ECR_IMAGE="${ECR_REPO}:${IMAGE_TAG}"

echo -e "\n${YELLOW}📦 Building Docker image locally...${NC}"
docker build -t "$ECR_IMAGE" .

echo -e "\n${YELLOW}🔐 Logging in to ECR...${NC}"
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REPO" >/dev/null

echo -e "\n${YELLOW}📤 Pushing image to ECR...${NC}"
docker push "$ECR_IMAGE"

echo -e "\n${YELLOW}📤 Copying files to EC2...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" "mkdir -p $DEPLOY_DIR"

echo "Copying docker-compose.yml..."
scp -i "$EC2_KEY" docker-compose.yml "$EC2_USER@$EC2_HOST:$DEPLOY_DIR/"

echo "Uploading runtime environment file..."
cat > /tmp/janata-root.env << EOF
ECR_IMAGE=${ECR_IMAGE}
NODE_ENV=production
PORT=8008
AWS_REGION=${AWS_REGION}
USERS_TABLE=${USERS_TABLE:-ChinmayaJanata-Users}
CENTERS_TABLE=${CENTERS_TABLE:-ChinmayaJanata-Centers}
EVENTS_TABLE=${EVENTS_TABLE:-ChinmayaJanata-Events}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-}
AWS_SESSION_TOKEN=${AWS_SESSION_TOKEN:-}
JWT_SECRET=${JWT_SECRET}
SESSION_SECRET=${SESSION_SECRET}
ADMIN_NAME=${ADMIN_NAME:-Brahman}
CORS_ORIGIN=${CORS_ORIGIN}
CORS_ALLOW_NO_ORIGIN=${CORS_ALLOW_NO_ORIGIN:-false}
EOF
scp -i "$EC2_KEY" /tmp/janata-root.env "$EC2_USER@$EC2_HOST:$DEPLOY_DIR/.env"

echo -e "\n${YELLOW}🚢 Deploying on EC2...${NC}"
ssh -i "$EC2_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    set -e
    cd /home/ubuntu/chinmaya-janata

    echo "Logging in to ECR..."
    aws ecr get-login-password --region "${AWS_REGION:-us-east-1}" | docker login --username AWS --password-stdin "$(cat .env | grep '^ECR_IMAGE=' | cut -d: -f1 | cut -d= -f2)" >/dev/null

    echo "Pulling image..."
    docker pull "$(cat .env | grep '^ECR_IMAGE=' | cut -d= -f2)"

    echo "Stopping existing containers..."
    docker-compose down || true

    echo "Starting new containers..."
    docker-compose up -d

    echo "Waiting for containers to start..."
    sleep 5

    echo "Checking container status..."
    docker-compose ps

    echo "Recent logs:"
    docker-compose logs --tail=30

    echo "✅ Deployment complete!"
ENDSSH

rm /tmp/janata-root.env

echo -e "\n${GREEN}✅ Deployment successful!${NC}"
echo -e "Your app should be running at: http://$EC2_HOST"
echo -e "\nTo view logs, run:"
echo -e "  ssh -i $EC2_KEY $EC2_USER@$EC2_HOST 'cd $DEPLOY_DIR && docker-compose logs -f'"
