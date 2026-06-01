# Sprint 01 — Foundations Week

**Dates:** 2026-05-25 → 2026-05-29 (Mon → Fri)
**Increment:** Inc 1 — Foundations & Finish Core Loop
**Sprint goal:** Lay the infrastructure that lets us move fast — OpenAPI spec, CI, observability, canonical API URL — and start the marketing track.

---

## Demo target (Friday 2026-05-29)

- [ ] Swagger UI reachable from a URL — shows `/auth/*`, `/trips/*`, `/ai/itinerary/generate` schemas
- [ ] GitHub Actions CI green on a sample PR (lint + spec validate + integration tests)
- [ ] Mobile app talking to the canonical API Gateway URL (no more URL drift between docs and code)
- [ ] Sentry catching a deliberately thrown error from both backend and mobile
- [ ] Positioning doc shared with team; social handles + domain reserved

---

## Task assignments

### Emma
- [ ] **A1** Resolve API Gateway URL mismatch. Pick canonical URL between `1w6itm4sqj.execute-api...` (backend docs) and `gaq4nwm4l6.execute-api...` (mobile `api.ts`). Update `TripApp_AIChallange/mobile/src/services/api.ts` and the various `*.md` docs at repo root. Open a single PR.
- [ ] **A2** Set up Sentry on backend Lambdas via `serverless-sentry-lib` or `sentry-sdk[serverless]`. Add `SENTRY_DSN` to env vars. Throw a test error and verify it appears in Sentry.
- [ ] **A3** Set up Sentry on mobile via `@sentry/react-native` (Expo-compatible build). Wrap App in Sentry boundary. Trigger a deliberate error and verify.
- [ ] **Run Sprint 1 planning meeting Monday 9:00.** Walk Nikki and Jaliah through this file. Confirm Slack/Discord channel for standups.
- [ ] **Marketing:** Buy domain (chronicle.travel or chosen alt). Reserve handles on Instagram, TikTok, X, Threads, YouTube. Draft 1-page positioning doc: one-sentence value prop + 3 differentiators + target persona.

### Nikki
- [ ] **A4** Hand-write `backend/openapi.yaml` (OpenAPI 3.1) covering all 4 auth endpoints: `POST /auth/signup`, `/auth/login`, `/auth/confirm`, `/auth/resend`. Include request/response/error schemas with examples. Reference `backend/handlers/auth.py` for actual behavior.
- [ ] **A6** Stand up Swagger UI. Easiest path: serve Swagger UI HTML from a Lambda or static S3 bucket, point it at the openapi.yaml hosted in the same bucket. Internal-only (basic auth or behind VPN — discuss with Emma).
- [ ] Pair with Jaliah Tuesday afternoon on CI scaffolding — agree on the spec validation tool (`@redocly/cli` or `swagger-cli`).

### Jaliah
- [ ] **A5** Hand-write `backend/openapi.yaml` entries for `POST /trips`, `GET /trips`, `GET/PUT/DELETE /trips/{trip_id}`, and `POST /ai/itinerary/generate`. Coordinate with Nikki to keep file format consistent.
- [ ] **A7** Set up GitHub Actions CI in `.github/workflows/ci.yml`:
  - Trigger on PR to `main`
  - Job 1: install Python deps, run `flake8` or `ruff` on `backend/` + `ai-layer/`
  - Job 2: validate `backend/openapi.yaml` with the tool Nikki picks
  - Job 3: run `backend/tests/integration_test.py` against a test Cognito user (use repo secrets for `TEST_EMAIL`, `TEST_PASSWORD`, `API_URL`)
- [ ] **A8** Write `infrastructure/DEPLOY.md` documenting `serverless deploy --stage dev` vs `--stage staging` (staging stage to be created Sprint 2-3) and the env vars each requires.

---

## Dependencies / sequencing

- **Nikki's A4 (auth spec format)** should land Monday/Tuesday so Jaliah's A5 (trips spec) can match the same conventions
- **Jaliah's A7 (CI)** depends on having an OpenAPI file to validate — so it needs to wait until at least A4 is in the repo (target: Tue EOD)
- **Emma's A1 (URL fix)** can happen any time but the mobile rebuild for the demo Fri depends on it being merged by Thu
- **A2 + A3 (Sentry)** are independent — Emma can do them in parallel with the other work

Critical path: A4 → A5/A7 → demo

---

## Standups

Daily 3-line update in `#chronicle-standup` by 10:00 AM.

| Day | Emma | Nikki | Jaliah |
|---|---|---|---|
| Mon | | | |
| Tue | | | |
| Wed | | | |
| Thu | | | |
| Fri | | | |

---

## Notes for the planning meeting

Walk through together Monday:
1. Confirm everyone has access to: GitHub repo, AWS console (read-only ok), Sentry org (Emma creates), Slack/Discord
2. Confirm working hours and timezone overlap
3. Confirm reviewer pairings (default in `TEAM.md`)
4. Open questions from `MARKETING.md` — get the team's input on target persona and monetization
5. Walk through `PROCESS.md` Definition of Done — agree on it before Sprint 1 work starts

---

## Sprint review

