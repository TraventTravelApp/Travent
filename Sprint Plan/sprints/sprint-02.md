# Sprint 02 — Finish Core-Loop Wiring

| | |
|---|---|
| **Dates** | 2026-06-01 → 2026-06-05 (Mon → Fri) |
| **Increment** | Inc 1 — Foundations & Finish Core Loop |
| **Sprint Goal** | Wire the mobile screens whose backend already exists (Profile, Settings, EditActivities, all three trip-view screens), add Cognito refresh-token flow, finish the OpenAPI spec, ship typed API client. Clear Sprint 1 carryovers (CI pipeline + backend template-size unblock) before any new backend work. |

---

## 🎯 Demo Targets (Friday, June 5)

By end of sprint, the following must be live and demonstrable:

- [ ] Profile screen round-trips: edit name → save → reload → still there
- [ ] Settings screen round-trips with at least one toggle persisted
- [ ] Editing an activity in `EditActivitiesScreen` persists across app reload
- [ ] Opening any trip from HomeScreen shows that trip's real itinerary in `TripRouteView` — no more `mockTripData` *(TripMapView + TripDayListView are stretch this sprint)*
- [ ] Expired JWT auto-refreshes via Cognito refresh token; user stays logged in across an hour-long session
- [ ] `mobile/src/types/api.ts` exists, is generated from `backend/openapi.yaml`, and CI fails if it drifts
- [ ] GitHub Actions CI green on a sample PR — lint + spec validate + integration tests (Sprint 1 carryover)
- [ ] One successful `serverless deploy --stage dev` against the trimmed-down backend stack; Sentry catches a deliberate error from a *running Lambda* (closes Sprint 1 A2 caveat)

---

## 📋 Task Assignments

### Emma (5 tasks · ~16 hrs) · zero hard blockers

