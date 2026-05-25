---
name: navi-testing-loop
description: >
  Use when running recursive Navi skill-improvement cycles in a clean-room
  sandbox. Covers baseline run setup, behavior-first evaluation, friction
  logging, targeted skill/code fixes, reruns, and convergence checks.
version: 0.1.0
tags: [navi, testing, sandbox, friction]
author: navi
---

# Navi Testing Loop

Use this when the goal is to improve Navi behavior over repeated runs, not just
one-off answer quality.

This is the core game loop for using Navi on itself or on any external workspace
that exposes tools/actions through the same harness shape.

## Game Loop

1. Run one narrow, representative task.
2. Preserve the thread and inspect whether it is reusable:
   - `thread top`
   - `thread state <id>`
   - `thread introspect <id> --json`
   - `thread tools <id> --json`
   - `threads analyze <id> --json`
3. Continue the same thread to deepen the main line of inquiry.
4. Fork the thread to challenge the current conclusion.
5. Separate:
   - real product bug
   - review/debug friction
   - model/tool-surface mismatch
6. Fix only the highest-leverage issue.
7. Re-run the same task and compare:
   - correctness
   - tool behavior
   - runtime
   - reusability of the resulting thread

Prefer many tight loops over one large “super-run”.

## AxBxN Slice Rule

Use the shorthand `A x B x N` for recursive stabilization passes:

- `A` = minimum bugs to find/fix per pass
- `B` = minimum frictions to find/fix per pass
- `N` = recursive passes before the rolled-up validation pass

Default example: `2x2x3`
- find/fix at least 2 bugs and 2 frictions
- recurse for 3 passes
- then do one rolled-up validation pass

Deeper example: `2x2x5`
- same bug/friction floor
- recurse for 5 passes instead of 3

If the user says `2x2x3`, `2x2x5`, or “recursive sausage maker,” treat it as
this same shape rather than a one-off phrase.

For design/plan work, use a 3-pass reinforcement rhythm instead of one broad review:

1. root pass: missing steps, bad assumptions, migration risk
2. same-thread pass: reorder tasks and shrink the first vertical slice
3. forked pass: adversarial “hardest remaining gap” review
4. run `thread top`, `thread state`, `thread introspect`, `thread tools`, and `threads analyze` after each pass and only keep the durable findings

## KPI Order

1. **Behavior quality** — did the supervisor follow the intended flow?
2. **Outcome quality** — did it solve the task with real evidence?
3. **Efficiency** — acceptable steps/time/tool cost once behavior is stable.

## Canonical Loop (One Cycle)

1. Run a baseline in a fresh temp sandbox.
2. Inspect artifacts (`output.log`, `introspect.json`, `threads-tree.json`, `notes.md`).
3. Identify **1-2 highest-leverage frictions**.
4. Apply focused fixes:
   - skill instruction change (preferred first),
   - runtime/telemetry fix if behavior cannot improve via instructions alone.
5. Re-run in a new clean sandbox.
6. Compare deltas (flow compliance, tool evidence, tool counts, blockers).
7. Append findings to the friction log.

When the thing you are testing is a staged **action**, prefer testing the
action itself instead of only the underlying skills:

```bash
navi run navi-self-test --target=navi-brainstorm \
  "Test whether the action keeps brainstorm -> approval -> same-thread plan natural"
```

The self-test path now supports both:
- skills (for skill activation/routing behavior)
- actions (for user-facing flow discipline)
- staged same-thread scenarios (for workflows that must preserve phase state across turns)

## Quickstart Commands

