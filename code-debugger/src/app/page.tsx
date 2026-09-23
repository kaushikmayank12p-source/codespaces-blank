'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Play, 
  Send, 
  Sparkles, 
  Code2, 
  Terminal, 
  Bot, 
  User, 
  CheckCircle2, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const DEFAULT_JAVA_CODE = `import java.util.Scanner;

public class BuggyCalculator {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter first number: ");
        double num1 = scanner.nextDouble();

        System.out.print("Enter operator (+, -, *, /): ");
        String operator = null;

        System.out.print("Enter second number: ");
        double num2 = scanner.nextDouble();

        double result = 0;

        if (operator == "+") {
            result = num1 + num2;
        } else if (operator == "-") {
            result = num1 - num2;
        } else if (operator == "*") {
            result = num1 * num2
        } else if (operator == "/") {
            result = num1 / 0;
        } else {
            System.out.println("Invalid operator!");
        }

        System.out.println("Result: " + result);
    }
}`;

export default function DebugCraftStudio() {
  const [language, setLanguage] = useState('java');
  const [inputCode, setInputCode] = useState(DEFAULT_JAVA_CODE);
  const [fixedCode, setFixedCode] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 **Welcome to DebugCraft Studio!** 🚀\n\nI'm your Principal Software Engineer copilot. Drop buggy code into the center editor, ask any questions here, or hit **⚡ Run Debug Engine** to auto-fix and diagnose logic bugs.",
      timestamp: 'Ready',
    },
  ]);

  const copyToClipboard = () => {
    if (!fixedCode) return;
    navigator.clipboard.writeText(fixedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeDebug = async (userPrompt?: string) => {
    const query = userPrompt || prompt || 'Analyze and resolve all bugs in this code.';
    if (isProcessing) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsProcessing(true);

    try {
      const res = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode,
          language,
          instruction: query,
        }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.fixedCode !== undefined) {
        setFixedCode(data.fixedCode);
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.diagnosis || '✅ All checks passed! No issues detected.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Engineer Alert**: ${err.message || 'Unable to connect to AI debugging pipeline.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-slate-100 font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-slate-800 bg-[#161b22] px-6 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛠️</span>
          <h1 className="font-bold text-lg tracking-wide bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            DebugCraft Studio
          </h1>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
            v2.0 ⚡
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#0d1117] border border-slate-700 px-3 py-1.5 rounded-lg">
            <span className="text-sm">🌐</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="java">☕ Java</option>
              <option value="python">🐍 Python</option>
              <option value="javascript">📜 JavaScript</option>
              <option value="typescript">🔷 TypeScript</option>
              <option value="c">⚙️ C</option>
              <option value="cpp">🚀 C++</option>
            </select>
          </div>

          <button
            onClick={() => executeDebug()}
            disabled={isProcessing}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition active:scale-95 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Diagnosing... 🧠</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Debug Engine ⚡</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main 3-Column Responsive Grid */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-800">
        
        {/* Column 1: AI Chat & Reasoning Panel (3 cols) */}
        <section className="col-span-12 md:col-span-3 flex flex-col bg-[#161b22]/70 h-full overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex items-center gap-2 bg-[#161b22]">
            <Bot className="w-4 h-4 text-purple-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Copilot Chat & Diagnosis 💬
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center shrink-0">
                    🤖
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[85%] whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-[#21262d] text-slate-200 border border-slate-700/60 rounded-bl-none shadow-inner'
                  }`}
                >
                  {m.content}
                  <div className="mt-1 text-[10px] opacity-40 text-right">{m.timestamp}</div>
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                    👨‍💻
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (prompt.trim()) executeDebug(prompt);
            }}
            className="p-3 border-t border-slate-800 bg-[#161b22] flex gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a question or type 'hi'... 💭"
              className="flex-1 bg-[#0d1117] border border-slate-700 px-3 py-2 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-lg text-white disabled:opacity-50 transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>

        {/* Column 2: Active Input Editor (5 cols) */}
        <section className="col-span-12 md:col-span-5 flex flex-col bg-[#0d1117] h-full overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#161b22]">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Source Code Editor ✍️
              </h2>
            </div>
            <span className="text-[11px] text-amber-400/80 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Input Area 📝
            </span>
          </div>

          <div className="flex-1 overflow-hidden">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={inputCode}
              onChange={(val) => setInputCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderWhitespace: 'none',
              }}
            />
          </div>
        </section>

        {/* Column 3: Fixed Clean Output Column (4 cols) */}
        <section className="col-span-12 md:col-span-4 flex flex-col bg-[#0d1117] h-full overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-[#161b22]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Resolved Output ✨
              </h2>
            </div>
            {fixedCode && (
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-slate-300 border border-slate-700 transition"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied! ✅' : 'Copy 📋'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-hidden relative">
            {fixedCode ? (
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={fixedCode}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                }}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                <span className="text-4xl">🪄</span>
                <p className="text-xs max-w-xs leading-relaxed">
                  Clean, production-ready code will appear here after clicking <b>Run Debug Engine</b> ⚡
                </p>
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
