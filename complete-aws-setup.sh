#!/bin/bash

set -e  # Exit on error

echo "🚀 Complete AWS Setup for Chronicle"
echo "===================================="
echo ""

REGION="us-east-1"
USER_POOL_ID="us-east-1_JjY1YkS9X"

echo "✅ User Pool already exists: $USER_POOL_ID"
echo ""

# Create User Pool Client
echo "📝 Creating User Pool Client..."
CLIENT_RESPONSE=$(aws cognito-idp create-user-pool-client \
  --user-pool-id "$USER_POOL_ID" \
  --client-name "ChronicleAppClient" \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --region "$REGION" 2>&1)

if [ $? -eq 0 ]; then
    CLIENT_ID=$(echo "$CLIENT_RESPONSE" | grep -o '"ClientId": "[^"]*' | cut -d'"' -f4)
    echo "✅ User Pool Client created: $CLIENT_ID"
else
    # Try to get existing client
    echo "⚠️  Client might already exist, trying to list..."
    CLIENT_ID=$(aws cognito-idp list-user-pool-clients \
      --user-pool-id "$USER_POOL_ID" \
      --region "$REGION" \
      --query 'UserPoolClients[0].ClientId' \
      --output text 2>&1)
    echo "✅ Using existing client: $CLIENT_ID"
fi
echo ""

# Create DynamoDB Tables
echo "📝 Creating DynamoDB Tables..."

# Users table
echo "  - Creating 'users' table..."
aws dynamodb create-table \
  --table-name users \
  --attribute-definitions \
    AttributeName=user_id,AttributeType=S \
  --key-schema \
    AttributeName=user_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" 2>&1 > /dev/null || echo "    (Table might already exist)"

# Trips table
echo "  - Creating 'trips' table..."
aws dynamodb create-table \
  --table-name trips \
  --attribute-definitions \
    AttributeName=trip_id,AttributeType=S \
    AttributeName=user_id,AttributeType=S \
  --key-schema \
    AttributeName=trip_id,KeyType=HASH \
  --global-secondary-indexes \
    "IndexName=user-index,KeySchema=[{AttributeName=user_id,KeyType=HASH}],Projection={ProjectionType=ALL}" \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" 2>&1 > /dev/null || echo "    (Table might already exist)"

# Travel POIs table
echo "  - Creating 'travel-pois' table..."
aws dynamodb create-table \
  --table-name travel-pois \
  --attribute-definitions \
    AttributeName=poi_id,AttributeType=S \
  --key-schema \
    AttributeName=poi_id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region "$REGION" 2>&1 > /dev/null || echo "    (Table might already exist)"

echo "✅ DynamoDB tables created/verified"
echo ""

# Create S3 Bucket
echo "📝 Creating S3 Bucket..."
BUCKET_NAME="chronicle-uploads-$(date +%s)"
aws s3 mb "s3://$BUCKET_NAME" --region "$REGION" 2>&1 > /dev/null || {
    # Try to find existing bucket
    BUCKET_NAME=$(aws s3 ls | grep chronicle-uploads | awk '{print $3}' | head -1)
    if [ -z "$BUCKET_NAME" ]; then
        BUCKET_NAME="chronicle-uploads-$(date +%s)"
        aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
    fi
}
echo "✅ S3 Bucket: $BUCKET_NAME"
echo ""

# Update backend .env file
echo "📝 Updating backend/.env file..."
cat > backend/.env << EOF
# AWS Cognito Configuration
COGNITO_USER_POOL_ID=$USER_POOL_ID
COGNITO_CLIENT_ID=$CLIENT_ID

# JWT Secret
JWT_SECRET=$(openssl rand -base64 32)

# S3 Bucket
S3_BUCKET_NAME=$BUCKET_NAME

# Bedrock Model ID
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# AWS Location Service
LOCATION_MAP_NAME=TripMapView
LOCATION_PLACE_INDEX_NAME=TripPlaceIndex
EOF

echo "✅ Backend .env file updated"
echo ""

# Deploy backend
echo "📝 Deploying backend with Serverless..."
cd backend
serverless deploy --region "$REGION"
cd ..

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Configuration:"
echo "  User Pool ID: $USER_POOL_ID"
echo "  Client ID: $CLIENT_ID"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  Region: $REGION"
echo ""
echo "Next steps:"
echo "  1. Test backend: ./test-backend.sh"
echo "  2. Start app: cd TripApp_AIChallange/mobile && npx expo start"
echo ""
