#!/usr/bin/env bash
# Create all Sprint 01 GitHub issues at once.
#
# Prerequisites:
#   1. brew install gh
#   2. gh auth login    (choose GitHub.com, HTTPS, paste token or browser auth)
#   3. cd into the repo before running
#
# Usage:
#   ./Sprint\ Plan/sprints/create-sprint-01-issues.sh
#
# Idempotency: this script creates fresh issues each time it runs. If you
# re-run it, you'll get duplicates. Either delete the old issues first or
# don't re-run.

set -euo pipefail

REPO="ChronicleTravel/ChronicleOfficial"
MILESTONE="Sprint 01 — Foundations Week"

echo "==> Verifying gh CLI is authenticated..."
gh auth status >/dev/null 2>&1 || { echo "ERROR: run 'gh auth login' first"; exit 1; }

echo "==> Verifying repo access..."
gh repo view "$REPO" >/dev/null 2>&1 || { echo "ERROR: cannot access $REPO"; exit 1; }

echo "==> Creating labels (idempotent — ok if they already exist)..."
create_label() {
  gh label create "$1" --color "$2" --description "$3" --repo "$REPO" 2>/dev/null \
    || gh label edit "$1" --color "$2" --description "$3" --repo "$REPO" >/dev/null
}
create_label "sprint-01"          "1f6feb" "Sprint 01 (2026-05-25 → 2026-05-29)"
create_label "epic: foundations"  "8957e5" "Epic A: Foundations"
create_label "owner: emma"        "0e8a16" "Owner: Emma"
create_label "owner: nikki"       "e99695" "Owner: Nikki"
create_label "owner: jaliah"      "fbca04" "Owner: Jaliah"
create_label "area: backend"      "5319e7" "Area: Backend"
create_label "area: mobile"       "0075ca" "Area: Mobile"
create_label "area: infra"        "d4c5f9" "Area: Infrastructure"
create_label "area: marketing"    "f9d0c4" "Area: Marketing"

echo "==> Creating milestone..."
gh api "repos/$REPO/milestones" -f title="$MILESTONE" \
  -f description="Sprint 1 of Inc 1 — Foundations & Finish Core Loop" \
  -f due_on="2026-05-29T23:59:59Z" 2>/dev/null || echo "    (milestone exists or skipped)"

echo "==> Creating issues..."

create_issue() {
  local title="$1"
  local body_file="$2"
  shift 2
  local labels="$1"
  shift
  gh issue create \
    --repo "$REPO" \
    --title "$title" \
    --body-file "$body_file" \
    --label "$labels" \
    --milestone "$MILESTONE"
}

# Each issue's body is inlined below via heredoc. This avoids needing
# separate body files alongside the script.

ISSUE_1_BODY=$(mktemp)
cat > "$ISSUE_1_BODY" <<'EOF'
**Owner:** Emma

### Context
There are two different API Gateway URLs floating around:
- Backend docs: `https://1w6itm4sqj.execute-api.us-east-1.amazonaws.com/dev`
- Mobile `api.ts` fallback: `https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev`

One is stale. We need a single canonical URL before any other Sprint 1 work merges.

### What to do
1. `curl` both URLs against `/auth/login` to find the live one
2. Pick the canonical URL
3. Update `TripApp_AIChallange/mobile/src/services/api.ts` fallback
4. Sweep repo-root `*.md` docs for stale references
5. Document `EXPO_PUBLIC_API_BASE_URL` in `mobile/.env.example`

### Acceptance criteria
- [ ] Single canonical URL agreed and documented
- [ ] Mobile points at canonical URL
- [ ] No stale URLs in repo-root docs
- [ ] PR merged
- [ ] Friday demo: app makes an authenticated call against canonical URL
EOF

ISSUE_2_BODY=$(mktemp)
cat > "$ISSUE_2_BODY" <<'EOF'
**Owner:** Emma

### Context
Inc 2 ships new features (Diary, Friends). Before that lands, we need crash visibility.

### What to do
1. Create Sentry org + `chronicle-backend` project
2. Install `sentry-sdk[serverless]` (Python)
3. Wrap Lambda handlers with Sentry init
4. Add `SENTRY_DSN` to `serverless.yml` env (value in SSM Parameter Store)
5. Deploy to `dev`, throw a test error, verify in dashboard
6. Set up Slack/Discord notification on new issues

### Acceptance criteria
- [ ] Sentry project exists, DSN in SSM
- [ ] Backend Lambdas report to Sentry
- [ ] Test error visible in dashboard
- [ ] Team channel alert configured
- [ ] PR merged
EOF

ISSUE_3_BODY=$(mktemp)
cat > "$ISSUE_3_BODY" <<'EOF'
**Owner:** Emma

### Context
Pairs with the backend Sentry issue. Device-side crash visibility.

