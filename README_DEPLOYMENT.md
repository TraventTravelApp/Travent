# 🚀 Chronicle App - Complete Deployment Guide

**Current Status**: ⚠️ Backend needs redeployment (AWS credentials expired)

---

## Quick Diagnosis

Run this to check backend status:
```bash
./test-backend.sh
```

**Result**: ❌ Backend NOT accessible - needs redeployment

---

## What You Need

### 1. Fresh AWS Credentials

Get new temporary session credentials from AWS:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`  
- `AWS_SESSION_TOKEN`

### 2. Node.js v20.19.4+

Current: v20.11.1 ❌  
Required: v20.19.4+ ✅

**Update Node.js:**
- Download from: https://nodejs.org/en/download
- Or use: `brew upgrade node` (if Homebrew installed)

---

## Step-by-Step Deployment

### Step 1: Update Node.js (if needed)

```bash
# Check version
node --version

# If < v20.19.4, update from https://nodejs.org
```

### Step 2: Get AWS Credentials

From AWS Console or AWS Academy, get:
```
AWS_ACCESS_KEY_ID=ASIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=IQoJb3JpZ2luX2VjE...
```

### Step 3: Set Credentials

```bash
export AWS_ACCESS_KEY_ID="ASIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="IQoJb3JpZ2luX2VjE..."
export AWS_DEFAULT_REGION="us-east-1"
```

### Step 4: Verify Credentials

```bash
aws sts get-caller-identity
```

Should show your AWS account info.

### Step 5: Deploy Backend

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
  POST - https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev/ai/itinerary/generate
  ...

functions:
  login: travel-assistant-backend-dev-login (15 MB)
  signup: travel-assistant-backend-dev-signup (15 MB)
  generateAiItinerary: travel-assistant-backend-dev-generateAiItinerary (15 MB)
  ...
```

### Step 6: Test Backend

```bash
./test-backend.sh
```

Should show: ✅ Backend IS accessible!

### Step 7: Start Mobile App

```bash
cd TripApp_AIChallange/mobile

# Install dependencies (if needed)
npm install --legacy-peer-deps

# Start Expo
npx expo start --clear
```

### Step 8: Test in App

1. Scan QR code with Expo Go
2. Login: `test@chronicle.com` / `TestPass123`
3. Create a trip to test AI generation

---

## Complete Setup (Fresh Start)

If starting from scratch:

```bash
# 1. Update Node.js to v20.19.4+
# Download from https://nodejs.org

# 2. Set AWS credentials
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."

# 3. Deploy backend
cd backend
serverless deploy

# 4. Setup mobile app
cd ../TripApp_AIChallange/mobile
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --legacy-peer-deps

# 5. Start app
npx expo start
```

---

## Troubleshooting

### "Network request failed" in mobile app

**Cause**: Backend not deployed or not accessible

**Fix**:
```bash
# Test backend
./test-backend.sh

# If fails, redeploy
cd backend
serverless deploy
```

### "Node.js is outdated"

**Cause**: Node.js < v20.19.4

**Fix**: Download and install from https://nodejs.org

### "AWS credentials missing"

**Cause**: Credentials not set or expired

**Fix**:
```bash
# Get fresh credentials from AWS Console
export AWS_ACCESS_KEY_ID="..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="..."

# Verify
aws sts get-caller-identity
```

### "EBADENGINE Unsupported engine"

**Cause**: Node.js version mismatch (warnings only)

**Fix**: Use `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

### "package.json does not exist"

**Cause**: Wrong directory

**Fix**: Navigate to mobile folder:
```bash
cd TripApp_AIChallange/mobile
npx expo start
```

---

## Verification Checklist

Before using the app:

- [ ] Node.js v20.19.4+: `node --version`
- [ ] AWS credentials set: `aws sts get-caller-identity`
- [ ] Backend deployed: `./test-backend.sh` shows ✅
- [ ] Dependencies installed: `ls TripApp_AIChallange/mobile/node_modules`
- [ ] App starts: `npx expo start` works

---

## What's Working

Once deployed:

✅ **Authentication**
- Sign up with email/password
- Email verification
- Login with JWT tokens

✅ **AI Trip Generation**
- AWS Bedrock (Claude 3.5 Sonnet v2)
- Amazon Location Services
- Real place recommendations
- Personalized itineraries

✅ **Trip Management**
- Create, view, edit, delete trips
- Multi-day itineraries
- Activity scheduling
- Cost estimates

✅ **User Profile**
- Interest quiz
- Profile settings
- Trip history

---

## Cost Estimate

**Per trip generation:**
- Bedrock (Claude): ~$0.05-0.10
- Location Services: ~$0.001
- DynamoDB: Negligible
- **Total**: ~$0.05-0.10

**Monthly (100 trips):**
- **Total**: ~$5-10

---

## Quick Commands

```bash
# Test backend status
./test-backend.sh

# Deploy backend
cd backend && serverless deploy

# Start mobile app
cd TripApp_AIChallange/mobile && npx expo start

# View backend logs
cd backend && serverless logs -f generateAiItinerary -t

# Check AWS credentials
aws sts get-caller-identity

# Update Node.js
brew upgrade node  # or download from nodejs.org
```

---

## Files Reference

**Backend:**
- `backend/serverless.yml` - Deployment config
- `backend/.env` - Environment variables
- `backend/handlers/ai_itinerary.py` - AI generation
- `backend/handlers/auth.py` - Authentication

**Mobile App:**
- `TripApp_AIChallange/mobile/src/services/api.ts` - API config
- `TripApp_AIChallange/mobile/src/screens/LoginScreen.tsx` - Login
- `TripApp_AIChallange/mobile/src/screens/TripQuestionnaireScreen.tsx` - Trip creation

**Documentation:**
- `NETWORK_ERROR_FIX.md` - Network error solutions
- `NODE_VERSION_FIX.md` - Node.js update guide
- `AI_INTEGRATION_STATUS.md` - AI integration details
- `QUICK_START.md` - Quick start guide

---

## Summary

**To fix "Network request failed":**

1. Get fresh AWS credentials
2. Set credentials: `export AWS_ACCESS_KEY_ID=...`
3. Deploy backend: `cd backend && serverless deploy`
4. Test: `./test-backend.sh`
5. Start app: `cd TripApp_AIChallange/mobile && npx expo start`

**Current blockers:**
- ⚠️ AWS credentials expired (need fresh credentials)
- ⚠️ Node.js outdated (need v20.19.4+)

**Once fixed:**
- ✅ Backend will be accessible
- ✅ Mobile app will connect successfully
- ✅ AI trip generation will work
- ✅ All features operational

---

**Need Help?**
1. Run `./test-backend.sh` to diagnose
2. Check `NETWORK_ERROR_FIX.md` for solutions
3. Verify Node.js version: `node --version`
4. Verify AWS credentials: `aws sts get-caller-identity`
