# AI Layer Integration Guide

## What This Does

Your AI layer takes trip preferences and generates detailed day-by-day itineraries using Claude AI.

## API Endpoint

```
POST https://ksalbazufb.execute-api.us-east-1.amazonaws.com/dev/ai/itinerary/generate
```

## How Backend Should Call It

### Request Format

```json
{
  "trip_type": "location",
  "destination": "New York City",
  "duration": 3,
  "budget": "moderate",
  "intensity": 7,
  "group_type": "friends",
  "interests": ["food", "art", "nightlife"],
  "activity_preferences": ["museums", "local restaurants"],
  "recommended_places": [
    {
      "name": "Roberta's Pizza",
      "description": "Legendary Brooklyn pizza spot, locals swear by it"
    },
    {
      "name": "The Met Cloisters",
      "description": "Hidden medieval art museum in Fort Tryon Park"
    }
  ]
}
```

### Required Fields
- `trip_type`: "location" or "roadtrip"
- `destination`: City name (for location trips)
- `duration`: Number of days (1-10)
- `budget`: "low", "moderate", or "high"
- `intensity`: 1-10 (how packed the schedule should be)
- `group_type`: "solo", "couple", "friends", "family"
- `interests`: Array of interest keywords

### Optional Fields
- `activity_preferences`: More specific activities they want
- `recommended_places`: **YOUR REDDIT SCRAPER DATA GOES HERE**

### Response Format

```json
{
  "success": true,
  "data": {
    "user_id": "test-user-123",
    "trip_type": "location",
    "itinerary": {
      "trip_summary": "Brief overview",
      "days": [
        {
          "day": 1,
          "theme": "Food & Culture",
          "activities": [
            {
              "time": "9:00 AM",
              "name": "Roberta's Pizza",
              "location": "261 Moore St, Brooklyn",
              "description": "Start with legendary pizza",
              "estimated_duration": "1.5 hours",
              "estimated_cost": "$15-25 per person",
              "booking_required": false,
              "tips": "Get there early to avoid lines"
            }
          ]
        }
      ],
      "total_estimated_cost": "$500-700",
      "notes": ["Helpful trip-wide tips"]
    }
  }
}
```

## Integration with Reddit Scraper

### Flow

1. User completes interest quiz
2. Backend calls Reddit scraper with user interests
3. Scraper returns NYC spots from Reddit
4. Backend formats spots into `recommended_places` array
5. Backend calls AI layer with quiz data + recommended places
6. AI layer generates itinerary featuring those spots
7. Backend saves itinerary to database
8. Frontend displays the trip

### Example Backend Code (Python)

```python
import requests

# Get user quiz data
user_data = get_user_quiz_answers(user_id)

# Call Reddit scraper
reddit_spots = reddit_scraper.get_spots(
    city="NYC",
    interests=user_data['interests']
)

# Format for AI layer
recommended_places = [
    {
        "name": spot['name'],
        "description": spot['reddit_description']
    }
    for spot in reddit_spots
]

# Call AI layer
response = requests.post(
    "https://ksalbazufb.execute-api.us-east-1.amazonaws.com/dev/ai/itinerary/generate",
    json={
        "trip_type": "location",
        "destination": "New York City",
        "duration": user_data['duration'],
        "budget": user_data['budget'],
        "intensity": user_data['intensity'],
        "group_type": user_data['group_type'],
        "interests": user_data['interests'],
        "recommended_places": recommended_places
    }
)

itinerary = response.json()['data']['itinerary']
```

## What Makes Your App Unique

**Without Reddit scraper:**
- AI suggests generic tourist spots (Times Square, Statue of Liberty)

**With Reddit scraper:**
- AI builds itinerary around local hidden gems
- Features spots that locals actually recommend
- Avoids tourist traps
- More authentic, personalized experience

## Testing

### Test without Reddit spots:
```bash
cd ai-layer
bash test-api.sh
```

### Test with Reddit spots:
```bash
curl -X POST https://ksalbazufb.execute-api.us-east-1.amazonaws.com/dev/ai/itinerary/generate \
  -H "Content-Type: application/json" \
  -d '{
    "trip_type": "location",
    "destination": "NYC",
    "duration": 2,
    "budget": "moderate",
    "intensity": 7,
    "group_type": "friends",
    "interests": ["food", "art"],
    "recommended_places": [
      {"name": "Katz Deli", "description": "Famous pastrami, Reddit favorite"},
      {"name": "The High Line", "description": "Elevated park, locals love it"}
    ]
  }'
```

## Current Status

- ✅ AI layer deployed to AWS
- ✅ API endpoint live
- ✅ Accepts recommended_places from scraper
- ✅ Generates detailed itineraries
- ⏳ Waiting for Anthropic model access (15 min wait)

## Model Being Used

`anthropic.claude-3-haiku-20240307-v1:0`
- Fast responses (2-5 seconds)
- Cheap ($0.25 per million input tokens)
- Great quality for trip planning

## Questions?

- Where does scraper data go? → `recommended_places` array
- Does it matter where spots come from? → No, just needs name + description
- Can we use multiple sources? → Yes! Mix Reddit, Yelp, TikTok, whatever
- What if no recommended places? → AI uses its general knowledge