### What to do
1. Create `chronicle-mobile` Sentry project
2. Install `@sentry/react-native` (Expo-compatible)
3. Initialize Sentry in `App.tsx` before root render
4. Wrap root in `Sentry.ErrorBoundary`
5. Add `EXPO_PUBLIC_SENTRY_DSN` to `.env`
6. Trigger deliberate crash, verify in dashboard

### Acceptance criteria
- [ ] `chronicle-mobile` project exists
- [ ] Mobile reports errors to Sentry
- [ ] Test crash visible with sourcemapped stack trace
- [ ] PR merged
EOF

ISSUE_4_BODY=$(mktemp)
cat > "$ISSUE_4_BODY" <<'EOF'
**Owner:** Emma

### Context
Brand assets are cheap to lock in early and expensive to lose. Positioning shapes what we're building.

### Domain
- [ ] Check availability: `chronicle.travel`, `chronicletravel.com`, `getchronicle.app`, `usechronicle.com`
- [ ] Purchase chosen one (Namecheap, Cloudflare, Porkbun)
- [ ] Set up DNS basics

### Social handles (reserve, no posts yet)
- [ ] Instagram
- [ ] TikTok
- [ ] X / Twitter
- [ ] Threads (auto with IG)
- [ ] YouTube

### Positioning doc (1 page, shared with team Friday)
- [ ] One-sentence value prop ("Chronicle is the travel app for ___ who want ___ without ___")
- [ ] 3 differentiators vs Wanderlog, TripIt, Roadtrippers
- [ ] Target persona (1 paragraph)

### Acceptance criteria
- [ ] Domain purchased
- [ ] All 5 handles reserved
- [ ] Positioning doc shared Friday
- [ ] Team aligned on positioning at Friday demo
EOF

ISSUE_5_BODY=$(mktemp)
cat > "$ISSUE_5_BODY" <<'EOF'
**Owner:** Nikki

### Context
Going spec-first for the API. Auth is the natural starting point — small surface, well-understood. Sets conventions for Jaliah's trips/AI spec.

### What to do
1. Create `backend/openapi.yaml` (OpenAPI 3.1: `info`, `servers`, `security`)
2. Document 4 endpoints (reference `backend/handlers/auth.py` for behavior):
   - `POST /auth/signup` — 200, 400, 409
   - `POST /auth/login` — 200 (with tokens), 401, 403
   - `POST /auth/confirm` — 200, 400
   - `POST /auth/resend` — 200, 404
3. Use `components/schemas` for shared shapes (`AuthTokens`, `ErrorResponse`)
4. Include realistic `example` per schema

### Acceptance criteria
- [ ] `backend/openapi.yaml` validates with `redocly lint` (no errors)
- [ ] All 4 auth endpoints documented
- [ ] Examples included
- [ ] PR merged by Tuesday EOD (unblocks the trips spec)
EOF

ISSUE_6_BODY=$(mktemp)
cat > "$ISSUE_6_BODY" <<'EOF'
**Owner:** Nikki

### Context
Once `openapi.yaml` exists we need a way to browse it. Internal-only for now.

### What to do
Pick one of two paths:

**Option A — Lambda + API Gateway** (recommended)
1. New Lambda `handlers/docs.serve_swagger` returns Swagger UI HTML pointing at `/openapi.yaml`
2. Serve `openapi.yaml` from S3, auto-synced on deploy
3. API Gateway route `GET /docs`
4. Basic-auth or IP allowlist

**Option B — Static S3 + CloudFront**
1. Upload Swagger UI dist + spec to S3
2. CloudFront in front
3. Signed URLs or Lambda@Edge basic auth

### Acceptance criteria
- [ ] Swagger UI reachable at one URL
- [ ] Shows auth endpoints from the spec
- [ ] Internal-only
- [ ] URL added to `#chronicle-dev` and `Sprint Plan/README.md`
EOF

ISSUE_7_BODY=$(mktemp)
cat > "$ISSUE_7_BODY" <<'EOF'
**Owner:** Jaliah

### Context
Continues spec-first work. Follow Nikki's conventions from the auth endpoints.

### Blocked by
Auth OpenAPI spec must merge first (or be near-final in PR).

### What to do
Add to `backend/openapi.yaml` (reference `backend/handlers/trips.py` and `ai_itinerary.py`):
- `POST /trips`
- `GET /trips`
- `GET /trips/{trip_id}`
- `PUT /trips/{trip_id}`
- `DELETE /trips/{trip_id}`
- `POST /ai/itinerary/generate` (document 25s timeout + 502/504 behavior)

Reuse `ErrorResponse` and other shared schemas.

### Acceptance criteria
- [ ] All 6 endpoints in spec
- [ ] Validates with `redocly lint`
- [ ] Consistent naming/error shape with auth
- [ ] PR merged
EOF

