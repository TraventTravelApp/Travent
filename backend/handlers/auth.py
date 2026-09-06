import json
import boto3
import os
from datetime import datetime, timezone
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.dynamodb import get_dynamodb_table
from utils.response import success_response, error_response
from utils.error_handler import handle_errors
from utils.rate_limiter import rate_limit

# Cognito client
cognito = boto3.client('cognito-idp', region_name='us-east-1')

# Get Cognito User Pool ID and Client ID from environment
USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID', '')
CLIENT_ID = os.getenv('COGNITO_CLIENT_ID', '')

# Validate environment variables at module load time
if not USER_POOL_ID or not CLIENT_ID:
    print(f"[AUTH] ERROR: Cognito environment variables not set!")
    print(f"[AUTH] COGNITO_USER_POOL_ID: {USER_POOL_ID or 'NOT SET'}")
    print(f"[AUTH] COGNITO_CLIENT_ID: {CLIENT_ID or 'NOT SET'}")
else:
    print(f"[AUTH] Cognito configured: Pool ID: {USER_POOL_ID[:20]}..., Client ID: {CLIENT_ID[:10]}...")

users_table = get_dynamodb_table('users')

@handle_errors
def signup(event, context):
    """Handle user signup with Cognito"""
    print("[AUTH] Signup handler called")
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return error_response(400, "Email and password required")
        
        # Sign up user in Cognito
        try:
            response = cognito.sign_up(
                ClientId=CLIENT_ID,
                Username=email,
                Password=password,
                UserAttributes=[
                    {'Name': 'email', 'Value': email}
                ]
            )
            
            user_sub = response['UserSub']  # Cognito user ID
            
            # Create user record in DynamoDB
            user = {
                'user_id': user_sub,
                'email': email,
                'quiz_results': {},
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            
            users_table.put_item(Item=user)
            
            return success_response({
                'user_id': user_sub,
                'email': email,
                'message': 'User created successfully. Please check your email to verify your account.'
            })
            
        except cognito.exceptions.UsernameExistsException:
            return error_response(400, "User already exists")
        except cognito.exceptions.InvalidPasswordException as e:
            return error_response(400, "Invalid password")
        except Exception as e:
            print(f"[AUTH] Signup Cognito error: {str(e)}")
            return error_response(500, "Authentication service error")
        
    except Exception as e:
        return error_response(500, "Authentication service error")

@handle_errors
def login(event, context):
    """Handle user login with Cognito"""
    print("[AUTH] Login handler called")
    print(f"[AUTH] Event keys: {list(event.keys())}")
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        password = body.get('password')

        print(f"[AUTH] Login attempt for email: {email}")

        if not email or not password:
            print("[AUTH] Missing email or password")
            return error_response(400, "Email and password required")

        # Authenticate with Cognito
        print(f"[AUTH] Calling Cognito initiate_auth with Pool ID: {USER_POOL_ID[:20]}...")
        try:
            response = cognito.initiate_auth(
                ClientId=CLIENT_ID,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': email,
                    'PASSWORD': password
                }
            )
            
            # Get tokens from Cognito
            print("[AUTH] Cognito authentication successful, extracting tokens")
            id_token = response['AuthenticationResult']['IdToken']
            access_token = response['AuthenticationResult']['AccessToken']
            refresh_token = response['AuthenticationResult']['RefreshToken']

            # Get user info from Cognito
            print("[AUTH] Fetching user info from Cognito")
            user_info = cognito.get_user(AccessToken=access_token)
            
            # Extract user_sub (Cognito user ID)
            user_sub = None
            for attr in user_info['UserAttributes']:
                if attr['Name'] == 'sub':
                    user_sub = attr['Value']
                    break

            print(f"[AUTH] Login successful for user: {user_sub}")
            return success_response({
                'user_id': user_sub,
                'email': email,
                'id_token': id_token,
                'access_token': access_token,
                'refresh_token': refresh_token
            })
            
        except cognito.exceptions.NotAuthorizedException as e:
            print(f"[AUTH] Invalid credentials: {str(e)}")
            return error_response(401, "Invalid credentials")
        except cognito.exceptions.UserNotConfirmedException as e:
            print(f"[AUTH] User not confirmed: {str(e)}")
            return error_response(401, "User email not verified. Please check your email.")
        except Exception as e:
            print(f"[AUTH] Cognito error: {str(e)}")
            return error_response(500, "Authentication service error")

    except Exception as e:
        print(f"[AUTH] Unexpected error in login: Authentication service error")
        return error_response(500, "Authentication service error")

