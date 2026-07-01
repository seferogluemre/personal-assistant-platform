"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { ChatMessages, type Message, type Attachment } from "@/components/dashboard/ChatMessages";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/AuthProvider";

// ─── Types ───────────────────────────────────────────────────────────────────

type Thread = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

const createThread = (): Thread => ({
  id: crypto.randomUUID(),
  title: "New Chat",
  messages: [],
  createdAt: new Date(),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

// ─── Component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [threads, setThreads] = useState<Thread[]>([createThread()]);
  const [activeThreadId, setActiveThreadId] = useState(threads[0].id);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId)!;

  useEffect(() => setMounted(true), []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages, isLoading]);

  // Focus edit input
  useEffect(() => {
    if (editingThreadId) editInputRef.current?.focus();
  }, [editingThreadId]);

  const handleNewThread = () => {
    const t = createThread();
    setThreads((prev) => [t, ...prev]);
    setActiveThreadId(t.id);
  };

  // ─── Thread title editing ────────────────────────────────────────────────

  const startEditingTitle = (threadId: string, currentTitle: string) => {
    setEditingThreadId(threadId);
    setEditingTitle(currentTitle);
  };

  const saveTitle = () => {
    if (!editingThreadId) return;
    const trimmed = editingTitle.trim();
    if (trimmed) {
      setThreads((prev) => prev.map((t) => t.id === editingThreadId ? { ...t, title: trimmed } : t));
    }
    setEditingThreadId(null);
    setEditingTitle("");
  };

  // ─── File attachment ─────────────────────────────────────────────────────

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const att: Attachment = {
        name: file.name,
        type: isImage ? "image" : "document",
        size: formatFileSize(file.size),
      };
      if (isImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
          att.url = e.target?.result as string;
          setAttachments((prev) => [...prev, att]);
        };
        reader.readAsDataURL(file);
      } else {
        setAttachments((prev) => [...prev, att]);
      }
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── Send message ────────────────────────────────────────────────────────

  const handleSend = async () => {
    const content = input.trim();
    if ((!content && attachments.length === 0) || isLoading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    const isFirst = activeThread.messages.length === 0;
    const newTitle = isFirst
      ? (content || attachments[0]?.name || "New Chat").slice(0, 40)
      : activeThread.title;

    setThreads((prev) =>
      prev.map((t) => t.id === activeThreadId ? { ...t, title: newTitle, messages: [...t.messages, userMsg] } : t)
    );
    setAttachments([]);
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 1400));

    const aiMsg: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Mesajınızı aldım: "${content}"${attachments.length > 0 ? ` (${attachments.length} dosya eki ile)` : ""}. Bu kısım yakında Mastra AI altyapısına bağlanacak. Şu an demo modundayım!`,
      timestamp: new Date(),
    };

    setThreads((prev) =>
      prev.map((t) => t.id === activeThreadId ? { ...t, messages: [...t.messages, aiMsg] } : t)
    );
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = activeThread.messages.length === 0;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-[220px] flex-shrink-0 bg-muted/30 border-r flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
              <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold">openclaw</span>
        </div>

        <div className="p-3">
          <button
            onClick={handleNewThread}
            className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20 rounded-lg px-3 h-9 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Thread
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
          {threads.map((t) => (
            <div
              key={t.id}
              onClick={() => { setActiveThreadId(t.id); setEditingThreadId(null); }}
              className={`group w-full text-left text-xs rounded-lg px-3 py-2.5 transition-colors leading-snug cursor-pointer flex items-center gap-1 ${activeThreadId === t.id ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {editingThreadId === t.id ? (
                <input
                  ref={editInputRef}
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingThreadId(null); }}
                  className="bg-transparent border border-border rounded px-1 py-0.5 text-xs w-full outline-none focus:border-primary"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{t.title}</div>
                    <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                      {t.createdAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEditingTitle(t.id, t.title); }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity flex-shrink-0"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-3 border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{user?.name || "Kullanıcı"}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.role?.name || "Üye"}</p>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0">
                  <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                </svg>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 bg-popover border-border">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.name || "Kullanıcı"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm cursor-pointer" onClick={logout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ─── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 h-14 border-b flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            <span className="truncate max-w-[300px] font-medium">{activeThread.title}</span>
          </div>

          {/* Right side: dark mode toggle */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors border border-transparent dark:border-transparent"
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
            )}
          </div>
        </header>

        {/* Messages / Empty State */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {isEmpty ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold">Sana nasıl yardımcı olabilirim?</h1>
                <p className="text-sm text-muted-foreground">Yavuz AI&apos;a bir şeyler sor veya dosya yükle</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <ChatMessages messages={activeThread.messages} isLoading={isLoading} />
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ─── Input Area ────────────────────────────────────────────────── */}
        <div className="px-6 pb-6 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="bg-muted/30 border border-border dark:border-border/30 rounded-2xl overflow-hidden focus-within:border-foreground/20 transition-colors">
              {/* Attachment previews */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 px-4 pt-3">
                  {attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 bg-background border rounded-lg px-2.5 py-1.5 text-xs group">
                      {att.type === "image" && att.url ? (
                        <img src={att.url} alt={att.name} className="w-6 h-6 rounded object-cover" />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      )}
                      <span className="truncate max-w-[120px] text-foreground">{att.name}</span>
                      <button
                        onClick={() => removeAttachment(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Mesaj yaz... (Shift+Enter yeni satır)"
                className="w-full bg-transparent text-sm placeholder:text-muted-foreground px-4 pt-4 pb-2 resize-none outline-none leading-relaxed"
                style={{ minHeight: "52px", maxHeight: "200px" }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 200) + "px";
                }}
              />

              {/* Bottom toolbar */}
              <div className="flex items-center justify-between px-3 pb-3">
                <div className="flex items-center gap-1">
                  {/* File upload button (rich editor style) */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.pdf,.md,.csv,.json,.png,.jpg,.jpeg,.gif,.webp"
                    className="hidden"
                    onChange={(e) => { handleFileSelect(e.target.files); e.target.value = ""; }}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild={false}>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Dosya Ekle
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Send */}
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && attachments.length === 0) || isLoading}
                  className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-all active:scale-95"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5" />
                    <polyline points="5 12 12 5 19 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
