"""
AI Itinerary Generator using AWS Bedrock and Amazon Location Services
"""
import json
import sys
import os
import uuid
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import boto3

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from utils.response import success_response, error_response
from utils.decorators import require_auth
from utils.dynamodb import get_dynamodb_table
from utils.error_handler import handle_errors, ExternalServiceError
from pydantic import ValidationError as PydanticValidationError
from models.trip_request import AIItineraryRequest

# AWS clients
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')
location_client = boto3.client('location', region_name='us-east-1')
trips_table = get_dynamodb_table('trips')

# Use Claude 3 Haiku inference profile (cross-region)
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'us.anthropic.claude-3-haiku-20240307-v1:0')
PLACE_INDEX_NAME = os.environ.get('LOCATION_PLACE_INDEX_NAME', 'TripPlaceIndex')

def search_places(query: str, bias_position: list = None, max_results: int = 10):
    """Search for places using Amazon Location Service"""
    try:
        params = {
            'IndexName': PLACE_INDEX_NAME,
            'Text': query,
            'MaxResults': max_results
        }
        
        if bias_position:
            params['BiasPosition'] = bias_position
        
        response = location_client.search_place_index_for_text(**params)
        return response.get('Results', [])
    except Exception as e:
        print(f"Error searching places: {str(e)}")
        return []

def get_coordinates(location_name: str):
    """Get coordinates for a location"""
    results = search_places(location_name, max_results=1)
    if results:
        point = results[0]['Place']['Geometry']['Point']
        return {'lat': point[1], 'lon': point[0], 'label': results[0]['Place']['Label']}

    # Log warning but don't fail - coordinates are optional
    print(f"Warning: Could not find coordinates for location: {location_name}")
    return None

def generate_itinerary_with_ai(trip_data: dict, user_interests: list):
    """Generate itinerary using Claude via Bedrock"""
    
    trip_type = trip_data.get('trip_type')
    duration = trip_data.get('duration', 3)
    budget = trip_data.get('budget', 500)
    intensity = trip_data.get('intensity', 3)
    
    # Determine trip description based on type
    if trip_type == 'location':
        trip_description = trip_data.get('destination', 'Unknown destination')
        main_location = trip_data.get('destination', 'Unknown')
    else:  # roadtrip
        start_loc = trip_data.get('start_location', 'Unknown')
        end_loc = trip_data.get('end_location', 'Unknown')
        trip_description = f"{start_loc} to {end_loc}"
        main_location = end_loc  # Use end location as main destination
    
    # Build concise prompt for Claude
    prompt = f"""Generate a {duration}-day travel itinerary in JSON format.

Trip: {trip_description}
Type: {trip_type}
Budget: ${budget}
Intensity: {intensity}/5 ({get_intensity_description(intensity)})
Interests: {', '.join(user_interests[:3]) if user_interests else 'general'}

Return ONLY this JSON structure (no other text):
{{
  "title": "Trip name",
  "destination": "{main_location}",
  "days": [
    {{
      "day": 1,
      "activities": [
        {{
          "time": "9:00 AM",
          "name": "Place name",
          "description": "One sentence",
          "location": "Address",
          "duration": "2 hours",
          "cost": 25,
          "category": "food"
        }}
      ]
    }}
  ],
  "total_cost": {budget}
}}

Requirements:
- Real places only
- {get_activities_per_day(intensity)} activities per day
- Costs within budget
- Mix activity types"""
    
    try:
        # Call Bedrock with shorter timeout
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2000,  # Reduced for faster response
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7
        }

        response = bedrock.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps(request_body)
        )

        response_body = json.loads(response['body'].read())
        ai_text = response_body['content'][0]['text']

        # Extract JSON from response
        json_start = ai_text.find('{')
        json_end = ai_text.rfind('}') + 1

        if json_start >= 0 and json_end > json_start:
            itinerary_json = ai_text[json_start:json_end]
            itinerary = json.loads(itinerary_json)
            return itinerary
        else:
            raise ExternalServiceError('Bedrock', 'AI response did not contain valid JSON')

    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {str(e)}")
        raise ExternalServiceError('Bedrock', 'AI returned invalid JSON format')
    except ExternalServiceError:
        # Re-raise our custom errors
        raise
    except Exception as e:
        print(f"Error calling Bedrock: {str(e)}")
        raise ExternalServiceError('Bedrock', f'AI generation failed: {str(e)}')

def get_activities_per_day(intensity: int) -> str:
    activities = {
        1: '2',
        2: '2-3',
        3: '3-4',
        4: '4-5',
        5: '5+'
    }
    return activities.get(intensity, '3-4')

def get_intensity_description(level: int) -> str:
    descriptions = {
        1: '≤2 activities per day (very relaxed)',
        2: '2-3 activities per day (relaxed)',
        3: '3-4 activities per day (moderate)',
        4: '4-5 activities per day (packed)',
        5: '≥5 activities per day (very packed)'
    }
    return descriptions.get(level, 'moderate pace')

