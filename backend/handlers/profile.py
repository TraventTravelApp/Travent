import json
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.dynamodb import get_dynamodb_table
from utils.decorators import require_auth
from utils.response import success_response, error_response
from pydantic import ValidationError as PydanticValidationError
from models.trip_request import ProfileUpdateRequest

users_table = get_dynamodb_table('users')

@require_auth
def get_profile(event, context):
    """Get user profile"""
    try:
        user_id = event['authenticated_user_id']

        response = users_table.get_item(Key={'user_id': user_id})
        if 'Item' not in response:
            return error_response(404, "User not found")
        
        user = response['Item']
        
        # Remove sensitive data
        user.pop('password_hash', None)
        
        return success_response(user)
        
    except Exception as e:
        return error_response(500, str(e))

@require_auth
def update_profile(event, context):
    """Update user profile"""
    try:
        user_id = event['authenticated_user_id']

        body = json.loads(event['body'])

        # Validate request with Pydantic
        try:
            profile_update = ProfileUpdateRequest(**body)
        except PydanticValidationError as e:
            errors = []
            for error in e.errors():
                field = ' -> '.join(str(loc) for loc in error['loc'])
                errors.append(f"{field}: {error['msg']}")
            return error_response(400, f"Validation error: {'; '.join(errors)}")

        # Build update expression with ExpressionAttributeNames
        update_expr = []
        expr_values = {}
        expr_names = {}

        if profile_update.name is not None:
            update_expr.append('#name = :n')
            expr_values[':n'] = profile_update.name
            expr_names['#name'] = 'name'

        if profile_update.bio is not None:
            update_expr.append('#bio = :b')
            expr_values[':b'] = profile_update.bio
            expr_names['#bio'] = 'bio'

        if profile_update.profile_photo_url is not None:
            update_expr.append('#profile_photo_url = :p')
            expr_values[':p'] = profile_update.profile_photo_url
            expr_names['#profile_photo_url'] = 'profile_photo_url'

        if profile_update.preferences is not None:
            update_expr.append('#preferences = :pr')
            expr_values[':pr'] = profile_update.preferences
            expr_names['#preferences'] = 'preferences'

        if not update_expr:
            return error_response(400, "No valid fields to update")

        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET ' + ', '.join(update_expr),
            ExpressionAttributeNames=expr_names,
            ExpressionAttributeValues=expr_values
        )
        
        return success_response({'message': 'Profile updated successfully'})
        
    except Exception as e:
        return error_response(500, str(e))

@require_auth
def get_settings(event, context):
    """Get user settings"""
    try:
        user_id = event['authenticated_user_id']

        response = users_table.get_item(Key={'user_id': user_id})
        if 'Item' not in response:
            return error_response(404, "User not found")
        
        user = response['Item']
        settings = user.get('settings', {
            'notifications': True,
            'email_updates': True,
            'theme': 'light',
            'units': 'imperial'
        })
        
        return success_response({'settings': settings})
        
    except Exception as e:
        return error_response(500, str(e))

@require_auth
def update_settings(event, context):
    """Update user settings"""
    try:
        user_id = event['authenticated_user_id']

        body = json.loads(event['body'])
        settings = body.get('settings')

        if not settings:
            return error_response(400, "Settings required")

        if not isinstance(settings, dict):
            return error_response(400, "Settings must be an object")

        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression='SET #settings = :s',
            ExpressionAttributeNames={'#settings': 'settings'},
            ExpressionAttributeValues={':s': settings}
        )
        
        return success_response({'message': 'Settings updated successfully'})
        
    except Exception as e:
        return error_response(500, str(e))
