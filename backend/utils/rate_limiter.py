import time
from functools import wraps
from typing import Callable, Dict, Any
from utils.response import error_response

# In-memory store for rate limiting (in production, consider using Redis or DynamoDB)
# Structure: {identifier: [timestamp1, timestamp2, ...]}
_request_history = {}

def rate_limit(max_requests: int = 5, window_seconds: int = 60, identifier_extractor=None):
    """
    Rate limiting decorator for Lambda handler functions.
    
    Args:
        max_requests: Maximum number of requests allowed in the time window
        window_seconds: Time window in seconds
        identifier_extractor: Function to extract identifier from event (defaults to IP address)
    
    Usage:
        @rate_limit(max_requests=5, window_seconds=60)
        def my_handler(event, context):
            # ... handler logic
            
        # Or with custom identifier extraction (e.g., by email for auth endpoints):
        @rate_limit(max_requests=3, window_seconds=300, 
                   identifier_extractor=lambda event: event.get('body', {}).get('email', 'unknown'))
        def login(event, context):
            # ... handler logic
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
            # Extract identifier for rate limiting
            if identifier_extractor:
                try:
                    identifier = identifier_extractor(event)
                except Exception:
                    # Fallback to IP address if custom extractor fails
                    identifier = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
            else:
                # Default to IP address
                identifier = event.get('requestContext', {}).get('identity', {}).get('sourceIp', 'unknown')
            
            # Clean old requests outside the window
            current_time = time.time()
            if identifier in _request_history:
                _request_history[identifier] = [
                    req_time for req_time in _request_history[identifier]
                    if current_time - req_time < window_seconds
                ]
            else:
                _request_history[identifier] = []
            
            # Check if rate limit exceeded
            if len(_request_history[identifier]) >= max_requests:
                return error_response(
                    429, 
                    f"Too many requests. Please try again after {window_seconds} seconds."
                )
            
            # Add current request timestamp
            _request_history[identifier].append(current_time)
            
            # Call the original function
            return func(event, context)
        
        return wrapper
    return decorator