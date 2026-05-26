# 🔧 Network Request Failed - Fix Guide

**Error**: "Network request failed" when logging in

**Root Cause**: The AWS backend is not accessible (credentials expired)

---

## Quick Diagnosis

The backend API at `https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev` is not responding.

This happens because:
1. ✅ AWS temporary session credentials expired (most likely)
2. Backend Lambda functions were removed
3. API Gateway endpoint changed

---

## Solution: Redeploy Backend

### Step 1: Get Fresh AWS Credentials

You need new temporary session credentials from your AWS account.

**Get credentials from AWS Console:**
1. Log into AWS Console
2. Go to your IAM role or AWS Academy
3. Get new temporary credentials:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN`

### Step 2: Set Credentials

```bash
export AWS_ACCESS_KEY_ID="ASIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="IQoJb3JpZ2luX2VjE..."
export AWS_DEFAULT_REGION="us-east-1"
```

### Step 3: Verify Credentials

```bash
# Test credentials
aws sts get-caller-identity

# Should show your user/role info
```

### Step 4: Deploy Backend

```bash
cd backend
serverless deploy
```

**Expected output:**
```
✔ Service deployed to stack travel-assistant-backend-dev (60s)

endpoints:
  POST - https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev/auth/login
  POST - https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev/auth/signup
  ...
```

### Step 5: Test Backend

```bash
# Test login endpoint
curl -X POST https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@chronicle.com","password":"TestPass123"}'
```

**Expected response:**
```json
{
  "user_id": "...",
  "email": "test@chronicle.com",
  "access_token": "...",
  ...
}
```

### Step 6: Test Mobile App

1. Restart Expo: `npx expo start --clear`
2. Reload app in Expo Go
3. Try logging in again

---

## Alternative: Use Mock Data (Temporary)

If you can't redeploy the backend right now, you can temporarily use mock data:

### Update API Configuration

Edit `TripApp_AIChallange/mobile/src/services/api.ts`:

```typescript
// Temporarily disable backend
const API_BASE_URL = ''; // Empty string = mock mode

// Or add a mock mode flag
const USE_MOCK_DATA = true;
const API_BASE_URL = USE_MOCK_DATA ? '' : 'https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev';
```

This will make the app work offline with example data.

---

## Troubleshooting

### "Could not load credentials from any providers"

**Problem**: AWS credentials not set or expired

**Solution**:
```bash
# Check if credentials are set
aws configure list

# Set new credentials
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."
```

### "Endpoint not found" or "403 Forbidden"

**Problem**: Backend not deployed or wrong region

**Solution**:
```bash
# Check deployed endpoints
cd backend
serverless info

# Redeploy
serverless deploy
```

### "Network request failed" persists after deployment

**Problem**: Mobile app cache or wrong URL

**Solution**:
```bash
# 1. Clear Expo cache
cd TripApp_AIChallange/mobile
npx expo start --clear

# 2. Verify API URL in api.ts
cat src/services/api.ts | grep API_BASE_URL

# 3. Test backend directly
curl https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev/auth/login
```

### "CORS error" in browser

**Problem**: CORS not configured (shouldn't happen in Expo Go)

**Solution**: Backend already has CORS enabled in serverless.yml

---

## Check Backend Status

### Test if backend is accessible:

```bash
# Test health
curl -I https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev/auth/login

# Should return: HTTP/2 200 or 400 (not 000 or timeout)
```

### Check CloudWatch Logs:

```bash
cd backend

# View recent logs
serverless logs -f login --startTime 10m

# View errors only
serverless logs -f login --filter ERROR
```

### Check DynamoDB Tables:

```bash
# List tables
aws dynamodb list-tables

# Should show: users, trips, travel-pois
```

---

## Complete Redeploy Checklist

- [ ] Get fresh AWS credentials
- [ ] Set environment variables (AWS_ACCESS_KEY_ID, etc.)
- [ ] Test credentials: `aws sts get-caller-identity`
- [ ] Navigate to backend: `cd backend`
- [ ] Deploy: `serverless deploy`
- [ ] Test login endpoint with curl
- [ ] Restart Expo: `npx expo start --clear`
- [ ] Test login in mobile app

---

## Quick Test Script

Save this as `test-backend.sh`:

```bash
#!/bin/bash

echo "Testing backend..."

# Test login endpoint
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
  https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev/auth/login)

if [ "$RESPONSE" = "000" ]; then
  echo "❌ Backend not accessible (connection failed)"
  echo "   Need to redeploy backend with fresh AWS credentials"
elif [ "$RESPONSE" = "400" ] || [ "$RESPONSE" = "200" ]; then
  echo "✅ Backend is accessible (HTTP $RESPONSE)"
  echo "   Mobile app should work"
else
  echo "⚠️  Backend returned HTTP $RESPONSE"
  echo "   May need to check backend logs"
fi
```

Run it:
```bash
chmod +x test-backend.sh
./test-backend.sh
```

---

## Summary

**The Issue:**
- AWS credentials expired
- Backend is not deployed
- Mobile app can't reach API

**The Fix:**
1. Get fresh AWS credentials
2. Deploy backend: `cd backend && serverless deploy`
3. Test: `curl https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev/auth/login`
4. Restart app: `npx expo start --clear`

**Temporary Workaround:**
- Set `API_BASE_URL = ''` in `api.ts` to use mock data

---

**Status**: ⚠️ Backend needs redeployment with fresh AWS credentials

**Files to check:**
- `TripApp_AIChallange/mobile/src/services/api.ts` - API URL
- `backend/.env` - Backend configuration
- `backend/serverless.yml` - Deployment config
