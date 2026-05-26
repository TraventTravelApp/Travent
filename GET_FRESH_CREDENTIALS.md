# 🔑 Get Fresh AWS Credentials

Your AWS credentials have expired. Here's how to get new ones:

---

## Option 1: Create New Access Keys (Permanent)

### Step 1: Go to AWS Console
1. Open: https://console.aws.amazon.com
2. Make sure you're in **us-east-1** region (top-right)

### Step 2: Create New Access Keys
1. Click your **username** (top-right)
2. Click **"Security credentials"**
3. Scroll to **"Access keys"** section
4. Click **"Create access key"**
5. Select **"Command Line Interface (CLI)"**
6. Check **"I understand"**
7. Click **"Next"** → **"Create access key"**

### Step 3: Save Credentials
Copy both:
- **Access Key ID**: `AKIA...`
- **Secret Access Key**: `...`

Save to `keys.txt`:
```
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

### Step 4: Configure AWS CLI
```bash
aws configure
```

Enter:
- Access Key ID: `AKIA...`
- Secret Access Key: `...`
- Region: `us-east-1`
- Format: `json`

### Step 5: Run Setup
```bash
./setup-backend.sh
```

---

## Option 2: Use AWS CloudShell (Easier)

### Step 1: Open CloudShell
1. Go to AWS Console: https://console.aws.amazon.com
2. Make sure you're in **us-east-1** region
3. Click the **CloudShell icon** (terminal icon) in the top toolbar
4. Wait for CloudShell to start

### Step 2: Upload Files
In CloudShell:
1. Click **Actions** → **Upload file**
2. Upload the entire `backend` folder (zip it first)

### Step 3: Deploy
```bash
# Unzip
unzip backend.zip

# Install dependencies
cd backend
npm install

# Deploy
npx serverless deploy
```

This will use your AWS Console credentials automatically!

---

## Option 3: Use AWS Academy (If You're a Student)

### Step 1: Start Lab
1. Go to AWS Academy
2. Start your lab session
3. Click **"AWS Details"**
4. Click **"Show"** next to AWS CLI credentials

### Step 2: Copy Credentials
You'll see:
```
[default]
aws_access_key_id=ASIA...
aws_secret_access_key=...
aws_session_token=IQoJb3JpZ2luX2VjE...
```

### Step 3: Set Credentials
```bash
export AWS_ACCESS_KEY_ID="ASIA..."
export AWS_SECRET_ACCESS_KEY="..."
export AWS_SESSION_TOKEN="IQoJb3JpZ2luX2VjE..."
export AWS_DEFAULT_REGION="us-east-1"
```

### Step 4: Run Setup
```bash
./setup-backend.sh
```

⚠️ **Note**: Academy credentials expire after 4 hours!

---

## Quick Test

After setting credentials, test them:

```bash
aws sts get-caller-identity
```

Should show your account info ✅

---

## What Happens Next

Once you have valid credentials:

1. ✅ Run `./setup-backend.sh` - Creates Cognito, DynamoDB, S3
2. ✅ Run `cd backend && serverless deploy` - Deploys Lambda functions
3. ✅ Run `./test-backend.sh` - Tests if backend works
4. ✅ Run `cd TripApp_AIChallange/mobile && npx expo start` - Starts app

---

## Summary

**You need to:**
1. Get fresh AWS credentials (Option 1, 2, or 3 above)
2. Configure AWS CLI: `aws configure`
3. Run setup: `./setup-backend.sh`
4. Deploy backend: `cd backend && serverless deploy`
5. Start app: `cd TripApp_AIChallange/mobile && npx expo start`

**Recommended**: Use Option 1 (permanent access keys) for easiest setup.

---

**Current Status**: ⚠️ Credentials expired - need fresh credentials to continue
