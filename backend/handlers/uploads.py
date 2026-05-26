import json
import base64
import uuid
import sys
import os
from datetime import datetime, timezone
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.s3_utils import (
    upload_profile_photo as s3_upload_profile_photo,
    upload_trip_photo as s3_upload_trip_photo,
    upload_poi_image as s3_upload_poi_image,
    delete_file as s3_delete_file
)
from utils.decorators import require_auth
from utils.response import success_response, error_response
from utils.dynamodb import get_dynamodb_table
from utils.validation import (
    validate_profile_photo,
    validate_trip_photo,
    validate_poi_image,
    validate_pdf,
    ValidationError as FileValidationError
)
from utils.error_handler import (
    handle_errors,
    DatabaseError,
    ExternalServiceError,
    safe_execute
)

users_table = get_dynamodb_table('users')
trips_table = get_dynamodb_table('trips')
trip_photos_table = get_dynamodb_table('trip-photos')

@require_auth
@handle_errors
def upload_profile_photo(event, context):
    """Upload user profile photo (Lambda handler)"""
    user_id = event['authenticated_user_id']

    body = json.loads(event['body'])
    file_data = body.get('file_data')  # Base64 encoded
    file_name = body.get('file_name')
    content_type = body.get('content_type', 'image/jpeg')

    if not all([file_data, file_name]):
        return error_response(400, "file_data and file_name required")

    # Validate and decode file data
    try:
        file_content = validate_profile_photo(file_data, file_name, content_type)
    except FileValidationError as e:
        return error_response(e.status_code, e.message)

    # Upload to S3
    s3_url = s3_upload_profile_photo(file_content, file_name, content_type, user_id)

    if not s3_url:
        raise ExternalServiceError('S3', 'Failed to upload photo')

    # Update user record with photo URL (fail if this fails)
    try:
        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET #profile_photo_url = :url',
            ExpressionAttributeNames={'#profile_photo_url': 'profile_photo_url'},
            ExpressionAttributeValues={':url': s3_url}
        )
    except Exception as e:
        print(f"Error updating user record: {e}")
        raise DatabaseError('update', f"Failed to save photo URL to profile: {str(e)}")

    return success_response({
        'photo_url': s3_url,
        'message': 'Profile photo uploaded successfully'
    })

@require_auth
@handle_errors
def upload_trip_photo(event, context):
    """Upload trip photo (Lambda handler)"""
    user_id = event['authenticated_user_id']

    body = json.loads(event['body'])
    trip_id = body.get('trip_id')
    file_data = body.get('file_data')  # Base64 encoded
    file_name = body.get('file_name')
    content_type = body.get('content_type', 'image/jpeg')
    caption = body.get('caption', '')

    if not all([trip_id, file_data, file_name]):
        return error_response(400, "trip_id, file_data, and file_name required")

    # Verify trip ownership
    response = trips_table.get_item(Key={'trip_id': trip_id})
    trip = response.get('Item')

    if not trip:
        return error_response(404, "Trip not found")

    if trip.get('user_id') != user_id:
        return error_response(403, "Forbidden")

    # Validate and decode file data
    try:
        file_content = validate_trip_photo(file_data, file_name, content_type)
    except FileValidationError as e:
        return error_response(e.status_code, e.message)

    # Upload to S3
    s3_url = s3_upload_trip_photo(file_content, file_name, content_type, trip_id)

    if not s3_url:
        raise ExternalServiceError('S3', 'Failed to upload photo')

    # Create photo record in trip-photos table (fail if this fails)
    photo_id = str(uuid.uuid4())
    photo_record = {
        'trip_id': trip_id,
        'photo_id': photo_id,
        'url': s3_url,
        'caption': caption,
        'uploaded_at': datetime.now(timezone.utc).isoformat(),
        'uploaded_by': user_id
    }

    try:
        trip_photos_table.put_item(Item=photo_record)
    except Exception as e:
        print(f"Error saving photo record: {e}")
        raise DatabaseError('put', f"Photo uploaded to S3 but failed to save record: {str(e)}")

    return success_response({
        'photo_id': photo_id,
        'photo_url': s3_url,
        'message': 'Trip photo uploaded successfully'
    })

