'use client';

import React, { useState, useRef, useEffect } from 'react';
import Editor, { DiffEditor } from '@monaco-editor/react';
import {
  Sparkles,
  ArrowUp,
  Bot,
  User,
  GitPullRequest,
  Check,
  Copy,
  Code2,
  GitCompare,
  Bug,
  Terminal,
  PanelLeftClose,
  PanelLeft,
  RotateCcw,
  ChevronDown,
  Wand2
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, STARTER_CODE, SupportedLanguage } from '@/lib/constants';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function ChatGPTStyleDebugger() {
  const [language, setLanguage] = useState<SupportedLanguage>('c');
  const [inputCode, setInputCode] = useState<string>(STARTER_CODE['c']);
  const [fixedCode, setFixedCode] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'diff'>('editor');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Hello! Paste your code on the right panel or describe your bug here. You can also paste compiler traces or error stack logs.',
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
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(fixedCode || inputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const executeDebug = (userQuery?: string) => {
    const queryText = userQuery || prompt || 'Please analyze and fix all errors in this code.';
    if (isProcessing) return;

    // Append user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setIsProcessing(true);

    // Simulated high-fidelity AI response
    setTimeout(() => {
      let corrected = inputCode;
      let issuesFound = '';

      if (language === 'c') {
        corrected = `#include <stdio.h>\n\nint main() {\n    int count = 10;\n    printf("Count is: %d\\n", count);\n    return 0;\n}`;
        issuesFound = `• **Missing Semicolon**: Line 5 was missing a terminating \`;\`.\n• **Format Specifier Mismatch**: Changed \`%f\` (float) to \`%d\` (integer) inside \`printf\`.`;
      } else if (language === 'java') {
        corrected = `public class Main {\n    public static void main(String[] args) {\n        String message = "Hello World";\n        System.out.println(message.length());\n    }\n}`;
        issuesFound = `• **NullPointerException Prevention**: Initialized \`message\` before calling \`.length()\`.\n• **Syntax Error**: Added missing semicolon to line 4.`;
      } else {
        corrected = `<!-- Validated Clean Output -->\n` + inputCode.replace(/<div>\s*<p>/g, '<div><p>').replace(/<\/div>\s*<\/p>/g, '</p></div>');
        issuesFound = `• **Tag Mismatch**: Corrected improperly nested HTML structure and closing tags.`;
      }

      setFixedCode(corrected);
      setActiveTab('diff');

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed your **${language.toUpperCase()}** code and fixed the bugs. You can inspect the changes in the **Diff** tab on the canvas.\n\n### Root Causes Identified:\n${issuesFound}\n\nWould you like me to commit these changes or generate unit tests?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsProcessing(false);
    }, 1100);
  };

  return (
    <div className="flex h-screen w-full bg-[#18181b] text-zinc-100 font-sans antialiased overflow-hidden">
      {/* ── Left Panel: ChatGPT-Style Conversation ───────────────── */}
      <div
        className={`${
          sidebarOpen ? 'w-full md:w-[420px] xl:w-[480px]' : 'w-0'
        } transition-all duration-300 ease-in-out border-r border-zinc-800/80 bg-[#121214] flex flex-col h-full shrink-0 relative`}
      >
        {/* Chat Header */}
        <div className="h-14 px-4 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-600/30">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-200">Debug Assistant</h2>
              <p className="text-[10px] text-emerald-400 font-medium">Ready • GPT-4o Engine</p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition"
            title="Collapse chat"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-sm leading-relaxed ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-3 max-w-[85%] text-[13px] ${
                  msg.role === 'user'
                    ? 'bg-zinc-700 text-white rounded-tr-none'
                    : 'bg-[#1e1e22] border border-zinc-800 text-zinc-300 rounded-tl-none space-y-2'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div className="text-[10px] text-zinc-500 text-right">{msg.timestamp}</div>
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-zinc-400 text-xs py-2">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Analyzing code structure and runtime logic...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Box (ChatGPT Style) */}
        <div className="p-3 border-t border-zinc-800/80 bg-[#121214]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (prompt.trim()) executeDebug();
            }}
            className="relative rounded-2xl bg-[#1e1e22] border border-zinc-700/60 focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500 transition shadow-inner flex flex-col p-2.5"
          >
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask to debug, explain an error trace, or fix logic..."
              className="w-full bg-transparent resize-none outline-none text-xs text-zinc-200 placeholder-zinc-500 leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (prompt.trim()) executeDebug();
                }
              }}
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                <Terminal className="w-3.5 h-3.5" />
                <span>Shift + Enter for newline</span>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !prompt.trim()}
                className="w-7 h-7 rounded-xl bg-zinc-100 hover:bg-white text-zinc-900 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center transition"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── Right Panel: Canvas Workspace (Claude / ChatGPT Canvas) ── */}
      <div className="flex-1 flex flex-col h-full bg-[#1e1e22] min-w-0 relative">
        {/* Canvas Toolbar */}
        <div className="h-14 px-5 border-b border-zinc-800/80 bg-[#18181b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition mr-1"
                title="Open chat"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            )}

            {/* Language dropdown */}
            <div className="relative flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-medium">Language:</span>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
                className="bg-[#242429] text-xs font-semibold text-zinc-200 border border-zinc-700/80 rounded-lg px-2.5 py-1 outline-none hover:border-zinc-500 cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#242429] p-0.5 rounded-lg border border-zinc-800 text-xs">
              <button
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                  activeTab === 'editor'
                    ? 'bg-zinc-700 text-white font-medium shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                onClick={() => setActiveTab('diff')}
                disabled={!fixedCode}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition ${
                  activeTab === 'diff'
                    ? 'bg-zinc-700 text-white font-medium shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 disabled:opacity-40 disabled:hover:text-zinc-400'
                }`}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Changes (Diff)</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setInputCode(STARTER_CODE[language]);
                setFixedCode('');
                setActiveTab('editor');
              }}
              title="Reset code"
              className="p-2 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={() => executeDebug()}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>{isProcessing ? 'Fixing...' : 'Fix Errors'}</span>
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 min-h-0 relative">
          {activeTab === 'editor' ? (
            <Editor
              height="100%"
              theme="vs-dark"
              language={language}
              value={fixedCode || inputCode}
              onChange={(v) => {
                if (fixedCode) {
                  setFixedCode(v || '');
                } else {
                  setInputCode(v || '');
                }
              }}
              options={{
                minimap: { enabled: false },
                fontSize: 13.5,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
              }}
            />
          ) : (
            <DiffEditor
              height="100%"
              theme="vs-dark"
              language={language}
              original={inputCode}
              modified={fixedCode}
              options={{
                readOnly: false,
                minimap: { enabled: false },
                fontSize: 13.5,
                renderSideBySide: true,
                automaticLayout: true,
                padding: { top: 16 },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
