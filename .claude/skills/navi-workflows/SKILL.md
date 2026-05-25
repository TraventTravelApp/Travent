---
name: navi-workflows
description: >
  Use when designing, testing, or debugging multi-turn Navi workflows. Covers
  phase control, thread continuation/forking, memory scope, and the stronger
  planner plus cheaper worker pattern for stable game loops.
version: 0.1.0
tags: [navi, workflows, threads, memory, testing]
author: navi
---

# Navi Workflows

Use this skill when the task is a staged flow rather than a one-shot answer.

## Two Layers

1. **User workflow**
   - what the end user experiences
   - phase transitions must be obvious
   - the next move must be explicit

2. **Builder workflow**
   - how you test the flow itself
   - preserve threads, fork weak conclusions, patch the smallest surface, rerun

## Default Contract

- Current thread is authoritative.
- Workspace memory is background, not phase state.
- Reinforcement is part of the workflow, not a postscript.
- Use prior workspace memory only when:
  - the user asked to resume prior work, or
  - you are explicitly comparing current-thread state against prior workspace context.

## Memory Modes

- `flow`: default; stay grounded in the current thread
- `workspace`: allow prior workspace memory to shape the answer
- `compare`: show current-thread state and workspace memory side by side, then resolve conflicts

## Planner / Worker Split

When the weak point is phase control, use:

- a stronger planner for the top-level workflow
- cheaper workers for narrow recon or verification

Do not spend a stronger model on low-level grep/peek work if the real problem is
transition discipline between brainstorm, approval, and plan.

## Test Loop

1. Run the workflow once.
2. Inspect the thread with `thread top`, `thread state`, `thread introspect`, `thread tools`, and `threads analyze`.
3. Continue the same thread.
4. Fork to challenge the design.
5. Patch the prompt/skill/runtime surface with the highest leverage.
6. Re-run and compare behavior, not just output.

For structural CLI/workflow work, keep the order disciplined:

1. preserve action-aware thread state
2. then improve parser/tree organization
3. then widen into capability-family or phase-policy cleanup

Do not start by renaming the whole surface if thread state and saved artifacts
would still be ambiguous afterward.

For a user-facing action, prefer testing the action itself:

```bash
navi run navi-self-test --target=navi-brainstorm \
  "Test whether the workflow stays natural across brainstorm, approval, and plan"
```

For skills-only routing/debugging, target the skill directly instead.

For staged actions, treat the same-thread continuation as part of the test, not a separate unrelated run.

## Hardening Rules

- Reuse exact paths from verified repo context. If a tool found `workspace/actions/...`, keep that exact path.
- In this repo, use `workspace/...` for runtime actions/skills and top-level `skills/...` only for Claude/plugin-skill guidance.
- Verify CLI commands from `navi-cli --help`, `README.md`, or another checked source before you print them.
- In this flow, the allowed follow-up forms are `navi ... -t <id> "<prompt>"` and `navi ... -t <id> --fork "<prompt>"`. Never emit `-t <id> continue "..."`.
- Every phase response should leave the user with an obvious reinforcement path:
  - inspect or analyze the current thread
  - continue the same thread
  - fork to challenge the current design
- Treat any saved plan artifact as a Navi-managed export of the thread. Revisions should happen by continuing the same thread with the same action, not by telling the user to hand-edit the file.
- Check `thread state` for `pressureStage`, budget details, and `pruned=true` carryover markers before you conclude a long harness run lost context. `high` and `critical` pressure mean later prompts may intentionally receive pruned carryover plus durable findings.
- `thread introspect --json` now includes `threadTruth.runLifecycle` for the target thread. Use that instead of scraping raw event payloads when you need the latest persisted run snapshot.
- Workflow actions compiled from `phases:` still surface workflow `run` ids and `status` rather than full thread lifecycle parity. Keep that distinction explicit when you explain how to inspect a run.

## Review Pattern

For planning/refactor loops, prefer this sequence:

1. root critique for missing steps and bad assumptions
2. same-thread critique for ordering and smallest safe slice
3. forked critique for the hardest remaining gap
4. `thread top`, `thread state`, `thread introspect`, `thread tools`, and `threads analyze` after each pass

This keeps the main line focused while still giving you one adversarial branch.