```bash
# 1) init clean sandbox
scripts/navi-testing-sandbox.sh init /tmp/navi-loop/sandbox

# 2) clone fixture repo under sandbox CWD
gh repo clone bercastle/navi /tmp/navi-loop/sandbox/fixture-navi -- --depth 1

# 3) run evaluation prompt
scripts/navi-testing-sandbox.sh run /tmp/navi-loop/sandbox \
  "Code-search behavior test in /cwd/fixture-navi ..."

# 3b) run a specific built-in action in the sandbox
scripts/navi-testing-sandbox.sh run /tmp/navi-loop/sandbox \
  "Improve the brainstorm -> plan flow" \
  --action=superpowers-brainstorm -m glm-5

# 4) if a dispatched child looks stuck, rerun with step-level debug
NAVI_DEBUG=true bun run dev -- --debug -w /tmp/navi-loop/sandbox run <action> "..."

# 5) if the child still starts slowly, test a faster subagent model
NAVI_AGENT_MODEL=xai/grok-code-fast-1 \
NAVI_DEBUG=true bun run dev -- --debug -w /tmp/navi-loop/sandbox run <action> "..."

# 6) if CI review lanes are slow, disable memory for worker runs
MASTRA_MEMORY_DISABLED=true NAVI_DEBUG=true \
bun run dev -- --debug -w /tmp/navi-loop/sandbox run <action> "..."

# 7) reinforce a fresh root run before iterating
navi -w /tmp/navi-loop/sandbox "trace the control point ..."
navi thread top
navi thread state <thread-id>
navi thread introspect <thread-id> --json
navi thread tools <thread-id> --json
navi threads analyze <thread-id> --json
navi -t <thread-id> "push deeper on the same path"
navi -t <thread-id> --fork "argue the strongest competing explanation"
```

`MASTRA_MEMORY_DISABLED=true` is for cheap stateless inspection only. Do not
expect a reusable persisted thread for `-t`, `thread state`, `thread introspect`,
or `threads analyze` after that kind of run.

## Optimization Order

When a run is weak, optimize in this order:

1. Narrow the task.
2. Narrow the tool surface.
3. Tighten the prompt contract.
4. Change the model or subagent model.
5. Patch runtime/provider behavior.

For workflow and CLI cleanup specifically:

1. preserve thread/action/artifact truth first
2. then improve parser/tree shape
3. then add capability-family / phase-gating behavior

That order avoids creating duplicate control systems.

Do not start with a broad supervisor redesign unless the narrow loop already works.

## Workflow Testing Heuristics

For multi-turn actions, separate:

1. phase control
2. repo grounding
3. memory scope
4. model quality

Default recommendation:

- `flow` memory mode for fresh workflow kicks
- `compare` mode when debugging cross-run contamination
- stronger planner model for phase control
- cheaper worker/subagent model for recon and verification

If a fresh run starts acting like it is mid-conversation, treat that as a workflow bug even if the remembered content is correct.

## Dispatch Debug Checklist

When debugging a dispatched skill or action, separate these cases:

1. Parent dispatch failure
- Symptom: no `skill-dispatch` step, or no `single dispatch:` line in debug output.
- Focus: action wiring, skill availability, skill filters.

2. Child startup stall
- Symptom: debug log shows `agent:<skill> started` but no `agent:<skill> step 1`.
- Focus: prompt size/shape, tool surface, model choice.
- Fast check: rerun with `NAVI_AGENT_MODEL=xai/grok-code-fast-1`.

3. Child executing but not finishing
- Symptom: debug log reaches `agent:<skill> step 1` or later, but the run still times out.
- Focus: bad plan shape, repeated searches, slow tool loops, missing validation stop condition.

Prefer debug logs over thread summaries for in-flight runs. A child can be live even when
`thread show` still reports `Messages: 0`.

For completed root runs, the expected loop is different:
- once the CLI prints a thread id, `thread state <id>` should show a persisted run lifecycle, any `pressureStage` / `pruned=true` payload details that matter, and `thread show <id>` should immediately show persisted messages
- `thread introspect <id> --json` should include `threadTruth.runLifecycle` when the run persisted lifecycle metadata
- `threads analyze <id> --json` should succeed on the first pass
- use `-t` to continue the same line of inquiry
- use `--fork` to challenge the current conclusion instead of contaminating the main thread

For pure workflow actions compiled from `phases:`:
- expect CLI-visible workflow `run` ids and `status` output
- do not expect full `thread state` parity unless that action executes through the harness path

If memory is intentionally disabled, the thread is ephemeral. In that mode:
- do not expect `threads analyze` or `-t` continuation to work
- treat the run as a one-shot probe
- rerun with a refined prompt or re-enable memory for reinforcement

## Prompt Contract (Behavior-First)

Require these sections in every run:
- `INDEX -> FILTER -> MAP -> REDUCE`
- `MAP` with at least 2 lanes
- `Flow audit`
- `Executed tools`
- `Friction log`