@require_auth
def get_trip_photos(event, context):
    """Get all photos for a trip with pagination"""
    try:
        user_id = event['authenticated_user_id']
        trip_id = event['pathParameters']['trip_id']

        # Verify trip ownership
        response = trips_table.get_item(Key={'trip_id': trip_id})
        trip = response.get('Item')

        if not trip:
            return error_response(404, "Trip not found")

        if trip.get('user_id') != user_id:
            return error_response(403, "Forbidden")

        # Query trip-photos table
        from boto3.dynamodb.conditions import Key as DynamoKey

        query_params = {
            'KeyConditionExpression': DynamoKey('trip_id').eq(trip_id),
            'ScanIndexForward': False  # Sort by photo_id descending (newest first)
        }

        # Add pagination support
        query_string = event.get('queryStringParameters', {}) or {}
        limit = int(query_string.get('limit', 50))
        last_key = query_string.get('last_key')

        if limit:
            query_params['Limit'] = min(limit, 100)  # Max 100 per request

        if last_key:
            query_params['ExclusiveStartKey'] = {
                'trip_id': trip_id,
                'photo_id': last_key
            }

        response = trip_photos_table.query(**query_params)

        result = {
            'photos': response.get('Items', []),
            'count': len(response.get('Items', []))
        }

        # Add pagination token if there are more results
        if 'LastEvaluatedKey' in response:
            result['last_key'] = response['LastEvaluatedKey']['photo_id']
            result['has_more'] = True
        else:
            result['has_more'] = False

        return success_response(result)

    except Exception as e:
        print(f"Error retrieving trip photos: {e}")
        return error_response(500, str(e))

@require_auth
def delete_upload(event, context):
    """Delete photo from S3 (Lambda handler)"""

    try:
        body = json.loads(event['body'])
        photo_url = body.get('photo_url')

        if not photo_url:
            return error_response(400, "photo_url required")

        # Delete from S3
        success = s3_delete_file(photo_url)

        if not success:
            return error_response(500, "Failed to delete photo")

        return success_response({
            'message': 'Photo deleted successfully'
        })

    except Exception as e:
        return error_response(500, str(e))

@require_auth
def upload_poi_image(event, context):
    """Upload POI image (Lambda handler)"""

    try:
        body = json.loads(event['body'])
        poi_id = body.get('poi_id')
        file_data = body.get('file_data')  # Base64 encoded
        file_name = body.get('file_name')
        content_type = body.get('content_type', 'image/jpeg')

        if not all([poi_id, file_data, file_name]):
            return error_response(400, "poi_id, file_data, and file_name required")

        # Validate and decode file data
        try:
            file_content = validate_poi_image(file_data, file_name, content_type)
        except ValidationError as e:
            return error_response(e.status_code, e.message)

        # Upload to S3
        s3_url = s3_upload_poi_image(file_content, file_name, content_type, poi_id)

        if not s3_url:
            return error_response(500, "Failed to upload POI image")

        return success_response({
            'image_url': s3_url,
            'message': 'POI image uploaded successfully'
        })

    except ValueError as e:
        return error_response(400, str(e))
    except Exception as e:
        return error_response(500, str(e))

@require_auth
def upload_itinerary_pdf(event, context):
    """Upload/generate itinerary PDF (Lambda handler)"""

    try:
        user_id = event['authenticated_user_id']

        body = json.loads(event['body'])
        trip_id = body.get('trip_id')

        if not trip_id:
            return error_response(400, "trip_id required")

        # Get trip data
        response = trips_table.get_item(Key={'trip_id': trip_id})
        trip = response.get('Item')

        if not trip:
            return error_response(404, "Trip not found")

        # Verify trip ownership
        if trip.get('user_id') != user_id:
            return error_response(403, "Forbidden")

        # TODO: Implement PDF generation using reportlab or weasyprint
        # For now, return placeholder response
        return success_response({
            'message': 'PDF generation not yet implemented',
            'trip_id': trip_id,
            'status': 'pending'
        })

    except ValueError as e:
        return error_response(400, str(e))
    except Exception as e:
        return error_response(500, str(e))
