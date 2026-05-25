"""
Trip planning handler that integrates quiz results + Reddit scraper + AI layer
"""
import json
import sys
import os
import requests

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from utils.response import success_response, error_response
from utils.decorators import require_auth

AI_LAYER_URL = os.environ.get(
    'AI_LAYER_URL',
    'https://ksalbazufb.execute-api.us-east-1.amazonaws.com/dev/ai/itinerary/generate'
)

@require_auth
def create_trip_from_quiz(event, context):
    """
    Complete flow: Quiz answers → Reddit scraper → AI layer → Save trip
    """
    try:
        user_id = event['authenticated_user_id']
        
        body = json.loads(event.get('body', '{}'))
        
        # Extract quiz answers
        destination = body.get('destination')
        duration = body.get('duration', 3)
        budget = body.get('budget', 'moderate')
        intensity = body.get('intensity', 5)
        group_type = body.get('group_type', 'solo')
        interests = body.get('interests', [])
        activity_preferences = body.get('activity_preferences', [])
        
        if not destination:
            return error_response('destination is required')
        
        # TODO: Call Reddit scraper to get local spots
        # For now, using empty list - your scraper friend will implement this
        recommended_places = []
        
        # Example of what scraper should return:
        # recommended_places = reddit_scraper.get_spots(
        #     city=destination,
        #     interests=interests
        # )
        
        # Build request for AI layer
        ai_request = {
            'trip_type': 'location',
            'destination': destination,
            'duration': duration,
            'budget': budget,
            'intensity': intensity,
            'group_type': group_type,
            'interests': interests,
            'activity_preferences': activity_preferences,
            'recommended_places': recommended_places  # From Reddit scraper
        }
        
        print(f"Generating itinerary for {destination} with {len(recommended_places)} recommended places")
        
        # Call AI layer
        ai_response = requests.post(
            AI_LAYER_URL,
            json=ai_request,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        if ai_response.status_code != 200:
            error_msg = ai_response.json().get('error', 'AI layer request failed')
            return error_response(f'AI generation failed: {error_msg}', 500)
        
        ai_data = ai_response.json()
        
        if not ai_data.get('success'):
            return error_response(ai_data.get('error', 'Unknown error'), 500)
        
        itinerary = ai_data['data']['itinerary']
        
        # TODO: Save to DynamoDB
        # trip_id = save_trip_to_db(user_id, {
        #     'destination': destination,
        #     'itinerary': itinerary,
        #     'quiz_answers': body,
        #     'created_at': datetime.now().isoformat()
        # })
        
        return success_response({
            'message': 'Trip created successfully',
            'user_id': user_id,
            'destination': destination,
            'itinerary': itinerary
        })
        
    except requests.exceptions.Timeout:
        return error_response('AI generation timed out. Please try again.', 504)
    except requests.exceptions.RequestException as e:
        print(f"Error calling AI layer: {str(e)}")
        return error_response(f'Failed to connect to AI service: {str(e)}', 500)
    except Exception as e:
        print(f"Error in trip planning: {str(e)}")
        return error_response(f'Failed to create trip: {str(e)}', 500)
