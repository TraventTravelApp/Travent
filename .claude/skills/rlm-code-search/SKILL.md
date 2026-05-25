---
name: rlm-code-search
description: >
  This skill should be used when the user asks to "search code", "find where",
  "how does X work", "trace the flow", "understand the architecture",
  "find all usages of", "what calls this function", or any code exploration task.
  Teaches the RLM (INDEX/FILTER/MAP/REDUCE) strategy for token-efficient search.
version: 0.1.0
tags: [search, code, rlm, ripgrep, ast-grep]
author: navi
metadata:
  agent:
    maxSteps: 20
    temperature: 0.1
    supervised: false
---

# RLM Code Search Strategy

When searching codebases, apply RLM with explicit behavior tracking. The goal is
not only the right answer, but a reliable search flow that can be repeated.

## Execution Contract (Supervisor Behavior)

Before searching:
1. Normalize target scope to an absolute mounted path (prefer `/cwd/...`, not `./...`).
2. Validate target path exists before deep search.
3. If path validation fails with mount/path errors, pivot to `/` and rediscover the target repo directory.
4. If target repo still cannot be accessed, stop and report `Blocked` instead of inferring architecture conclusions.

During search:
1. Use explicit `INDEX -> FILTER -> MAP -> REDUCE` phases in the response.
2. In `MAP`, run at least two evidence lanes in parallel:
   - lane A: callsites / symbol flow
   - lane B: command routing / execution order / side effects
3. Every claim requires `file:line` evidence.
4. Run at least one concrete discovery command and one concrete verification command before REDUCE.

After search:
1. Include a short `Flow audit` (what lanes were run, what was parallelized, what was skipped).
2. Include `Friction log` with any tool/path failures and how they were mitigated.

## RLM Tooling Sequence

### INDEX (cheap fan-out first)
- `local_ripgrep_search` for broad candidate discovery.
- `local_ast_grep_search` when syntax/structure matters.
- Return candidate files quickly; do not deep read yet.

### FILTER (prune aggressively)
- Use `code_peek` for top candidates.
- Drop low-signal files before full mapping.
- Keep candidate set small and explicit.
- If a direct file read fails, confirm exact path with `rg --files` and retry with extension-aware alternatives (`.ts`, `.tsx`, `.js`, `.mjs`) before concluding missing file.

### MAP (parallel evidence lanes)
- Use `code_parallel_peek` or equivalent multi-file reads.
- Run at least two named lanes (e.g., symbol-lane + routing-lane).
- Compare/merge lane findings; call out disagreements.

### REDUCE (synthesis + behavior report)
- Final answer with cited evidence.
- If no files were actually searched, mark conclusions as unavailable (blocked) and list what is missing.
- Add:
  - `Flow audit`
  - `Friction log`
  - `Confidence`
  - `Executed tools` (actual commands/tool calls used)

## Failure Handling

- If a path/mount error occurs (`No mount for path`), do not retry the same path.
- Switch to mounted-root discovery (`/`) and locate the repo from there.
- If filesystem read tools keep failing on mount resolution, pivot to command-based reads via `mastra_workspace_execute_command` (`rg -n`, `sed -n`, `cat`) from the current working directory.
- Prefer `/cwd/...` paths for read/peek tools in sandbox runs.
- When cited paths originate from import strings, resolve extension mismatches before treating as evidence gaps.
- Record the failure in `Friction log` and continue.
- Never report high confidence from empty evidence (0 files / 0 matches).
- Never fabricate tool usage or source citations. If no tool ran, explicitly state `No tools executed` and remain blocked.