@handle_errors
def confirm_signup(event, context):
    """Confirm user signup with verification code"""
    print("[AUTH] Confirm signup handler called")
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        code = body.get('code')
        
        if not email or not code:
            return error_response(400, "Email and verification code required")
        
        try:
            cognito.confirm_sign_up(
                ClientId=CLIENT_ID,
                Username=email,
                ConfirmationCode=code
            )
            
            return success_response({
                'message': 'Email verified successfully. You can now log in.'
            })
            
        except cognito.exceptions.CodeMismatchException:
            return error_response(400, "Invalid verification code")
        except cognito.exceptions.ExpiredCodeException:
            return error_response(400, "Verification code expired")
        except Exception as e:
            return error_response(500, "Authentication service error")
        
    except Exception as e:
        return error_response(500, "Authentication service error")

@handle_errors
def resend_confirmation(event, context):
    """Resend confirmation code"""
    print("[AUTH] Resend confirmation handler called")
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        
        if not email:
            return error_response(400, "Email required")
        
        try:
            cognito.resend_confirmation_code(
                ClientId=CLIENT_ID,
                Username=email
            )
            
            return success_response({
                'message': 'Verification code sent to your email.'
            })
            
        except Exception as e:
            return error_response(500, "Authentication service error")
        
    except Exception as e:
        return error_response(500, "Authentication service error")


@handle_errors
def forgot_password(event, context):
    """Initiate forgot-password flow — sends a reset code to the user's email"""
    print("[AUTH] Forgot password handler called")
    try:
        body = json.loads(event['body'])
        email = body.get('email')

        if not email:
            return error_response(400, "Email required")

        try:
            cognito.forgot_password(
                ClientId=CLIENT_ID,
                Username=email
            )

            # Always return success to avoid leaking whether the email exists
            return success_response({
                'message': 'If an account with that email exists, a reset code has been sent.'
            })

        except cognito.exceptions.UserNotFoundException:
            # Return the same success message — don't leak account existence
            return success_response({
                'message': 'If an account with that email exists, a reset code has been sent.'
            })
        except cognito.exceptions.InvalidParameterException as e:
            # User exists but is unconfirmed — can't reset password yet
            return error_response(400, "Account email is not verified. Please verify your email first.")
        except Exception as e:
            print(f"[AUTH] Forgot password Cognito error: {str(e)}")
            return error_response(500, "Authentication service error")

    except Exception as e:
        return error_response(500, "Authentication service error")


@handle_errors
def confirm_forgot_password(event, context):
    """Confirm forgot-password — verify reset code and set new password"""
    print("[AUTH] Confirm forgot password handler called")
    try:
        body = json.loads(event['body'])
        email = body.get('email')
        code = body.get('code')
        new_password = body.get('new_password')

        if not email or not code or not new_password:
            return error_response(400, "Email, code, and new_password are required")

        try:
            cognito.confirm_forgot_password(
                ClientId=CLIENT_ID,
                Username=email,
                ConfirmationCode=code,
                Password=new_password
            )

            return success_response({
                'message': 'Password reset successfully. You can now log in with your new password.'
            })

        except cognito.exceptions.CodeMismatchException:
            return error_response(400, "Invalid reset code")
        except cognito.exceptions.ExpiredCodeException:
            return error_response(400, "Reset code has expired. Please request a new one.")
        except cognito.exceptions.InvalidPasswordException:
            return error_response(400, "Password does not meet requirements. Use at least 8 characters with uppercase, lowercase, and a number.")
        except cognito.exceptions.UserNotFoundException:
            return error_response(404, "No account found with that email address")
        except Exception as e:
            print(f"[AUTH] Confirm forgot password Cognito error: {str(e)}")
            return error_response(500, "Authentication service error")

    except Exception as e:
        return error_response(500, "Authentication service error")