ISSUE_8_BODY=$(mktemp)
cat > "$ISSUE_8_BODY" <<'EOF'
**Owner:** Jaliah

### Context
No CI today. Every PR is hand-tested or untested. As Nikki and Jaliah add endpoints, this gets risky.

### What to do
Create `.github/workflows/ci.yml` with 3 jobs:

**Job 1 — Lint Python**
- `ruff` (preferred) or `flake8` on `backend/` + `ai-layer/`

**Job 2 — Validate OpenAPI spec**
- `redocly lint backend/openapi.yaml`

**Job 3 — Integration tests**
- Run `backend/tests/integration_test.py`
- Use repo secrets: `API_URL`, `TEST_EMAIL`, `TEST_PASSWORD`
- Cache pip deps

Triggers: PR to `main`, push to `main`. Enable branch protection requiring CI green after first green run.

### Acceptance criteria
- [ ] `.github/workflows/ci.yml` exists
- [ ] All 3 jobs run on every PR
- [ ] Sample PR shows green CI
- [ ] Branch protection on `main` requires CI green
- [ ] Repo secrets set
EOF

ISSUE_9_BODY=$(mktemp)
cat > "$ISSUE_9_BODY" <<'EOF'
**Owner:** Jaliah

### Context
20+ stale markdown setup docs at repo root, none current. Need one clean source of truth.

### What to do
Create `infrastructure/DEPLOY.md` covering:

1. **Prereqs**: AWS credentials, Node/Python/serverless versions, region
2. **Stages**: `dev` (current) and `staging` (to be created Sprint 2-3); env vars per stage
3. **Deploy procedure**:
   - `cd backend && serverless deploy --stage dev`
   - `cd ai-layer && serverless deploy --stage dev`
   - Smoke test `/auth/login`
4. **Rollback**: how to roll back CloudFormation if deploy breaks
5. **Common errors**: Bedrock model access, IAM gotchas
6. **Secrets**: where `COGNITO_USER_POOL_ID`, `SENTRY_DSN`, etc. live (SSM); how to update

Also: separate follow-up issue to archive old root-level `*.md` files into `docs/_archive/`.

### Acceptance criteria
- [ ] `infrastructure/DEPLOY.md` is source of truth
- [ ] Emma can follow it cold and deploy successfully
- [ ] Linked from `Sprint Plan/README.md`
- [ ] PR merged
EOF

# Create each issue. Labels are comma-separated.
create_issue "[Sprint 01] A1 — Resolve API Gateway URL mismatch between backend docs and mobile client" \
  "$ISSUE_1_BODY" "sprint-01,epic: foundations,owner: emma,area: infra,area: mobile"

create_issue "[Sprint 01] A2 — Set up Sentry on backend Lambdas" \
  "$ISSUE_2_BODY" "sprint-01,epic: foundations,owner: emma,area: backend"

create_issue "[Sprint 01] A3 — Set up Sentry on mobile (React Native + Expo)" \
  "$ISSUE_3_BODY" "sprint-01,epic: foundations,owner: emma,area: mobile"

create_issue "[Sprint 01] Marketing — Buy domain, reserve social handles, draft positioning doc" \
  "$ISSUE_4_BODY" "sprint-01,epic: foundations,owner: emma,area: marketing"

create_issue "[Sprint 01] A4 — Hand-write openapi.yaml for auth endpoints" \
  "$ISSUE_5_BODY" "sprint-01,epic: foundations,owner: nikki,area: backend"

create_issue "[Sprint 01] A6 — Stand up internal Swagger UI" \
  "$ISSUE_6_BODY" "sprint-01,epic: foundations,owner: nikki,area: infra"

create_issue "[Sprint 01] A5 — Hand-write openapi.yaml for trips and AI itinerary endpoints" \
  "$ISSUE_7_BODY" "sprint-01,epic: foundations,owner: jaliah,area: backend"

create_issue "[Sprint 01] A7 — Set up GitHub Actions CI (lint + spec validate + integration tests)" \
  "$ISSUE_8_BODY" "sprint-01,epic: foundations,owner: jaliah,area: infra"

create_issue "[Sprint 01] A8 — Write infrastructure/DEPLOY.md" \
  "$ISSUE_9_BODY" "sprint-01,epic: foundations,owner: jaliah,area: infra"

# Cleanup
rm -f "$ISSUE_1_BODY" "$ISSUE_2_BODY" "$ISSUE_3_BODY" "$ISSUE_4_BODY" \
      "$ISSUE_5_BODY" "$ISSUE_6_BODY" "$ISSUE_7_BODY" "$ISSUE_8_BODY" "$ISSUE_9_BODY"

echo ""
echo "==> Done. View all Sprint 01 issues:"
echo "    https://github.com/$REPO/issues?q=is:open+milestone:\"Sprint+01+%E2%80%94+Foundations+Week\""
