# AI Layer Setup Guide - Detailed Reference

**Note: For quick setup, use `QUICKSTART.md` instead. This guide has more details and troubleshooting.**

## Step 1: AWS Credentials

### If you have regular AWS account:
```bash
aws configure
```
Enter your:
- Access Key ID
- Secret Access Key  
- Region: us-east-1
- Output format: json

### If you're using AWS Academy/Learner Lab:
1. Go to AWS Academy → Start Lab
2. Click "AWS Details" button
3. Click "Show" next to "AWS CLI"
4. Copy the three lines that look like:
   ```
   [default]
   aws_access_key_id=ASIA...
   aws_secret_access_key=...
   aws_session_token=...
   ```
5. Paste them into `~/.aws/credentials` file

### Verify it works:
```bash
aws sts get-caller-identity
```
You should see your account info.

---

## Step 2: Verify AWS Bedrock Access

Good news! As of late 2024, AWS Bedrock models are **automatically enabled** for all accounts. You don't need to manually request access anymore.

However, for Anthropic Claude models, first-time users may need to acknowledge terms of use:

1. Go to AWS Console: https://console.aws.amazon.com/bedrock/
2. Click "Playgrounds" in the left sidebar
3. Click "Chat" or "Text"
4. Try to select "Anthropic Claude 3.5 Sonnet v2" from the model dropdown
5. If prompted, review and accept the terms of use
6. That's it!

### Verify Bedrock access:
```bash
aws bedrock list-foundation-models --region us-east-1 --query 'modelSummaries[?contains(modelId, `claude`)].modelId'
```

You should see Claude models listed.

### If you get "Access Denied":
- Make sure your AWS account is in good standing
- Check your IAM user/role has `bedrock:InvokeModel` permission
- Try a different region (some models aren't available in all regions)

---

## Step 3: Install Python Dependencies

```bash
cd ai-layer
pip install -r requirements.txt
```

If you get permission errors, use:
```bash
pip install --user -r requirements.txt
```

Or if you prefer virtual environment (recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On Mac/Linux
pip install -r requirements.txt
```

---

## Step 4: Install Serverless Framework

```bash
npm install -g serverless
```

If you get permission errors:
```bash
sudo npm install -g serverless
```

Verify installation:
```bash
serverless --version
```

---

## Step 5: Configure Environment Variables

```bash
cd ai-layer
cp .env.example .env
```

Now edit the `.env` file:
```bash
nano .env  # or use any text editor
```

Update these values:
- `AWS_REGION`: Keep as `us-east-1` (or change to your region)
- `BEDROCK_MODEL_ID`: Keep the default Claude model
- `JWT_SECRET`: Change to a random string (e.g., `my-super-secret-key-12345`)
- `DYNAMODB_TABLE_NAME`: Keep as `trip-planner-trips`

---

## Step 6: Deploy to AWS

```bash
cd ai-layer
serverless deploy
```

This will:
- Create Lambda functions
- Set up API Gateway endpoints
- Configure IAM roles
- Deploy your code

Takes about 2-3 minutes.

### After deployment:
You'll see output like:
```
endpoints:
  POST - https://abc123.execute-api.us-east-1.amazonaws.com/dev/ai/itinerary/generate
```

**SAVE THIS URL!** You'll need it for your frontend/backend integration.

---

## Step 7: Test Your Deployment

Create a test file:
```bash
cat > test-request.json << 'EOF'
{
  "trip_type": "location",
  "destination": "Miami, FL",
  "duration": 3,
  "budget": "moderate",
  "intensity": 7,
  "group_type": "friends",
  "interests": ["beach", "nightlife", "food"]
}
EOF
```

Test it (replace YOUR_JWT_TOKEN with a test token):
```bash
curl -X POST https://YOUR_API_URL/dev/ai/itinerary/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d @test-request.json
```

---

## Troubleshooting

### "Unable to locate credentials"
- Run `aws configure` again
- Check `~/.aws/credentials` file exists

### "Access Denied" when calling Bedrock
- Make sure you enabled model access in Bedrock console
- Check your IAM user has bedrock:InvokeModel permission

### "Module not found" errors
- Make sure you ran `pip install -r requirements.txt`
- Check you're in the right directory

### Serverless deploy fails
- Make sure AWS credentials are configured
- Check you have permissions to create Lambda functions
- Try `serverless deploy --verbose` for more details

---

## Quick Test Without Deployment

Want to test locally first? Create a test script:

```python
# test_local.py
import os
os.environ['AWS_REGION'] = 'us-east-1'
os.environ['BEDROCK_MODEL_ID'] = 'anthropic.claude-3-5-sonnet-20241022-v2:0'

from services.prompt_builder import PromptBuilder

builder = PromptBuilder()
system = builder.build_system_prompt()
user = builder.build_location_trip_prompt({
    'destination': 'Miami',
    'duration': 3,
    'budget': 'moderate',
    'intensity': 7,
    'group_type': 'friends',
    'interests': ['beach', 'food']
})

print("SYSTEM PROMPT:")
print(system)
print("\n\nUSER PROMPT:")
print(user)
```

Run it:
```bash
python test_local.py
```

This tests your prompt building without calling AWS.
