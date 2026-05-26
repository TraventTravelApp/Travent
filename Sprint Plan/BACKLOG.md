# Backlog

Full list of everything we know needs to happen, grouped by epic, roughly priority-ordered within each epic.

A task on the backlog isn't a commitment — it's a candidate. Sprint Planning pulls from here based on the increment's goal.

Legend: 🔥 critical · 📦 standard · 🧪 experimental · ❓ needs scoping

---

## Epic A — Foundations (Inc 1)

| ID | Task | Priority | Sprint |
|---|---|---|---|
| A1 | Resolve API Gateway URL mismatch between backend docs and `api.ts` | 🔥 | 1 |
| A2 | Set up Sentry on backend (serverless plugin) | 🔥 | 1 |
| A3 | Set up Sentry on mobile (Expo Sentry SDK) | 🔥 | 1 |
| A4 | Hand-write `openapi.yaml` for auth endpoints | 🔥 | 1 |
| A5 | Hand-write `openapi.yaml` for trips + AI itinerary endpoints | 🔥 | 1 |
| A6 | Stand up Swagger UI (internal-only) | 📦 | 1 |
| A7 | GitHub Actions CI: lint, spec validate, integration tests on PR | 🔥 | 1 |
| A8 | Document `serverless deploy` for staging vs dev | 📦 | 1 |
| A9 | Hand-write `openapi.yaml` for uploads, location, profile, settings | 🔥 | 2 |
| A10 | `openapi-typescript` codegen → `mobile/src/types/api.ts` | 🔥 | 2 |
| A11 | Cognito refresh-token flow in `auth.ts` (401 → refresh → retry) | 🔥 | 2 |
| A12 | Stand up separate `staging` serverless stage | 📦 | 2-3 |
| A13 | Integration tests run automatically in CI against staging | 📦 | 3 |
| A14 | Replace "Use Demo Data" fallback with real error UX | 📦 | 3 |
| A15 | Audit every screen for remaining hardcoded mock data | 📦 | 3 |
| A16 | Inc 1 bug bash — full end-to-end smoke with real accounts | 🔥 | 4 |
| A17 | ESLint config + autoformat on save | 📦 | 3-4 |

## Epic B — Finish core-loop wiring (Inc 1)

| ID | Task | Priority | Sprint |
|---|---|---|---|
| B1 | Wire ProfileScreen to `GET/PUT /profile` | 🔥 | 2 |
| B2 | Wire Settings to `GET/PUT /settings` | 🔥 | 2 |
| B3 | Wire EditActivitiesScreen to existing itinerary POI endpoints | 🔥 | 2 |
| B4 | Replace `mockTripData` in TripRouteViewScreen with real trip fetch | 🔥 | 2 |
| B5 | Replace `mockTripData` in TripMapViewScreen with real trip fetch | 🔥 | 2 |
| B6 | Replace `mockTripData` in TripDayListViewScreen with real trip fetch | 🔥 | 2 |
| B7 | Wire InterestQuizScreen to `POST /quiz/submit` (and/or reconcile with quiz_results on user) | 📦 | 3 |
| B8 | Wire ManualTripBuilderScreen to backend | 📦 | 3 |
| B9 | Finish TripListViewScreen (currently 1.1 KB stub) | ❓ | 3-4 |
| B10 | Wire trip date update to existing `PUT /trips/{id}` | 📦 | 2 |

## Epic C — Travel Diary (Inc 2)

