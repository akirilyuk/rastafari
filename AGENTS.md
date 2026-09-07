<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## TokenSave

This repo wires [TokenSave](https://github.com/aovestdipaperino/tokensave) as a project MCP server (`.cursor/mcp.json`) so agents can query a local code graph instead of scanning files.

When the `tokensave_*` MCP tools are connected, use `tokensave_search` / `tokensave_context` / `tokensave_node` before Grep, Glob, or Explore. Open only the files the graph names. Do not narrate savings metrics unless asked.

Laptop and Cloud Agent install steps: [docs/human-tasks/tokensave-setup.md](docs/human-tasks/tokensave-setup.md).
