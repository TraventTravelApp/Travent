---
name: navi-actions
description: >
  Use when the user asks to "run navi", "code review", "web search",
  "pre-pr review", "web search", "navi action", "what can navi do",
  "search with navi", "navi review", "doc audit", or wants to know
  what navi actions are available. Reference for all navi-cli actions
  and when to use each.
version: 0.1.0
tags: [navi, actions, workflows, routing]
author: navi
---

# Navi Actions Reference

Navi actions are multi-agent workflows run via `navi-cli run <action>` (or
`navi-cli -a <action>`). Each action orchestrates workspace skills into a
structured pipeline.

This skill is a reference, not a runnable action. Do **not** tell users to run
`navi-cli run navi-actions`. The correct standalone commands are either
`navi-cli catalog actions list` or the specific real action you are recommending.

## Available Actions

| Action | What It Does | CLI Syntax |
|--------|-------------|------------|
| `code-search` | Deep code search via RLM strategy — ripgrep, ast-grep, parallel agents | `navi-cli "query"` or `navi-cli run code-search "query"` |
| `code-review` | Structured review with P0-P3 severity ratings using git diffs + static analysis | `navi-cli run code-review "query"` |
| `pre-pr-review` | Full pre-PR audit: branch analysis, code review, doc audit, test coverage, build readiness | `navi-cli run pre-pr-review "query"` |
| `web-search` | Snippet-first mechanical web search with optional synthesis | `navi-cli run web-search "query"` |
| `rapid-search` | Raw mechanical ddgr fan-out with JSON-first output | `navi-cli run rapid-search "query"` |
| `doc-audit` | Multi-agent documentation audit — frontmatter, accuracy, inline docs | `navi-cli run doc-audit "query"` |
| `doc-review` | Documentation review cross-referencing code, README, and inline comments | `navi-cli run doc-review "query"` |
| `trace-inspect` | Post-mortem analysis of navi conversations — step timelines, tool usage, dispatch patterns | `navi-cli run trace-inspect --target=<thread-id> "query"` |
| `superpowers-brainstorm` | Guided brainstorm -> design approval -> implementation plan flow on one thread | `navi-cli run superpowers-brainstorm "query"` |

## Action Details

### code-search (default action)

The default when you run `navi-cli "query"` without specifying an action.

```bash
navi-cli "how does authentication work"
navi-cli run code-search --focus=src/auth/ "trace the login flow"
```

**Args:** `--focus` (file/dir/module to narrow search)

### code-review

```bash
navi-cli run code-review "review changes on this branch"
navi-cli run code-review --focus=src/api/ --severity=p1 "review API changes"
```

**Args:** `--focus` (narrow scope), `--severity` (min level: p0/p1/p2/p3, default: p2)

### pre-pr-review

The most comprehensive review — combines code review, doc audit, test coverage,
and build readiness into a scored report.

```bash
navi-cli run pre-pr-review "review all changes before PR"
navi-cli run pre-pr-review --depth=deep --base_branch=develop "thorough review"
navi-cli run pre-pr-review --depth=quick "sanity check"
```

**Args:** `--focus`, `--base_branch` (default: main), `--severity` (default: p2), `--depth` (quick/standard/deep)

### web-search

Snippet-first mechanical web search with optional synthesis over the returned JSON.

```bash
navi-cli run web-search "latest React 19 features"
navi-cli run web-search --site=github.com --count=10 "bun test runner examples"
navi-cli run web-search --agents=3 "React 19 upgrade guide"
```

**Args:** `--agents` (mechanical lanes, default: 1), `--count` (results per lane, default: 10), `--top` (merged result cap, default: 10), `--site` (restrict to domain), `--delayMs` (lane spacing, default: 500), `--synthesize` (default: true)

### rapid-search

Raw mechanical web search. Use this when you want JSON and ranking first, not prose.

```bash
navi-cli run rapid-search "TypeScript error handling best practices"
navi-cli run rapid-search --agents=3 --count=5 --top=10 "broad research topic"
```

**Args:** `--agents` (mechanical lanes, default: 1), `--count` (results per lane, default: 10), `--top` (merged result cap, default: 10), `--site` (restrict to domain), `--delayMs` (lane spacing, default: 500), `--synthesize` (default: false)

### doc-audit

