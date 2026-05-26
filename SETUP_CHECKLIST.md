# ✅ Setup Checklist - Chronicle App

Follow these steps in order:

---

## 1️⃣ AWS Console Setup (5 minutes)

### Switch Region
- [ ] Go to AWS Console: https://console.aws.amazon.com
- [ ] Click region dropdown (top-right)
- [ ] Select **"US East (N. Virginia) us-east-1"**
- [ ] Verify it shows "us-east-1" or "N. Virginia"

### Create Access Keys
- [ ] Click your username (top-right)
- [ ] Click "Security credentials"
- [ ] Scroll to "Access keys"
- [ ] Click "Create access key"
- [ ] Select "Command Line Interface (CLI)"
- [ ] Check "I understand" box
- [ ] Click "Next" → "Create access key"
- [ ] **SAVE BOTH KEYS** (copy to notepad):
  ```
  Access Key ID: AKIA...
  Secret Access Key: ...
  ```
- [ ] Click "Download .csv file" (backup)
- [ ] Click "Done"

---

## 2️⃣ Local Setup (5 minutes)

### Install AWS CLI
- [ ] Check if installed: `aws --version`
- [ ] If not, install:
  - macOS: `brew install awscli`
  - Or download: https://aws.amazon.com/cli/

### Configure AWS CLI
- [ ] Run: `aws configure`
- [ ] Enter Access Key ID: `AKIA...`
- [ ] Enter Secret Access Key: `...`
- [ ] Enter region: `us-east-1`
- [ ] Enter format: `json`

### Verify
- [ ] Run: `aws sts get-caller-identity`
- [ ] Should show your account info ✅

---

## 3️⃣ Install Serverless (2 minutes)

- [ ] Run: `npm install -g serverless`
- [ ] Verify: `serverless --version`
- [ ] Should show version number ✅

---

## 4️⃣ Deploy Backend (3 minutes)

- [ ] Navigate: `cd backend`
- [ ] Deploy: `serverless deploy`
- [ ] Wait 2-3 minutes...
- [ ] Look for "✔ Service deployed" message
- [ ] Copy the API URL (starts with https://)
- [ ] Save it: `https://xxxxx.execute-api.us-east-1.amazonaws.com/dev`

---

## 5️⃣ Enable Bedrock (3 minutes)

- [ ] Go to AWS Console
- [ ] Search for "Bedrock"
- [ ] Click "Amazon Bedrock"
- [ ] Click "Model access" (left sidebar)
- [ ] Click "Manage model access" or "Enable specific models"
- [ ] Find "Claude 3.5 Sonnet v2"
- [ ] Check the box next to it
- [ ] Click "Save changes"
- [ ] Wait for "Access granted" status

---

## 6️⃣ Verify Resources (2 minutes)

### Check DynamoDB Tables
- [ ] Run: `aws dynamodb list-tables --region us-east-1`
- [ ] Should show: users, trips, travel-pois

### Check S3 Bucket
- [ ] Run: `aws s3 ls | grep chronicle`
- [ ] Should show: chronicle-uploads-...

### Check Cognito
- [ ] Run: `aws cognito-idp list-user-pools --max-results 10 --region us-east-1`
- [ ] Should show user pool

---

## 7️⃣ Test Backend (1 minute)

- [ ] Run: `./test-backend.sh`
- [ ] Should show: "✅ Backend IS accessible!"
- [ ] If not, check previous steps

---

## 8️⃣ Update Mobile App (1 minute)

### Check API URL
- [ ] Open: `TripApp_AIChallange/mobile/src/services/api.ts`
- [ ] Find line: `const API_BASE_URL = '...'`
- [ ] Make sure it matches your deployed API URL
- [ ] If different, update it and save

---

## 9️⃣ Start Mobile App (2 minutes)

- [ ] Navigate: `cd TripApp_AIChallange/mobile`
- [ ] Install deps (if needed): `npm install --legacy-peer-deps`
- [ ] Start: `npx expo start --clear`
- [ ] Scan QR code with Expo Go app

---

## 🔟 Test in App (5 minutes)

- [ ] Open app in Expo Go
- [ ] Sign up with new email
- [ ] Check email for verification code
- [ ] Enter code to verify
- [ ] Login with email/password
- [ ] Complete interest quiz (select 3-5 interests)
- [ ] Click "Start New Trip"
- [ ] Choose "Location-Based Trip"
- [ ] Fill in:
  - Destination: "New York City"
  - Duration: 3 days
  - Budget: $500
  - Intensity: 3
- [ ] Click "Generate My Trip"
- [ ] Wait 10-20 seconds
- [ ] See AI-generated itinerary! 🎉

---

## Troubleshooting

### ❌ "Access Denied" errors
**Fix**: Add IAM permissions
1. Go to IAM → Users → Your user
2. Add permissions → Attach policies
3. Add: DynamoDB, S3, Lambda, API Gateway, Cognito, Bedrock, Location

### ❌ "Backend not accessible"
**Fix**: Redeploy backend
```bash
cd backend
serverless deploy
```

### ❌ "Model not found"
**Fix**: Enable Bedrock model
1. AWS Console → Bedrock → Model access
2. Enable Claude 3.5 Sonnet v2

### ❌ "Network request failed"
**Fix**: Check API URL
1. Run `./test-backend.sh`
2. If fails, redeploy backend
3. Update API URL in `api.ts`

---

## Time Estimate

- AWS Console Setup: 5 min
- Local Setup: 5 min
- Install Serverless: 2 min
- Deploy Backend: 3 min
- Enable Bedrock: 3 min
- Verify Resources: 2 min
- Test Backend: 1 min
- Update Mobile App: 1 min
- Start Mobile App: 2 min
- Test in App: 5 min

**Total: ~30 minutes**

---

## Success Criteria

✅ AWS credentials configured  
✅ Backend deployed to us-east-1  
✅ Bedrock Claude model enabled  
✅ DynamoDB tables exist  
✅ S3 bucket exists  
✅ Backend test passes  
✅ Mobile app starts  
✅ Can login to app  
✅ Can create trip  
✅ AI generates itinerary  

---

## Quick Commands

```bash
# Configure AWS
aws configure

# Deploy backend
cd backend && serverless deploy

# Test backend
./test-backend.sh

# Start app
cd TripApp_AIChallange/mobile && npx expo start

# View logs
cd backend && serverless logs -f generateAiItinerary -t
```

---

**Ready to start?** Follow the steps above in order! ⬆️
