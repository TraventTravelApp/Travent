#!/bin/bash

# Login
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST https://1w6itm4sqj.execute-api.us-east-1.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@chronicle.com","password":"TestPass123"}')

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to get access token"
  exit 1
fi

echo "Checking trips..."
curl -s -X GET https://1w6itm4sqj.execute-api.us-east-1.amazonaws.com/dev/trips \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool

