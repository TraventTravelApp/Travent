#!/bin/bash

echo "🔍 Checking your setup..."
echo ""

# Check AWS CLI
echo "1️⃣ Checking AWS CLI..."
if command -v aws &> /dev/null; then
    echo "   ✅ AWS CLI installed"
    AWS_VERSION=$(aws --version)
    echo "   📦 $AWS_VERSION"
else
    echo "   ❌ AWS CLI not installed"
    echo "   Install: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
fi
echo ""

# Check AWS Credentials
echo "2️⃣ Checking AWS credentials..."
if aws sts get-caller-identity &> /dev/null; then
    echo "   ✅ AWS credentials configured"
    ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    echo "   🔑 Account: $ACCOUNT"
else
    echo "   ❌ AWS credentials not configured"
    echo "   Run: aws configure"
fi
echo ""

# Check Bedrock Access
echo "3️⃣ Checking Bedrock access..."
if aws bedrock list-foundation-models --region us-east-1 &> /dev/null; then
    echo "   ✅ Bedrock access working"
    CLAUDE_MODELS=$(aws bedrock list-foundation-models --region us-east-1 --query 'modelSummaries[?contains(modelId, `claude-3-5`)].modelId' --output text | wc -l)
    echo "   🤖 Claude 3.5 models available: $CLAUDE_MODELS"
    if [ "$CLAUDE_MODELS" -eq 0 ]; then
        echo "   ⚠️  No Claude 3.5 models found - try a different region or check AWS Console"
    fi
else
    echo "   ❌ Cannot access Bedrock"
    echo "   Check IAM permissions for bedrock:InvokeModel"
fi
echo ""

# Check Python
echo "4️⃣ Checking Python..."
if command -v python3 &> /dev/null; then
    echo "   ✅ Python installed"
    PYTHON_VERSION=$(python3 --version)
    echo "   🐍 $PYTHON_VERSION"
else
    echo "   ❌ Python not installed"
fi
echo ""

# Check pip packages
echo "5️⃣ Checking Python packages..."
if python3 -c "import boto3" &> /dev/null; then
    echo "   ✅ boto3 installed"
else
    echo "   ❌ boto3 not installed"
    echo "   Run: pip install -r requirements.txt"
fi
echo ""

# Check Node.js
echo "6️⃣ Checking Node.js..."
if command -v node &> /dev/null; then
    echo "   ✅ Node.js installed"
    NODE_VERSION=$(node --version)
    echo "   📗 $NODE_VERSION"
else
    echo "   ❌ Node.js not installed"
fi
echo ""

# Check Serverless
echo "7️⃣ Checking Serverless Framework..."
if command -v serverless &> /dev/null; then
    echo "   ✅ Serverless installed"
    SLS_VERSION=$(serverless --version | head -n 1)
    echo "   ⚡ $SLS_VERSION"
else
    echo "   ❌ Serverless not installed"
    echo "   Run: npm install -g serverless"
fi
echo ""

# Check .env file
echo "8️⃣ Checking .env file..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
else
    echo "   ⚠️  .env file not found"
    echo "   Run: cp .env.example .env"
fi
echo ""

echo "✨ Setup check complete!"
echo ""
echo "Next steps:"
echo "  1. Fix any ❌ items above"
echo "  2. Read setup-guide.md for detailed instructions"
echo "  3. Run: serverless deploy"
