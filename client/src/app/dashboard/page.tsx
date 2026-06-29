"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const SUGGESTION_CHIPS = ["Weather", "Code", "Write", "Analyze", "Brainstorm"];

const CHIP_ICONS: Record<string, React.ReactNode> = {
  Weather: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z" /></svg>
  ),
  Code: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
  ),
  Write: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
  ),
  Analyze: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10" /><line x1="12" x2="12" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="14" /></svg>
  ),
  Brainstorm: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 1 5 5c0 1.8-.9 3.4-2.3 4.4L14 12h-4l-.7-0.6C7.9 10.4 7 8.8 7 7a5 5 0 0 1 5-5z" /><path d="M9 17h6" /><path d="M10 21h4" /><line x1="12" y1="12" x2="12" y2="17" /></svg>
  ),
};

type Message = { role: "user" | "assistant"; content: string };

const THREADS = [
  { id: 1, label: "New Chat" },
];

export default function DashboardPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeThread] = useState(1);

  const handleSend = async (text?: string) => {
    const content = text ?? input.trim();
    if (!content || isLoading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsLoading(true);
    // Mock response — ileride Mastra'ya bağlanacak
    await new Promise((r) => setTimeout(r, 1200));
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "Bu kısım yakında Mastra AI asistanına bağlanacak. Şu an demo modunda çalışıyorum!" },
    ]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen bg-[#0d0d0d] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[220px] flex-shrink-0 bg-[#111111] border-r border-white/5 flex flex-col">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-300">openclaw</span>
          </div>
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 h-9 px-3 rounded-lg mb-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Thread
          </Button>
          {THREADS.map((t) => (
            <button
              key={t.id}
              className={`w-full text-left text-sm rounded-lg px-3 h-9 flex items-center transition-colors ${activeThread === t.id
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            New Chat
          </div>
          <button className="text-gray-500 hover:text-white transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </header>

        {/* Messages / Empty State */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <h1 className="text-2xl font-bold text-white mb-8">How can I help you today?</h1>
            </div>
          ) : (
            <div className="flex-1 px-6 py-6 space-y-6 max-w-2xl mx-auto w-full">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
                        ? "bg-white/10 text-white rounded-tr-sm"
                        : "bg-transparent text-gray-200"
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="px-6 pb-6 flex-shrink-0">
          <div className="max-w-2xl mx-auto">
            {/* Main input box */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Send a message... (@ to mention, / for commands)"
                className="w-full bg-transparent text-sm text-white placeholder:text-gray-600 px-4 pt-4 pb-2 resize-none outline-none leading-relaxed"
                style={{ minHeight: "52px", maxHeight: "200px" }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 200) + "px";
                }}
              />
              {/* Bottom toolbar */}
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-2">
                  <button className="text-gray-600 hover:text-gray-400 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-2.5 py-1 border border-white/5">
                    <div className="w-3.5 h-3.5 bg-white/20 rounded-full" />
                    <span className="text-xs text-gray-400">Yavuz AI</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-gray-600 hover:text-gray-400 transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="w-7 h-7 bg-white rounded-full flex items-center justify-center disabled:opacity-30 hover:bg-gray-200 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Suggestion chips — sadece boş halde */}
            {isEmpty && (
              <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                {SUGGESTION_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSend(chip)}
                    className="flex items-center gap-1.5 bg-[#1a1a1a] border border-white/10 text-gray-400 text-xs font-medium px-3 py-2 rounded-full hover:border-white/20 hover:text-white transition-all"
                  >
                    {CHIP_ICONS[chip]}
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
