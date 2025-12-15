# EC2 Deployment Guide

# Om Sri Cinmaya Sadgurave Namaha. Om Sri Gurubyo Namaha.

## Created Deployment Scripts

### 1. **setup-ec2.sh** - One-time EC2 setup

Run this ONCE on your fresh EC2 instance to install Docker, Docker Compose, and configure the environment.

```bash
# SSH into EC2 and run:
bash setup-ec2.sh
```

### 2. **deploy.sh** - Main deployment script

Deploy from your local machine to EC2.

```bash
# From your local machine:
EC2_HOST=your-ec2-ip.compute.amazonaws.com npm run deploy
```

### 3. **remote-deploy.sh** - Git-based deployment

Deploy by pulling from GitHub directly on EC2.

```bash
# SSH into EC2 and run:
bash remote-deploy.sh
```

### 4. **logs.sh** - View application logs

```bash
EC2_HOST=your-ec2-ip.compute.amazonaws.com bash infrastructure/scripts/logs.sh
```

### 5. **ssh-ec2.sh** - Quick SSH access

```bash
EC2_HOST=your-ec2-ip.compute.amazonaws.com bash infrastructure/scripts/ssh-ec2.sh
```

### 6. **rollback.sh** - Rollback to previous version

```bash
EC2_HOST=your-ec2-ip.compute.amazonaws.com bash infrastructure/scripts/rollback.sh
```

## Setup Steps

### Step 1: Set up EC2 Instance

1. Launch Ubuntu EC2 instance (t3.small or larger recommended)
2. Configure security group:
   - Port 22 (SSH)
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
3. Attach IAM role with DynamoDB permissions
4. Save your SSH key as `~/.ssh/janatha-ec2.pem`

### Step 2: Configure IAM Role for DynamoDB

Create IAM role with this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Query",
        "dynamodb:Scan",
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem"
      ],
      "Resource": ["arn:aws:dynamodb:us-east-1:*:table/ChinmayaJanata-*"]
    }
  ]
}
```

### Step 3: Initial EC2 Setup

```bash
# 1. Copy setup script to EC2
scp -i ~/.ssh/janatha-ec2.pem infrastructure/scripts/setup-ec2.sh ubuntu@YOUR-EC2-IP:/home/ubuntu/

# 2. SSH into EC2
ssh -i ~/.ssh/janatha-ec2.pem ubuntu@YOUR-EC2-IP

# 3. Run setup
bash setup-ec2.sh

# 4. Log out and back in
exit
```

### Step 4: Configure Environment Variables

```bash
# SSH into EC2
ssh -i ~/.ssh/janatha-ec2.pem ubuntu@YOUR-EC2-IP

# Create .env file
cd /home/ubuntu/project-janatha/packages/backend
nano .env
```

Copy from `.env.example` and fill in values.

### Step 5: Deploy

```bash
# From your local machine
export EC2_HOST=your-ec2-ip.compute.amazonaws.com
npm run deploy
```

## GitHub Actions Setup

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

- `EC2_HOST` - Your EC2 public DNS/IP
- `EC2_SSH_KEY` - Contents of your SSH private key
- `AWS_ACCESS_KEY_ID` - AWS access key (for GitHub Actions)
- `AWS_SECRET_ACCESS_KEY` - AWS secret key (for GitHub Actions)

## Monitoring & Maintenance

### View logs

```bash
EC2_HOST=your-ec2-ip.com bash infrastructure/scripts/logs.sh
```

### Check container status

```bash
ssh -i ~/.ssh/janatha-ec2.pem ubuntu@YOUR-EC2-IP
cd /home/ubuntu/project-janatha
docker-compose ps
```

### Restart services

```bash
docker-compose restart
```

## Notes

- The PM2 ecosystem config is in `infrastructure/pm2/ecosystem.config.js`
- Use IAM roles instead of hardcoding AWS credentials
- Update `CORS_ORIGIN` in `.env` to your domain
- Consider setting up CloudWatch for monitoring
