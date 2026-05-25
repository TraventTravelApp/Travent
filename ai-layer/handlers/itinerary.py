import json
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.claude_service import ClaudeService
from services.prompt_builder import PromptBuilder
from services.itinerary_parser import ItineraryParser
from services.itinerary_validator import ItineraryValidator
from utils.response import success_response, error_response
from utils.auth_utils import extract_user_id

claude_service = ClaudeService()
prompt_builder = PromptBuilder()
parser = ItineraryParser()
validator = ItineraryValidator()

def generate(event, context):
    try:
        # Extract and validate user ID from JWT token
        user_id = extract_user_id(event)
        if not user_id:
            return error_response('Unauthorized - valid authentication token required', 401)
        
        body = json.loads(event.get('body', '{}'))
        
        trip_type = body.get('trip_type')
        if trip_type not in ['location', 'roadtrip']:
            return error_response('Invalid trip_type. Must be "location" or "roadtrip"')
        
        system_prompt = prompt_builder.build_system_prompt()
        
        if trip_type == 'location':
            if not body.get('destination'):
                return error_response('destination is required for location trips')
            user_prompt = prompt_builder.build_location_trip_prompt(body)
        else:
            if not body.get('start_location') or not body.get('end_location'):
                return error_response('start_location and end_location are required for roadtrips')
            user_prompt = prompt_builder.build_roadtrip_prompt(body)
        
        # Generate itinerary with retry on validation failure
        max_retries = 2
        for attempt in range(max_retries + 1):
            claude_response = claude_service.generate_itinerary(system_prompt, user_prompt)

            itinerary = parser.parse(claude_response)

            # Validate itinerary against constraints
            is_valid, validation_errors = validator.validate(itinerary, body)

            if is_valid:
                # Success - return valid itinerary
                result = {
                    'user_id': user_id,
                    'trip_type': trip_type,
                    'itinerary': itinerary,
                    'validation_passed': True
                }
                return success_response(result)

            # Validation failed
            print(f"Validation failed (attempt {attempt + 1}/{max_retries + 1}): {validation_errors}")

            if attempt < max_retries:
                # Add validation feedback to prompt for retry
                user_prompt += f"\n\nIMPORTANT: Previous attempt had these issues:\n"
                for error in validation_errors:
                    user_prompt += f"- {error}\n"
                user_prompt += "\nPlease fix these issues in your response."
            else:
                # Max retries reached - return with warnings
                print(f"Max retries reached. Returning itinerary with validation warnings.")
                result = {
                    'user_id': user_id,
                    'trip_type': trip_type,
                    'itinerary': itinerary,
                    'validation_passed': False,
                    'validation_warnings': validation_errors
                }
                return success_response(result)
        
    except Exception as e:
        print(f"Error generating itinerary: {str(e)}")
        return error_response(f'Failed to generate itinerary: {str(e)}', 500)
