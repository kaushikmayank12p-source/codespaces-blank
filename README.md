# ⚡ DebugCraft Studio
> An intelligent, multi-language code debugging studio built with Next.js, Monaco Editor, and a ChatGPT-inspired developer interface.
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Monaco Editor](https://img.shields.io/badge/Monaco_Editor-1E1E1E?style=for-the-badge&logo=visual-studio-code&logoColor=007ACC)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
---
## 🌟 Overview
**DebugCraft Studio** is a web-based code repair and analysis tool designed to eliminate the friction of debugging syntax errors, boundary violations, and runtime exceptions. 
Featuring a **3-column developer layout**, it allows programmers to inspect problematic code, chat with an integrated debugging copilot, compare side-by-side diffs, and retrieve sanitized production code in a single click.
---
## 🚀 Key Features
* **🖥️ 3-Column Pro Workspace**:
  * **Copilot Chat (Left)**: Conversational assistant for explaining root causes, stack traces, and edge cases (collapsible).
  * **Source Editor (Center)**: Full VS Code-style editor supporting syntax highlighting and line counters.
  * **Corrected Output (Right)**: Dedicated final results pane with a persistent **"Copy Result"** button and inline diffing.
* **🌐 Broad Language Support**: Pre-configured presets and highlighters for **Java**, **C**, **HTML**, **JavaScript**, and **Python**.
* **🔍 Visual Diff Comparison**: Inspect line-by-line additions and deletions using Monaco's native `DiffEditor`.
* **🎨 Modern Developer Aesthetics**: Built with high-contrast neutral zinc tones, subtle neon accents, and smooth transitions inspired by modern devtools like Raycast and ChatGPT Canvas.
* **⚡ One-Click Copy**: Instant clipboard export for rapid integration into local IDEs.
---
## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js](https://nextjs.org/) (App Router, React 19) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Code Editor** | [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Effects** | `canvas-confetti` |

---
## 📂 Project Structure
```text
code-debugger/
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css        # Tailwind directives and custom variables
│   │   ├── layout.tsx         # Root HTML/Body shell
│   │   └── page.tsx           # 3-column debugging workspace
│   └── lib/
│       └── constants.ts       # Supported languages & starter templates
├── public/                    # Static assets & icons
├── package.json
├── tailwind.config.ts
└── tsconfig.json
