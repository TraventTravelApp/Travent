---
name: library-docs
description: >
  This skill should be used when the user asks about library APIs, framework
  configuration, "how to use X library", "what's the API for Y", package
  documentation, or version-specific behavior. Fetches current docs via
  DuckDuckGo + Sourcegraph instead of relying on potentially stale training data.
version: 0.1.0
tags: [library, docs, sourcegraph, duckduckgo]
author: navi
---

# Library Documentation Lookup

When asked about library APIs or framework behavior, fetch current documentation
via DuckDuckGo (to find the repo) + Sourcegraph (to fetch docs and source).
Training data may be stale — this approach gets current docs from the actual repo.

**No API key required.**

## When to Use

ALWAYS use this skill before answering questions about:
- Library API methods and signatures
- Framework configuration and setup
- Version-specific behavior or breaking changes
- Code examples for specific libraries

## User-Facing CLI Guidance

When you give the user a command to run, use real Navi actions only:

- `navi-cli run web-search "LIBRARY official docs"`
- `navi-cli run rapid-search "LIBRARY API docs and examples"`
- `navi-cli run doc-review "compare docs vs repo behavior"`

Do **not** suggest nonexistent actions such as `navi-cli run web-fetch` or
`navi-cli run sourcegraph-search`.

## Three-Step Workflow

### Step 1: Find the GitHub Repo

Use DuckDuckGo to search for the library on GitHub:

```bash
ddgr --json -n 5 -w github.com "LIBRARY_NAME stars"
```

**Parse the results** to find the canonical `owner/repo` path. Look for:
- URL pattern: `https://github.com/owner/repo`
- High star count in the description
- Official org (e.g., `facebook/react` not `some-fork/react`)

### Step 2: Search for Docs on Sourcegraph

Search sourcegraph.com for documentation files in the repo:

```bash
npx @sourcegraph/src search -json "repo:github.com/OWNER/REPO file:\.md$ TOPIC count:5"
```

Override the endpoint for public sourcegraph.com if needed:

```bash
SRC_ENDPOINT=https://sourcegraph.com npx @sourcegraph/src search -json "repo:github.com/OWNER/REPO file:\.md$ TOPIC count:5"
```

**Targeted searches:**
```bash
# README
npx @sourcegraph/src search -json "repo:github.com/OWNER/REPO file:README.md count:1"

# Docs folder
npx @sourcegraph/src search -json "repo:github.com/OWNER/REPO file:docs/ TOPIC count:5"

# Type definitions
npx @sourcegraph/src search -json "repo:github.com/OWNER/REPO FUNCTION_NAME type:symbol lang:typescript count:5"
```

### Step 3: Fetch Full File Content

Use the GraphQL API to get the full file:

```bash
npx @sourcegraph/src api -query='{ repository(name: "github.com/OWNER/REPO") { commit(rev: "HEAD") { blob(path: "PATH/TO/FILE.md") { content } } } }'
```

The response is at `data.repository.commit.blob.content`.

## Examples

### React Hooks
```bash
# Find repo
ddgr --json -n 3 -w github.com "react hooks"
# -> github.com/facebook/react

# Search for docs
SRC_ENDPOINT=https://sourcegraph.com npx @sourcegraph/src search -json "repo:github.com/facebook/react file:docs/ hooks count:5"

# Fetch a doc file
SRC_ENDPOINT=https://sourcegraph.com npx @sourcegraph/src api -query='{ repository(name: "github.com/facebook/react") { commit(rev: "HEAD") { blob(path: "docs/hooks.md") { content } } } }'
```

### Zod Validation
```bash
ddgr --json -n 3 -w github.com "zod typescript validation"
# -> github.com/colinhacks/zod (README at packages/zod/README.md)

SRC_ENDPOINT=https://sourcegraph.com npx @sourcegraph/src search -json "repo:github.com/colinhacks/zod file:README.md count:3"
```

## Fallback: Direct GitHub Fetch

If Sourcegraph doesn't have the repo indexed:

```bash
# Via Jina Reader (markdown output)
curl -s "https://r.jina.ai/https://github.com/OWNER/REPO"

# Via raw GitHub (specific file)
curl -sL "https://raw.githubusercontent.com/OWNER/REPO/main/README.md"
```

## Tips

- Always search DuckDuckGo first to confirm the correct `owner/repo`
- Use `count:5` or lower to keep results small
- `file:\.md$` for docs, `type:symbol` for definitions, `file:test` for examples
- Some repos have nested paths (e.g., Zod at `packages/zod/README.md`) — use exact paths from search
- Fall back to WebSearch if both DDG and Sourcegraph fail
