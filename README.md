# DebugCraft Studio

DebugCraft Studio is a browser-based coding interface styled like a compact debugger. It has a Monaco editor, a conversational assistant, and an output panel for exploring code ideas and suggested changes. Alongside the debugger-style workspace, it includes a few built-in games that can be opened with special codes.

## Built-in games

Enter one of these codes in the Copilot chat:

- `SKYBIRD` opens a flying bird game with pipes, scoring, keyboard controls, and restart behavior.
- `HILLCLIMB` opens a small hill-driving game with rolling terrain, gas, brake, fuel, and distance tracking.
- `CODEBREAK` opens Signal Shift, a timed reaction game where you click a moving signal to build a score.

Each game can be played inside the app and closed with the close button or `Esc`.

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

The assistant can be connected to an OpenRouter-compatible model with `OPENROUTER_API_KEY` in `.env.local`. Without a provider connection, the interface still includes its local response and Java code-checking behavior.