Hard rules:
- Do not claim high confidence with zero evidence.
- Do not fabricate tool usage or citations.
- If blocked, say blocked.

## Known Friction Patterns + Fixes

### 1) Cross-run context contamination
- Symptom: fresh sandbox reuses old thread context.
- Fix: scope harness thread `resourceId` by workspace path.

### 2) File read mount failures
- Symptom: `No mount for path: ./...` on read/peek tools.
- Fix: use `/cwd/...` paths; if needed pivot to `execute_command` (`rg`, `sed`, `cat`).

### 3) Telemetry mismatch (`toolCallCount: 0`)
- Symptom: run log shows tools but introspect/tree shows zero.
- Fix: count v2 `parts[].tool-invocation` payloads (with `toolCallId` dedupe).

### 4) Extension mismatch (`.js` vs `.ts`)
- Symptom: read-file failure on inferred import path.
- Fix: retry with extension-aware candidates before concluding missing file.

### 5) Process-tool failures in dispatched skills
- Symptom: repeated `mastra_workspace_get_process_output` or `mastra_workspace_kill_process`
  followed by `WorkspaceNotAvailableError`.
- Fix: do not expose background-process helpers to skill-dispatch children; keep plugin
  authoring skills on foreground commands and direct file reads/writes only.

### 6) Child agent starts but never reaches first step
- Symptom: debug log stops at `agent:<skill> started`.
- Fix:
  - shorten the plugin skill body,
  - move examples/reference detail out of the main runbook,
  - add `tools: [workspace, utility]` when appropriate,
  - retry with `NAVI_AGENT_MODEL=xai/grok-code-fast-1` to confirm whether the issue is
    prompt/model latency versus runtime wiring.

### 7) Declared tool filtering still exposes the wrong tools
- Symptom: a lane or child agent claims to be focused, but debug output still shows the
  wrong tool surface or web/provider behavior.
- Fix:
  - verify filtering matches the tool's runtime `id`, not only the export-map key
  - if the skill/action is workspace-discovered, put tool categories under `metadata.tools`
    rather than relying on top-level fields
  - confirm with debug output that the final allowed tool count is nonzero and plausible

### 8) Test workspace cannot isolate search/fetch provider behavior
- Symptom: a throwaway `.navi/config.json` does not affect web-search runs, so
  ddgr/minimax/zai comparisons silently use the global provider.
- Fix:
  - put runtime overrides directly in the test workspace:
    ```json
    {
      "searchProvider": "ddgr",
      "fetchProvider": "jina",
      "parallelDispatchConcurrency": 4
    }
    ```
  - use the workspace itself as the boundary for provider-isolated tests

### 9) Memory-disabled runs still burn steps on working memory
- Symptom: `MASTRA_MEMORY_DISABLED=true` is set, but early steps still call
  `updateWorkingMemory`.
- Fix:
  - wire the env flag into Navi's own memory capability detection and harness/direct-mode
    memory creation path
  - verify debug shows `Memory: working: off` before rerunning

### 10) Focused CI worker still too slow after prompt cleanup
- Symptom: the worker starts, but the harnessed skill-dispatch path dominates runtime.
- Fix:
  - keep the action/workflow split, but convert the worker from harness-dispatch to a
    direct functional action with a tighter prompt
  - keep the skill as the reference playbook, but do not pay the child-agent startup tax
    in hot CI paths

### 11) Model invents shortened file paths
- Symptom: the run keeps peeking or diffing nonexistent paths like `navi-core/...` after
  `git diff --name-only` returned `packages/navi-core/...`.
- Fix:
  - tell the worker to reuse exact diff paths verbatim
  - treat any rewritten path as a friction bug, not a harmless miss

### 12) Prompt-only CI output drifts away from the contract
- Symptom: the worker finds the right issue but emits a generic answer instead of the
  required `Readiness` / `Severity Counts` report.
- Fix:
  - harden prompts with exact mandatory lines, required section headers, and exact finding tags
  - if prompt-only enforcement is still unreliable, prefer workflow-side normalization or
    structured-output wrappers for CI consumption

