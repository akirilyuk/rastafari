<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## TokenSave

This repo wires [TokenSave](https://github.com/aovestdipaperino/tokensave) as a project MCP server (`.cursor/mcp.json`) so agents can query a local code graph instead of scanning files. Cloud Agents and local agents both follow this.

When the `tokensave_*` MCP tools are connected, use them for code discovery before raw file reads. Start with `tokensave_context` or `tokensave_search`. Use `tokensave_node` or `tokensave_body` for a symbol the graph already named. Open a file with Read only after the graph names that file, or when you need lines the graph did not return. Do not use Grep, Glob, or Explore to scan the repo while TokenSave is connected. Do not narrate savings metrics unless asked.

If TokenSave is disconnected or still loading, fall back to Grep, Glob, and Read.

Laptop and Cloud Agent install steps: [docs/human-tasks/tokensave-setup.md](docs/human-tasks/tokensave-setup.md).

## Branch names

Do not create branches whose names start with `cursor/`. Cloud Agents follow this too.

Pick the prefix from the change:

- `feature/` for new behavior
- `fix/` for a bug fix
- `chores/` for maintenance, tooling, docs, and configuration

Do not add a generated suffix.
