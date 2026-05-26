#!/bin/bash

echo "📦 Creating Lambda deployment package..."

# Clean up old package
rm -rf package lambda-package.zip

# Create package directory
mkdir -p package

# Copy code
echo "Copying code..."
cp -r handlers services prompts utils package/

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt -t package/ --quiet --upgrade

# Create zip
echo "Creating zip file..."
cd package
zip -r ../lambda-package.zip . -q
cd ..

echo "✅ Package created: lambda-package.zip"
echo ""
echo "Deploying to Lambda..."

# Update Lambda function
aws lambda update-function-code \
  --function-name trip-planner-ai-dev-generateItinerary \
  --zip-file fileb://lambda-package.zip

echo ""
echo "✅ Deployment complete!"
