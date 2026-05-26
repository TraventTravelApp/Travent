import json
from functools import wraps
from typing import Callable, Dict, Any
from .auth_utils import extract_user_id


def success_response(data: Dict[str, Any], status_code: int = 200) -> Dict[str, Any]:
    """Create a standardized success response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True
        },
        'body': json.dumps(data)
    }


def error_response(status_code: int, message: str) -> Dict[str, Any]:
    """Create a standardized error response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': True
        },
        'body': json.dumps({'error': message})
    }


def require_auth(func: Callable) -> Callable:
    """
    Decorator to enforce authentication on Lambda handler functions.

    Extracts and verifies JWT token from Authorization header, then injects
    the authenticated user_id into the event object for use by the handler.

    Usage:
        @require_auth
        def my_handler(event, context):
            user_id = event['authenticated_user_id']
            # ... rest of handler logic

    Returns 401 Unauthorized if:
    - No Authorization header present
    - Invalid token format
    - Token signature verification fails
    - Token is expired
    - No user identifier found in token
    """
    @wraps(func)
    def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        try:
            # Extract and verify user ID from JWT token
            user_id = extract_user_id(event)

            if not user_id:
                return error_response(401, "Authentication required")

            # Inject authenticated user_id into event for handler to use
            event['authenticated_user_id'] = user_id

            # Call the actual handler function
            return func(event, context)

        except ValueError as e:
            # Authentication/authorization errors
            return error_response(401, str(e))
        except Exception as e:
            # Unexpected errors during authentication
            print(f"Unexpected error in require_auth: {str(e)}")
            return error_response(500, "Internal server error")

    return wrapper


def optional_auth(func: Callable) -> Callable:
    """
    Decorator for endpoints that support optional authentication.

    If a valid token is present, injects user_id into event.
    If no token or invalid token, sets user_id to None and continues.

    Usage:
        @optional_auth
        def my_handler(event, context):
            user_id = event.get('authenticated_user_id')  # May be None
            # ... rest of handler logic
    """
    @wraps(func)
    def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        try:
            # Try to extract user ID
            user_id = extract_user_id(event)
            event['authenticated_user_id'] = user_id
        except (ValueError, KeyError):
            # No auth or invalid auth - continue without user_id
            event['authenticated_user_id'] = None
        except Exception as e:
            print(f"Unexpected error in optional_auth: {str(e)}")
            event['authenticated_user_id'] = None

        # Call handler regardless of auth status
        return func(event, context)

    return wrapper
