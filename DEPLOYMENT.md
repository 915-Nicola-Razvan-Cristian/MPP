# AWS Deployment Guide

This guide explains how to deploy the MPP application to AWS using Docker, ECR, and ECS.

## Prerequisites

1. AWS CLI installed and configured
2. Docker installed
3. GitHub account (for CI/CD setup)
4. Proper AWS IAM permissions

## Local Development with Docker Compose

To run the application locally using Docker Compose:

```bash
# Build and start all containers
docker-compose up

# To rebuild containers after changes
docker-compose up --build

# To run in background
docker-compose up -d

# To stop all containers
docker-compose down
```

## Manual AWS Deployment

1. Update the AWS account ID in the `deploy-aws.sh` script:

```bash
AWS_ACCOUNT_ID="your-aws-account-id"
```

2. Replace subnet and security group IDs in the script:

```bash
--network-configuration "awsvpcConfiguration={subnets=[subnet-REPLACE_ME],securityGroups=[sg-REPLACE_ME],assignPublicIp=ENABLED}"
```

3. Make the script executable and run it:

```bash
chmod +x deploy-aws.sh
./deploy-aws.sh
```

## GitHub Actions CI/CD Setup

1. Create the following GitHub repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION` (optional, defaults to eu-central-1)

2. Update the task definition file in `.aws/task-definition.json`:
   - Replace `ACCOUNT_ID` with your AWS account ID
   - Replace `REGION` with your AWS region
   - Update environment variables with real values

3. Push your code to the main branch, and GitHub Actions will automatically deploy to AWS ECS.

## AWS RDS Database Setup (Optional)

For production, it's recommended to use Amazon RDS instead of a containerized database:

1. Create an RDS MySQL instance in AWS
2. Update the environment variables in the task definition:
   ```json
   "environment": [
     { "name": "DB_HOST", "value": "your-rds-endpoint.rds.amazonaws.com" },
     { "name": "DB_USER", "value": "your-db-username" },
     { "name": "DB_PASSWORD", "value": "your-db-password" },
     { "name": "DB_NAME", "value": "mpp_database" },
     { "name": "JWT_SECRET", "value": "your-secret-key" }
   ]
   ```

## AWS Resources Created

- ECR Repositories:
  - mpp-backend
  - mpp-frontend
- ECS Cluster: mpp-cluster
- ECS Service: mpp-service
- CloudWatch Log Groups:
  - /ecs/mpp-backend
  - /ecs/mpp-frontend

## Load Balancer Setup (Optional)

For production traffic, add an Application Load Balancer:

1. Create an ALB in the AWS console
2. Create target groups for your services (port 80 for frontend, port 3000 for backend)
3. Update the ECS service to use the load balancer:

```bash
aws ecs update-service \
  --cluster mpp-cluster \
  --service mpp-service \
  --load-balancers "targetGroupArn=TARGET_GROUP_ARN,containerName=mpp-frontend,containerPort=80" \
  --region AWS_REGION
```

## Troubleshooting

- Check CloudWatch logs for container issues
- Verify security group settings allow required traffic
- Ensure task role has necessary permissions
- Check ECS service events for deployment failures 