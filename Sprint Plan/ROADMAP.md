# Roadmap — 6 Increments, 24 Weeks

**Start:** 2026-05-25 · **Target launch:** end of Week 16 (~2026-09-14) · **End:** end of Week 24 (~2026-11-09)

Each increment is 4 sprints (4 weeks). Sprint 1-2 are detailed in `sprints/`. The rest are sketched here and planned in real Sprint Planning meetings.

---

## Increment 1 — Foundations & Finish Core Loop  (Sprints 1-4 · 2026-05-25 → 2026-06-19)

The original "Increment 1: Core Loop" is already done. This Inc 1 lays the foundations that make every subsequent sprint faster and finishes the dangling Inc-1-era wiring.

| Sprint | Focus |
|---|---|
| **Sprint 1** (W1) | OpenAPI foundation (auth + trips + AI spec), Swagger UI, GitHub Actions CI, Sentry on backend + frontend, resolve API URL mismatch, marketing positioning doc |
| **Sprint 2** (W2) | Finish OpenAPI spec (uploads, location, profile, settings), TypeScript codegen for mobile, wire ProfileScreen + Settings to existing backend, wire EditActivitiesScreen to existing itinerary endpoints, kill mocks in map screens, Cognito refresh tokens |
| **Sprint 3** (W3) | Staging stack separate from dev, integration tests in CI against staging, replace "Use Demo Data" fallback with real error UX, audit every screen for remaining mock data |
| **Sprint 4** (W4) | Inc 1 hardening sprint: bug bash on the entire core loop end-to-end with real accounts, fix all P0/P1, lock down API contract for downstream Diary/Friends work |

**Exit criteria:**
- All existing endpoints documented in OpenAPI
- CI green on every PR (lint + spec validate + integration tests)
- Sentry capturing errors from both frontend and backend
- No `mock*` constants remaining in any production screen
- ProfileScreen, Settings, EditActivitiesScreen all hit real backend
- Staging environment usable for QA

---

## Increment 2 — Travel Diary + Friends  (Sprints 5-8 · 2026-06-22 → 2026-07-17)

The two big missing feature areas.

| Sprint | Focus |
|---|---|
| **Sprint 5** (W5) | Diary backend: spec → table → endpoints (`POST /trips/{id}/diary`, `GET /trips/{id}/diary`). Photo upload endpoint already exists — verify and wire it. |
| **Sprint 6** (W6) | Diary frontend: integrate `expo-image-picker`, wire photo upload to existing S3 endpoint, wire diary notes save/load, replace hardcoded `totalDays = 3` with real trip data. |
| **Sprint 7** (W7) | Friends backend: spec → `friendships` table → endpoints (`GET /friends`, `POST /friends/request`, `POST /friends/accept/{id}`, `DELETE /friends/{id}`, `POST /trips/{id}/share`). |
| **Sprint 8** (W8) | Friends frontend: wire FriendsScreen, AddFriendScreen, ShareTripScreen. Wire TripMemoriesScreen to real diary/photo data. |

**Exit criteria:**
- User can save diary entries with photos for a trip and revisit them
- User can send/accept friend requests and share a trip
- Zero `mockFriends` / `mockSuggestedFriends` / `mockPreviousEntries` references

---

## Increment 3 — Polish, Validation, Reliability  (Sprints 9-12 · 2026-07-20 → 2026-08-14)

Make the app feel solid. End with internal beta.

| Sprint | Focus |
|---|---|
| **Sprint 9** (W9) | Form validation across all inputs (signup, login, quiz, questionnaire, profile). Network retry logic in `api.ts`. Expired-session → redirect to login. |
| **Sprint 10** (W10) | Loading skeletons replace raw spinners across the app. Image caching (`expo-image`). Lazy load trip cards. |
| **Sprint 11** (W11) | Expo Push Notifications (trip confirmation, reminder before trip start). Analytics (PostHog or Amplitude) — track signup → first trip → diary funnel. |
| **Sprint 12** (W12) | Accessibility audit (labels, contrast, touch targets), performance pass (slow renders). **Internal beta:** distribute via TestFlight + Play Store internal track. |

**Exit criteria:**
- Internal beta build distributed to 5-10 friendly testers
- Analytics funnel data flowing
- Sentry crash-free sessions > 99%

---

## Increment 4 — Pre-Launch  (Sprints 13-16 · 2026-08-17 → 2026-09-11)

Store assets, legal, landing page, and submission.

| Sprint | Focus |
|---|---|
| **Sprint 13** (W13) | App Store Connect + Play Console listings created. Privacy policy + ToS drafted. Categories/age/content ratings set. |
| **Sprint 14** (W14) | Store assets: screenshots for all device sizes, app icon finals, optional preview video. EAS Build production iOS + Android. Submit first build to TestFlight external beta. |
| **Sprint 15** (W15) | **Landing page** live (Framer/Webflow/HTML) with waitlist email capture. Social accounts active (Instagram, TikTok). First content posted. |
| **Sprint 16** (W16) | Fix beta feedback. Submit to Apple review (budget 1-2 weeks). Submit to Google Play (1-3 days). Prep launch comms. Outreach to 5-10 travel micro-influencers. |

**Exit criteria:**
- App submitted to both stores
- Landing page live, waitlist collecting emails
- Launch-day content prepared and scheduled

---

## Increment 5 — Launch & Early Traction  (Sprints 17-20 · 2026-09-14 → 2026-10-09)

| Sprint | Focus |
|---|---|
| **Sprint 17** (W17) | **Launch week.** Go live both stores. Waitlist email. Product Hunt (schedule Tues-Thu). Posts in r/travel, r/solotravel, travel FB groups. |
| **Sprint 18** (W18) | Feedback sprint: Sentry P0s same-day, read every review/email, identify top 3 pain points, hotfix if needed, respond to every review. |
| **Sprint 19** (W19) | ASO: keyword analysis, screenshot A/B test, description iteration. Travel blog outreach. "Hidden gems in [city]" content series launch. |
| **Sprint 20** (W20) | Retention: drop-off analysis, onboarding improvements where funnel leaks, push notification re-engagement campaign, "share your trip" social sharing, NPS collection. |

---

## Increment 6 — Growth  (Sprints 21-24 · 2026-10-12 → 2026-11-06)

| Sprint | Focus |
|---|---|
| **Sprint 21** (W21) | Referral system (invite a friend → both get a perk, e.g. extra AI generations). "Share trip with a friend" deep link flow. Optional: public trip profiles. |
| **Sprint 22** (W22) | Collaborative trip planning: shared trip editing, notifications when a friend edits, activity voting (thumbs up/down), group trip creation flow. |
| **Sprint 23** (W23) | First paid ad experiment (Meta or TikTok, small budget). Double down on organic content that's performing. 1-2 sponsored creator partnerships. Submit to "best travel apps" roundups. |
| **Sprint 24** (W24) | Compile all user feedback into a prioritized V2 backlog. Plan V2 roadmap based on data. **Celebrate shipping something real.** 🎉 |
