'use client';

import React, { useState, useRef, useEffect } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import {
  Sparkles,
  ArrowUp,
  Bot,
  Copy,
  Check,
  GitCompare,
  PanelLeftClose,
  PanelLeft,
  RotateCcw,
  CheckCircle2,
  FileCode2,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, STARTER_CODE, SupportedLanguage } from '@/lib/constants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ThreeColumnDebuggerPage() {
  const [language, setLanguage] = useState<SupportedLanguage>('java');
  const [inputCode, setInputCode] = useState<string>(STARTER_CODE['java'] || '');
  const [fixedCode, setFixedCode] = useState<string>('');
  const [showDiff, setShowDiff] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Welcome! Paste your code into the center editor and hit "Debug & Fix" to see the clean output and diagnosis.',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setInputCode(STARTER_CODE[lang]);
    setFixedCode('');
    setShowDiff(false);
  };

  const handleCopy = (codeToCopy: string) => {
    if (!codeToCopy) return;
    navigator.clipboard.writeText(codeToCopy);
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
        body: JSON.stringify({ code: inputCode, language }),
      });

      const data = await res.json();

      if (data.fixedCode) {
        setFixedCode(data.fixedCode);

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I've analyzed your **${language.toUpperCase()}** code and fixed the bugs.\n\n### Diagnosis:\n${data.diagnosis}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Could not reach the debugging engine. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#0b0f17] text-slate-100 font-sans antialiased overflow-hidden">
      {/* Top Bar */}
      <header className="h-14 border-b border-slate-800/80 bg-[#111827]/80 backdrop-blur-md px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              DebugCraft Studio
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Live AI
            </span>
          </div>
        </div>

        {/* Language Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {SUPPORTED_LANGUAGES.map((l) => (
            <button
              key={l.value}
              onClick={() => handleLanguageChange(l.value)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                language === l.value
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setInputCode(STARTER_CODE[language]);
              setFixedCode('');
              setShowDiff(false);
            }}
            title="Reset code"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent hover:border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => executeDebug()}
            disabled={isProcessing}
            className="relative flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:opacity-95 shadow-md shadow-indigo-500/25 disabled:opacity-50 transition"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Analyzing...' : 'Debug & Fix'}</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Workspace */}
      <div className="flex-1 flex min-h-0 divide-x divide-slate-800/80">
        {/* Column 1: AI Chat Assistant */}
        <div
          className={`${
            sidebarOpen ? 'w-80 xl:w-96' : 'w-12'
          } transition-all duration-300 ease-in-out bg-[#0d131f] flex flex-col h-full shrink-0 relative`}
        >
          <div className="h-10 px-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-300">Debugger Copilot</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  title="Collapse chat"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-full flex justify-center py-2 text-slate-400 hover:text-slate-200"
                title="Expand chat"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {sidebarOpen && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-2.5 text-xs leading-relaxed ${
                      m.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 max-w-[85%] ${
                        m.role === 'user'
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-[#151c2c] border border-slate-800 text-slate-300 rounded-tl-none space-y-1.5'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>
                      <div className="text-[9px] text-slate-500 text-right">{m.timestamp}</div>
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-indigo-400 text-xs py-1">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Resolving syntax & runtime logic...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (prompt.trim()) executeDebug();
                  }}
                  className="rounded-xl bg-[#151c2c] border border-slate-700/80 focus-within:border-indigo-500 p-2 flex flex-col gap-2"
                >
                  <textarea
                    rows={2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask about an error or request changes..."
                    className="w-full bg-transparent resize-none outline-none text-xs text-slate-200 placeholder-slate-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (prompt.trim()) executeDebug();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500">Enter to send</span>
                    <button
                      type="submit"
                      disabled={isProcessing || !prompt.trim()}
                      className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-slate-800 disabled:text-slate-600 transition"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        {/* Column 2: Source Code Editor */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0b0f17]">
          <div className="h-10 px-4 border-b border-slate-800/80 bg-slate-900/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono font-medium">
                SOURCE
              </span>
              <span className="text-xs text-slate-400 font-medium capitalize">{language} Input</span>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {inputCode.split('\n').length} lines
            </span>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={inputCode}
              onChange={(val) => setInputCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>
        </div>

        {/* Column 3: Dedicated Final Output Column */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#0d131f] border-l border-slate-800/80">
          <div className="h-10 px-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-mono font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                CORRECTED OUTPUT
              </span>
              {fixedCode && (
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className={`text-[11px] px-2 py-0.5 rounded border transition flex items-center gap-1 ${
                    showDiff
                      ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                      : 'border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <GitCompare className="w-3 h-3" />
                  {showDiff ? 'Show Clean Code' : 'Show Diff'}
                </button>
              )}
            </div>

            <button
              onClick={() => handleCopy(fixedCode)}
              disabled={!fixedCode}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition shadow-sm ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-indigo-600/20 hover:bg-indigo-600/30 border-indigo-500/40 text-indigo-200 hover:text-white'
              } disabled:opacity-40 disabled:hover:bg-transparent`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Result'}</span>
            </button>
          </div>

          <div className="flex-1 min-h-0 relative">
            {!fixedCode ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 shadow-inner">
                  <FileCode2 className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="text-sm font-semibold text-slate-300">Clean Output Column</p>
                <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                  Click <span className="text-indigo-400 font-medium">"Debug & Fix"</span> above to test code repairs.
                </p>
              </div>
            ) : showDiff ? (
              <DiffEditor
                height="100%"
                theme="vs-dark"
                language={language}
                original={inputCode}
                modified={fixedCode}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  renderSideBySide: false,
                  automaticLayout: true,
                  padding: { top: 12 },
                }}
              />
            ) : (
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={fixedCode}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12 },
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
