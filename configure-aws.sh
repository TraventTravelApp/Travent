#!/bin/bash

echo "🔐 AWS Configuration Helper"
echo ""
echo "This script will help you configure AWS CLI with your credentials."
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed"
    echo ""
    echo "Install it first:"
    echo "  brew install awscli"
    echo "  OR download from: https://aws.amazon.com/cli/"
    exit 1
fi

echo "✅ AWS CLI is installed: $(aws --version)"
echo ""

# Prompt for credentials
echo "Enter your AWS credentials from the AWS Console:"
echo ""

read -p "AWS Access Key ID (starts with AKIA...): " ACCESS_KEY
read -p "AWS Secret Access Key: " SECRET_KEY

echo ""
echo "Setting up AWS CLI configuration..."
echo ""

# Configure AWS CLI
aws configure set aws_access_key_id "$ACCESS_KEY"
aws configure set aws_secret_access_key "$SECRET_KEY"
aws configure set region us-east-1
aws configure set output json

echo "✅ AWS CLI configured!"
echo ""

# Verify credentials
echo "Verifying credentials..."
if aws sts get-caller-identity &> /dev/null; then
    echo ""
    echo "✅ Credentials are valid!"
    echo ""
    aws sts get-caller-identity
    echo ""
    echo "🎉 AWS is configured and ready!"
    echo ""
    echo "Next steps:"
    echo "  1. Deploy backend: cd backend && serverless deploy"
    echo "  2. Test backend: ./test-backend.sh"
    echo "  3. Start app: cd TripApp_AIChallange/mobile && npx expo start"
else
    echo ""
    echo "❌ Credentials verification failed"
    echo ""
    echo "Please check:"
    echo "  - Access Key ID is correct (starts with AKIA)"
    echo "  - Secret Access Key is correct"
    echo "  - You have internet connection"
    echo ""
    echo "Try running: aws configure"
    echo "And enter your credentials manually."
fi
