# Sprint 02 — Finish Core-Loop Wiring

**Dates:** 2026-06-01 → 2026-06-05 (Mon → Fri)
**Increment:** Inc 1 — Foundations & Finish Core Loop
**Sprint goal:** Wire the mobile screens whose backend already exists (Profile, Settings, EditActivities, map screens), add Cognito refresh, finish the OpenAPI spec, ship typed API client.

---

## Demo target (Friday 2026-06-05)

- [ ] Profile screen round-trips: edit name → save → reload → still there
- [ ] Settings screen round-trips with at least one toggle persisted
- [ ] Editing an activity in EditActivitiesScreen persists across app reload
- [ ] Opening any trip from HomeScreen shows that trip's real itinerary in TripRouteView, TripMapView, and TripDayListView (no more mock data)
- [ ] Expired JWT auto-refreshes via Cognito refresh token; user stays logged in
- [ ] `mobile/src/types/api.ts` exists and is generated from `openapi.yaml`

---

## Task assignments

### Emma
- [ ] **B1** Wire `ProfileScreen` to `GET /profile` (on mount) and `PUT /profile` (on save). Use the new generated types from `mobile/src/types/api.ts`. Add loading + error states per Definition of Done.
- [ ] **B2** Wire Settings to `GET /settings` / `PUT /settings`. Same DoD.
- [ ] **A11** Cognito refresh-token flow in `TripApp_AIChallange/mobile/src/services/auth.ts`. On 401 from any API call, attempt refresh via `InitiateAuth` with `REFRESH_TOKEN_AUTH`, retry the original request once, log out on failure.
- [ ] **B10** Wire trip date update from HomeScreen date-change modal to existing `PUT /trips/{trip_id}`.
- [ ] **Marketing:** Publish the positioning doc to the team. Draft 10 content-series ideas tied to the value prop. Pick a posting tool (Buffer / Later / Metricool) and create the account.

### Nikki
- [ ] **A9** Hand-write OpenAPI entries for the remaining endpoints: uploads (`/uploads/*`, `GET /trips/{id}/photos`), location (`/location/search`), profile (`GET/PUT /profile`), settings (`GET/PUT /settings`), itinerary edits (`/trips/{id}/itinerary/*`), trip planning (`/trips/{id}/recommendations`, `/trips/{id}/costs`), and quiz (`/quiz/*`).
- [ ] **A10** Add `openapi-typescript` to mobile dev dependencies. Add an npm script `generate:api-types` that runs `openapi-typescript ../../backend/openapi.yaml -o src/types/api.ts`. Run it, commit the generated file.
- [ ] Wire the codegen step into CI — fail PR if `api.ts` is out of date with `openapi.yaml`. Pair with Jaliah on the CI tweak.

### Jaliah
- [ ] **B3** Wire `EditActivitiesScreen` to existing itinerary POI endpoints: `POST /trips/{id}/itinerary/pois`, `PUT /trips/{id}/itinerary/pois/{poi_id}`, `DELETE /trips/{id}/itinerary/pois/{poi_id}`. Replace `mockActivities` constant.
- [ ] **B4** Replace `mockTripData` in `TripRouteViewScreen` with `GET /trips/{tripId}` fetch.
- [ ] **B5** Same for `TripMapViewScreen`.
- [ ] **B6** Same for `TripDayListViewScreen`.
- [ ] **Stretch (A12 start):** Begin standing up a separate `staging` serverless stage if Sprint 1 work allows. (Carries over to Sprint 3 if needed.)

---

## Dependencies / sequencing

- **A9 (remaining OpenAPI)** should land Tue so Emma can use generated types for B1/B2 starting Wed
- **A10 (codegen)** depends on A9 being merged
- **B3/B4/B5/B6** can proceed in parallel with the OpenAPI work — they don't require new types since the endpoints' shapes are known from the backend handlers
- **A11 (refresh tokens)** is independent — Emma can do anytime
- **Marketing tasks** are independent

---

## Standups

| Day | Emma | Nikki | Jaliah |
|---|---|---|---|
| Mon | | | |
| Tue | | | |
| Wed | | | |
| Thu | | | |
| Fri | | | |

---

## Sprint review (fill in Friday)

| Task | Owner | Status | Notes |
|---|---|---|---|
| B1 — ProfileScreen wire | Emma | | |
| B2 — Settings wire | Emma | | |
| A11 — Cognito refresh | Emma | | |
| B10 — Trip date update | Emma | | |
| Marketing — content ideas + tool | Emma | | |
| A9 — Remaining OpenAPI | Nikki | | |
| A10 — TS codegen | Nikki | | |
| B3 — EditActivities wire | Jaliah | | |
| B4 — TripRouteView wire | Jaliah | | |
| B5 — TripMapView wire | Jaliah | | |
| B6 — TripDayListView wire | Jaliah | | |
| A12 — Staging stage (stretch) | Jaliah | | |

**Shipped:**
- _list Friday_

**Carryover to next sprint:**
- _list Friday_

**Dropped (with reason):**
- _list Friday_
