#!/bin/bash

# AWS Lambda Deployment Script for OATutor AI Agent
# Run with: ./deploy.sh

set -e

echo "🚀 Deploying OATutor AI Agent to AWS Lambda..."

# Configuration
FUNCTION_NAME="oatutor-ai-agent"
REGION="us-west-1"
RUNTIME="nodejs20.x"
HANDLER="index.handler"
MEMORY_SIZE="512"
TIMEOUT="30"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if logged in to AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Not logged in to AWS. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create deployment package
echo "📦 Creating deployment package..."
zip -r aiAgentGeneration.zip . -x "*.git*" "node_modules/.cache/*" "*.md" "test-*" "local-test.mjs" "deploy.sh"

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION &> /dev/null; then
    echo "🔄 Updating existing function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://aiAgentGeneration.zip \
        --region $REGION
else
    echo "🆕 Creating new function..."
    aws lambda create-function \
        --function-name $FUNCTION_NAME \
        --runtime $RUNTIME \
        --role arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/lambda-execution-role \
        --handler $HANDLER \
        --zip-file fileb://aiAgentGeneration.zip \
        --memory-size $MEMORY_SIZE \
        --timeout $TIMEOUT \
        --region $REGION
fi

# Set environment variables
echo "🔧 Setting environment variables..."
aws lambda update-function-configuration \
    --function-name $FUNCTION_NAME \
    --environment Variables="{
        OPENAI_API_KEY=$OPENAI_API_KEY,
        CONVERSATION_TABLE_NAME=agent-conversations,
        NODE_ENV=production
    }" \
    --region $REGION

# Create API Gateway (optional)
echo "🌐 Setting up API Gateway..."
API_ID=$(aws apigateway create-rest-api \
    --name "OATutor-AI-Agent-API" \
    --description "API for OATutor AI Agent" \
    --region $REGION \
    --query 'id' \
    --output text)

echo "✅ API Gateway created with ID: $API_ID"

# Get function ARN
FUNCTION_ARN=$(aws lambda get-function \
    --function-name $FUNCTION_NAME \
    --region $REGION \
    --query 'Configuration.FunctionArn' \
    --output text)

echo "✅ Function ARN: $FUNCTION_ARN"

# Clean up
rm aiAgentGeneration.zip

echo "🎉 Deployment complete!"
echo "📋 Next steps:"
echo "1. Set up DynamoDB table 'agent-conversations'"
echo "2. Configure API Gateway endpoints"
echo "3. Update frontend with the API Gateway URL"
echo "4. Test the integration"

echo ""
echo "🔗 Function URL: https://$API_ID.execute-api.$REGION.amazonaws.com/prod"
echo "📊 Monitor in AWS Console: https://console.aws.amazon.com/lambda/home?region=$REGION#/functions/$FUNCTION_NAME"
