#!/bin/bash

echo "🔍 Testing Chronicle Backend..."
echo ""

# Test login endpoint
echo "Testing: https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev/auth/login"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -m 5 \
  https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev/auth/login)

echo "HTTP Response Code: $RESPONSE"
echo ""

if [ "$RESPONSE" = "000" ]; then
  echo "❌ Backend NOT accessible"
  echo ""
  echo "Reason: Connection failed (timeout or DNS error)"
  echo ""
  echo "This means:"
  echo "  • AWS credentials expired"
  echo "  • Backend needs to be redeployed"
  echo "  • Lambda functions are not running"
  echo ""
  echo "To fix:"
  echo "  1. Get fresh AWS credentials from AWS Console/Academy"
  echo "  2. Set credentials:"
  echo "     export AWS_ACCESS_KEY_ID=\"...\""
  echo "     export AWS_SECRET_ACCESS_KEY=\"...\""
  echo "     export AWS_SESSION_TOKEN=\"...\""
  echo "  3. Deploy backend:"
  echo "     cd backend"
  echo "     serverless deploy"
  echo ""
  exit 1
elif [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "401" ] || [ "$RESPONSE" = "200" ]; then
  echo "✅ Backend IS accessible!"
  echo ""
  echo "HTTP $RESPONSE means the API is responding correctly."
  echo "The mobile app should work now."
  echo ""
  echo "If you still get 'Network request failed':"
  echo "  1. Clear Expo cache: npx expo start --clear"
  echo "  2. Reload app in Expo Go"
  echo "  3. Check mobile device has internet connection"
  echo ""
  exit 0
elif [ "$RESPONSE" = "403" ]; then
  echo "⚠️  Backend returned 403 Forbidden"
  echo ""
  echo "This might mean:"
  echo "  • API Gateway permissions issue"
  echo "  • CORS configuration problem"
  echo ""
  echo "Try redeploying: cd backend && serverless deploy"
  echo ""
  exit 1
elif [ "$RESPONSE" = "500" ] || [ "$RESPONSE" = "502" ] || [ "$RESPONSE" = "503" ]; then
  echo "⚠️  Backend returned $RESPONSE (Server Error)"
  echo ""
  echo "The backend is deployed but having issues."
  echo ""
  echo "Check logs:"
  echo "  cd backend"
  echo "  serverless logs -f login --startTime 10m"
  echo ""
  exit 1
else
  echo "⚠️  Unexpected response: HTTP $RESPONSE"
  echo ""
  echo "Try redeploying the backend:"
  echo "  cd backend"
  echo "  serverless deploy"
  echo ""
  exit 1
fi
