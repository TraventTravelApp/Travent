"""Structured error handling for Lambda functions"""
import traceback
from functools import wraps
from typing import Callable, Dict, Any
from .response import error_response


class AppException(Exception):
    """Base exception for application errors"""
    def __init__(self, message: str, status_code: int = 500, details: Dict = None):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(AppException):
    """Validation error - client sent invalid data"""
    def __init__(self, message: str, details: Dict = None):
        super().__init__(message, 400, details)


class NotFoundError(AppException):
    """Resource not found error"""
    def __init__(self, message: str, details: Dict = None):
        super().__init__(message, 404, details)


class ForbiddenError(AppException):
    """Authorization error - user doesn't have permission"""
    def __init__(self, message: str, details: Dict = None):
        super().__init__(message, 403, details)


class UnauthorizedError(AppException):
    """Authentication error - user not authenticated"""
    def __init__(self, message: str, details: Dict = None):
        super().__init__(message, 401, details)


class ExternalServiceError(AppException):
    """Error from external service (AWS, APIs, etc.)"""
    def __init__(self, service: str, message: str, details: Dict = None):
        error_details = details or {}
        error_details['service'] = service
        super().__init__(f"{service} error: {message}", 503, error_details)


class DatabaseError(AppException):
    """Database operation error"""
    def __init__(self, operation: str, message: str, details: Dict = None):
        error_details = details or {}
        error_details['operation'] = operation
        super().__init__(f"Database {operation} failed: {message}", 500, error_details)


def handle_errors(func: Callable) -> Callable:
    """
    Decorator for consistent error handling across Lambda handlers.

    Catches all exceptions and converts them to proper HTTP responses.
    Logs errors for debugging while hiding sensitive details from users.

    Usage:
        @handle_errors
        def my_handler(event, context):
            # handler code
            pass
    """
    @wraps(func)
    def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        try:
            return func(event, context)

        except AppException as e:
            # Known application errors - return with appropriate status code
            print(f"AppException in {func.__name__}: {e.message}")
            if e.details:
                print(f"Details: {e.details}")

            return error_response(e.status_code, e.message)

        except ValueError as e:
            # Validation/parsing errors from Python
            print(f"ValueError in {func.__name__}: {str(e)}")
            return error_response(400, str(e))

        except KeyError as e:
            # Missing required fields
            print(f"KeyError in {func.__name__}: {str(e)}")
            return error_response(400, f"Missing required field: {str(e)}")

        except Exception as e:
            # Unexpected errors - log details but return generic message
            error_type = type(e).__name__
            print(f"Unexpected {error_type} in {func.__name__}: {str(e)}")
            print("Traceback:")
            traceback.print_exc()

            # Don't expose internal error details to users
            return error_response(500, "An internal error occurred. Please try again later.")

    return wrapper


def safe_execute(operation: str, func: Callable, *args, **kwargs) -> Any:
    """
    Safely execute a function with error handling.

    Args:
        operation: Description of the operation (for logging)
        func: Function to execute
        *args, **kwargs: Arguments to pass to the function

    Returns:
        Result of the function

    Raises:
        AppException: If the operation fails

    Usage:
        result = safe_execute("upload to S3", s3.put_object, Bucket=bucket, Key=key)
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        error_type = type(e).__name__
        print(f"Error during {operation}: {error_type} - {str(e)}")
        raise AppException(f"Failed to {operation}", 500, {'original_error': str(e)})


def require_fields(data: Dict, *fields: str) -> None:
    """
    Ensure required fields are present in data.

    Args:
        data: Dictionary to check
        *fields: Required field names

    Raises:
        ValidationError: If any required field is missing

    Usage:
        require_fields(body, 'email', 'password', 'name')
    """
    missing = [field for field in fields if field not in data or data[field] is None]

    if missing:
        if len(missing) == 1:
            raise ValidationError(f"Missing required field: {missing[0]}")
        else:
            raise ValidationError(f"Missing required fields: {', '.join(missing)}")


def validate_ownership(resource_user_id: str, authenticated_user_id: str, resource_type: str = "resource") -> None:
    """
    Validate that the authenticated user owns the resource.

    Args:
        resource_user_id: User ID associated with the resource
        authenticated_user_id: User ID from authentication token
        resource_type: Type of resource (for error message)

    Raises:
        NotFoundError: If resource doesn't exist (resource_user_id is None)
        ForbiddenError: If user doesn't own the resource

    Usage:
        validate_ownership(trip['user_id'], event['authenticated_user_id'], 'trip')
    """
    if not resource_user_id:
        raise NotFoundError(f"{resource_type.capitalize()} not found")

    if resource_user_id != authenticated_user_id:
        raise ForbiddenError(f"You don't have permission to access this {resource_type}")
