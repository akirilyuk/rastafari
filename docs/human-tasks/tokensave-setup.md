# TokenSave setup

Human (or Cloud Agent `install`) steps so Cursor can use [TokenSave](https://github.com/aovestdipaperino/tokensave): a local code-graph MCP server. Agents then query symbols instead of grepping the tree, which cuts token usage.

The repo already contains:

- `.cursor/mcp.json` — stdio MCP server `tokensave serve`
- `.cursor/hooks.json` — redirect wasteful Grep/Shell discovery
- `.cursor/rules/tokensave.mdc` — prefer graph tools
- `scripts/install-tokensave.sh` — download the Linux binary, `tokensave init`, `tokensave sync`
- `.cursor/environment.json` `install` / `start` — Cloud Agents run that script, then sync on boot

The `.tokensave/` graph database is gitignored. Each machine rebuilds it locally.

## Laptop (Cursor desktop)

1. Install the CLI from [TokenSave releases](https://github.com/aovestdipaperino/tokensave/releases) (or Homebrew `brew install aovestdipaperino/tap/tokensave`, or `cargo install tokensave`). Put `tokensave` on your `PATH`.
2. From the repo root:

   ```bash
   tokensave init
   tokensave sync
   ```

3. Restart Cursor so it reloads `.cursor/mcp.json`.
4. Confirm MCP: Cursor Settings → MCP → `tokensave` should be connected. Optional: `tokensave status` in the project root.

Linux Cloud-style install (same script agents use):

```bash
bash scripts/install-tokensave.sh
```

The script currently fetches the Linux binary (x86_64 or arm64). On macOS use Homebrew or a macOS release asset instead.

## Cursor Cloud Agents

No extra secrets. `install` already runs `bash scripts/install-tokensave.sh` after `npm ci`. New environment **builds** pick this up; an already-running agent will not.

After a new agent starts:

- `tokensave --version` prints `7.11.1` (or the pinned `TOKENSAVE_VERSION`)
- `tokensave status` shows this repo indexed
- MCP tools named `tokensave_*` are available if the environment allows project MCP servers

If MCP is disconnected, the agent still has the CLI for `tokensave search` / `tokensave sync`, and falls back to Grep/Read.

## Verify

```bash
tokensave --version
tokensave status
tokensave tool search isSupabaseConfigured
```

You should see symbols from `src/lib/supabase.ts` without opening the whole tree.

## Notes

- Do not commit `.tokensave/` (local libSQL graph).
- `tokensave install --local --agent cursor` was already run; you should not need to re-run it unless you upgrade TokenSave and want it to rewrite `.cursor/mcp.json`.
- Turn off per-call savings narration (saves *output* tokens) with `TOKENSAVE_REPORT_SAVINGS=false` or `"report_savings": false` in `.tokensave/config.json`.
