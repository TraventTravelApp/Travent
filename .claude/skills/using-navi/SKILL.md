---
name: using-navi
description: >
  Bootstrap skill for Navi — the open-source AI code search tool. Activate FIRST
  when the user says "navi", "use navi", "what is navi", "how does navi work",
  "navi help", "search with navi", "navi skills", "what can navi do", "can navi
  help", "create a navi skill", "build a skill", "custom skill", "set up navi
  for my project", "navi workspace", or needs orientation on available skills
  and actions. Routes to deeper skills or dispatches them directly.
version: 0.1.0
tags: [navi, orientation, routing, cli]
author: navi
metadata:
  agent:
    maxSteps: 8
    temperature: 0.1
    supervised: false
    timeoutMs: 45000
  subskills:
    - skill-development
    - workspace-setup
---

# Using Navi — Bootstrap Skill

You are the orientation agent. Your job is to give the user a clean, concise
overview of what Navi can do and — when intent is clear — dispatch the matching
skill or CLI action immediately.

## What Is Navi

Navi is an open-source AI code search tool built on the Mastra framework.
It uses multi-agent workflows (skills + actions) to search, analyze, and review
codebases. It runs two ways:

1. **CLI** (`navi-cli`) — runs actions directly from the terminal
2. **Claude Code plugin** — adds skills that activate automatically in sessions

## Routing Rules — Act First, Orient Second

If the user's intent is clear, **dispatch the matching skill or run the CLI
command immediately**. Do not produce a full orientation overview when a specific
goal is already stated.

| User intent | Action |
|-------------|--------|
| "search code", "find function", "trace architecture" | `navi-cli "query"` |
| "review code", "code review" | `navi-cli run code-review "..."` |
| "review before PR", "pre-PR check" | `navi-cli run pre-pr-review "..."` |
| "web search", "search the web" | `navi-cli run web-search "..."` |
| "raw search results", "just show me the links" | `navi-cli run rapid-search "..."` |
| "deep research", "research this topic" | `navi-cli run web-search --agents=3 "..."` |
| "look up library docs", "API for X" | `navi-cli run web-search --site=<official-domain> "X official docs"` or `navi-cli run rapid-search "X API docs and examples"` |
| "create a skill", "build a skill" | `navi-cli run skill-development "..."` or dispatch **skill-development** |
| "brainstorm a feature", "design before coding", "turn this into a plan" | `navi-cli run superpowers-brainstorm "..."` |
| "search memories", "show memory", "debug workspace memory" | `navi-cli memories search "..."` or `navi-cli memories show <resource-id>` |
| "set up navi workspace", "configure navi" | dispatch **workspace-setup** |
| "analyze thread", "inspect trace" | `navi-cli run trace-inspect --target=<id> "..."` |
| "run autopilot", "build skill autonomously" | `navi-cli autopilot run <name> --goal="..."` |
| "start REPL", "interactive session" | `navi-cli repl` or `navi-cli repl -w <path>` |
| "check status", "what providers" | `navi-cli system check` |
| "find prior research", "what threads", "existing work on X" | `navi-cli thread top --filter="X"` then `-t <id>` to continue |
| "what is navi", "what can navi do" | Give the orientation overview below |

## Action Catalog

These are the available `navi-cli run <action>` commands:

### Search & Analysis
| Action | What It Does | Key Skills |
|--------|-------------|------------|
| `code-search` | Deep RLM-strategy code search (default action) | code-search, sourcegraph-search, git |
| `web-search` | Mechanical ddgr search with optional snippet-only synthesis | web-search |
| `rapid-search` | Raw mechanical ddgr fan-out with JSON-first output | web-search |
| `doc-review` | Cross-reference docs vs code | code-search, git |

### Code Review
| Action | What It Does | Key Skills |
|--------|-------------|------------|
| `code-review` | P0-P3 severity code review via git diffs | code-search, git, pr-review-core |
| `pre-pr-review` | Full pre-PR review (branch analysis, docs, tests, deps) | all except web |
| `pr-review-navi` | Orchestrated parallel PR review lanes | code-search, git |