- **B1** Wire `ProfileScreen` to `GET /profile` (on mount) and `PUT /profile` (on save). Define response/request types inline in `mobile/src/services/api.ts` next to the existing endpoints — the backend handlers in `backend/handlers/profile.py` are the source of truth. Loading + error states per Definition of Done. (If Nikki's A10 codegen lands before Fri, swap inline types for the generated ones as a small follow-up PR; not required to ship B1.)
- **B2** Wire `SettingsScreen` to `GET /settings` / `PUT /settings`. Same pattern — inline types from `backend/handlers/profile.py`. Same DoD.
- **A11** Cognito refresh-token flow in `mobile/src/services/auth.ts`. On 401 from any API call: attempt refresh via `InitiateAuth` with `REFRESH_TOKEN_AUTH`, retry the original request once, log out on failure.
- **B10** Wire trip date update from HomeScreen date-change modal to existing `PUT /trips/{trip_id}`.
- **Marketing** — Publish positioning doc. Draft 10 content-series ideas tied to value prop. Pick a posting tool (Buffer / Later / Metricool) and create the account. *(Carries Sprint 1 marketing forward if domain/handles aren't done — confirm at Mon planning.)*

### Nikki (5 tasks · ~15 hrs)

- **A9a** OpenAPI for uploads + location + quiz: `/uploads/*`, `GET /trips/{id}/photos`, `/location/search`, `/quiz/*`.
- **A9b** OpenAPI for profile + settings: `GET/PUT /profile`, `GET/PUT /settings`.
- **A9c** OpenAPI for itinerary edits + trip planning: `/trips/{id}/itinerary/*`, `/trips/{id}/recommendations`, `/trips/{id}/costs`.
- **A10** Add `openapi-typescript` to mobile dev dependencies. New npm script `generate:api-types` runs `openapi-typescript ../../backend/openapi.yaml -o src/types/api.ts`. Run it, commit the generated file.
- ⚡ **Pair with Jaliah Mon/Tue on CI** — wire codegen check so CI fails if `api.ts` drifts from `openapi.yaml`.

### Jaliah (4 core + 2 stretch · ~15 hrs core)

- **A7 (carryover)** Set up GitHub Actions CI in `.github/workflows/ci.yml`:
  - Trigger on PR to `main` AND `development`
  - Job 1: `ruff` or `flake8` on `backend/` + `ai-layer/`
  - Job 2: validate `backend/openapi.yaml` (Redocly CLI per Nikki's pick)
  - Job 3: run `backend/tests/integration_test.py` against test Cognito user (repo secrets: `TEST_EMAIL`, `TEST_PASSWORD`, `API_URL`)
  - Job 4 (new): `serverless package --stage dev` — fail-fast on template-size or yaml issues before merge
- **A12 (new)** Unblock backend deploys. Backend serverless service hit CloudFormation's 51,200-byte inline-template limit during Sprint 1's A2 work. Pick one of (a) install `serverless-prune-versions` + delete old Lambda versions, (b) split the service into `auth`, `trips`, `uploads` sub-stacks, (c) switch deploy method to S3-uploaded template via changesets. Document choice in `infrastructure/DEPLOY.md`. **Verify by doing one successful `serverless deploy --stage dev` + hitting `GET /debug/sentry` and confirming the error lands in `chronicle-backend` Sentry (closes Sprint 1 A2 caveat).**
- **B4** Replace `mockTripData` in `TripRouteViewScreen` with `GET /trips/{tripId}` fetch.
- **B3** Wire `EditActivitiesScreen` to `POST /trips/{id}/itinerary/pois`, `PUT .../{poi_id}`, `DELETE .../{poi_id}`. Replace `mockActivities`.
- **Stretch B5** Same fetch pattern for `TripMapViewScreen` (if A7+A12 land by Wed EOD).
- **Stretch B6** Same fetch pattern for `TripDayListViewScreen` (if B5 also lands).

---

## 🔗 Dependencies & Critical Path

> **A12 → A7 → all backend deploys** · **All B-tasks have backend handlers already in place** · **Nobody waits on anyone for their core deliverable**

- **A12 (template-size unblock)** is the highest-priority work in the sprint — the team can't deploy *any* backend change until it's resolved. Target: Mon/Tue.
- **A7 (CI carryover)** lands Tue. CI's `serverless package` job depends on A12 actually succeeding.
- **All B-tasks (B1-B6, B10) are independent of the OpenAPI work.** Endpoint shapes are already known from the deployed backend handlers; we use inline types in `api.ts` for now and let A10's codegen replace them as a follow-up if/when it lands. This way Nikki's pace doesn't gate Emma's or Jaliah's screens.
- **A9a/b/c → A10** is its own internal chain on Nikki's side. If A10 lands by Fri, swap inline types → generated types in tiny follow-up PRs (low risk; same shapes). If not, it carries to Sprint 3 with zero blast radius.
- **A11 (Cognito refresh)** independent; Emma can pick any day.
- **Marketing** independent — Mon planning confirms whether it's still needed this sprint.
- **B5/B6 stretch** only pulled in if A7 + A12 land by Wed EOD. Otherwise they carry to Sprint 3.

---

## 🗣️ Daily Standups

Post a 3-line update in `#chronicle-standup` by 10:00 AM each day.

| Day | Emma | Nikki | Jaliah |
|---|---|---|---|
| Mon | | | |
| Tue | | | |
| Wed | | | |
| Thu | | | |
| Fri | | | |

---

## 📅 Planning Meeting Agenda (Monday)

Walk through together at 9:00 AM:

1. **Sprint 1 retro recap** (5 min) — confirm action items from `sprint-01.md` are accepted: pre-flight deploy checklist, marketing status, A7 + A12 sequencing on Jaliah's plate.
2. **Confirm reviewer pairings** — Emma reviews Jaliah's PRs; Nikki reviews Emma's PRs; Jaliah reviews Nikki's PRs (or as set in `TEAM.md`).
3. **Marketing decision** — domain + handles + positioning doc status. If incomplete from Sprint 1, decide: extend on Emma's column this sprint, or split off to a marketing-only week.
4. **A12 approach pre-vote** — Jaliah walks through the three options (prune-versions plugin / split service / changesets) and the team picks one before she starts. Avoids mid-sprint rework.
5. **Definition of Done refresh** — same as Sprint 1, with one addition: every PR touching `backend/` must include a passing `serverless package` step in the CI job (added in A7).
6. **Open questions from `MARKETING.md`** — re-raise target persona + monetization if not resolved in Sprint 1.

---

## ✅ Sprint Review (fill in Friday)

| Task ID | Description | Owner | Status | Notes |
|---|---|---|---|---|
| B1 | Profile screen wire | Emma | | |
| B2 | Settings screen wire | Emma | | |
| A11 | Cognito refresh | Emma | | |
| B10 | Trip date update | Emma | | |
| Marketing | Positioning doc + content ideas + tool | Emma | | |
| A9a | Uploads/Location/Quiz OpenAPI | Nikki | | |
| A9b | Profile/Settings OpenAPI | Nikki | | |
| A9c | Itinerary/Planning OpenAPI | Nikki | | |
| A10 | TS codegen | Nikki | | |
| A7 | CI pipeline (carryover) | Jaliah | | |
| A12 | Backend template-size unblock | Jaliah | | |
| B3 | EditActivities wire | Jaliah | | |
| B4 | TripRouteView wire | Jaliah | | |
| B5 | TripMapView wire (stretch) | Jaliah | | |
| B6 | TripDayListView wire (stretch) | Jaliah | | |

**Shipped**
- _list Friday_

**Carryover to Sprint 3**
- _list Friday_

**Dropped (with reason)**
- _list Friday_

---

## 🔄 Retrospective Notes (Friday)

### Keep — what worked
- _list Friday_

### Change — what's friction
- _list Friday_

### Try — one experiment for next 2 weeks
- _list Friday_

### Action items
- [ ] who · what · by when
