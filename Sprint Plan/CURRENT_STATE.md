# Current State — Codebase Snapshot

Audited 2026-05-25. This is what's actually built right now — the source of truth for what Sprint 1 picks up.

## Repository layout

```
Chronicle1/
├── backend/               — Python + Serverless Framework (AWS Lambda)
│   ├── handlers/          — 27 Lambda functions (auth, trips, AI, uploads, profile, location, ...)
│   ├── services/          — business logic
│   ├── utils/             — auth_utils, etc.
│   ├── tests/             — integration_test.py
│   └── serverless.yml     — function & resource definitions
├── ai-layer/              — Python + Serverless, separate stack
│   ├── handlers/itinerary.py
│   └── services/          — claude_service, prompt_builder, itinerary_parser, itinerary_validator
├── TripApp_AIChallange/
│   ├── mobile/            — React Native + Expo app (the real frontend)
│   │   └── src/
│   │       ├── screens/   — 20 screens
│   │       └── services/  — api.ts, auth.ts
│   └── frontend/          — empty (web frontend never built)
├── infrastructure/        — dynamodb_tables.py, COGNITO_SETUP.md, etc.
├── scraper/               — placeholder for Reddit scraper (TODO in trip_planning.py)
└── scripts/               — misc setup scripts
```

## Backend — DEPLOYED & LIVE

**API Gateway:** `https://1w6itm4sqj.execute-api.us-east-1.amazonaws.com/dev` (per `BACKEND_DEPLOYED.md`)
**Frontend points at:** `https://gaq4nwm4l6.execute-api.us-east-1.amazonaws.com/dev` (per `mobile/src/services/api.ts`)
**⚠️ MISMATCH — Sprint 1 must resolve this.** One of these is stale.

### Endpoints (27 total, all deployed)

| Domain | Endpoints | Status |
|---|---|---|
| **Auth** | `POST /auth/signup`, `/auth/login`, `/auth/confirm`, `/auth/resend` | ✅ Live, wired to mobile |
| **Quiz** | `POST /quiz/submit`, `GET /quiz` | ✅ Live, mobile uses AsyncStorage instead — needs review |
| **Trips** | `POST/GET /trips`, `GET/PUT/DELETE /trips/{id}` | ✅ Live, wired |
| **AI itinerary** | `POST /ai/itinerary/generate` (25s timeout, Bedrock Claude Sonnet 4.6) | ✅ Live, wired |
| **Itinerary edit** | `POST/PUT/DELETE /trips/{id}/itinerary/pois/{id}`, `POST /trips/{id}/itinerary/reorder` | ✅ Live, **mobile not wired (uses mocks)** |
| **Trip planning** | `GET /trips/{id}/recommendations`, `/trips/{id}/costs` | ⚠️ Live but stubbed (recommendations returns empty, costs not persisted) |
| **Uploads** | `POST /uploads/profile-photo`, `/trip-photo`, `/poi-image`, `/itinerary-pdf`; `GET /trips/{id}/photos`; `DELETE /uploads` | ✅ Live (PDF is placeholder), mobile not yet using |
| **Location** | `GET /location/search` (AWS Location Service) | ✅ Live, wired in TripQuestionnaireScreen |
| **Profile + settings** | `GET/PUT /profile`, `GET/PUT /settings` | ✅ Live, **mobile not wired** |

### Data tables (DynamoDB)
- `users` (PK: `user_id`, GSI: `email-index`) ✅
- `trips` (PK: `trip_id`, GSI: `user-index`) ✅
- `trip-photos` (composite: `trip_id` + `photo_id`) ✅
- `travel-pois` (referenced in IAM) ✅
- **Missing:** `diary_entries` (needs to be created in Inc 2 Sprint 5)
- **Missing:** `friendships` (needs to be created in Inc 2 Sprint 7)

### Auth (Cognito)
- User Pool ID: `us-east-1_fN4gzHqjT`
- Client ID: `1cdvnej2kel3nofdnp5bo2ftt8`
- Signup → email confirmation → login → JWT works end-to-end
- **Missing:** refresh token flow (Sprint 2 task)