| Task | Owner | Status | Notes |
|---|---|---|---|
| A1 — API URL reconcile | Emma | ✅ Shipped | PR #1 merged. Canonical = `gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev`; 8 root `*.md` docs updated; `api.ts` already pointed at canonical. |
| A2 — Backend Sentry | Emma | ✅ Shipped (with caveat) | PR #5 merged. SDK initialized via `backend/utils/sentry_init.py`; `capture_exception` wired into the `@handle_errors` decorator; `GET /debug/sentry` route added. DSN + SDK path verified live via CloudShell (event landed in `chronicle-backend` Sentry project). **Lambda-runtime verification deferred** — `serverless deploy` failed against CloudFormation's 51,200-byte inline-template limit; `versionFunctions: false` didn't strip the `Lambda::Version` resources on Serverless Framework 3.40. Tech debt for Sprint 2. |
| A3 — Mobile Sentry | Emma | ✅ Shipped | PR #6 merged. `@sentry/react-native` ~7.2 installed + Expo config plugin registered. `Sentry.wrap(App)` in `App.tsx`. `__DEV__`-gated trigger on WelcomeScreen. End-to-end verified on iOS via Expo Go — deliberate error captured in `chronicle-mobile` Sentry project. Also did a drive-by `npx expo install --check` to fix a React/RN version-mismatch crash and removed broken `react-native-maps` config-plugin entry. |
| Marketing — domain + handles + positioning | Emma | 🚧 TBD | Confirm at Sprint 2 planning Monday — not in code, not visible from git. |
| A4 — Auth OpenAPI | Nikki | ✅ Shipped | `backend/openapi.yaml` covers `/auth/signup`, `/auth/login`, `/auth/confirm`, `/auth/resend` with schemas + examples. |
| A6 — Swagger UI | Nikki | ✅ Shipped | `docs/index.html` + `docs/openapi.yaml` + `infra/terraform/*` (Lambda@Edge basic auth, S3 static hosting). |
| A5 — Trips + AI OpenAPI | Jaliah | ✅ Shipped | Extended `backend/openapi.yaml` with `/trips/*` and `/ai/itinerary/generate` (+801 lines). |
| A7 — CI pipeline | Jaliah | ❌ Not shipped | No `.github/workflows/` on development. **Carryover to Sprint 2.** |
| A8 — Deploy doc | Jaliah | ✅ Shipped | `infrastructure/DEPLOY.md` (363 lines) covers dev vs staging deploy + env vars. |

**Shipped (7 of 9 engineering tasks):**
- A1 API URL reconcile, A2 Backend Sentry (with caveat), A3 Mobile Sentry, A4 Auth OpenAPI, A5 Trips+AI OpenAPI, A6 Swagger UI, A8 Deploy doc
- Bonus drive-by: repo cleanup PR (~54 files removed, 7,600 lines + 16 MB freed), `Sprint Plan/` folder added to repo

**Carryover to Sprint 2:**
- A7 — CI pipeline (Jaliah)
- A2 Lambda-runtime Sentry verification — naturally happens when the next successful backend deploy lands
- Backend serverless template-size fix (new task — block on any further backend deploys until resolved)
- Marketing — pending confirmation

**Dropped:**
- _none_

---

## Retro notes

### Keep
- **PRs target `development`, not `main`** — gave Sprint 1 a clean staging line; all 6 PRs merged without overwriting anyone's work.
- **Single-task PRs** — A1 alone, A2 alone, A3 alone. Easy to review, easy to revert in isolation.
- **CloudShell as fallback** when local AWS tooling is missing — kept A2 moving even when Emma's Mac had no `aws` CLI / `serverless` framework / IAM credentials.
- **Repo cleanup early in the sprint** — untangled tracked personal config (`.claude/`), leaked artifacts (`ai-layer/ziHrujBQ` 16MB zip), and 20+ AI-cruft status `.md` files before they obscured the diff.

### Change
- **Backend deploy is structurally brittle.** The serverless service has 30+ Lambdas and rendered template now exceeds CloudFormation's 51,200-byte inline limit. Means *any* change to the backend can't be deployed without fixing the template size first. Also: hardcoded Windows `pythonBin` path was blocking Mac/Linux contributors until A2.
- **Expo dep alignment is fragile.** Adding `@sentry/react-native` reshuffled `node_modules` and surfaced a pre-existing `react: 19.1.0 / react-native-renderer: 19.1.4` mismatch that crashed the app to a black screen. Fixed via `npx expo install --check` but only because we caught it during A3 verification.
- **No team-wide "first deploy works on every laptop" pre-flight.** Emma's Mac had no AWS CLI / serverless installed; AWS credentials weren't persisted. Lost ~2 hours to environment setup mid-sprint.

### Try (next 2 weeks)
- **Pre-flight checklist in `PROCESS.md`**: before claiming any backend task, the assignee runs `aws sts get-caller-identity` + `cd backend && serverless print` successfully. Catches creds + tooling gaps before the work starts.
- **A "deploy doctor" GitHub Action** — runs `serverless package` on every PR that touches `backend/` to fail-fast on template-size issues before merge.

### Action items
- [ ] **Jaliah** · finish A7 CI pipeline (carries to Sprint 2) · by Tue 2026-06-02 EOD
- [ ] **Jaliah (or whoever picks up the new tech-debt task)** · file backend template-size fix as a Sprint 2 task; explore `serverless-prune-versions` plugin, split service, or changesets · by Wed 2026-06-03
- [ ] **Emma** · confirm marketing track status at Mon planning; decide whether to keep on her column or split off
- [ ] **All** · sign off on the pre-flight checklist proposal at Mon planning before Sprint 2 work begins
