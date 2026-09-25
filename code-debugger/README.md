# DebugCraft Studio

DebugCraft Studio is a small web interface styled like a debugger. It combines a Monaco editor, a conversational chat panel, and a read-only output pane for exploring code, asking programming questions, and viewing suggested changes. It also has several built-in games hidden behind special chat codes.

## Built-in games

Type one of these codes into the Copilot chat to open a game:

- `SKYBIRD`: a flying bird game with pipes, scoring, keyboard controls, and restart behavior.
- `HILLCLIMB`: a hill-driving game with rolling terrain, gas and brake controls, fuel, and distance tracking.
- `CODEBREAK`: Signal Shift, a timed reaction game about clicking a moving signal as quickly as possible.

Games run inside the app and can be closed with the close button or `Esc`.

## What it does

- Accepts code in the editor and lets you choose a language.
- Sends an analysis request with an optional instruction or question.
- Displays a diagnosis alongside the repaired code returned by the debugging route.
- Falls back to a local Java analysis when the upstream model is unavailable.
- Copies the resolved code to the clipboard from the output panel.

The current editor includes starter Java code with several intentional issues. That makes it useful for checking the full request flow without preparing a sample from scratch.

## Stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Monaco Editor via `@monaco-editor/react`
- Lucide React icons
- OpenRouter-compatible OpenAI client for the remote analysis path

## Run locally

Use Node.js 20 or newer, then install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) once the server is running.

To create a production build:

```bash
npm run build
npm run start
```

## Configuration

The API route reads `OPENROUTER_API_KEY` from the environment. Add it to `.env.local` when you want to use the remote model:

```bash
OPENROUTER_API_KEY=your-key-here
```

The interface still includes local responses and Java code checks when the remote service is unavailable.

## Project layout

```text
src/
├── app/
│   ├── api/debug/route.ts   # Analysis endpoint and local fallback
│   ├── globals.css           # Workspace theme and responsive layout
│   ├── layout.tsx            # Metadata and font setup
│   └── page.tsx              # Debugging workspace
└── lib/constants.ts          # Language and starter-code definitions
```

## Notes

The API route is intentionally lightweight. It is a useful starting point for adding richer language-specific diagnostics, streaming responses, authentication, or persistent project history later.
