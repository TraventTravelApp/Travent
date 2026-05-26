import os
import requests
from datetime import datetime, timezone
from jose import jwt as jose_jwt, JWTError
from jose.exceptions import JWKError

COGNITO_REGION = os.getenv('AWS_REGION', 'us-east-1')
COGNITO_USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID')
COGNITO_CLIENT_ID = os.getenv('COGNITO_CLIENT_ID')

# JWKS caching (global to Lambda container for reuse)
_jwks_cache = {
    'keys': None,
    'expires_at': None
}
JWKS_CACHE_TTL = 300  # 5 minutes

def get_cognito_jwks():
    """Fetch Cognito JSON Web Key Set (JWKS) with caching"""
    global _jwks_cache

    # Check if cache is valid
    now = datetime.now(timezone.utc).timestamp()
    if _jwks_cache['keys'] and _jwks_cache['expires_at'] and now < _jwks_cache['expires_at']:
        return _jwks_cache['keys']

    # Fetch JWKS from Cognito
    if not COGNITO_USER_POOL_ID:
        raise ValueError("COGNITO_USER_POOL_ID environment variable not set")
    if not COGNITO_CLIENT_ID:
        raise ValueError("COGNITO_CLIENT_ID environment variable not set")

    jwks_url = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"

    try:
        response = requests.get(jwks_url, timeout=5)
        response.raise_for_status()
        jwks = response.json()

        # Cache the JWKS
        _jwks_cache['keys'] = jwks
        _jwks_cache['expires_at'] = now + JWKS_CACHE_TTL

        return jwks
    except Exception as e:
        print(f"Error fetching JWKS: {str(e)}")
        # If fetch fails but we have cached keys, use them even if expired
        if _jwks_cache['keys']:
            print("Using expired JWKS cache as fallback")
            return _jwks_cache['keys']
        raise


def verify_cognito_token(token: str) -> dict:
    """
    Verify Cognito JWT token with proper signature validation.

    This function:
    1. Fetches the Cognito JWKS (public keys)
    2. Verifies the token signature using the appropriate key
    3. Validates claims (issuer, audience, expiration, token_use)

    Args:
        token: Cognito JWT token string

    Returns:
        dict: Decoded token payload if valid

    Raises:
        ValueError: If token is invalid, expired, or verification fails
    """
    try:
        # Get JWKS
        jwks = get_cognito_jwks()

        # Decode token header to get key ID (kid)
        unverified_header = jose_jwt.get_unverified_header(token)
        kid = unverified_header.get('kid')

        if not kid:
            raise ValueError("Token missing 'kid' in header")

        # Find the matching key in JWKS
        key = None
        for jwk_key in jwks.get('keys', []):
            if jwk_key.get('kid') == kid:
                key = jwk_key
                break

        if not key:
            raise ValueError(f"Public key not found for kid: {kid}")

        # Verify and decode token with signature validation
        # This will check:
        # - Signature is valid using the public key
        # - Token hasn't expired
        # - Issuer matches Cognito User Pool
        issuer = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"

        payload = jose_jwt.decode(
            token,
            key,
            algorithms=['RS256'],
            audience=COGNITO_CLIENT_ID,
            issuer=issuer,
            options={
                'verify_signature': True,
                'verify_exp': True,
                'verify_iss': True,
                'verify_aud': True,
            }
        )

        token_use = payload.get('token_use')
        if token_use != 'id':
            raise ValueError(f"Invalid token_use: {token_use}. Expected 'id'")

        return payload

    except JWTError as e:
        raise ValueError(f"JWT verification failed: {str(e)}")
    except JWKError as e:
        raise ValueError(f"JWK error: {str(e)}")
    except Exception as e:
        raise ValueError(f"Token verification error: {str(e)}")


def extract_user_id(event: dict) -> str:
    """
    Extract user_id from JWT token in Authorization header.

    This function:
    1. Extracts the token from the Authorization header
    2. Verifies the token as a Cognito ID token
    3. Extracts the canonical Cognito user id from `sub`

    Args:
        event: Lambda event dict containing headers

    Returns:
        str: User ID extracted from token

    Raises:
        ValueError: If authentication fails for any reason
    """
    try:
        # Get Authorization header (case-insensitive)
        headers = event.get('headers', {})
        auth_header = headers.get('Authorization') or headers.get('authorization')

        if not auth_header:
            raise ValueError('No Authorization header provided')

        # Extract token from "Bearer <token>" format
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            raise ValueError('Invalid Authorization header format. Expected: Bearer <token>')

        token = parts[1]

        # Verify token with signature validation
        payload = verify_cognito_token(token)
        user_id = payload.get('sub')

        if not user_id:
            raise ValueError('No user identifier found in token')

        return user_id

    except ValueError:
        # Re-raise ValueError as-is
        raise
    except Exception as e:
        # Wrap unexpected errors
        raise ValueError(f'Authentication failed: {str(e)}')
