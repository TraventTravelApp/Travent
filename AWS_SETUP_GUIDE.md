# 🔐 AWS Setup - Step by Step Guide

**Current Status**: You're logged into AWS Console (us-east-2 region)

---

## Important: Change Region First!

⚠️ **You're in us-east-2, but the app needs us-east-1**

### Step 1: Switch to us-east-1 Region

1. Look at the top-right corner of AWS Console
2. You'll see a region dropdown (currently showing "Ohio" or "us-east-2")
3. Click on it
4. Select **"US East (N. Virginia) us-east-1"**
5. Wait for the page to reload

**Why?** The backend is configured for us-east-1, and all resources must be in the same region.

---

## Get AWS Credentials

### Step 2: Create Access Keys

1. **Click on your username** in the top-right corner
2. Select **"Security credentials"** from the dropdown
3. Scroll down to **"Access keys"** section
4. Click **"Create access key"**
5. Select use case: **"Command Line Interface (CLI)"**
6. Check the box "I understand..."
7. Click **"Next"**
8. (Optional) Add description: "Chronicle App Deployment"
9. Click **"Create access key"**

### Step 3: Save Your Credentials

You'll see a screen with:
- **Access key ID**: Starts with `AKIA...`
- **Secret access key**: Long string (only shown once!)

⚠️ **IMPORTANT**: Copy these NOW! You can't see the secret key again.

**Save them somewhere safe:**
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

Click **"Download .csv file"** to save a backup.

---

## Configure AWS CLI

### Step 4: Install AWS CLI (if not installed)

Check if installed:
```bash
aws --version
```

If not installed:
```bash
# macOS with Homebrew
brew install awscli

# Or download installer
curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
sudo installer -pkg AWSCLIV2.pkg -target /
```

### Step 5: Configure AWS CLI

```bash
aws configure
```

Enter your credentials:
```
AWS Access Key ID [None]: AKIA... (paste your access key)
AWS Secret Access Key [None]: ... (paste your secret key)
Default region name [None]: us-east-1
Default output format [None]: json
```

### Step 6: Verify Configuration

```bash
aws sts get-caller-identity
```

Should show:
```json
{
    "UserId": "AIDA...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/YourUsername"
}
```

✅ If you see this, credentials are working!

---

## Deploy Backend

### Step 7: Install Serverless Framework

```bash
npm install -g serverless
```

Verify:
```bash
serverless --version
```

### Step 8: Update Backend Configuration

The backend needs to use **us-east-1** region.

Check current region in `backend/serverless.yml`:
```bash
grep "region:" backend/serverless.yml
```

Should show: `region: us-east-1` ✅

### Step 9: Deploy Backend

```bash
cd backend
serverless deploy
```

**This will take 2-3 minutes.**

Expected output:
```
Deploying "travel-assistant-backend" to stage "dev" (us-east-1)

✔ Service deployed to stack travel-assistant-backend-dev (120s)

endpoints:
  POST - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/auth/signup
  POST - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/auth/login
  POST - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/ai/itinerary/generate
  GET - https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/trips
  ...

functions:
  signup: travel-assistant-backend-dev-signup (15 MB)
  login: travel-assistant-backend-dev-login (15 MB)
  generateAiItinerary: travel-assistant-backend-dev-generateAiItinerary (15 MB)
  ...
```

### Step 10: Save the API URL

Copy the API Gateway URL from the output. It will look like:
```
https://xxxxx.execute-api.us-east-1.amazonaws.com/dev
```

---

## Update Mobile App

### Step 11: Update API URL in Mobile App

If the API URL changed, update it:

Edit `TripApp_AIChallange/mobile/src/services/api.ts`:

```typescript
const API_BASE_URL = 'https://xxxxx.execute-api.us-east-1.amazonaws.com/dev';
```

Replace `xxxxx` with your actual API Gateway ID.

### Step 12: Test Backend

```bash
./test-backend.sh
```

Should show: ✅ Backend IS accessible!

---

## Enable Required AWS Services

### Step 13: Enable Bedrock (for AI)

1. Go to AWS Console
2. Search for **"Bedrock"** in the search bar
3. Click on **"Amazon Bedrock"**
4. Click **"Get started"** (if prompted)
5. In the left sidebar, click **"Model access"**
6. Click **"Manage model access"** or **"Enable specific models"**
7. Find and enable:
   - ✅ **Claude 3.5 Sonnet v2** (anthropic.claude-3-5-sonnet-20241022-v2:0)
8. Click **"Save changes"**
9. Wait for status to change to **"Access granted"** (may take a few minutes)

### Step 14: Create DynamoDB Tables

The setup script should have created these, but verify:

```bash
aws dynamodb list-tables --region us-east-1
```

