---
name: workspace-setup
description: >
  Use when the user asks to set up a Navi workspace, create starter skills or
  actions, or customize Navi for a project.
version: 0.1.0
tags: [navi, workspace, setup, customization]
author: navi
tools: [workspace, utility]
metadata:
  agent:
    maxSteps: 12
    temperature: 0.1
    supervised: false
---

# Workspace Setup

Set up a working Navi workspace under `workspace/` and leave the user with
real validation commands.

Write paths:
- workspace skill: `/cwd/workspace/skills/<name>/SKILL.md`
- workspace action: `/cwd/workspace/actions/<name>/action.yaml`
- action prompt: `/cwd/workspace/actions/<name>/prompts/instructions.md`

Rules:
- use `mastra_workspace_execute_command` for all writes
- use foreground commands only
- read files back after writing
- use `shell_quote` before interpolating user-provided names
- never use `background: true`
- never use `mastra_workspace_get_process_output`
- never use `mastra_workspace_kill_process`
- never use `/workspace/...`
- never use absolute OS paths like `/tmp/...`

Setup flow:
1. Create the skill file.
2. Create the action file.
3. Create the prompt file if needed.
4. Read the files back.
5. Validate the workspace.

Validation:
- `navi-cli -w /cwd system check`
- `navi-cli -w /cwd actions list`
- `navi-cli -w /cwd agents`
- `navi-cli -w /cwd run <action> "test query"`

Current supported customization path is local workspace overlays. Do not teach
remote pack notation such as `-w @owner/repo` as if it exists today.

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

Always return:
1. what you created
2. exact file paths
3. validation commands
4. the next logical command
