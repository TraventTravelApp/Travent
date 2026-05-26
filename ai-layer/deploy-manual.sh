#!/bin/bash

echo "🚀 Deploying AI Layer manually (without Serverless Framework)..."
echo ""

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p .deploy
cp -r handlers services prompts utils .deploy/
cp requirements.txt .deploy/

# Install dependencies into deployment package
echo "📥 Installing dependencies..."
pip install -r requirements.txt -t .deploy/ --quiet

# Create zip file
echo "🗜️  Creating zip file..."
cd .deploy
zip -r ../lambda-deployment.zip . -q
cd ..

echo "✅ Deployment package created: lambda-deployment.zip"
echo ""
echo "⚠️  Manual steps needed:"
echo "1. Go to AWS Console → Lambda"
echo "2. Create a new function named 'trip-planner-ai-generate'"
echo "3. Runtime: Python 3.11"
echo "4. Upload lambda-deployment.zip"
echo "5. Set handler to: handlers/itinerary.generate"
echo "6. Add environment variables from .env file"
echo "7. Increase timeout to 60 seconds"
echo "8. Add IAM permissions for Bedrock"
echo ""
echo "Or use AWS CLI (if you have permissions):"
echo "aws lambda create-function --function-name trip-planner-ai-generate \\"
echo "  --runtime python3.11 \\"
echo "  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \\"
echo "  --handler handlers/itinerary.generate \\"
echo "  --zip-file fileb://lambda-deployment.zip \\"
echo "  --timeout 60"
