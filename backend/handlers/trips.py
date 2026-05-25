import json
import uuid
from datetime import datetime, timezone
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.dynamodb import get_dynamodb_table
from utils.decorators import require_auth
from utils.response import success_response, error_response
from utils.error_handler import handle_errors, NotFoundError, validate_ownership
from boto3.dynamodb.conditions import Key
from pydantic import ValidationError as PydanticValidationError
from models.trip_request import CreateTripRequest, UpdateTripRequest

trips_table = get_dynamodb_table('trips')

@require_auth
@handle_errors
def create_trip(event, context):
    """Create a new trip with detailed questionnaire data"""
    user_id = event['authenticated_user_id']

    body = json.loads(event['body'])

    # Validate request with Pydantic
    try:
        trip_request = CreateTripRequest(**body)
    except PydanticValidationError as e:
        # Format Pydantic errors nicely
        errors = []
        for error in e.errors():
            field = ' -> '.join(str(loc) for loc in error['loc'])
            errors.append(f"{field}: {error['msg']}")
        return error_response(400, f"Validation error: {'; '.join(errors)}")

    trip_id = str(uuid.uuid4())

    # Extract questionnaire data from validated model
    questionnaire = trip_request.questionnaire.model_dump()

    trip = {
        'trip_id': trip_id,
        'user_id': user_id,
        'type': trip_request.type,
        'destination': trip_request.destination,

        # Questionnaire fields from validated request
        'questionnaire': questionnaire,

        'preferences': trip_request.preferences,
        'status': 'pending',
        'itinerary': {},
        'created_at': datetime.now(timezone.utc).isoformat()
    }

    trips_table.put_item(Item=trip)

    return success_response(trip)

@require_auth
@handle_errors
def list_trips(event, context):
    """List all trips for a user"""
    user_id = event['authenticated_user_id']

    response = trips_table.query(
        IndexName='user-index',
        KeyConditionExpression=Key('user_id').eq(user_id)
    )

    return success_response(response['Items'])

@require_auth
@handle_errors
def get_trip(event, context):
    """Get a specific trip"""
    user_id = event['authenticated_user_id']
    trip_id = event['pathParameters']['trip_id']

    print(f"[GET TRIP] Fetching trip_id: {trip_id} for user: {user_id}")

    response = trips_table.get_item(Key={'trip_id': trip_id})
    if 'Item' not in response:
        print(f"[GET TRIP] ❌ Trip not found in DynamoDB: {trip_id}")
        raise NotFoundError("Trip not found")

    trip = response['Item']
    print(f"[GET TRIP] ✅ Trip found, owner: {trip.get('user_id')}")

    # Verify ownership
    validate_ownership(trip['user_id'], user_id, 'trip')

    print(f"[GET TRIP] ✅ Ownership validated, returning trip")
    return success_response(trip)

@require_auth
@handle_errors
def update_trip(event, context):
    """Update a trip"""
    user_id = event['authenticated_user_id']

    trip_id = event['pathParameters']['trip_id']
    body = json.loads(event['body'])

    # Validate request with Pydantic
    try:
        update_request = UpdateTripRequest(**body)
    except PydanticValidationError as e:
        errors = []
        for error in e.errors():
            field = ' -> '.join(str(loc) for loc in error['loc'])
            errors.append(f"{field}: {error['msg']}")
        return error_response(400, f"Validation error: {'; '.join(errors)}")

    # Verify ownership
    response = trips_table.get_item(Key={'trip_id': trip_id})
    if 'Item' not in response:
        raise NotFoundError("Trip not found")

    trip = response['Item']
    validate_ownership(trip['user_id'], user_id, 'trip')

    # Build update expression using ExpressionAttributeNames
    update_expr = []
    expr_values = {}
    expr_names = {}

    if update_request.preferences is not None:
        update_expr.append('#preferences = :p')
        expr_values[':p'] = update_request.preferences
        expr_names['#preferences'] = 'preferences'

    if update_request.status is not None:
        update_expr.append('#status = :s')
        expr_values[':s'] = update_request.status
        expr_names['#status'] = 'status'

    if update_request.itinerary is not None:
        update_expr.append('#itinerary = :i')
        expr_values[':i'] = update_request.itinerary
        expr_names['#itinerary'] = 'itinerary'

    if update_expr:
        trips_table.update_item(
            Key={'trip_id': trip_id},
            UpdateExpression='SET ' + ', '.join(update_expr),
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_values
        )

    return success_response({'message': 'Trip updated'})

@require_auth
@handle_errors
def delete_trip(event, context):
    """Delete a trip"""
    user_id = event['authenticated_user_id']

    trip_id = event['pathParameters']['trip_id']

    # Verify ownership
    response = trips_table.get_item(Key={'trip_id': trip_id})
    if 'Item' not in response:
        raise NotFoundError("Trip not found")

    trip = response['Item']
    validate_ownership(trip['user_id'], user_id, 'trip')

    trips_table.delete_item(Key={'trip_id': trip_id})

    return success_response({'message': 'Trip deleted'})
