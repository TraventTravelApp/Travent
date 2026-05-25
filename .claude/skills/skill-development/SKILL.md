---
name: skill-development
description: >
  Use when creating, editing, or publishing a Navi workspace skill (SKILL.md),
  action (action.yaml), or plugin skill. Build the files, validate them, and
  return exact follow-up commands.
version: 0.1.0
tags: [navi, skills, actions, publishing]
author: navi
tools: [workspace, utility]
metadata:
  agent:
    maxSteps: 12
    temperature: 0.1
    supervised: false
---

# Skill Development

Create or update Navi skills and actions that actually run.

Use the same reinforcement loop that Navi uses on itself:
1. build the smallest useful skill/action first
2. run one real task through it
3. inspect the resulting thread
4. continue the thread for depth
5. fork the thread to challenge the answer
6. patch the skill/action/tool surface
7. rerun the same task until the workflow is stable

Use this for:
- new `SKILL.md` files
- new `action.yaml` files
- updates to an existing skill or action
- plugin skill work under `/cwd/skills/<name>/SKILL.md`

Write paths:
- workspace skill: `/cwd/workspace/skills/<name>/SKILL.md`
- workspace action: `/cwd/workspace/actions/<name>/action.yaml`
- action prompt: `/cwd/workspace/actions/<name>/prompts/instructions.md`
- plugin skill: `/cwd/skills/<name>/SKILL.md`

Rules:
- use `mastra_workspace_execute_command` for all writes
- write only with `/cwd/...` paths
- read files back after writing
- use foreground commands only
- use `shell_quote` before interpolating user-provided names
- never use `background: true`
- never use `mastra_workspace_get_process_output`
- never use `mastra_workspace_kill_process`
- never invent tool IDs or `navi-cli run` actions
- if a workflow writes an artifact (for example a saved plan), keep that artifact under Navi control and revise it by continuing the same thread with the same action

Workflow:
1. Discover existing files with `rg --files /cwd/workspace /cwd/skills`.
2. Write files with `mkdir -p` and `cat <<'EOF'`.
3. Read each written file back with `cat /cwd/...`.
4. Validate with real CLI commands.
5. If the skill/action is meant to be agentic, run one real task and keep the thread id.
6. Use `navi thread state <thread-id>`, `navi thread introspect <thread-id> --json`, and `navi threads analyze <thread-id> --json` to extract friction and patterns.
7. Use `navi -t <thread-id> ...` and `navi -t <thread-id> --fork ...` to pressure-test the workflow.
8. Return changed files and next commands.

For staged workflow design, prefer this sequence:
1. make the thread the source of truth
2. if needed, export an artifact from that thread
3. revise the artifact by same-thread follow-up, not manual side editing
4. only then widen into tree/taxonomy cleanup

Validation:
- `navi-cli -w /cwd system check`
- `navi-cli -w /cwd catalog actions list`
- `navi-cli -w /cwd catalog agents`
- `navi-cli -w /cwd run <action> "test query"`

Minimum skill frontmatter:
- `name`
- `description`
- `metadata.agent.maxSteps`
- `metadata.agent.temperature`
- `metadata.agent.supervised`

Minimum action fields:
- `name`
- `description`
- `skills.only`
- `prompt`

Always end with:
1. files created or changed
2. validation commands
3. any blocker or remaining gap

Optimization rules:
- prefer narrow actions over broad “do everything” agents
- if a weaker model struggles, reduce tools before changing the whole design
- document what worked back into the skill/action so the next loop starts smarter
- for CLI/workflow refactors, start with one subtree and one high-signal workflow instead of renaming the whole surface in one pass
