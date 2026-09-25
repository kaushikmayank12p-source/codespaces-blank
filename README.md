# DebugCraft Studio

DebugCraft Studio is a browser-based coding interface styled like a compact debugger. It has a Monaco editor, a conversational assistant, and an output panel for exploring code ideas and suggested changes. Alongside the debugger-style workspace, it includes a few built-in games that can be opened with special codes.

## Built-in games

Enter one of these codes in the Copilot chat:

- `SKYBIRD` opens a flying bird game with pipes, scoring, keyboard controls, and if you lose you can restart it again.
- `HILLCLIMB` opens a small hill-driving game with rolling terrain, gas, brake, fuel, and distance tracking. Here you don't have to stop if you stop your vehicle you will lose.
- `CODEBREAK` opens a game which calculate your reaction time, a timed reaction game where you click a moving signal to build a score.

Each game can be played inside my web app and can be closed with the close button or `Esc` or by refreshing the page.

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