| ID | Task | Priority | Sprint |
|---|---|---|---|
| C1 | OpenAPI spec for diary endpoints | 🔥 | 5 |
| C2 | `diary_entries` DynamoDB table | 🔥 | 5 |
| C3 | `POST /trips/{id}/diary` handler + tests | 🔥 | 5 |
| C4 | `GET /trips/{id}/diary` handler + tests | 🔥 | 5 |
| C5 | Add diary deploy to `serverless.yml` and ship | 🔥 | 5 |
| C6 | Integrate `expo-image-picker` | 🔥 | 6 |
| C7 | Wire photo upload to existing `POST /uploads/trip-photo` → S3 | 🔥 | 6 |
| C8 | Wire diary notes save to `POST /trips/{id}/diary` | 🔥 | 6 |
| C9 | Load existing entries from `GET /trips/{id}/diary` | 🔥 | 6 |
| C10 | Replace hardcoded `totalDays = 3` with real trip duration | 🔥 | 6 |
| C11 | Wire TripMemoriesScreen to real diary/photo data | 🔥 | 8 |

## Epic D — Friends + Sharing (Inc 2)

| ID | Task | Priority | Sprint |
|---|---|---|---|
| D1 | OpenAPI spec for friends endpoints | 🔥 | 7 |
| D2 | `friendships` DynamoDB table (user_id, friend_id, status, created_at) | 🔥 | 7 |
| D3 | `GET /friends` handler | 🔥 | 7 |
| D4 | `POST /friends/request` handler | 🔥 | 7 |
| D5 | `POST /friends/accept/{id}` handler | 🔥 | 7 |
| D6 | `DELETE /friends/{id}` handler | 🔥 | 7 |
| D7 | `POST /trips/{id}/share` handler | 🔥 | 7 |
| D8 | Wire FriendsScreen to `GET /friends` | 🔥 | 8 |
| D9 | Wire AddFriendScreen to `POST /friends/request` | 🔥 | 8 |
| D10 | Wire ShareTripScreen to `POST /trips/{id}/share` | 🔥 | 8 |
| D11 | Friend acceptance push notification | 📦 | 11 |

## Epic E — Polish & Reliability (Inc 3)

| ID | Task | Priority | Sprint |
|---|---|---|---|
| E1 | Form validation: signup | 🔥 | 9 |
| E2 | Form validation: login | 🔥 | 9 |
| E3 | Form validation: quiz | 📦 | 9 |
| E4 | Form validation: trip questionnaire | 🔥 | 9 |
| E5 | Form validation: profile | 📦 | 9 |
| E6 | Network retry logic in `api.ts` | 🔥 | 9 |
| E7 | Expired session → redirect to login | 🔥 | 9 |
| E8 | Loading skeletons (replace ActivityIndicator) | 📦 | 10 |
| E9 | Image caching (`expo-image`) | 📦 | 10 |
| E10 | Lazy load trip cards on HomeScreen | 📦 | 10 |
| E11 | Expo Push Notifications setup | 🔥 | 11 |
| E12 | Trip-created confirmation notification | 📦 | 11 |
| E13 | Pre-trip reminder notification | 📦 | 11 |
| E14 | Analytics integration (PostHog or Amplitude) | 🔥 | 11 |
| E15 | Track signup → first trip → diary funnel | 🔥 | 11 |
| E16 | Accessibility audit (labels, contrast, touch targets) | 📦 | 12 |
| E17 | Performance pass (slow renders) | 📦 | 12 |
| E18 | Internal beta build to TestFlight + Play internal | 🔥 | 12 |

## Epic F — Pre-Launch (Inc 4)

| ID | Task | Priority | Sprint |
|---|---|---|---|
| F1 | App Store Connect listing | 🔥 | 13 |
| F2 | Play Console listing | 🔥 | 13 |
| F3 | App description, keywords, subtitle | 🔥 | 13 |
| F4 | Privacy policy | 🔥 | 13 |
| F5 | Terms of service | 🔥 | 13 |
| F6 | App categories, age rating, content rating | 🔥 | 13 |
| F7 | Store screenshots (all device sizes) | 🔥 | 14 |
| F8 | Final app icon (all sizes) | 🔥 | 14 |
| F9 | App preview video | 📦 | 14 |
| F10 | EAS Build production iOS + Android | 🔥 | 14 |
| F11 | TestFlight external beta build | 🔥 | 14 |
| F12 | Landing page live (with waitlist) | 🔥 | 15 |
| F13 | Domain configured (chronicle.travel or chosen alt) | 🔥 | 15 |
| F14 | Social handles active (IG, TikTok) | 🔥 | 15 |
| F15 | First content posted | 📦 | 15 |
| F16 | Fix beta feedback | 🔥 | 16 |
| F17 | Submit to Apple App Store review | 🔥 | 16 |
| F18 | Submit to Google Play review | 🔥 | 16 |
| F19 | Outreach to 5-10 travel micro-influencers | 📦 | 16 |
| F20 | Launch comms prepared | 🔥 | 16 |

