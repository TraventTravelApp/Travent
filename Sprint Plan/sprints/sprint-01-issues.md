# Sprint 01 — GitHub Issues

Nine issues, one per Sprint 1 task. Each section below is ready to paste into a GitHub "New issue" form: copy the `### Title` into the title field and everything under `### Body` into the body.

**Recommended labels to create first** (Repo → Issues → Labels → New label):
- `sprint-01` (color: blue)
- `epic: foundations` (color: purple)
- `owner: emma` (color: green)
- `owner: nikki` (color: orange)
- `owner: jaliah` (color: yellow)
- `area: backend`, `area: mobile`, `area: infra`, `area: marketing` (any color)

**Recommended milestone:** create `Sprint 01 — Foundations Week (2026-05-25 → 2026-05-29)` and assign all 9 issues to it.

---

## Issue 1 — A1: API URL reconcile

### Title
`[Sprint 01] A1 — Resolve API Gateway URL mismatch between backend docs and mobile client`

### Body
**Owner:** Emma
**Labels:** `sprint-01`, `epic: foundations`, `owner: emma`, `area: infra`, `area: mobile`

### Context
There are two different API Gateway URLs floating around:
- Backend docs (`BACKEND_DEPLOYED.md` and friends): `https://1w6itm4sqj.execute-api.us-east-1.amazonaws.com/dev`
- Mobile `TripApp_AIChallange/mobile/src/services/api.ts` (hardcoded fallback): `https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev`

One of these is stale. We need a single canonical URL before any other Sprint 1 work merges, or we'll be debugging "why does X work locally but not in the deployed app" all week.

### What to do
1. Verify which API Gateway is actually live and serving traffic — `curl <url>/auth/login` against both and see which responds correctly
2. Pick the canonical one (or redeploy the backend to consolidate)
3. Update `TripApp_AIChallange/mobile/src/services/api.ts` so the fallback matches the canonical URL
4. Sweep the repo-root `*.md` docs and update any stale URL references
5. Set `EXPO_PUBLIC_API_BASE_URL` env var documentation in `mobile/.env.example` so future devs don't hardcode

### Acceptance criteria
- [ ] Single canonical URL agreed and documented
- [ ] `mobile/src/services/api.ts` points at the canonical URL
- [ ] No stale URLs in any repo-root `*.md` file
- [ ] PR merged to `main`
- [ ] Demo Friday: app makes a real authenticated call against the canonical URL

---

## Issue 2 — A2: Backend Sentry

### Title
`[Sprint 01] A2 — Set up Sentry on backend Lambdas`

### Body
**Owner:** Emma
**Labels:** `sprint-01`, `epic: foundations`, `owner: emma`, `area: backend`

### Context
Inc 2 starts shipping new features (Diary, Friends). Before that lands, we need crash visibility — otherwise users will hit errors and we won't know.

### What to do
1. Create a Sentry organization (free tier is fine) and a `chronicle-backend` project
2. Install Sentry SDK in the backend — recommend `sentry-sdk[serverless]` (Python). Alternatively the `serverless-sentry` plugin
3. Wrap each Lambda handler entry with Sentry initialization (or use middleware)
4. Add `SENTRY_DSN` to `serverless.yml` env vars; store the actual DSN value in AWS SSM Parameter Store, not in code
5. Deploy to `dev`, throw a test error from `/auth/login` (force a 500), verify it shows in Sentry within 60 seconds
6. Set up Slack/Discord notification on new issues (channel: `#chronicle-alerts`)

### Acceptance criteria
- [ ] Sentry project exists and DSN is in SSM
- [ ] Backend Lambdas report errors to Sentry
- [ ] Test error visible in Sentry dashboard
- [ ] Alert routed to team channel
- [ ] PR merged

---

## Issue 3 — A3: Mobile Sentry

### Title
`[Sprint 01] A3 — Set up Sentry on mobile (React Native + Expo)`

### Body
**Owner:** Emma
**Labels:** `sprint-01`, `epic: foundations`, `owner: emma`, `area: mobile`

### Context
Pairs with Issue #2 (backend Sentry). We need crash visibility on the device side too.

### What to do
1. In the same Sentry org, create a `chronicle-mobile` project
2. Install `@sentry/react-native` (Expo-compatible build — follow the Expo Sentry guide for the current SDK)
3. Initialize Sentry in `App.tsx` before the root component renders
4. Wrap the root component in `Sentry.ErrorBoundary`
5. Add `SENTRY_DSN` to `.env` and reference via `EXPO_PUBLIC_SENTRY_DSN`
6. Build and run on simulator. Trigger a deliberate crash (e.g. throw in a button handler). Verify the event appears in Sentry within 60 seconds

### Acceptance criteria
- [ ] `chronicle-mobile` Sentry project exists
- [ ] Mobile reports errors to Sentry
- [ ] Test crash visible in dashboard with stack trace mapped to source
- [ ] PR merged

---

## Issue 4 — Marketing: domain + handles + positioning

### Title
`[Sprint 01] Marketing — Buy domain, reserve social handles, draft positioning doc`