```bash
navi-cli run doc-audit "audit all documentation"
navi-cli run doc-audit --focus=CLAUDE.md --depth=deep "check project docs"
```

**Args:** `--focus` (file/dir/topic), `--severity` (default: p2), `--depth` (quick/standard/deep)

### doc-review

```bash
navi-cli run doc-review "review README completeness"
navi-cli run doc-review --focus=installation --scope=section "check install docs"
```

**Args:** `--focus` (file/section/topic), `--scope` (full/changed/section)

### trace-inspect

```bash
navi-cli run trace-inspect --target=navi-2585db10-abc "analyze this conversation"
```

**Args:** `--target` (thread ID, required), `--trace` (path to trace JSON)

### superpowers-brainstorm

Use this when the user should design first and only then move to a plan.

```bash
navi-cli run superpowers-brainstorm "Help me think through this workflow before we build it"
navi-cli run superpowers-brainstorm --memory-mode=compare "Compare this new idea against prior workspace attempts"
```

**Args:** `--memory-mode` (`flow` default, `workspace`, or `compare`)

## Decision Guide: When to Use What

| Situation | Recommended Approach |
|-----------|---------------------|
| Known file, simple lookup | Native Grep/Read (no navi needed) |
| Multi-file search, <5 files | Native tools with RLM strategy |
| Architecture tracing, >5 files | `navi-cli "query"` |
| Structured code review | `navi-cli run code-review` |
| Pre-PR readiness check | `navi-cli run pre-pr-review` |
| Web research, current info | `navi-cli run web-search` or `rapid-search` |
| Documentation quality check | `navi-cli run doc-audit` or `doc-review` |
| Debug a past navi session | `navi-cli run trace-inspect --target=<id>` |
| Brainstorm then plan on the same thread | `navi-cli run superpowers-brainstorm` |

## Output Rules

1. Only mention action names that appear in this file or `navi-cli catalog actions list`.
2. Do not invent flags, helper actions, or unsupported CLI subcommands.
3. In whisper-back, use `navi-cli catalog actions list` or a concrete `navi-cli run <action>`
   command, never `navi-cli run navi-actions`.

## Global Flags

All actions accept these flags:

| Flag | Purpose |
|------|---------|
| `-m` / `--model` | Override model (e.g., `-m claude-sonnet-4-20250514`) |
| `-w` / `--workspace` | Search in a specific directory |
| `-o` / `--output` | Output format |
| `-r` / `--reasoning` | Enable reasoning output |
| `--debug` | Verbose debug output |

## Run Controls

Use these when the action itself is under test or you need stronger operator visibility:

```bash
navi-cli run <action> --clean-room "query"
navi-cli run <action> --clean-room --clean-room-passthrough=~/.config/qbo "query"
navi-cli run <action> --runtime-state-file state.json "query"
navi-cli run <action> --progress=live|whisper|jsonl|off "query"
```

When the task is **experimenting on an existing action**, prefer the Bun
override runner over editing the action in place:

```bash
bun -e 'import { runActionWithOverrides } from "@navi/cli/run-action-with-overrides";

const result = await runActionWithOverrides({
  actionName: "web-search",
  query: "React 19 upgrade guide",
  workspace: process.cwd(),
  actionArgs: ["--agents=3", "--maxConcurrency=2", "--delayMs=250"],
  overrides: {
    instructionsAppend: "Call out whether wider fan-out materially improved the result map."
  },
  progressMode: "live",
});

console.log(result.threadId);
console.log(result.artifactsDir);'
```

That keeps the baseline action intact, gives you isolated artifacts, and makes
fan-out experiments auditable.

## Thread Inspection

For action debugging, inspect the resulting thread in this order:

```bash
navi-cli thread top
navi-cli thread state <id>
navi-cli thread introspect <id> --json
navi-cli thread tools <id> --json
navi-cli threads analyze <id> --json
```

`thread top` / `thread state` / `thread introspect` / `thread tools` are the
deterministic inspection surfaces. `threads analyze` is the inferential overlay.

## Installation

If `navi-cli` is not available:

```bash
git clone git@github.com:bercastle/navi.git ~/navi
cd ~/navi && bun install
cd packages/navi-cli && bun link
navi-cli system check   # verify installation
```

Requires [Bun](https://bun.sh) and at least one API key (see `navi-cli system check` output).
