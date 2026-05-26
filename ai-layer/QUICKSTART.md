# 🚀 Quick Start Guide

**START HERE!** Follow these steps to get your AI layer deployed.

(If you get stuck, check `setup-guide.md` for detailed troubleshooting)

Follow these steps in order. Each step builds on the previous one.

---

## ✅ Step 1: Check Your Setup

Run the setup checker:
```bash
cd ai-layer
bash scripts/check-setup.sh
```

This will tell you exactly what's missing. Fix any ❌ items before continuing.

---

## 🔑 Step 2: Configure AWS Credentials

### Option A: Regular AWS Account
```bash
aws configure
```
Enter your Access Key ID, Secret Key, region (us-east-1), and format (json).

### Option B: AWS Academy/Learner Lab
1. Start your lab in AWS Academy
2. Click "AWS Details" → "Show" next to AWS CLI
3. Copy the credentials
4. Paste into `~/.aws/credentials`

### Verify:
```bash
aws sts get-caller-identity
```
You should see your account info.

---

## 🤖 Step 3: Verify Bedrock Access

**Good news!** Bedrock models are now automatically enabled. But let's verify:

### Quick test:
```bash
aws bedrock list-foundation-models --region us-east-1 --query 'modelSummaries[?contains(modelId, `claude-3-5`)].modelId'
```
You should see Claude models listed.

### If you're a first-time Anthropic user:
1. Go to: https://console.aws.amazon.com/bedrock/
2. Click "Playgrounds" → "Chat"
3. Select "Anthropic Claude 3.5 Sonnet v2"
4. Accept terms if prompted
5. Done!

---

## 📦 Step 4: Install Dependencies

### Python packages:
```bash
cd ai-layer
pip install -r requirements.txt
```

If you get errors, try:
```bash
pip install --user -r requirements.txt
```

### Serverless Framework:
```bash
npm install -g serverless
```

If you get permission errors:
```bash
sudo npm install -g serverless
```

---

## ⚙️ Step 5: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and change:
- `JWT_SECRET` to any random string (e.g., "hackathon-secret-2024")
- Keep other values as-is for now

---

## 🧪 Step 6: Test Locally (Optional but Recommended)

Test that your prompts work:
```bash
python3 scripts/test-prompts.py
```

This doesn't call AWS - it just verifies your code works.

---

## 🚀 Step 7: Deploy to AWS

```bash
serverless deploy
```

This takes 2-3 minutes. You'll see output like:
```
endpoints:
  POST - https://abc123.execute-api.us-east-1.amazonaws.com/dev/ai/itinerary/generate
```

**SAVE THIS URL!** You need it for your frontend.

---

## 🎯 Step 8: Test Your API

Create a test file:
```bash
cat > test.json << 'EOF'
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

Test it (you'll need a JWT token from your backend):
```bash
curl -X POST https://YOUR_API_URL/dev/ai/itinerary/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token-123" \
  -d @test.json
```

---

## 🎉 You're Done!

Your AI layer is deployed and ready. Next steps:

1. **Integrate with backend**: Give your backend the API endpoint URL
2. **Test end-to-end**: Try creating a trip from your frontend
3. **Tune prompts**: Edit files in `prompts/` to improve AI responses
4. **Monitor**: Check AWS CloudWatch logs if something breaks

---

## 🆘 Common Issues

### "Unable to locate credentials"
→ Run `aws configure` or check `~/.aws/credentials`

### "Access Denied" calling Bedrock
→ Enable model access in Bedrock console (Step 3)

### "Module not found"
→ Run `pip install -r requirements.txt` again

### Deployment fails
→ Run `serverless deploy --verbose` to see detailed errors

### Need help?
→ Check `setup-guide.md` for detailed troubleshooting

---

## 📊 Monitoring Your API

View logs:
```bash
serverless logs -f generateItinerary -t
```

View all functions:
```bash
serverless info
```

Remove deployment (if needed):
```bash
serverless remove
```