### Body
**Owner:** Emma
**Labels:** `sprint-01`, `epic: foundations`, `owner: emma`, `area: marketing`

### Context
Brand assets are cheap to lock in early and expensive to lose. Domain + social handles need to exist before someone else grabs them, and the positioning doc shapes how Nikki and Jaliah think about what they're building.

### What to do
**Domain:**
- [ ] Check `chronicle.travel`, `chronicletravel.com`, `getchronicle.app`, `usechronicle.com` for availability
- [ ] Buy the chosen one (Namecheap, Cloudflare, or Porkbun)
- [ ] Set up DNS basics (no need to point at anything yet)

**Social handles** (reserve, don't post yet):
- [ ] Instagram `@chronicle.travel` or alt
- [ ] TikTok `@chronicle.travel` or alt
- [ ] X / Twitter `@chronicletravel` or alt
- [ ] Threads (auto with IG)
- [ ] YouTube `@chronicletravel` or alt

**Positioning doc** (1 page, shared with team Friday):
- [ ] One-sentence value prop ("Chronicle is the travel app for ___ who want ___ without ___")
- [ ] 3 differentiators vs Wanderlog, TripIt, Roadtrippers, AI Trip
- [ ] Target persona (1 paragraph)

### Acceptance criteria
- [ ] Domain purchased and registered to Emma / company entity
- [ ] All 5 handles reserved on all platforms
- [ ] Positioning doc shared with Nikki and Jaliah by Friday
- [ ] Team agrees on the positioning at the Friday demo

---

## Issue 5 — A4: Auth OpenAPI spec

### Title
`[Sprint 01] A4 — Hand-write openapi.yaml for auth endpoints`

### Body
**Owner:** Nikki
**Labels:** `sprint-01`, `epic: foundations`, `owner: nikki`, `area: backend`

### Context
We're going spec-first for the API. Auth endpoints are the natural starting point — small surface, well-understood, no dependencies. This sets the conventions Jaliah will follow in Issue #7 for the trips/AI spec.

### What to do
1. Create `backend/openapi.yaml` with OpenAPI 3.1 header (`info`, `servers`, `security`)
2. Document these 4 endpoints, referencing `backend/handlers/auth.py` for actual behavior:
   - `POST /auth/signup` — request body, 200 response, 400 (invalid), 409 (email exists)
   - `POST /auth/login` — request body, 200 response with tokens, 401 (bad creds), 403 (not confirmed)
   - `POST /auth/confirm` — request body, 200 response, 400 (bad code)
   - `POST /auth/resend` — request body, 200 response, 404 (email not found)
3. Use `components/schemas` for shared request/response shapes (e.g. `AuthTokens`, `ErrorResponse`)
4. Include at least one realistic `example` per schema

### Notes for Jaliah's downstream work
After this lands, Jaliah will pattern-match conventions (naming, error shape, security scheme) for the trips + AI endpoints (Issue #7). Keep the file structure clean — we'll be extending it for the next ~10 weeks.

### Acceptance criteria
- [ ] `backend/openapi.yaml` exists and validates with `redocly lint` (no errors)
- [ ] All 4 auth endpoints documented with request/response/error schemas
- [ ] Examples included
- [ ] PR merged by Tuesday EOD (unblocks Issue #7)

---

## Issue 6 — A6: Swagger UI

### Title
`[Sprint 01] A6 — Stand up internal Swagger UI`

### Body
**Owner:** Nikki
**Labels:** `sprint-01`, `epic: foundations`, `owner: nikki`, `area: infra`

### Context
Once we have `openapi.yaml`, we need a way to browse it visually. Swagger UI is the standard. Internal-only — we'll consider public docs later.

### What to do
Pick one of two paths:

**Option A — Lambda + API Gateway** (recommended)
1. Add a new Lambda `handlers/docs.serve_swagger` that returns Swagger UI HTML pointing at `/openapi.yaml`
2. Add a new Lambda or static route to serve `openapi.yaml` from S3 (auto-synced on deploy)
3. Add API Gateway route `GET /docs` → docs Lambda
4. Add basic-auth (or IP allowlist) for internal-only access

**Option B — Static S3 + CloudFront**
1. Upload Swagger UI dist + `openapi.yaml` to a new S3 bucket
2. Front with CloudFront
3. Use signed URLs or basic auth via Lambda@Edge

### Acceptance criteria
- [ ] Swagger UI reachable from a single URL
- [ ] Shows the auth endpoints from Issue #5
- [ ] Internal-only (basic auth or VPN)
- [ ] URL shared in `#chronicle-dev` and added to `Sprint Plan/README.md` quick reference

---

## Issue 7 — A5: Trips + AI OpenAPI spec

### Title
`[Sprint 01] A5 — Hand-write openapi.yaml for trips and AI itinerary endpoints`

### Body
**Owner:** Jaliah
**Labels:** `sprint-01`, `epic: foundations`, `owner: jaliah`, `area: backend`

### Context
Continues the spec-first work from Issue #5. Follow the conventions Nikki established for the auth endpoints.

### Blocked by
Issue #5 must merge first (or be in a near-final PR you can pattern-match against).

### What to do
Add the following endpoints to `backend/openapi.yaml`. Reference `backend/handlers/trips.py` and `backend/handlers/ai_itinerary.py` for actual behavior.

- `POST /trips` — create trip (request: trip questionnaire fields; response: `trip_id`)
- `GET /trips` — list user's trips (response: paginated array)
- `GET /trips/{trip_id}` — fetch single trip with full itinerary
- `PUT /trips/{trip_id}` — update trip metadata (dates, destination, etc.)
- `DELETE /trips/{trip_id}` — delete a trip
- `POST /ai/itinerary/generate` — generate itinerary (this is the 25s-timeout Bedrock call — document the timeout and 502/504 behavior)

Reuse schemas from Issue #5 where applicable (`ErrorResponse`).

### Acceptance criteria
- [ ] All 6 endpoints in `openapi.yaml`
- [ ] Validates with `redocly lint`
- [ ] Consistent naming/error shape with auth endpoints
- [ ] PR merged

---

## Issue 8 — A7: GitHub Actions CI

### Title
`[Sprint 01] A7 — Set up GitHub Actions CI (lint + spec validate + integration tests)`

### Body
**Owner:** Jaliah
**Labels:** `sprint-01`, `epic: foundations`, `owner: jaliah`, `area: infra`

### Context
No CI today. Every PR is hand-tested or untested. As we add Nikki and Jaliah's new endpoints, this gets risky fast.

### Blocked by
Needs at least Issue #5 (`openapi.yaml`) in the repo to validate against. Can run lint + integration tests immediately.

### What to do
Create `.github/workflows/ci.yml` with 3 jobs:

**Job 1 — Lint Python**
- Install `ruff` (preferred) or `flake8`
- Run against `backend/` and `ai-layer/`
- Fail on errors

**Job 2 — Validate OpenAPI spec**
- Install `@redocly/cli` (or `swagger-cli` — agree with Nikki, A6 pair session)
- Run `redocly lint backend/openapi.yaml`
- Fail on errors

**Job 3 — Integration tests**
- Run `backend/tests/integration_test.py`
- Use repo secrets for `API_URL`, `TEST_EMAIL`, `TEST_PASSWORD`
- Cache pip deps for speed

Configure:
- Triggers: PR to `main`, push to `main`
- Required status check on `main` (after first green run, enable branch protection)

### Acceptance criteria
- [ ] `.github/workflows/ci.yml` exists
- [ ] All 3 jobs run on every PR
- [ ] A sample PR shows green CI
- [ ] Branch protection enabled on `main` requiring CI green to merge
- [ ] Secrets `API_URL`, `TEST_EMAIL`, `TEST_PASSWORD` set in repo settings

---

## Issue 9 — A8: Deploy documentation

### Title
`[Sprint 01] A8 — Write infrastructure/DEPLOY.md`

### Body
**Owner:** Jaliah
**Labels:** `sprint-01`, `epic: foundations`, `owner: jaliah`, `area: infra`

### Context
20+ stale markdown setup docs at repo root, none of them current. Anyone new to the project (or future hire) will be lost. We need one clean source-of-truth deploy doc.

### What to do
Create `infrastructure/DEPLOY.md` covering:

1. **Prereqs**: AWS credentials, Node version, Python version, serverless framework version, AWS region
2. **Stages**: explain `dev` (current) and `staging` (to be created in Sprint 2-3). Note env vars each requires.
3. **Deploy procedure**:
   - `cd backend && serverless deploy --stage dev`
   - `cd ai-layer && serverless deploy --stage dev`
   - Verify with smoke test against `/auth/login`
4. **Rollback**: how to roll back to a previous CloudFormation stack version if a deploy breaks
5. **Common errors**: at minimum the Bedrock model access issue, IAM permission gotchas
6. **Secrets**: where `COGNITO_USER_POOL_ID`, `SENTRY_DSN`, etc. live (SSM Parameter Store) and how to update them

Also: mark the 20+ stale root-level `*.md` docs as deprecated (move to `docs/_archive/` in a follow-up PR — separate issue).

### Acceptance criteria
- [ ] `infrastructure/DEPLOY.md` exists and is the source of truth
- [ ] Emma can follow it cold and deploy successfully
- [ ] Linked from `Sprint Plan/README.md`
- [ ] PR merged

---

## Quick paste-to-GitHub guide

For each issue above:
1. Go to https://github.com/ChronicleTravel/ChronicleOfficial/issues/new
2. Copy the `### Title` line content into the issue title
3. Copy everything under `### Body` (skip the `### Body` header itself) into the description
4. Add the listed labels (create them once if they don't exist yet)
5. Assign to the named owner (use GitHub @ usernames)
6. Add to the Sprint 01 milestone
7. Submit

Or, if you'd rather automate: install `gh` (`brew install gh`), run `gh auth login`, then run `Sprint Plan/sprints/create-sprint-01-issues.sh`.
