import os
import requests
from typing import Dict
from time import time
from jose import jwt as jose_jwt, JWTError
from jose.exceptions import JWKError

COGNITO_REGION = os.getenv('AWS_REGION', 'us-east-1')
COGNITO_USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID')
COGNITO_CLIENT_ID = os.getenv('COGNITO_CLIENT_ID')

_jwks_cache = {
    'keys': None,
    'expires_at': None
}
JWKS_CACHE_TTL = 300


def get_cognito_jwks() -> Dict:
    """Fetch Cognito JWKS with a short in-memory cache."""
    global _jwks_cache

    now = time()
    if _jwks_cache['keys'] and _jwks_cache['expires_at'] and now < _jwks_cache['expires_at']:
        return _jwks_cache['keys']

    if not COGNITO_USER_POOL_ID:
        raise ValueError("COGNITO_USER_POOL_ID environment variable not set")
    if not COGNITO_CLIENT_ID:
        raise ValueError("COGNITO_CLIENT_ID environment variable not set")

    jwks_url = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"
    response = requests.get(jwks_url, timeout=5)
    response.raise_for_status()

    jwks = response.json()
    _jwks_cache['keys'] = jwks
    _jwks_cache['expires_at'] = now + JWKS_CACHE_TTL
    return jwks


def verify_cognito_token(token: str) -> Dict:
    """Verify a Cognito ID token and return its payload."""
    try:
        jwks = get_cognito_jwks()
        header = jose_jwt.get_unverified_header(token)
        kid = header.get('kid')
        if not kid:
            raise ValueError("Token missing 'kid' in header")

        key = None
        for jwk_key in jwks.get('keys', []):
            if jwk_key.get('kid') == kid:
                key = jwk_key
                break

        if not key:
            raise ValueError(f"Public key not found for kid: {kid}")

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
    except JWTError as exc:
        raise ValueError(f"JWT verification failed: {str(exc)}")
    except JWKError as exc:
        raise ValueError(f"JWK error: {str(exc)}")
    except Exception as exc:
        raise ValueError(f"Token verification error: {str(exc)}")


def extract_user_id(event: Dict) -> str:
    headers = event.get('headers', {})
    auth_header = headers.get('Authorization') or headers.get('authorization')
    if not auth_header:
        raise ValueError('No Authorization header provided')
    if not auth_header.startswith('Bearer '):
        raise ValueError('Invalid Authorization header format. Expected: Bearer <token>')

    token = auth_header.replace('Bearer ', '', 1)
    payload = verify_cognito_token(token)
    user_id = payload.get('sub')
    if not user_id:
        raise ValueError('No user identifier found in token')
    return user_id
