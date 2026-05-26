# Trip Planner AI Layer

AWS Bedrock-powered itinerary generation service for the FSU AI Maker Challenge.

**🚀 New here? Open `START-HERE.md` or `QUICKSTART.md` to get started!**

---

## Overview

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Install Serverless Framework:
```bash
npm install -g serverless
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your values
```

4. Deploy to AWS:
```bash
serverless deploy
```

## API Endpoints

### POST /ai/itinerary/generate

Generate a trip itinerary using Claude via AWS Bedrock.

**Headers:**
- `Authorization: Bearer <jwt_token>`

**Request Body (Location Trip):**
```json
{
  "trip_type": "location",
  "destination": "Miami, FL",
  "duration": 3,
  "budget": "moderate",
  "intensity": 7,
  "group_type": "friends",
  "interests": ["beach", "nightlife", "food"],
  "activity_preferences": ["water sports", "clubs", "seafood restaurants"]
}
```

**Request Body (Road Trip):**
```json
{
  "trip_type": "roadtrip",
  "start_location": "Atlanta, GA",
  "end_location": "Miami, FL",
  "duration": 5,
  "budget": "moderate",
  "intensity": 6,
  "scenic_route": true,
  "include_gas": true,
  "interests": ["nature", "photography", "local food"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "trip_type": "location",
    "itinerary": {
      "trip_summary": "...",
      "days": [...],
      "total_estimated_cost": "$500-700",
      "notes": [...]
    }
  }
}
```

## AWS Services Used

- **AWS Bedrock**: Claude Sonnet 4.6 for itinerary generation (Opus-level performance at Sonnet pricing)
- **AWS Lambda**: Serverless function execution
- **API Gateway**: REST API endpoints
- **DynamoDB**: Trip storage (integrated with backend layer)

## Model Selection

Using Claude Sonnet 4.6 (Feb 2026 release):
- Cost: $3 input / $15 output per million tokens
- Performance: Opus-level intelligence at 5x lower cost
- Perfect for creative itinerary generation

Alternative models available:
- Claude Opus 4.5: Most powerful ($5/$25) - use if you need absolute best quality
- Claude Haiku 4.5: Fastest/cheapest - use if budget is very tight

## Local Testing

```bash
# Test the handler locally
python -c "from handlers.itinerary import generate; print(generate({'body': '{...}'}, {}))"
```

## Environment Variables

- `AWS_REGION`: AWS region (default: us-east-1)
- `BEDROCK_MODEL_ID`: Bedrock model ID
- `JWT_SECRET`: Secret for JWT verification
- `DYNAMODB_TABLE_NAME`: DynamoDB table name