### AI layer (separate stack)
- Bedrock Claude Sonnet 4.6 with fallback to 3.5 Sonnet
- Retry on validation failure (up to 2 attempts)
- Supports `location` and `roadtrip` modes
- Wired through `/ai/itinerary/generate` endpoint

### Tech debt / known TODOs
- `trip_planning.py:165` — Reddit scraper for recommendations (returns empty)
- `trip_planning.py:180` — trip costs not persisted to DynamoDB
- `uploads.py:210` — PDF export is a placeholder (no reportlab/weasyprint)
- No CI/CD pipeline
- No OpenAPI spec (Sprint 1 will introduce)
- No `staging` stage separate from `dev`
- Integration tests exist but unclear if they run automatically

## Mobile (React Native + Expo)

**Stack:** Expo SDK 54, React Native, TypeScript 5.9, React Navigation v7, NativeWind (Tailwind), AsyncStorage for token persistence.

### Screens — status table

| Screen | Status | Notes |
|---|---|---|
| WelcomeScreen | ✅ UI complete | |
| LoginScreen | ✅ Wired | Calls `/auth/login` |
| SignupScreen | ✅ Wired | Calls `/auth/signup`, `/auth/confirm` |
| InterestQuizScreen | ⚠️ UI only | Saves to AsyncStorage, never reaches `/quiz/submit` |
| HomeScreen | ✅ Wired | `GET /trips` |
| NewTripScreen | ✅ UI stub | Trip type selector |
| TripQuestionnaireScreen | ✅ Wired | `POST /ai/itinerary/generate` + location autocomplete |
| TripPreviewScreen | ⚠️ Partial | Calls `/trips/{id}` but has `mockTripData` fallback |
| EditActivitiesScreen | ❌ Mock | `mockActivities` hardcoded — **backend endpoints exist, not wired** |
| TripRouteViewScreen | ❌ Mock | `mockTripData` hardcoded |
| TripMapViewScreen | ❌ Mock | `mockTripData` hardcoded |
| TripDayListViewScreen | ❌ Mock | `mockTripData` hardcoded |
| TravelDiaryScreen | ❌ Missing | No `expo-image-picker`, Alert "will be implemented" |
| TripMemoriesScreen | ❌ Mock | Hardcoded entries |
| ProfileScreen | ❌ Stub | Local state only — **backend endpoints exist, not wired** |
| FriendsScreen | ❌ Mock | `mockFriends` (Sarah Chen, Mike Torres, Emma Rodriguez) |
| AddFriendScreen | ❌ Mock | `mockSuggestedFriends` |
| ShareTripScreen | ❌ Mock | `mockTrips` |
| ManualTripBuilderScreen | ❌ Stub | `TODO: Save trip to backend` |
| TripListViewScreen | ❌ Stub | 1.1 KB placeholder |

### Mobile-side tech debt
- 13 `TODO` / `FIXME` comments across screens
- API URL hardcoded as fallback in `api.ts`
- No ESLint configuration
- Custom token encryption in AsyncStorage (review for security)
- "Use Demo Data" fallback button on errors hides real bugs
- 8+ screens have mock-data fallbacks

## What works end-to-end today

1. ✅ New user signs up → confirms email → logs in → reaches HomeScreen with empty state
2. ✅ Fills out trip questionnaire → AI generates itinerary in 10-20s → views in TripPreview
3. ✅ Sees real trip list on HomeScreen after creating one
4. ✅ Can delete a trip
5. ✅ Location autocomplete works (AWS Location Service)

## What's broken / mocked end-to-end

1. ❌ Can't edit individual activities and have it persist
2. ❌ Can't update trip dates
3. ❌ Can't save/view diary entries or photos
4. ❌ Can't add friends or share trips
5. ❌ Can't update profile or settings
6. ❌ Map/route views show fake data regardless of which trip you opened
7. ❌ Session expires after JWT TTL (no refresh) → silent failure
