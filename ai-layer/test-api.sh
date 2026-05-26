#!/bin/bash

API_URL="https://ksalbazufb.execute-api.us-east-1.amazonaws.com/dev/ai/itinerary/generate"

echo "🧪 Testing AI Layer API..."
echo ""
echo "Testing Location Trip (Miami)..."
echo ""

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-123" \
  -d '{
    "trip_type": "location",
    "destination": "Miami, FL",
    "duration": 3,
    "budget": "moderate",
    "intensity": 7,
    "group_type": "friends",
    "interests": ["beach", "nightlife", "food"],
    "activity_preferences": ["water sports", "clubs", "seafood restaurants"]
  }' | python3 -m json.tool

echo ""
echo ""
echo "✅ Test complete!"
