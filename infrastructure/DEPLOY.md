# Chronicle — Deployment Guide

> **Source of truth for deploying the Chronicle backend.**
> If something in this doc is wrong or out of date, fix it here — don't create another doc.

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Environment variables](#2-environment-variables)
3. [Stages](#3-stages)
4. [Deploy procedure](#4-deploy-procedure)
5. [Smoke test](#5-smoke-test)
6. [Rollback](#6-rollback)
7. [Common errors](#7-common-errors)

---

## 1. Prerequisites

Install and verify each of these before attempting a deploy.

### AWS CLI

```bash
aws --version        # needs 2.x
aws sts get-caller-identity   # confirms your credentials are active
```

Configure with the Chronicle AWS account credentials:

```bash
aws configure
# AWS Access Key ID: <from Emma / AWS IAM>
# AWS Secret Access Key: <from Emma / AWS IAM>
# Default region: us-east-1
# Default output format: json
```

### Node.js

The Serverless Framework requires Node. Use **Node 20 LTS** (or 18 LTS minimum).

```bash
node --version    # v20.x.x
npm --version
```

### Serverless Framework

```bash
npm install -g serverless
serverless --version   # 3.x
```

### Python

- **backend stack** uses Python **3.12**
- **ai-layer stack** uses Python **3.11**

```bash
python3.12 --version
python3.11 --version
```

Both must be on your `PATH`. On macOS, install via `pyenv` or `brew install python@3.12 python@3.11`.

### ⚠️ Known issue — hardcoded `pythonBin` in `backend/serverless.yml`

`backend/serverless.yml` has this line under `custom.pythonRequirements`:

```yaml
pythonBin: "C:\\Users\\Emma Berry\\AppData\\Local\\Programs\\Python\\Python312\\python.exe"
```

This is Emma's Windows path and **will break on any other machine**. Before deploying, either:

- Remove the `pythonBin` line entirely (Serverless will find `python3` on your PATH), or
- Override it locally with your own path

Do not commit your local override. A fix to use `python3` by default is tracked in the backlog.

---

## 2. Environment variables

Both stacks read env vars at deploy time. They are **not** committed to the repo.

### How to get them

All secrets live in **AWS SSM Parameter Store** under the path `/chronicle/<stage>/<VAR_NAME>`.

Fetch a value:

```bash
aws ssm get-parameter \
  --name /chronicle/dev/COGNITO_USER_POOL_ID \
  --with-decryption \
  --query Parameter.Value \
  --output text
```

To update a value:

```bash
aws ssm put-parameter \
  --name /chronicle/dev/COGNITO_USER_POOL_ID \
  --value "us-east-1_XXXXXXXXX" \
  --type SecureString \
  --overwrite
```

### `backend` stack vars

| Variable | Description | Where to find it |
|---|---|---|
| `COGNITO_USER_POOL_ID` | Cognito User Pool ID | AWS Console → Cognito → User Pools, or SSM |
| `COGNITO_CLIENT_ID` | Cognito App Client ID | AWS Console → Cognito → App clients, or SSM |
| `S3_BUCKET_NAME` | S3 bucket for file uploads | AWS Console → S3, or SSM |
| `BEDROCK_MODEL_ID` | Claude model ID for AI calls | Default: `anthropic.claude-sonnet-4-6-20260217-v1:0` |
| `LOCATION_MAP_NAME` | AWS Location map name | Default: `TripMapView` |
| `LOCATION_PLACE_INDEX_NAME` | AWS Location place index name | Default: `TripPlaceIndex` |
| `SENTRY_DSN` | Sentry DSN for error reporting | Sentry dashboard → Project settings (added Sprint 1) |

Create a `backend/.env` file (gitignored) before deploying:

```bash
COGNITO_USER_POOL_ID=us-east-1_fN4gzHqjT
COGNITO_CLIENT_ID=1cdvnej2kel3nofdnp5bo2ftt8
S3_BUCKET_NAME=travel-assistant-uploads
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-6-20260217-v1:0
LOCATION_MAP_NAME=TripMapView
LOCATION_PLACE_INDEX_NAME=TripPlaceIndex
SENTRY_DSN=https://xxxx@oXXXXXX.ingest.sentry.io/XXXXXXX
```

### `ai-layer` stack vars

| Variable | Description |
|---|---|
| `COGNITO_USER_POOL_ID` | Same pool as backend |
| `COGNITO_CLIENT_ID` | Same client as backend |
| `BEDROCK_MODEL_ID` | Default: `anthropic.claude-sonnet-4-6-20260217-v1:0` |
| `DYNAMODB_TABLE_NAME` | Default: `trip-planner-trips` |

Create an `ai-layer/.env` file (gitignored) before deploying:

```bash
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_fN4gzHqjT
COGNITO_CLIENT_ID=1cdvnej2kel3nofdnp5bo2ftt8
BEDROCK_MODEL_ID=anthropic.claude-sonnet-4-6-20260217-v1:0
DYNAMODB_TABLE_NAME=trip-planner-trips
```

---

## 3. Stages

### `dev` (current — exists now)

- The live development environment.
- API Gateway URL: `https://1w6itm4sqj.execute-api.us-east-1.amazonaws.com/dev`
- Cognito User Pool: `us-east-1_fN4gzHqjT`
- All active development and testing happens here.
- Mobile app points at this URL.

### `staging` (planned — Sprints 2–3)

- A production-mirror environment for pre-release validation.
- Will have its own separate API Gateway URL, Cognito User Pool, DynamoDB tables, and S3 bucket.
- No shared state with `dev` — deploys to staging should never touch dev data.
- Required env vars will be the same set as `dev` but with staging-specific values stored under `/chronicle/staging/` in SSM.
- This section will be updated when staging is created.

---

## 4. Deploy procedure

Deploy the two stacks independently. **Backend first**, then ai-layer.

### Step 1 — Install dependencies

```bash
# Backend
cd /path/to/ChronicleOfficial/backend
npm install                    # installs serverless plugins
pip install -r requirements.txt

# AI layer
cd /path/to/ChronicleOfficial/ai-layer
npm install
pip install -r requirements.txt
```

### Step 2 — Deploy backend stack

```bash
cd backend
serverless deploy --stage dev
```

Expected output ends with something like:

```
✔ Service deployed to stack travel-assistant-backend-dev

endpoints:
  POST - https://1w6itm4sqj.execute-api.us-east-1.amazonaws.com/dev/auth/signup
  POST - https://1w6itm4sqj.execute-api.us-east-1.amazonaws.com/dev/auth/login
  ...
```

### Step 3 — Deploy ai-layer stack

```bash
cd ai-layer
serverless deploy --stage dev
```

Expected output ends with:

```
✔ Service deployed to stack trip-planner-ai-dev

endpoints:
  POST - https://<ai-layer-url>.execute-api.us-east-1.amazonaws.com/dev/ai/itinerary/generate
```

### Step 4 — Smoke test

See [Section 5](#5-smoke-test).

---

## 5. Smoke test

Run this after every deploy to confirm the stack is up and auth is working.

```bash
# Replace with the canonical API Gateway URL
API_URL="https://1w6itm4sqj.execute-api.us-east-1.amazonaws.com/dev"

curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "WrongPassword"}' | python3 -m json.tool
```

Expected response (401 is correct — it means the Lambda ran and Cognito responded):

```json
{
  "error": "Invalid credentials"
}
```

A 502 or 504 at this point means the Lambda failed to start — check CloudWatch logs:

```bash
serverless logs --function login --stage dev --tail
```

---

## 6. Rollback

### Option A — Serverless rollback (recommended)

List recent deployments:

```bash
cd backend
serverless deploy list --stage dev
```

Roll back to a specific timestamp:

```bash
serverless rollback --stage dev --timestamp 1716900000000
```

### Option B — AWS Console

1. Go to AWS Console → CloudFormation
2. Select the stack (`travel-assistant-backend-dev` or `trip-planner-ai-dev`)
3. Click **Stack actions → Roll back stack**
4. Confirm — CloudFormation will restore the previous version

### Option C — Redeploy from a previous git commit

```bash
git checkout <previous-commit-sha>
cd backend && serverless deploy --stage dev
git checkout main   # return to main after
```

---

## 7. Common errors

### Bedrock model access denied

```
AccessDeniedException: You don't have access to the model with the specified model ID.
```

**Fix:** Bedrock model access is not automatic. You must request it manually:

1. Go to AWS Console → Amazon Bedrock → Model access
2. Click **Manage model access**
3. Find `Claude Sonnet` (Anthropic) and request access
4. Wait for approval (usually instant for Sonnet, may take hours for Opus)
5. Repeat for the fallback model (`claude-3-5-sonnet`) if needed

### IAM permission error on first deploy

```
User: arn:aws:iam::XXXX:user/... is not authorized to perform: cloudformation:CreateStack
```

**Fix:** The deploying IAM user needs CloudFormation, Lambda, API Gateway, IAM, and S3 permissions. Ask Emma to attach the `AdministratorAccess` policy to your IAM user for initial setup, then scope it down after.

### `pythonBin` path not found

```
Error: spawn C:\Users\Emma Berry\... ENOENT
```

**Fix:** See the [known issue in Section 1](#️-known-issue--hardcoded-pythonbin-in-backendserverlessyml). Remove or override the `pythonBin` line in `backend/serverless.yml` locally.

### Lambda timeout on `/ai/itinerary/generate`

```
{"message": "Endpoint request timed out"}   # 504 from API Gateway
```

This is expected behavior when Bedrock takes longer than 25 seconds (the Lambda timeout). It is not a deploy error. The mobile app handles this with a retry. If it happens consistently, check Bedrock service health in the AWS Console.

### DynamoDB table not found

```
ResourceNotFoundException: Requested resource not found: Table: trips not found
```

**Fix:** The DynamoDB tables (`users`, `trips`, `trip-photos`, `travel-pois`) are not created by `serverless deploy` — they were created manually. If deploying to a new AWS account or region, run:

```bash
cd infrastructure
python3 dynamodb_tables.py
```

### Serverless plugin not found

```
Serverless plugin "serverless-python-requirements" not found
```

**Fix:** Run `npm install` inside the `backend/` directory before deploying.

---

*Last updated: Sprint 1 (2026-05-25). Update this doc whenever deploy behavior changes.*