### 13) Split review workflow shows all worker lanes green but the aggregate job fails
- Symptom: every focused lane succeeds, but the final PR review check still fails.
- Fix:
  - inspect the aggregate artifact first, not the workflow YAML
  - read `.navi-pr-review/aggregate-input.md` to see which lane raised each finding
  - if the aggregate step failed at `Fail on P0/P1 findings`, treat it as a real gate result,
    not an aggregator crash
  - only debug sticky-comment or merge logic when the aggregate log shows malformed artifacts
    or missing lane reports

### 13) Review comment renderer drops findings even though the merged report contains them
- Symptom: `navi-review.md` has P1/P2 sections, but the sticky PR comment shows only the verdict
  and counts.
- Fix:
  - verify whether the merged report used bare section labels (`P1 Findings`) instead of markdown
    headings (`## P1 Findings`)
  - make the comment parser accept both formats before blaming the merge action
  - preview the comment locally against a saved review artifact to confirm the rendered markdown,
    not just the raw report

### 14) Fresh root run prints an answer but the thread is empty afterward
- Symptom: the CLI prints a valid answer and thread id, but `thread show <id>` reports
  `Messages: 0` and `threads analyze <id>` fails with `Thread not found or empty`.
- Fix:
  - treat it as a persistence race, not an analysis bug
  - wait for the expected message count to land in storage before direct-mode exits
  - verify with `thread state <id>`, `thread show <id>`, or a direct `mastra_messages` count before iterating further

### 15) `threads analyze` fails on truncated analyzer JSON
- Symptom: `threads analyze` fails with errors like `Invalid JSON in response: Unterminated string`.
- Fix:
  - shorten the analyzer output contract so it emits fewer, smaller strings
  - attempt a deterministic tail repair for truncated JSON
  - retry once with a smaller prompt before giving up
  - keep the user-facing reinforcement command on `threads analyze <id> --json` so the output
    is machine-readable for the next loop

### 16) A review lane says “no issues” but a forked challenge hallucinates a regression
- Symptom: the first review is too trusting, then the adversarial fork over-corrects and invents a bug.
- Fix:
  - treat both outputs as signals about review quality, not ground truth
  - require the review lane to verify the exact branch/condition before claiming a regression
  - require the review lane to verify real test locations before claiming “missing tests”
  - if the forked lane disagrees, re-read the exact source region before patching anything

### 17) Workflow planner invents CLI commands or shortens verified repo paths
- Symptom: a plan cites commands like `actions show` that are not in `navi-cli --help`, or it rewrites
  verified paths like `workspace/actions/...` to nonexistent `actions/...`.
- Fix:
  - verify every cited command against checked docs or CLI help before printing it
  - reuse exact path strings from tool output; path rewriting is a workflow bug
  - if a test file or verification command is not verified, keep the instruction generic instead of inventing it

### 18) Structural refactor plan starts at the wrong layer
- Symptom: a plan starts with broad command renames or taxonomy cleanup before preserving thread/action/artifact state.
- Fix:
  - bind workflow state to the thread first
  - then migrate one high-signal subtree through the new parser/tree
  - only after that add capability families or phase-level gating
  - if the first slice touches too many nouns at once, narrow it again

### 19) Capability-family gating only hides tools but does not change agent behavior
- Symptom: the action exposes fewer tools, but the model still repeatedly tries unavailable behavior and burns steps retrying.
- Fix:
  - capability families must carry both:
    - tool mappings
    - short instruction fragments / behavioral constraints
  - inject both, or the family model is incomplete

## External Workspaces

Action/workspace developers can use the exact same loop for their own tools:

1. create a narrow action for one real user job
2. run it in a clean workspace
3. inspect the thread and analyze it
4. continue the thread for depth
5. fork the thread to challenge the answer
6. patch the skill/action/tool surface
7. rerun the same job until the loop becomes boring and reliable

The point is not “make one answer look good”.
The point is to make the workflow reusable, debuggable, and cheap to iterate.

## What To Log Each Cycle

Append to:
- `docs/navi-testing-sandbox-friction-log.md`

Use this structure:
1. Run ID / sandbox path
2. Friction (symptom + impact)
3. Fix applied
4. Verification evidence
5. Remaining risks

## Resume From Another Machine

1. Pull latest branch.
2. Invoke this skill: **`navi-testing-loop`**.
3. Start with the last entry in `docs/navi-testing-sandbox-friction-log.md`.