def convert_floats_to_decimals(obj):
    """Recursively convert all float values to Decimal for DynamoDB"""
    if isinstance(obj, list):
        return [convert_floats_to_decimals(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_floats_to_decimals(value) for key, value in obj.items()}
    elif isinstance(obj, float):
        return Decimal(str(obj))
    else:
        return obj

@require_auth
@handle_errors
def generate(event, context):
    """Generate AI-powered itinerary"""
    print(f"[AI GEN] Handler called, event keys: {list(event.keys())}")

    # Get authenticated user ID
    user_id = event['authenticated_user_id']
    print(f"[AI GEN] Authenticated user ID: {user_id}")

    # Parse request body
    body = json.loads(event.get('body', '{}'))
    print(f"[AI GEN] Request body keys: {list(body.keys())}")

    # Validate request with Pydantic
    try:
        ai_request = AIItineraryRequest(**body)
        print(f"[AI GEN] Validation passed: trip_type={ai_request.trip_type}, duration={ai_request.duration}")
    except PydanticValidationError as e:
        errors = []
        for error in e.errors():
            field = ' -> '.join(str(loc) for loc in error['loc'])
            errors.append(f"{field}: {error['msg']}")
        error_msg = f"Validation error: {'; '.join(errors)}"
        print(f"[AI GEN] ERROR: {error_msg}")
        return error_response(400, error_msg)

    print(f"[AI GEN] Generating itinerary for user {user_id}, trip_type: {ai_request.trip_type}")

    # Get user interests
    user_interests = ai_request.interests

    # Convert Pydantic model to dict for backward compatibility
    body_dict = ai_request.model_dump()

    # Get location coordinates using Amazon Location Service
    if ai_request.trip_type == 'location':
        print(f"[AI GEN] Fetching coordinates for destination: {ai_request.destination}")
        coords = get_coordinates(ai_request.destination)
        if coords:
            body_dict['destination_coords'] = coords
            print(f"[AI GEN] Coordinates found: {coords}")
    else:
        print(f"[AI GEN] Fetching coordinates for roadtrip: {ai_request.start_location} to {ai_request.end_location}")
        start_coords = get_coordinates(ai_request.start_location)
        end_coords = get_coordinates(ai_request.end_location)
        if start_coords and end_coords:
            body_dict['start_coords'] = start_coords
            body_dict['end_coords'] = end_coords
            print(f"[AI GEN] Route coordinates found")

    # Generate itinerary with AI
    print(f"[AI GEN] Calling Bedrock to generate itinerary...")
    itinerary = generate_itinerary_with_ai(body_dict, user_interests)
    print(f"[AI GEN] Bedrock generation completed, days: {len(itinerary.get('days', []))}")

    # Geocode activity locations
    print(f"[AI GEN] Geocoding activity locations...")
    for day in itinerary.get('days', []):
        for activity in day.get('activities', []):
            if activity.get('location'):
                coords = get_coordinates(activity['location'])
                if coords:
                    activity['latitude'] = coords['lat']
                    activity['longitude'] = coords['lon']
                    print(f"[AI GEN] Geocoded {activity['name']}: {coords['lat']}, {coords['lon']}")
    print(f"[AI GEN] Geocoding completed")

    # Create trip in database
    trip_id = str(uuid.uuid4())

    # Calculate dates
    start_date = ai_request.start_date
    if not start_date:
        start_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')

    duration = ai_request.duration
    end_date = ai_request.end_date
    if not end_date:
        end_date = (datetime.strptime(start_date, '%Y-%m-%d') + timedelta(days=duration)).strftime('%Y-%m-%d')

    # Determine destination for trip record
    if ai_request.trip_type == 'location':
        trip_destination = itinerary.get('destination', ai_request.destination)
    else:  # roadtrip
        trip_destination = f"{ai_request.start_location} to {ai_request.end_location}"

    trip = {
        'trip_id': trip_id,
        'user_id': user_id,
        'title': itinerary.get('title', f"Trip to {trip_destination}"),
        'type': ai_request.trip_type,
        'destination': trip_destination,
        'start_date': start_date,
        'end_date': end_date,
        'budget': ai_request.budget,
        'duration': duration,
        'intensity': ai_request.intensity,
        'group_type': ai_request.group_type,
        'interests': user_interests,
        'itinerary': itinerary,
        'status': 'active',
        'created_at': datetime.now(timezone.utc).isoformat(),
        'updated_at': datetime.now(timezone.utc).isoformat()
    }

    # Add roadtrip-specific fields
    if ai_request.trip_type == 'roadtrip':
        trip['start_location'] = ai_request.start_location
        trip['end_location'] = ai_request.end_location
        trip['include_gas'] = ai_request.include_gas
        trip['scenic_route'] = ai_request.scenic_route
        
    # Convert floats to Decimals for DynamoDB
    trip = convert_floats_to_decimals(trip)

    # Save to DynamoDB
    print(f"[AI GEN] Saving trip {trip_id} to DynamoDB...")
    try:
        trips_table.put_item(Item=trip)
        print(f"[AI GEN] ✅ Trip {trip_id} saved to DynamoDB successfully")
        print(f"[AI GEN] Trip keys: {list(trip.keys())}")
        print(f"[AI GEN] Itinerary has {len(trip.get('itinerary', {}).get('days', []))} days")
    except Exception as e:
        print(f"[AI GEN] ERROR saving to DynamoDB: {str(e)}")
        raise

    # Return trip data
    print(f"[AI GEN] Returning success response")
    return success_response({
        'trip_id': trip_id,
        'trip': trip
    })
