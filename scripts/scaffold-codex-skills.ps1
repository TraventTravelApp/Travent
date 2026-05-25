$ErrorActionPreference = 'Stop'

$root = 'C:\Users\Emma Berry\.codex\skills'

$skills = @(
  @{
    Name = 'cognito-auth-alignment'
    DisplayName = 'Cognito Auth Alignment'
    ShortDescription = 'Align Cognito token handling across mobile and Lambda.'
    DefaultPrompt = 'Use $cognito-auth-alignment to debug and align Cognito token handling across this repo.'
    Description = 'Align Cognito authentication across mobile, backend, and AI services. Use when Codex needs to debug login flows, JWT verification, Authorization headers, Cognito claims, token storage, or cross-service authentication mismatches in this repository.'
    SkillBody = @'
# Workflow

1. Read `references/auth-flow.md` first.
2. Read `references/claims-map.md` when token claims or JWT validation logic is involved.
3. Read `references/repo-hotspots.md` before editing auth code.
4. Run `scripts/check-auth-drift.ps1` before proposing fixes.
5. Prefer one canonical token model across mobile, backend, and AI services.
6. Remove predictable fallback secrets and avoid silent auth downgrades.

# Output Rules

- Identify the exact token type the client sends.
- Verify what each service accepts and rejects.
- Call out any mismatch between Cognito claims, stored tokens, and server expectations.
- Prefer concrete edits with line-level references.
'@
    References = @(
      @{
        Path = 'references/auth-flow.md'
        Content = @'
# Auth Flow

Use this skill when the repo's authentication path needs to be traced end to end.

Expected flow:
- Mobile signs up and logs in through Cognito-backed backend endpoints.
- Mobile stores returned tokens and sends one consistent bearer token on authenticated requests.
- Backend and AI services verify the same token model and extract the same user identifier.

Check for drift in:
- token type sent by mobile
- token verifier implementation in each service
- fallback secret behavior
- claim extraction order
'@
      },
      @{
        Path = 'references/claims-map.md'
        Content = @'
# Claims Map

Review these claims whenever token verification is touched:

- `sub`: canonical Cognito user id
- `cognito:username`: Cognito username fallback
- `token_use`: should match the accepted token type
- `aud` or `client_id`: verify the token was issued for the expected app client

Prefer `sub` as the canonical user identifier unless there is a documented exception.
'@
      },
      @{
        Path = 'references/repo-hotspots.md'
        Content = @'
# Repo Hotspots

Inspect these files first:

- `backend/utils/auth_utils.py`
- `ai-layer/utils/auth_utils.py`
- `backend/handlers/auth.py`
- `TripApp_AIChallange/mobile/src/services/api.ts`
- `TripApp_AIChallange/mobile/src/services/auth.ts`

Typical failures:
- custom JWT fallback remains enabled
- AI layer expects HS256 while mobile sends Cognito tokens
- mobile stores one token but sends another
- server accepts broader claims than intended
'@
      }
    )
    Scripts = @(
      @{
        Path = 'scripts/check-auth-drift.ps1'
        Content = @'
$ErrorActionPreference = "Stop"
$repo = if ($args.Count -gt 0) { $args[0] } else { "." }
$patterns = @(
  "JWT_SECRET",
  "your-secret-key-change-in-production",
  "fsu-hackathon-2024-secret-key",
  "token_use",
  "Authorization",
  "id_token",
  "access_token"
)
foreach ($pattern in $patterns) {
  Write-Host "=== $pattern ==="
  Select-String -Path (Join-Path $repo "*") -Pattern $pattern -SimpleMatch -Recurse -ErrorAction SilentlyContinue
}
'@
      }
    )
  },
  @{
    Name = 'aws-serverless-python'
    DisplayName = 'AWS Serverless Python'
    ShortDescription = 'Review AWS Lambda, IAM, env, and deploy config drift.'
    DefaultPrompt = 'Use $aws-serverless-python to review and fix the Serverless Framework and AWS Python setup in this repo.'
    Description = 'Review and maintain AWS serverless Python services in this repository. Use when Codex needs to work on Lambda handlers, Serverless Framework config, IAM policies, DynamoDB, S3, Amazon Location, environment variables, packaging, or deployment portability.'
    SkillBody = @'
# Workflow

1. Read `references/deploy-topology.md` for service boundaries and infrastructure names.
2. Read `references/iam-patterns.md` when modifying permissions.
3. Read `references/local-dev.md` before touching packaging or deployment scripts.
4. Run `scripts/check-serverless-config.ps1` before editing config.
5. Prefer portable paths, explicit env contracts, and least-privilege IAM.

# Output Rules

- Flag machine-specific paths and hidden deploy assumptions.
- Keep runtime, packaging, and env contracts consistent across services.
- Tighten wildcard IAM only when it can be done without breaking known flows.
'@
    References = @(
      @{
        Path = 'references/deploy-topology.md'
        Content = @'
# Deploy Topology

This repo currently has multiple AWS-facing areas:

- `backend/`: main Serverless Framework API
- `ai-layer/`: separate AI service or Lambda packaging flow
- `infrastructure/`: helper scripts and setup docs
- `scraper/`: data population scripts

Core AWS services in use:
- Cognito
- DynamoDB
- S3
- Amazon Location
- Bedrock
- Secrets Manager
'@
      },
      @{
        Path = 'references/iam-patterns.md'
        Content = @'
# IAM Patterns

Check for:
- wildcard `Resource: "*"` where a narrower ARN is possible
- mixed table naming conventions
- missing permissions for indexes, Secrets Manager, or Location resources
- broad permissions carried over from experiments

Prefer documenting why a wildcard is required when it cannot be removed safely.
'@
      },
      @{
        Path = 'references/local-dev.md'
        Content = @'
# Local Development

Review local tooling assumptions before editing deployment config:

- hardcoded Python executable paths
- Windows-only batch scripts
- serverless plugin assumptions
- missing cross-platform commands

Prefer config that works on another machine and in CI without hand edits.
'@
      }
    )
    Scripts = @(
      @{
        Path = 'scripts/check-serverless-config.ps1'
        Content = @'
$ErrorActionPreference = "Stop"
$repo = if ($args.Count -gt 0) { $args[0] } else { "." }
$files = @(
  "backend/serverless.yml",
  "ai-layer/serverless.yml",
  "backend/deploy.bat",
  "configure-aws.bat"
)
$patterns = @(
  "pythonBin:",
  "Resource: '*'",
  "JWT_SECRET:",
  "BEDROCK_MODEL_ID",
  "COGNITO_",
  "S3_BUCKET_NAME"
)
foreach ($file in $files) {
  $path = Join-Path $repo $file
  if (Test-Path $path) {
    Write-Host "=== $file ==="
    foreach ($pattern in $patterns) {
      Select-String -Path $path -Pattern $pattern -SimpleMatch -ErrorAction SilentlyContinue
    }
  }
}
'@
      }
    )
  },
  @{
    Name = 'bedrock-itinerary-engine'
    DisplayName = 'Bedrock Itinerary Engine'
    ShortDescription = 'Tune prompts, schema, and model handling for itineraries.'
    DefaultPrompt = 'Use $bedrock-itinerary-engine to improve itinerary prompts, validation, and Bedrock response handling in this repo.'
    Description = 'Maintain and improve the itinerary generation pipeline in this repository. Use when Codex needs to tune prompts, adjust Bedrock model usage, validate itinerary schemas, reduce latency or cost, or debug parsing and persistence issues in the AI trip planner flow.'
    SkillBody = @'
# Workflow

1. Read `references/itinerary-schema.md` before changing request or response fields.
2. Read `references/model-notes.md` before changing model ids, timeouts, or Bedrock request format.
3. Read `references/prompting-rules.md` when editing prompt templates or retry logic.
4. Run `scripts/check-bedrock-contract.ps1` before and after edits.
5. Preserve one canonical itinerary shape for both API consumers and persistence.

# Output Rules

- Keep prompt rules and schema rules separate.
- Call out where parser assumptions are brittle.
- Prefer validation near the contract boundary, not after persistence.
'@
    References = @(
      @{
        Path = 'references/itinerary-schema.md'
        Content = @'
# Itinerary Schema

Treat the itinerary payload as a contract shared by:
- request validation
- Bedrock prompt instructions
- response parsing
- mobile rendering
- DynamoDB persistence

Before changing fields, trace all producers and consumers of:
- `trip_type`
- destination or route fields
- `days`
- `activities`
- activity coordinates
- total cost or budget-related fields
'@
      },
      @{
        Path = 'references/model-notes.md'
        Content = @'
# Model Notes

Check these before modifying Bedrock usage:
- model id format and region support
- request body format expected by the chosen model family
- Lambda timeout and retry budget
- cost versus latency tradeoffs

Keep model ids configurable and avoid hardcoding experimental choices without a clear reason.
'@
      },
      @{
        Path = 'references/prompting-rules.md'
        Content = @'
# Prompting Rules

Prompt goals:
- valid JSON only
- realistic places
- budget-aware results
- duration-aware plans
- schema-compatible activities

If retries are used, append validation feedback precisely and keep the base prompt stable enough to compare outputs.
'@
      }
    )
    Scripts = @(
      @{
        Path = 'scripts/check-bedrock-contract.ps1'
        Content = @'
$ErrorActionPreference = "Stop"
$repo = if ($args.Count -gt 0) { $args[0] } else { "." }
$files = @(
  "backend/handlers/ai_itinerary.py",
  "ai-layer/handlers/itinerary.py",
  "ai-layer/services/claude_service.py",
  "backend/models/trip_request.py"
)
$patterns = @(
  "BEDROCK_MODEL_ID",
  "trip_type",
  "destination",
  "start_location",
  "end_location",
  "days",
  "activities",
  "validation"
)
foreach ($file in $files) {
  $path = Join-Path $repo $file
  if (Test-Path $path) {
    Write-Host "=== $file ==="
    foreach ($pattern in $patterns) {
      Select-String -Path $path -Pattern $pattern -SimpleMatch -ErrorAction SilentlyContinue
    }
  }
}
'@
      }
    )
  },
  @{
    Name = 'repo-hygiene-release'
    DisplayName = 'Repo Hygiene Release'
    ShortDescription = 'Audit stale docs, scripts, tests, and release readiness.'
    DefaultPrompt = 'Use $repo-hygiene-release to audit repo drift, stale docs, and release readiness for this project.'
    Description = 'Audit and clean up repository drift in this project. Use when Codex needs to review stale documentation, duplicate setup guides, inconsistent scripts, mismatched tests, noisy debug logging, or overall release readiness across the mobile app, backend, AI layer, and infrastructure folders.'
    SkillBody = @'
# Workflow

1. Read `references/cleanup-rules.md` to decide what should remain canonical.
2. Read `references/testing-matrix.md` when evaluating coverage gaps.
3. Run `scripts/repo-audit.ps1` before proposing cleanup.
4. Group findings into stale docs, dead files, behavior drift, and release blockers.
5. Prefer consolidation over creating more status files.

# Output Rules

- Lead with concrete findings and file references.
- Distinguish between cleanup work and behavior bugs.
- Call out any tests that no longer match live response shapes or auth behavior.
'@
    References = @(
      @{
        Path = 'references/cleanup-rules.md'
        Content = @'
# Cleanup Rules

Prefer one canonical source for:
- setup instructions
- deployment steps
- backend environment requirements
- AI integration status

Flag these as likely cleanup targets:
- duplicate status markdown files
- empty scripts
- generated placeholder artifacts
- accidental files such as `nul`
'@
      },
      @{
        Path = 'references/testing-matrix.md'
        Content = @'
# Testing Matrix

Review coverage in these areas:
- mobile auth and API contract handling
- backend auth and protected endpoints
- AI generation request validation
- persistence and retrieval of generated trips
- deployment and environment validation

Document what is automated, what is manual, and what is currently stale.
'@
      }
    )
    Scripts = @(
      @{
        Path = 'scripts/repo-audit.ps1'
        Content = @'
$ErrorActionPreference = "Stop"
$repo = if ($args.Count -gt 0) { $args[0] } else { "." }
Write-Host "=== Empty files ==="
Get-ChildItem -Path $repo -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Length -eq 0 } | Select-Object FullName
Write-Host "=== Suspicious names ==="
Get-ChildItem -Path $repo -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -in @("nul", "NUL") } | Select-Object FullName
Write-Host "=== Status markdown files ==="
Get-ChildItem -Path $repo -Recurse -File -Filter *.md -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "STATUS|SETUP|GUIDE|COMPLETE|SUMMARY" } | Select-Object FullName
'@
      }
    )
  }
)

