# DebugCraft Studio

DebugCraft Studio is a focused code review workspace built around a Monaco editor, a debugging chat panel, and a resolved-output pane. It is designed for quickly sending a code sample for analysis, understanding the diagnosis, and copying the suggested repair.

The Next.js application lives in [`code-debugger/`](code-debugger/). See the [application README](code-debugger/README.md) for setup, configuration, and the project layout.

## Quick start

```bash
cd code-debugger
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

## Checks

```bash
cd code-debugger
npm run lint
npm run build
```

The remote analysis route reads `OPENROUTER_API_KEY` from `.env.local`. When the remote model is unavailable, the app falls back to its local Java checks.
