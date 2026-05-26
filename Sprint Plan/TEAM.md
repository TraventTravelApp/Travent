# Team

Chronicle is being built by three people: **Emma, Nikki, and Jaliah.** Plus the rotating cast of friendly testers we'll recruit during beta.

## Focus areas

### Emma
- Owns: full-stack work end-to-end (mobile + backend), product decisions, marketing
- Lead on: Sprint 1-2 mobile wiring (Profile, Settings, EditActivities), Sentry/observability, Cognito refresh tokens, API contract reviews
- Marketing track: positioning, brand, social, content, landing page, store listings, launch comms, growth experiments
- Default reviewer for: spec PRs, anything touching auth or AWS infra

### Nikki
- Focus this increment: OpenAPI specification, Swagger UI, code generation pipeline, backend handlers for new endpoints
- Lead on: Sprint 1 auth spec, Swagger UI hosting, openapi-typescript codegen setup; Sprint 5 diary backend
- Pair partner for Jaliah on CI in Sprint 1

### Jaliah
- Focus this increment: CI/CD pipeline, integration test coverage, backend handlers, finishing mobile wiring against existing endpoints
- Lead on: Sprint 1 GitHub Actions CI + deploy docs, Sprint 2 EditActivitiesScreen wire + map screens; Sprint 7 friends backend
- Pair partner for Nikki on OpenAPI spec in Sprint 1

## How we split work

- **Spec-first contracts** mean Nikki and Jaliah can work in parallel: one writes the OpenAPI entry, the other implements the handler, mobile wiring can start once the spec is merged.
- **Pairing** is encouraged on anything new — first time hand-writing OpenAPI, first time touching CI, first time using `expo-image-picker`. Pair for the first hour, then split.
- **Code review** is the main learning channel — leave detailed comments on PRs, ask questions, suggest alternatives. We grow by reviewing.

## Reviewers

Default review assignments (any team member can review anything, but these are who's most likely to know the area):

| Area | Primary | Backup |
|---|---|---|
| Auth / Cognito | Emma | Nikki |
| OpenAPI spec | Nikki | Jaliah |
| CI / deploy / infra | Jaliah | Emma |
| Mobile screens | Emma | Jaliah |
| New backend endpoints | rotating (whoever's not the author) | Emma |
| AI / Bedrock layer | Emma | — |

## Availability

Fill this in collectively at the kickoff meeting:

| Person | Typical hours | Days off |
|---|---|---|
| Emma | _TBD_ | _TBD_ |
| Nikki | _TBD_ | _TBD_ |
| Jaliah | _TBD_ | _TBD_ |

## Communication channels

| Channel | Purpose |
|---|---|
| `#chronicle-standup` | Daily async standups |
| `#chronicle-dev` | General dev chat, PR notifications |
| `#chronicle-marketing` | Marketing/launch coordination |
| `#chronicle-alerts` | Sentry + CI failures (auto-posted) |
| GitHub PRs | Code review, design discussion |

(Slack or Discord — pick one at the kickoff.)
