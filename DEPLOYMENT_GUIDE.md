# Chronicle1 Backend Deployment Guide

## Prerequisites Checklist
✓ Node.js installed (v22.16.0)
✓ npm installed (10.9.2)
✓ Serverless Framework installed (v4.33.0)
⚠️ AWS Account needed
⚠️ AWS CLI needed
⚠️ AWS Credentials needed

---

## Step 1: Install AWS CLI

### Windows (using installer):
1. Download AWS CLI from: https://awscli.amazonaws.com/AWSCLIV2.msi
2. Run the installer
3. Restart your terminal

### Verify installation:
```bash
aws --version
```

---

## Step 2: Configure AWS Credentials

You need AWS Access Keys from your AWS account.

### Get AWS Credentials:
1. Log in to AWS Console: https://console.aws.amazon.com
2. Click your name (top right) → Security credentials
3. Scroll to "Access keys" → "Create access key"
4. Choose "Command Line Interface (CLI)"
5. Copy the **Access Key ID** and **Secret Access Key**

### Configure AWS CLI:
```bash
aws configure
```

Enter when prompted:
- **AWS Access Key ID**: [Your Access Key]
- **AWS Secret Access Key**: [Your Secret Key]
- **Default region name**: us-east-1
- **Default output format**: json

### Verify:
```bash
aws sts get-caller-identity
```

You should see your AWS account info.

---

## Step 3: Set Up AWS Cognito User Pool

### Option A: Use AWS Console (Easiest)

1. **Go to Cognito**: https://console.aws.amazon.com/cognito
2. **Create User Pool**:
   - Click "Create user pool"
   - **Step 1 - Authentication providers**:
     - Select "Email" as sign-in option
     - Click "Next"
   - **Step 2 - Security requirements**:
     - Password policy: Use defaults (8+ chars, uppercase, lowercase, number)
     - MFA: Choose "No MFA" for now
     - Click "Next"
   - **Step 3 - Sign-up experience**:
     - Keep defaults
     - Click "Next"
   - **Step 4 - Message delivery**:
     - Email provider: Select "Send email with Cognito"
     - Click "Next"
   - **Step 5 - Integrate your app**:
     - User pool name: `travel-assistant-users`
     - App client name: `travel-assistant-app`
     - ⚠️ **IMPORTANT**: Under "Authentication flows", check:
       - ✓ ALLOW_USER_PASSWORD_AUTH
       - ✓ ALLOW_REFRESH_TOKEN_AUTH
     - Click "Next"
   - **Step 6 - Review and create**:
     - Review settings
     - Click "Create user pool"

3. **Copy Configuration**:
   - After creation, you'll see:
     - **User pool ID**: us-east-1_XXXXXXXXX
     - **App client ID**: Click on the app client name to see it

### Option B: Use Python Script (Advanced)

If you have Python and boto3:
```bash
cd infrastructure
python setup_cognito.py
```

---

## Step 4: Create S3 Bucket for Uploads

```bash
aws s3 mb s3://travel-assistant-uploads-YOUR-NAME --region us-east-1
aws s3api put-public-access-block --bucket travel-assistant-uploads-YOUR-NAME --public-access-block-configuration "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

Replace `YOUR-NAME` with something unique (S3 bucket names must be globally unique).

---

## Step 5: Configure Backend Environment Variables

1. **Copy the example file**:
```bash
cd backend
cp .env.example .env
```

2. **Edit `.env` file** with your values:
```env
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
JWT_SECRET=change-this-to-a-random-secret
S3_BUCKET_NAME=travel-assistant-uploads-YOUR-NAME
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-6-20260217-v1:0
```

---

## Step 6: Create DynamoDB Tables

```bash
cd infrastructure
python dynamodb_tables.py
```

This creates 3 tables:
- `users` - User accounts
- `trips` - Trip data
- `travel-pois` - Points of interest

---

## Step 7: Deploy Backend

```bash
cd backend
serverless deploy
```

This will:
- Package your Python Lambda functions
- Create API Gateway endpoints
- Set up IAM roles
- Deploy everything to AWS

**Deployment takes 2-5 minutes.**

After deployment, you'll see:
```
endpoints:
  POST - https://XXXXX.execute-api.us-east-1.amazonaws.com/dev/auth/signup
  POST - https://XXXXX.execute-api.us-east-1.amazonaws.com/dev/auth/login
  ... (more endpoints)
```

**Copy your API endpoint URL!**

---

## Step 8: Configure Frontend

1. **Create frontend `.env` file**:
```bash
cd TripApp_AIChallange/frontend
cp .env.example .env
```

2. **Edit `.env` file**:
```env
VITE_API_URL=https://XXXXX.execute-api.us-east-1.amazonaws.com/dev
```

Replace with your actual API Gateway URL from Step 7.

---

## Step 9: Test Your Deployment

### Test Backend:
```bash
curl -X POST https://YOUR-API-URL/dev/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

You should receive a success response!

### Test Frontend:
```bash
cd TripApp_AIChallange/frontend
npm install
npm run dev
```

Open http://localhost:5173 and try signing up!

---

## Troubleshooting

### Error: "Unable to locate credentials"
- Run `aws configure` again
- Make sure you entered valid AWS Access Keys

### Error: "User pool not found"
- Double-check your COGNITO_USER_POOL_ID in `.env`
- Make sure the User Pool exists in us-east-1 region

### Error: "Invalid password"
- Password must have:
  - At least 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number

### Error: "ALLOW_USER_PASSWORD_AUTH not enabled"
- Go to Cognito User Pool → App integration → App clients
- Edit your app client
- Check "ALLOW_USER_PASSWORD_AUTH" under Authentication flows

### Deployment fails:
- Check you have AWS credentials configured
- Make sure you're in the `backend` directory
- Check `.env` file exists with all required values

---

## Cost Estimate

**Free Tier Eligible:**
- Lambda: 1M requests/month free
- API Gateway: 1M requests/month free
- DynamoDB: 25GB storage + 25 read/write units free
- Cognito: 50,000 MAUs free
- S3: 5GB storage + 20,000 GET requests free

**This project should cost $0/month during development!**

---

## Next Steps After Deployment

1. ✅ Test signup flow
2. ✅ Test login flow
3. ✅ Test creating trips
4. ✅ Deploy frontend to Vercel/Netlify (optional)
5. ✅ Share with team!

---

## Quick Reference Commands

```bash
# Deploy backend
cd backend && serverless deploy

# View logs
serverless logs -f signup

# Remove deployment (cleanup)
serverless remove

# Test API
curl -X POST https://YOUR-API/dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

---

**Need help?** Check the Chronicle1 repository README or AWS documentation.