foreach ($skill in $skills) {
  $skillRoot = Join-Path $root $skill.Name
  if (Test-Path $skillRoot) {
    throw "Skill already exists: $($skill.Name)"
  }

  New-Item -ItemType Directory -Path $skillRoot | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $skillRoot 'agents') | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $skillRoot 'references') | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $skillRoot 'scripts') | Out-Null

  $skillMd = @"
---
name: $($skill.Name)
description: $($skill.Description)
---

$($skill.SkillBody)
"@
  Set-Content -Path (Join-Path $skillRoot 'SKILL.md') -Value $skillMd -Encoding utf8

  $openaiYaml = @"
interface:
  display_name: "$($skill.DisplayName)"
  short_description: "$($skill.ShortDescription)"
  default_prompt: "$($skill.DefaultPrompt)"
"@
  Set-Content -Path (Join-Path $skillRoot 'agents/openai.yaml') -Value $openaiYaml -Encoding utf8

  foreach ($reference in $skill.References) {
    $referencePath = Join-Path $skillRoot $reference.Path
    $referenceDir = Split-Path $referencePath -Parent
    if (-not (Test-Path $referenceDir)) {
      New-Item -ItemType Directory -Path $referenceDir -Force | Out-Null
    }
    Set-Content -Path $referencePath -Value $reference.Content -Encoding utf8
  }

  foreach ($script in $skill.Scripts) {
    $scriptPath = Join-Path $skillRoot $script.Path
    $scriptDir = Split-Path $scriptPath -Parent
    if (-not (Test-Path $scriptDir)) {
      New-Item -ItemType Directory -Path $scriptDir -Force | Out-Null
    }
    Set-Content -Path $scriptPath -Value $script.Content -Encoding utf8
  }
}

Write-Host "Scaffolded $($skills.Count) skills in $root"