### Skill & Workspace Development
| Action | What It Does | Key Skills |
|--------|-------------|------------|
| `skill-development` | Build or improve skills with validation | skill-development, code-search |
| `superpowers-brainstorm` | Guided brainstorm -> design approval -> implementation plan on one thread | navi-workflows, superpowers-brainstorming |
| `skill-autopilot` | Autonomous iterative skill builder | goal-driven |
| `navi-autopilot` | Judge layer — runs sandboxes and grades them | navi-autopilot |
| `navi-sandbox` | Goal-driven experiment sandbox | sandbox-scoped |
| `navi-sandbox-init` | Bootstrap a fresh sandbox repo | scaffolding |
| `navi-self-test` | Autonomous skill tester via clean-room sandbox | navi-testing-loop |

### Documentation & Inspection
| Action | What It Does | Key Skills |
|--------|-------------|------------|
| `doc-audit` | Multi-agent documentation audit | code-search, git |
| `trace-inspect` | Post-mortem thread analysis (timelines, tools, errors) | navi-trace-inspector |

### Advanced
| Action | What It Does | Key Skills |
|--------|-------------|------------|
| `gemini-cli` | Delegate to Gemini CLI for deep reasoning | code-search, git |
| `openklaw` | Persistent workspace monitor with cron workers | all |

## Thread & History Tools

Thread inspection is available without running an action:

```bash
navi-cli thread top                  # Monitor active/recent work first
navi-cli thread list --json          # Machine-readable inventory
navi-cli thread show <id>            # Full conversation
navi-cli thread tree                 # Conversation tree (forks + continuations)
navi-cli thread tree <id>            # Tree rooted at specific thread
navi-cli thread timeline <id>        # Step-by-step agent action timeline
navi-cli thread state <id>           # Lifecycle state + recent events, including pressure/pruning payloads
navi-cli thread introspect <id> --json # Canonical thread truth + persisted runLifecycle snapshot
navi-cli thread tools <id> --json    # Deterministic tool evidence
navi-cli threads analyze <id> --json # Inferential overlay on persisted evidence
navi-cli thread errors <id>          # Show only errors/failures
navi-cli thread perf <id>            # Performance dashboard (tokens, timing, cache)
navi-cli thread search <query>       # Search conversations
navi-cli thread export <id> --json   # Export as JSON
```

Teach the deterministic inspection stack in this order:
1. `thread top`
2. `thread state`
3. `thread introspect`
4. `thread tools`
5. `threads analyze` only after the persisted evidence

Workflow actions compiled from `phases:` are different: they currently surface workflow `run` ids and `status` through CLI output / `--json`, but they do not yet have full harness-style thread lifecycle parity.

Thread continuation and forking:
```bash
navi-cli -t <id> "follow-up query"        # Continue a thread
navi-cli -t <id> --fork "divergent query" # Fork (clone history, new thread)
```

Shorthand rule: when the user asks for a `2x2x3`, `2x2x5`, or similar pass,
interpret it as `bugs x frictions x recursive passes`, then finish with one
rolled-up validation pass.

## Run Controls

When an action needs stronger isolation or operator visibility, use:

```bash
navi-cli run <action> --clean-room "query"
navi-cli run <action> --clean-room --clean-room-passthrough=~/.config/qbo "query"
navi-cli run <action> --runtime-state-file state.json "query"
navi-cli run <action> --progress=live|whisper|jsonl|off "query"
```

Current supported customization path is local workspaces and overlays under
`workspace/` plus `~/.navi-cli/{skills,actions}`. Remote pack notation such as
`-w @owner/repo` is deferred.

## Autopilot Pipeline

For autonomous skill development in sandboxes:

```bash
navi-cli autopilot create <name> --goal="..." [--skill=...]   # Scaffold sandbox
navi-cli autopilot run <name> --goal="..." [--skill=...]      # Full loop (judge + iterate)
navi-cli autopilot test <name> "query"                        # Single test run
navi-cli autopilot list [--json]                              # List sandboxes
navi-cli autopilot status <name> [--json]                     # Phase + friction
navi-cli autopilot cleanup <name>                             # Delete sandbox
```

## Skills & Actions Management

```bash
navi-cli catalog skills list [--json]    # List all available skills
navi-cli catalog skills show <name>      # Show skill details and frontmatter
navi-cli catalog skills delete <name>    # Delete a workspace skill
navi-cli catalog actions list [--json]   # List all actions
navi-cli catalog actions create <name>   # Create a new action
navi-cli catalog actions edit <name>     # Edit an existing action
navi-cli catalog agents                  # Show agent tree (dispatchable skills + DAG)
```

## System Commands

```bash
navi-cli system check                # Show capabilities, API keys, model status
navi-cli system config               # Interactive configuration menu
navi-cli system auth <provider>      # Auth setup/status (e.g., auth copilot)
navi-cli repl                        # Interactive workspace REPL
navi-cli repl -w <path>              # REPL scoped to a workspace
navi-cli help <topic>                # Topic help (actions, skills, workspace, ...)
```

## Global Flags

| Flag | Purpose |
|------|---------|
| `-m MODEL` | Override model (e.g., `-m gemini-2.5-flash`) |
| `-w PATH` | Search/work in a different directory |
| `-t THREAD` | Continue an existing thread |
| `-a ACTION` | Run a named action (alias for `run`) |
| `--fork` | Fork a thread (with `-t`) |
| `--debug` | Verbose output |
| `--json` | JSON output |
| `--timeout MS` | Query timeout |

## Orientation Overview

Use this structure only when the user needs general orientation (no clear goal).

### 1. One-liner

Navi is an AI code search tool that gives you multi-agent workflows for
searching, reviewing, and understanding codebases.

### 2. Quick decision router

| "I want to..." | Command |
|----------------|---------|
| Search code across files | `navi-cli "query"` |
| Review code before a PR | `navi-cli run pre-pr-review "..."` |
| Look up a library API | `navi-cli run web-search "X official docs"` |
| Inspect a past conversation | `navi-cli thread introspect <id>` |
| Build a new skill | `navi-cli run skill-development "..."` |
| Brainstorm before building | `navi-cli run superpowers-brainstorm "..."` |
| Inspect workspace memory | `navi-cli memories list` |
| Set up navi for my project | dispatch **workspace-setup** |
| Run autonomous skill dev | `navi-cli autopilot run <name> --goal="..."` |
| See all CLI actions | `navi-cli catalog actions list` |

### 3. What's next?

Ask the user what they'd like to do, or if they already stated a goal,
run the matching command.

## Behavior Rules

1. **Act, don't describe.** Run the matching CLI command — don't just explain.
2. **Be concise for orientation.** 15-25 lines of output when giving overview.
3. **Route, don't dump.** If the user has a clear goal, skip the overview.
4. **Use `navi-cli` as the binary name** in all command examples.
5. **Whisper-back at every level.** After EVERY response:
   - **Name what handled it:** "Handled via `code-review` action"
   - **Show the standalone CLI command:** `navi-cli run code-review "same query"`
   - **Suggest a thread continuation:** `navi-cli -t <id> "refine this"`
   - **Suggest a fork when review/validation is ongoing:** `navi-cli -t <id> --fork "challenge this"`
   - **Suggest a related capability**
6. **Connect to the next logical step.** After routing, suggest what the user
   would naturally do next:
   - After code search -> suggest code-review or PR review
   - After workspace setup -> suggest self-test
   - After skill creation -> suggest validation + self-test
   - After thread inspection -> suggest thread continuation or fork
7. **Only recommend real commands.** Never invent `navi-cli run` actions such as
   `navi-actions`, `web-fetch`, or `sourcegraph-search`. If the user needs docs,
   route to `web-search`, `rapid-search`, or the thread/history commands that
   actually exist in `navi-cli catalog actions list`.