Should show:
```json
{
    "TableNames": [
        "users",
        "trips",
        "travel-pois"
    ]
}
```

If missing, run:
```bash
./setup-backend.sh
```

### Step 15: Verify S3 Bucket

```bash
aws s3 ls | grep chronicle
```

Should show:
```
chronicle-uploads-XXXXXXXXXX
```

---

## Test Everything

### Step 16: Test Login Endpoint

```bash
curl -X POST https://xxxxx.execute-api.us-east-1.amazonaws.com/dev/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

Should return user data (not an error).

### Step 17: Verify User in Cognito

```bash
aws cognito-idp list-users \
  --user-pool-id us-east-1_fN4gzHqjT \
  --region us-east-1
```

Should show the test user.

### Step 18: Start Mobile App

```bash
cd TripApp_AIChallange/mobile
npx expo start --clear
```

### Step 19: Test in App

1. Scan QR code with Expo Go
2. Sign up with a new email
3. Verify email (check inbox)
4. Login
5. Complete interest quiz
6. Create a trip
7. Wait for AI to generate itinerary (10-20 seconds)
8. View your personalized trip!

---

## Troubleshooting

### "Access Denied" errors

**Problem**: IAM permissions not set

**Solution**: Add permissions to your IAM user:

1. Go to IAM in AWS Console
2. Click **"Users"**
3. Click your username
4. Click **"Add permissions"**
5. Select **"Attach policies directly"**
6. Add these policies:
   - ✅ AmazonDynamoDBFullAccess
   - ✅ AmazonS3FullAccess
   - ✅ AWSLambda_FullAccess
   - ✅ AmazonAPIGatewayAdministrator
   - ✅ AmazonCognitoPowerUser
   - ✅ AmazonBedrockFullAccess
   - ✅ AmazonLocationFullAccess
7. Click **"Next"** and **"Add permissions"**

### "Region mismatch" errors

**Problem**: Resources in different regions

**Solution**: Make sure everything is in **us-east-1**:
```bash
# Check current region
aws configure get region

# Should show: us-east-1
```

### "Model not found" in Bedrock

**Problem**: Claude model not enabled

**Solution**: Go to Bedrock console → Model access → Enable Claude 3.5 Sonnet v2

### "Table does not exist"

**Problem**: DynamoDB tables not created

**Solution**: Run setup script:
```bash
./setup-backend.sh
```

---

## Cost Management

### Set Up Billing Alerts

1. Go to **"Billing and Cost Management"** in AWS Console
2. Click **"Budgets"** in left sidebar
3. Click **"Create budget"**
4. Select **"Zero spend budget"** (free tier)
5. Enter your email
6. Click **"Create budget"**

You'll get alerts if you exceed free tier.

### Expected Costs

**Free Tier (first 12 months):**
- Lambda: 1M requests/month
- API Gateway: 1M requests/month
- DynamoDB: 25GB storage
- S3: 5GB storage
- Cognito: 50,000 users

**After Free Tier:**
- ~$5-10/month for 100 trips

---

## Complete Checklist

- [ ] Switched to us-east-1 region in AWS Console
- [ ] Created access keys (AKIA...)
- [ ] Configured AWS CLI: `aws configure`
- [ ] Verified credentials: `aws sts get-caller-identity`
- [ ] Installed Serverless: `npm install -g serverless`
- [ ] Deployed backend: `cd backend && serverless deploy`
- [ ] Enabled Bedrock Claude model
- [ ] Verified DynamoDB tables exist
- [ ] Verified S3 bucket exists
- [ ] Updated mobile app API URL (if needed)
- [ ] Tested backend: `./test-backend.sh`
- [ ] Started mobile app: `npx expo start`
- [ ] Tested login and trip creation

---

## Quick Reference

```bash
# Configure AWS
aws configure

# Verify credentials
aws sts get-caller-identity

# Deploy backend
cd backend
serverless deploy

# Test backend
./test-backend.sh

# Start mobile app
cd TripApp_AIChallange/mobile
npx expo start

# View logs
cd backend
serverless logs -f generateAiItinerary -t

# List resources
aws dynamodb list-tables --region us-east-1
aws s3 ls
aws cognito-idp list-user-pools --max-results 10 --region us-east-1
```

---

## Summary

**What you need to do:**

1. ✅ Switch to us-east-1 region in AWS Console
2. ✅ Create access keys (Security credentials)
3. ✅ Run `aws configure` with your keys
4. ✅ Run `cd backend && serverless deploy`
5. ✅ Enable Bedrock Claude model
6. ✅ Test with `./test-backend.sh`
7. ✅ Start app with `npx expo start`

**Time estimate:** 15-20 minutes

**Result:** Fully functional Chronicle app with AI-powered trip generation!

---

**Need help?** Check the error message and search this guide for the solution.