## Epic G — Launch & Traction (Inc 5)

| ID | Task | Priority | Sprint |
|---|---|---|---|
| G1 | Go live both stores | 🔥 | 17 |
| G2 | Waitlist launch email | 🔥 | 17 |
| G3 | Product Hunt launch (schedule Tues-Thu) | 🔥 | 17 |
| G4 | Posts in r/travel, r/solotravel, FB groups | 📦 | 17 |
| G5 | Sentry P0 fix loop | 🔥 | 18 |
| G6 | Read + respond to every review | 🔥 | 18 |
| G7 | Hotfix release if needed | 🔥 | 18 |
| G8 | Identify top 3 pain points from real users | 🔥 | 18 |
| G9 | ASO: keyword rankings + iteration | 📦 | 19 |
| G10 | Screenshot A/B test | 🧪 | 19 |
| G11 | Description rewrite based on user language | 📦 | 19 |
| G12 | Travel blog outreach | 📦 | 19 |
| G13 | "Hidden gems in [city]" content series launch | 🧪 | 19 |
| G14 | Drop-off analysis | 🔥 | 20 |
| G15 | Onboarding improvements (data-driven) | 🔥 | 20 |
| G16 | Re-engagement push campaigns | 📦 | 20 |
| G17 | Social share of itinerary screenshot | 📦 | 20 |
| G18 | NPS survey collection | 📦 | 20 |

## Epic H — Growth (Inc 6)

| ID | Task | Priority | Sprint |
|---|---|---|---|
| H1 | Referral system (perk on both sides) | 🔥 | 21 |
| H2 | "Share trip with friend" deep link | 🔥 | 21 |
| H3 | Public trip profiles (optional) | 🧪 | 21 |
| H4 | Collaborative trip editing | 🔥 | 22 |
| H5 | Notification on shared trip edit | 📦 | 22 |
| H6 | Activity voting (thumbs up/down) | 📦 | 22 |
| H7 | Group trip creation flow | 📦 | 22 |
| H8 | First paid UA experiment (Meta or TikTok) | 🧪 | 23 |
| H9 | Sponsored creator partnership(s) | 🧪 | 23 |
| H10 | "Best travel apps" roundup submissions | 📦 | 23 |
| H11 | V2 feedback compilation + prioritized backlog | 🔥 | 24 |

## Epic I — Tech debt cleanup (any sprint)

Pull one of these into any sprint with slack capacity.

| ID | Task | Priority |
|---|---|---|
| I1 | Reddit scraper for `/trips/{id}/recommendations` | 📦 |
| I2 | Persist trip costs to DynamoDB (`trip_planning.py:180`) | 📦 |
| I3 | Real PDF export (`reportlab` or `weasyprint`) | 📦 |
| I4 | Security review of AsyncStorage token encryption | 🔥 |
| I5 | Bedrock cost monitoring + alerts | 🔥 |
| I6 | Delete the 20+ stale markdown setup docs at repo root | 📦 |
| I7 | Empty `TripApp_AIChallange/frontend/` — delete or repurpose | 📦 |
| I8 | Reconcile InterestQuiz: backend has endpoint, mobile uses AsyncStorage | 📦 |
