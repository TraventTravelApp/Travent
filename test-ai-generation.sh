#!/bin/bash

# Get JWT token by logging in
echo "Logging in as test user..."
LOGIN_RESPONSE=$(curl -s -X POST https://1w6itm4sqj.execute-api.us-east-1.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@chronicle.com","password":"TestPass123"}')

# Extract access token using python
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('access_token', ''))")

if [ -z "$ACCESS_TOKEN" ]; then
  echo "Failed to get access token"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "Got access token successfully"

# Test AI generation
echo ""
echo "Testing AI itinerary generation (this may take 10-20 seconds)..."
curl -X POST https://1w6itm4sqj.execute-api.us-east-1.amazonaws.com/dev/ai/itinerary/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "trip_type": "location",
    "destination": "Portland, Oregon",
    "duration": 2,
    "budget": 300,
    "intensity": 2,
    "group_type": "solo",
    "interests": ["coffee", "hiking", "art"]
  }'

