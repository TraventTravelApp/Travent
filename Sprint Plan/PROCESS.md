# Process — How We Work

Our working agreement. Small team, weekly cadence, async-first.

## Sprint cadence

- **Length:** 1 week, Monday → Friday
- **Sprint planning:** Monday 9:00 AM (45 min, synchronous)
- **Daily standup:** async in Slack/Discord channel, posted by 10:00 AM
- **Mid-sprint check:** Wednesday 4:00 PM (15 min, optional — only if anyone is blocked)
- **Sprint review + demo:** Friday 3:00 PM (30 min, synchronous)
- **Retro:** Friday 3:30 PM, every other week (20 min, synchronous)

## Ceremonies

### Sprint Planning (Monday)
1. Walk through last sprint's exit state — what shipped, what carried over, what didn't get done
2. Open this sprint's file in `sprints/sprint-XX.md`
3. Each person reads their tasks aloud and flags anything unclear
4. Identify cross-person dependencies (e.g. "Nikki's spec needs to land before Emma can wire the frontend")
5. Confirm the sprint goal / demo target — "what does Friday look like?"

### Daily standup (async)
Post in `#chronicle-standup` by 10:00 AM. Three lines:
```
Yesterday: ...
Today: ...
Blockers: ...
```
If you're blocked, **tag whoever can unblock you**. Don't wait for the next sync meeting.

### Sprint Review + Demo (Friday)
- Each person demos their task on screen (real app, real backend — not slides)
- Mark each task in the sprint file: ✅ done · 🚧 in progress (rolls to next sprint) · ❌ dropped (note why)
- Decide carryover for next sprint

### Retro (every other Friday)
Three columns: **Keep · Change · Try.**
- **Keep:** what's working
- **Change:** what's friction
- **Try:** one experiment for the next 2 weeks

## Definition of Done

### A backend endpoint is "done" when:
1. ✅ Exists in `backend/openapi.yaml` with request, response, and error schemas
2. ✅ Implemented and deployed to `staging` stage
3. ✅ Integration test in `backend/tests/` covering happy path + at least 1 failure case
4. ✅ Auth enforced (JWT verified) if not a public endpoint
5. ✅ CI green on the PR (lint + spec validate + tests)
6. ✅ A reviewer has approved

### A mobile screen is "done" when:
1. ✅ Hits the real backend — no `mock*` constants remaining in production code paths
2. ✅ Has a visible loading state (skeleton or spinner)
3. ✅ Has a visible error state — no silent fallbacks to mock data
4. ✅ Manually tested on both iOS simulator and Android emulator
5. ✅ Sentry would catch a crash here (no swallowed exceptions)
6. ✅ A reviewer has approved

### A marketing deliverable is "done" when:
1. ✅ Published / posted / shipped — not just drafted
2. ✅ Linked from `MARKETING.md` if it's a durable asset (landing page, content series, social handle)
3. ✅ Tracked in the analytics dashboard if it has measurable impact

## Working agreements

- **PRs are reviewed within 24 hours.** If you can't review, say so in the PR thread.
- **Don't merge your own PRs** unless waiting >24h with no response.
- **Spec-first for new endpoints:** open a PR that adds to `openapi.yaml` *before* writing the handler. Lets the mobile work start in parallel.
- **No mock fallbacks in production code paths.** If an endpoint isn't ready, the screen should show a real error, not silently fall back to mock data — we got burned by this in Inc 1 (the "Use Demo Data" pattern hid real bugs).
- **Branch names:** `[name]/[short-description]` — e.g. `nikki/auth-openapi-spec`, `jaliah/edit-activities-wire`.
- **Commit messages:** present tense, one-line summary, body if needed — e.g. `add diary endpoints (POST/GET /trips/{id}/diary)`.

## Templates

### Sprint Planning agenda
```
1. Last sprint review (5 min)
2. Walk this sprint's tasks (15 min)
3. Dependencies + blockers (10 min)
4. Demo target for Friday (5 min)
5. Open questions (10 min)
```

### Retro template (copy into a notes doc each retro)
```
# Retro — Sprint N (date)

## Keep
- ...

## Change
- ...

## Try (next 2 weeks)
- ...

## Action items
- [ ] who · what · by when
```

### PR description template
```
## What
One-line summary.

## Why
The user need or bug being addressed.

## How
Brief technical approach. Link to the OpenAPI spec PR if applicable.

## Testing
How you tested. Screenshots for mobile changes.

## Checklist
- [ ] Spec updated (if backend)
- [ ] Tests added
- [ ] No mock fallbacks introduced
- [ ] Sentry-instrumentable (no swallowed errors)
```
