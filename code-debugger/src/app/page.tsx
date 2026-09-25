'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import SkybirdGame from './SkybirdGame';
import HillClimbGame from './HillClimbGame';
import { 
  Play, 
  Send, 
  Code2, 
  Bot, 
  User,
  RefreshCw,
  Copy,
  Check,
  ChevronDown,
  FileCode2,
  ShieldCheck,
  WandSparkles,
  Braces,
} from 'lucide-react';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

type ApiResponse = {
  fixedCode?: string;
  diagnosis?: string;
  error?: string;
};

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
  const [isGameOpen, setIsGameOpen] = useState(false);
  const [isHillClimbOpen, setIsHillClimbOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Welcome to DebugCraft Studio. Paste code into the editor, then run an analysis to identify syntax, logic, and runtime issues. You can also ask a focused question in the chat.",
      timestamp: 'Just now',
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

    if (query.trim().toLowerCase() === 'skybird') {
      setPrompt('');
      setIsGameOpen(true);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Secret mode unlocked. Welcome to Skybird.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      return;
    }

    if (query.trim().toLowerCase() === 'hillclimb') {
      setPrompt('');
      setIsHillClimbOpen(true);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Hill Climb unlocked. Keep your wheels on the ridge.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsProcessing(true);

    const conversation = messages
      .filter((message) => message.id !== 'welcome')
      .slice(-8)
      .map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch('/api/debug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode,
          language,
          instruction: query,
          conversation,
        }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'The debugging service returned an error.');
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to connect to AI debugging pipeline.';
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ **Engineer Alert**: ${message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="studio-shell flex flex-col h-screen overflow-hidden">
      <header className="studio-header h-16 shrink-0 px-5 lg:px-7 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="brand-mark"><Braces className="w-4 h-4" /></div>
          <div className="min-w-0">
            <h1 className="brand-name">DebugCraft <span>Studio</span></h1>
            <p className="brand-subtitle">Code analysis workspace</p>
          </div>
          <span className="version-tag">BETA</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="language-picker">
            <Code2 className="w-4 h-4 text-cyan-300" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Programming language"
              className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer appearance-none pr-5"
            >
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 -ml-5 pointer-events-none" />
          </div>

          <button
            onClick={() => executeDebug()}
            disabled={isProcessing}
            className="primary-action"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run analysis</span>
              </>
            )}
          </button>
        </div>
      </header>

      <main className="workspace-grid flex-1 grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-800/80">
        
        {/* Column 1: AI Chat & Reasoning Panel (3 cols) */}
        <section className="panel chat-panel col-span-12 md:col-span-3 flex flex-col h-full overflow-hidden">
          <div className="panel-header">
            <div className="panel-title"><Bot className="w-4 h-4 text-violet-300" /><h2>Copilot</h2></div>
            <span className="live-indicator"><span />Online</span>
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
                  <div className="avatar assistant-avatar">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-xl max-w-[85%] whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'message user-message'
                      : 'message assistant-message'
                  }`}
                >
                  {m.content}
                  <div className="message-time">{m.timestamp}</div>
                </div>
                {m.role === 'user' && (
                  <div className="avatar user-avatar">
                    <User className="w-3.5 h-3.5" />
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
            className="chat-composer p-3 border-t border-slate-800/80 flex gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask about this code..."
              aria-label="Ask the copilot"
              className="chat-input flex-1 px-3 py-2 text-xs"
            />
            <button
              type="submit"
              disabled={isProcessing}
              className="send-button disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </section>

        {/* Column 2: Active Input Editor (5 cols) */}
        <section className="panel col-span-12 md:col-span-5 flex flex-col h-full overflow-hidden">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-cyan-300" />
              <h2 className="panel-heading">Source code</h2>
            </div>
            <span className="panel-meta">editable</span>
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
        <section className="panel col-span-12 md:col-span-4 flex flex-col h-full overflow-hidden">
          <div className="panel-header">
            <div className="flex items-center gap-2">
              <WandSparkles className="w-4 h-4 text-emerald-300" />
              <h2 className="panel-heading">Resolved output</h2>
            </div>
            {fixedCode && (
              <button
                onClick={copyToClipboard}
                className="copy-button"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
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
              <div className="empty-output h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="empty-icon"><ShieldCheck className="w-6 h-6" /></div>
                <div>
                  <p className="text-sm text-slate-300 font-medium">Ready for a clean pass</p>
                  <p className="text-xs max-w-xs leading-relaxed mt-1">Run an analysis to see repaired code and a diagnosis here.</p>
                </div>
              </div>
            )}
          </div>
        </section>

      </main>
      <footer className="status-bar">
        <span><span className="status-dot" />Local workspace</span>
        <span>Monaco editor</span>
      </footer>
      {isGameOpen && <SkybirdGame onClose={() => setIsGameOpen(false)} />}
      {isHillClimbOpen && <HillClimbGame onClose={() => setIsHillClimbOpen(false)} />}
    </div>
  );
}
