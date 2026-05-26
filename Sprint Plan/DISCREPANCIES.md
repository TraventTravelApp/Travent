# Discrepancies — What Changed vs. The Original PDF

The original `6 Increment Timeline.pdf` was written without access to the current codebase. This is a record of what changed in the restructure and why, so anyone (the original author included) can see the reasoning.

## TL;DR

The original Increment 1 (W1-W4: "Core Loop — Make It Real") is **mostly already done**. Backend is deployed with 27 endpoints, Cognito auth works end-to-end, the AI itinerary flow is wired, and AWS Location Services is integrated. So Inc 1 has been re-purposed as **Foundations & Finish Core Loop** instead of "build the core loop from scratch."

## Item-by-item

### Increment 1 — "Core Loop"

| Original task | Status | New plan |
|---|---|---|
| Set up AWS credentials and env vars | ✅ done | — |
| Deploy backend with `serverless deploy` | ✅ done | — |
| Verify all Lambda functions are live | ✅ done — 27 functions live | — |
| Create DynamoDB tables (users, trips, travel-pois) | ✅ done | — |
| Create S3 bucket for uploads | ✅ done | — |
| Smoke test auth endpoints | ✅ done — `auth/signup, /confirm, /login, /resend` working | — |
| Set `API_BASE_URL` in `api.ts` | ⚠️ done but **URL mismatch with backend docs** | Sprint 1 task: reconcile |
| Wire `.env` with Cognito pool ID, client ID, region | ✅ done | — |
| Full auth flow test in app | ✅ done | — |
| Replace `MOCK_TRIPS` on HomeScreen with real `GET /trips` | ✅ done | — |
| Handle empty state gracefully | ✅ done | — |
| Connect TripQuestionnaireScreen to `POST /trips` | ✅ done | — |
| Connect to `POST /ai/itinerary/generate` | ✅ done | — |
| Wire TripPreviewScreen to real AI data | ⚠️ partial — still has `mockTripData` fallback | Sprint 3 task |
| Loading state during AI generation | ✅ done (ActivityIndicator) | Sprint 10: upgrade to skeleton |
| Error handling from AI layer | ⚠️ done but has "Use Demo Data" fallback that hides bugs | Sprint 3: replace |
| Fix date picker (TextInput → DateTimePicker) | ✅ already using DateTimePicker — was misdiagnosed | — |
| Wire delete trip to `DELETE /trips/{id}` | ✅ done | — |
| Wire trip update (date change) to `PUT /trips/{id}` | ⚠️ endpoint exists, mobile incomplete | Sprint 2 task |
| End-to-end test | Manual only — no automated coverage in CI | Sprint 1: CI setup |

**Net change:** ~80% of Inc 1 is done. The 20% remaining gets folded into Sprints 2-3 of the new Inc 1, freeing the rest for OpenAPI/CI/Sentry/staging — things the original plan never included but are essential for a 3-person team to move fast.

### Increment 2 — "Feature Completion" (Diary + Friends)

This increment is **still entirely accurate**. None of the diary or friends work has been done. Friends UI shows `mockFriends` (Sarah Chen, Mike Torres, Emma Rodriguez), diary screen has a TODO for the photo picker.

**Change:** spec-first now — write OpenAPI entry for each endpoint before the handler. Lets Emma start mobile wiring in parallel.

**Bonus discovery the original plan missed:** `GET/PUT /profile` and `GET/PUT /settings` endpoints **already exist** on the backend. Original plan put these in W8; we can wire them in **Sprint 2** since the backend is done.

### Increment 3 — "Polish & Stability"

Mostly still accurate. Two changes:

1. **Sentry moves up to Inc 1** (Sprint 1). The original put Sentry in W11; we want it from day 1 so that when we ship Diary and Friends we can see what breaks.
2. **Mock data audit (W9 task)** moves up to Sprint 3, alongside replacing the "Use Demo Data" pattern.

### Increment 4 — "Pre-Launch"

Accurate. Adding two items:
- Domain purchase moves to **Sprint 1** (in Marketing) instead of W15 — domains can be bought before features ship, and registering early is cheap insurance.
- Social handle reservations move to **Sprint 1** for the same reason.

### Increment 5 — "Launch & Early Traction"

Accurate. No structural changes.

### Increment 6 — "Growth"

Accurate. No structural changes.

## Things the original plan missed that we've added

- **OpenAPI / Swagger contract** — critical for parallel work between Nikki, Jaliah, and the mobile side. (Sprint 1)
- **CI/CD pipeline** — original plan had no CI, just "manual smoke tests." (Sprint 1)
- **Separate staging environment** — original plan only had `dev` stage. (Sprint 2-3)
- **Cognito refresh tokens** — without these, users get silently logged out when JWT expires. (Sprint 2)
- **Map screens** (TripRouteView, TripMapView, TripDayListView) — original plan mentioned the data flow but didn't list these specific screens as needing un-mocking. (Sprint 2)
- **EditActivitiesScreen wiring** — backend itinerary edit endpoints exist; original plan listed this as W9 work but it can be Sprint 2 since the backend is ready.
- **API URL mismatch** — backend docs and frontend `api.ts` point at different Gateway URLs. (Sprint 1)
- **Bedrock cost monitoring** — AI itinerary calls can rack up costs fast under load. (tech debt epic)
- **Security review of token encryption** — custom AsyncStorage crypto needs a second look. (tech debt epic)

## Things we're consciously deferring vs the original plan

- **PDF export** (handler stub exists) — punted to tech debt epic, not blocking launch
- **Reddit scraper for recommendations** — same
- **Trip costs persistence** — calculated correctly, just not saved
- **Public web frontend** — `TripApp_AIChallange/frontend/` is empty; mobile-only for v1

## How this plan stays accurate

This `DISCREPANCIES.md` is a one-time reconciliation document. Going forward, we update `CURRENT_STATE.md` at the start of each increment so the team always has an accurate snapshot, and `ROADMAP.md` if priorities shift mid-flight.
