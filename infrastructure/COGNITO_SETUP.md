# AWS Cognito Setup Guide

## What Changed?

The authentication system now uses AWS Cognito instead of custom JWT + bcrypt. This provides:

- **Better security**: AWS-managed authentication
- **Email verification**: Built-in email confirmation
- **Password reset**: Forgot password functionality
- **Scalability**: Handles millions of users
- **Token management**: Automatic token refresh

## Setup Steps

### 1. Create Cognito User Pool

Run the setup script:

```bash
cd infrastructure
python setup_cognito.py
```

This will create:
- A Cognito User Pool named `travel-assistant-users`
- A User Pool Client (App Client) named `travel-assistant-app`

### 2. Update Environment Variables

Copy the output from the script and add to `backend/.env`:

```
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 3. Deploy Backend

```bash
cd backend
serverless deploy
```

## API Changes

### Signup (POST /auth/signup)

**Request**:
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response**:
```json
{
  "user_id": "cognito-user-sub",
  "email": "user@example.com",
  "message": "User created successfully. Please check your email to verify your account."
}
```

**Note**: User must verify email before logging in!

### Confirm Email (POST /auth/confirm)

**Request**:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response**:
```json
{
  "message": "Email verified successfully. You can now log in."
}
```

### Login (POST /auth/login)

**Request**:
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response**:
```json
{
  "user_id": "cognito-user-sub",
  "email": "user@example.com",
  "id_token": "eyJraWQiOiI...",
  "access_token": "eyJraWQiOiI...",
  "refresh_token": "eyJjdHkiOiI..."
}
```

### Resend Confirmation (POST /auth/resend)

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "message": "Verification code sent to your email."
}
```

## Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- Symbols optional

## Token Usage

Use the `id_token` or `access_token` in the Authorization header:

```
Authorization: Bearer <id_token>
```

## Frontend Integration

### Signup Flow

1. User signs up → receives email with verification code
2. User enters code → email verified
3. User can now log in

### Login Flow

1. User logs in → receives tokens
2. Store tokens securely (e.g., secure storage on mobile)
3. Use `id_token` for API requests
4. Use `refresh_token` to get new tokens when expired

## Troubleshooting

**Error: "User email not verified"**
- User needs to verify email first
- Use `/auth/resend` to send new code

**Error: "Invalid password"**
- Check password requirements
- Must have uppercase, lowercase, and number

**Error: "User already exists"**
- Email already registered
- User should log in instead

## Cost

Cognito free tier:
- 50,000 MAUs (Monthly Active Users) free
- Perfect for hackathons and small apps
