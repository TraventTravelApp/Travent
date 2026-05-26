# Chronicle — Sprint Plan

This folder is the operating system for how Emma, Nikki, and Jaliah ship Chronicle from where it is today to a launched, growing product.

## Read in this order

1. **[CURRENT_STATE.md](CURRENT_STATE.md)** — what's actually built right now (audited 2026-05-25). Read this first so the rest makes sense.
2. **[ROADMAP.md](ROADMAP.md)** — the 24-week / 6-increment arc from foundations through growth.
3. **[PROCESS.md](PROCESS.md)** — how we run sprints, standups, demos, retros. Our working agreement.
4. **[TEAM.md](TEAM.md)** — who's focused on what.
5. **[sprints/sprint-01.md](sprints/sprint-01.md)** — what each person is doing this week (starts 2026-05-25).
6. **[MARKETING.md](MARKETING.md)** — Emma's marketing track, running parallel to engineering every sprint.
7. **[BACKLOG.md](BACKLOG.md)** — full feature backlog grouped by epic, in priority order.
8. **[DISCREPANCIES.md](DISCREPANCIES.md)** — what changed from the original PDF plan and why.

## How this folder is meant to be used

- **Sprint Planning (Monday 9:00):** open this sprint's file in `sprints/`, claim tasks, identify blockers, walk through together.
- **Mid-week:** post async standups in Slack/Discord; update task status inline in the sprint file if you finish or get blocked.
- **Friday Demo (3:00):** review the sprint file, mark each task ✅ / 🚧 / ❌, demo what shipped.
- **Friday Retro (3:30, every other week):** open `PROCESS.md` retro template, keep/change/try.
- **Next sprint planning:** copy `sprints/_template.md` to `sprints/sprint-XX.md`, fill in from `BACKLOG.md` and the increment's roadmap goals.

## Where the source of truth lives

- **Engineering work in progress:** GitHub issues + PRs (linked from sprint files when relevant)
- **API contract:** `backend/openapi.yaml` (introduced in Sprint 1)
- **Crash/error monitoring:** Sentry (introduced in Sprint 1)
- **Analytics:** PostHog or Amplitude (Inc 3, Sprint 11)
- **Marketing assets:** Google Drive / Notion (Emma to set up)

## Quick reference

| Today's date | Current sprint | Current increment | Target launch |
|---|---|---|---|
| 2026-05-25 | Sprint 1 (W1) | Inc 1 — Foundations | end of W16 (~2026-09-14) |
