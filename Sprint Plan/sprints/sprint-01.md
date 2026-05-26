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

## Sprint review (fill in Friday)

| Task | Owner | Status | Notes |
|---|---|---|---|
| A1 — API URL reconcile | Emma | | |
| A2 — Backend Sentry | Emma | | |
| A3 — Mobile Sentry | Emma | | |
| Marketing — domain + handles + positioning | Emma | | |
| A4 — Auth OpenAPI | Nikki | | |
| A6 — Swagger UI | Nikki | | |
| A5 — Trips + AI OpenAPI | Jaliah | | |
| A7 — CI pipeline | Jaliah | | |
| A8 — Deploy doc | Jaliah | | |

**Shipped:**
- _list Friday_

**Carryover to next sprint:**
- _list Friday_

**Dropped (with reason):**
- _list Friday_

---

## Retro notes (Friday — first retro of the project)

### Keep
- _what worked_

### Change
- _what's friction_

### Try (next 2 weeks)
- _one experiment_

### Action items
- [ ] who · what · by when
