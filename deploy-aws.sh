#!/bin/bash
set -e

# You need to replace these values with your actual AWS account ID and preferred region
AWS_ACCOUNT_ID=""
AWS_REGION="eu-central-1"
ECR_REPOSITORY_BACKEND="mpp-backend"
ECR_REPOSITORY_FRONTEND="mpp-frontend"
ECS_CLUSTER="mpp-cluster"
ECS_SERVICE="mpp-service"

# Replace placeholder values in task-definition.json
sed -i "s/ACCOUNT_ID/$AWS_ACCOUNT_ID/g" .aws/task-definition.json
sed -i "s/REGION/$AWS_REGION/g" .aws/task-definition.json

echo "Creating ECR repositories..."
aws ecr create-repository --repository-name $ECR_REPOSITORY_BACKEND --region $AWS_REGION || true
aws ecr create-repository --repository-name $ECR_REPOSITORY_FRONTEND --region $AWS_REGION || true

echo "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

echo "Building and pushing Docker images..."
docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_BACKEND:latest ./Backend
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_BACKEND:latest

docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_FRONTEND:latest ./MPP-app
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_FRONTEND:latest

echo "Creating ECS cluster if it doesn't exist..."
aws ecs create-cluster --cluster-name $ECS_CLUSTER --region $AWS_REGION || true

echo "Creating CloudWatch log groups..."
aws logs create-log-group --log-group-name /ecs/mpp-backend --region $AWS_REGION || true
aws logs create-log-group --log-group-name /ecs/mpp-frontend --region $AWS_REGION || true

echo "Registering ECS task definition..."
aws ecs register-task-definition --cli-input-json file://.aws/task-definition.json --region $AWS_REGION

echo "Checking if ECS service exists..."
SERVICE_EXISTS=$(aws ecs describe-services --cluster $ECS_CLUSTER --services $ECS_SERVICE --region $AWS_REGION | jq -r '.services | length')

if [ "$SERVICE_EXISTS" -eq "0" ]; then
  echo "Creating ECS service..."
  aws ecs create-service \
    --cluster $ECS_CLUSTER \
    --service-name $ECS_SERVICE \
    --task-definition mpp-task \
    --desired-count 1 \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-REPLACE_ME],securityGroups=[sg-REPLACE_ME],assignPublicIp=ENABLED}" \
    --region $AWS_REGION
else
  echo "Updating ECS service..."
  aws ecs update-service \
    --cluster $ECS_CLUSTER \
    --service $ECS_SERVICE \
    --task-definition mpp-task \
    --desired-count 1 \
    --region $AWS_REGION
fi

echo "Deployment completed!" 