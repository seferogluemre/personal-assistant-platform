"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { ChatMessages, type Message, type Attachment } from "@/components/dashboard/ChatMessages";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/providers/AuthProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { chatService } from "@/services/chat";

// ─── Types ───────────────────────────────────────────────────────────────────

type Thread = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

type TabType = "chat" | "skills" | "prompt" | "account";

type DocType = {
  id: string;
  name: string;
  size: string;
  date: Date;
  status: "success" | "processing";
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
  const [activeTab, setActiveTab] = useState<TabType>("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Chat States
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  // Dialog States
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [threadToDeleteId, setThreadToDeleteId] = useState<string | null>(null);

  // Skills States
  const [skillsEnabled, setSkillsEnabled] = useState({
    rag: true,
    webSearch: false,
    fileAnalysis: true,
  });
  const [documents, setDocuments] = useState<DocType[]>([
    { id: "1", name: "sirket_vizyonu_2026.txt", size: "12 KB", date: new Date(), status: "success" },
    { id: "2", name: "ik_politikalari.pdf", size: "1.2 MB", date: new Date(), status: "success" },
  ]);
  const [isDragging, setIsDragging] = useState(false);

  // System Prompt States
  const [systemPrompt, setSystemPrompt] = useState(
    "Sen OpenClaw asistanısın. Kullanıcıya her zaman kibar, profesyonel ve kısa yanıtlar ver. Bilmediğin konularda uydurmak yerine veritabanından veya webden arama yapacağını belirt."
  );
  const [isUpdatingPrompt, setIsUpdatingPrompt] = useState(false);
  const [showPromptInfo, setShowPromptInfo] = useState(true);

  // Refs
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const skillFileInputRef = useRef<HTMLInputElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId);

  useEffect(() => setMounted(true), []);

  // Sayfa yüklendiğinde sohbetleri ve sistem promptunu çek
  useEffect(() => {
    // 1. Sohbet listesini getir
    chatService.fetchChats()
      .then((chatList) => {
        const mappedThreads: Thread[] = chatList.map(c => ({
          id: c.id,
          title: c.title || "Yeni Sohbet",
          messages: [],
          createdAt: new Date(c.createdAt),
        }));
        setThreads(mappedThreads);
        if (mappedThreads.length > 0) {
          setActiveThreadId(mappedThreads[0].id);
        }
      })
      .catch((err) => {
        console.error("Sohbetler yüklenirken hata oluştu:", err);
      });

    // 2. Sistem promptunu getir
    chatService.getSystemPrompt("Yavuz AI")
      .then((res) => {
        if (res.success) {
          setSystemPrompt(res.agent.systemPrompt);
        }
      })
      .catch((err) => {
        console.error("Sistem promptu yüklenirken hata:", err);
      });
  }, []);

  // Aktif sohbet değiştikçe mesajlarını çek
  useEffect(() => {
    if (!activeThreadId) return;

    // Eğer o sohbet client-side geçici UUID ise çekmeye çalışma
    if (activeThreadId.length > 30) return;

    chatService.fetchMessages(activeThreadId)
      .then((chatMsgs) => {
        const mappedMsgs: Message[] = chatMsgs.map(m => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          timestamp: new Date(m.createdAt),
        }));

        setThreads(prev => prev.map(t => t.id === activeThreadId ? { ...t, messages: mappedMsgs } : t));
      })
      .catch((err) => {
        console.error("Mesajlar çekilirken hata:", err);
      });
  }, [activeThreadId]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (activeTab === "chat") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeThread?.messages, isLoading, activeTab]);

  // Focus edit input
  useEffect(() => {
    if (editingThreadId) editInputRef.current?.focus();
  }, [editingThreadId]);

  const handleNewThread = () => {
    setIsCreateDialogOpen(true);
  };

  const handleCreateThreadSubmit = () => {
    const trimmed = newThreadTitle.trim();
    if (!trimmed) return;
    const t = createThread();
    t.title = trimmed;
    setThreads((prev) => [t, ...prev]);
    setActiveThreadId(t.id);
    setActiveTab("chat");
    setNewThreadTitle("");
    setIsCreateDialogOpen(false);
  };

  const handleDeleteThreadSubmit = async () => {
    if (!threadToDeleteId) return;
    try {
      if (threadToDeleteId.length < 30) {
        await chatService.deleteChat(threadToDeleteId);
      }
      setThreads((prev) => {
        const filtered = prev.filter((t) => t.id !== threadToDeleteId);
        if (activeThreadId === threadToDeleteId) {
          if (filtered.length > 0) {
            setActiveThreadId(filtered[0].id);
          } else {
            setActiveThreadId(null);
          }
        }
        return filtered;
      });
      toast.success("Sohbet başarıyla silindi.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sohbet silinirken hata oluştu.";
      toast.error(msg);
    } finally {
      setThreadToDeleteId(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // ─── Thread Title Edit ───────────────────────────────────────────────────

  const startEditingTitle = (threadId: string, currentTitle: string) => {
    setEditingThreadId(threadId);
    setEditingTitle(currentTitle);
  };

  const saveTitle = async () => {
    if (!editingThreadId) return;
    const trimmed = editingTitle.trim();
    if (trimmed) {
      setThreads((prev) => prev.map((t) => (t.id === editingThreadId ? { ...t, title: trimmed } : t)));
      try {
        if (editingThreadId.length < 30) {
          await chatService.updateChatTitle(editingThreadId, trimmed);
        }
      } catch (err) {
        console.error("Başlık güncellenemedi:", err);
      }
    }
    setEditingThreadId(null);
    setEditingTitle("");
  };

  // ─── Document Upload (For Chat & Skills) ──────────────────────────────────

  const handleFileSelect = (files: FileList | null, destination: "chat" | "skills" = "chat") => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const isImage = file.type.startsWith("image/");
      const sizeStr = formatFileSize(file.size);

      if (destination === "chat") {
        const att: Attachment = {
          name: file.name,
          type: isImage ? "image" : "document",
          size: sizeStr,
        };
        if (isImage) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              att.url = e.target.result as string;
              setAttachments((prev) => [...prev, att]);
            }
          };
          reader.readAsDataURL(file);
        } else {
          setAttachments((prev) => [...prev, att]);
        }
      } else {
        // AI Skills page upload
        const newDoc: DocType = {
          id: crypto.randomUUID(),
          name: file.name,
          size: sizeStr,
          date: new Date(),
          status: "processing",
        };
        setDocuments((prev) => [newDoc, ...prev]);

        // Mock upload progress
        setTimeout(() => {
          setDocuments((prev) =>
            prev.map((d) => (d.id === newDoc.id ? { ...d, status: "success" } : d))
          );
          toast.success(`${file.name} başarıyla hafızaya işlendi.`);
        }, 2000);
      }
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    toast.error("Belge hafızadan silindi.");
  };

  // ─── Messaging ───────────────────────────────────────────────────────────

  const handleSend = async () => {
    const content = input.trim();
    if ((!content && attachments.length === 0) || isLoading || !activeThreadId) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const tempUserId = crypto.randomUUID();
    const userMsg: Message = {
      id: tempUserId,
      role: "user",
      content,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setThreads((prev) =>
      prev.map((t) => (t.id === activeThreadId ? { ...t, messages: [...t.messages, userMsg] } : t))
    );
    setAttachments([]);
    setIsLoading(true);

    try {
      const sendChatId = activeThreadId.length > 30 ? undefined : activeThreadId;
      const res = await chatService.sendMessage(sendChatId, content);

      const aiMsg: Message = {
        id: res.messageId,
        role: "assistant",
        content: res.content,
        timestamp: new Date(res.createdAt),
      };

      setThreads((prev) =>
        prev.map((t) => {
          if (t.id === activeThreadId) {
            const hasCustomTitle = t.title !== "New Chat" && t.title !== "Yeni Sohbet";
            return {
              ...t,
              id: res.chatId,
              title: hasCustomTitle ? t.title : (content.slice(0, 40) || "Yeni Sohbet"),
              messages: t.messages.map(m => m.id === tempUserId ? { ...m, id: crypto.randomUUID() } : m).concat(aiMsg),
            };
          }
          return t;
        })
      );
      setActiveThreadId(res.chatId);

      if (activeThread && activeThread.title && activeThread.title !== "New Chat" && activeThread.title !== "Yeni Sohbet" && sendChatId === undefined) {
        await chatService.updateChatTitle(res.chatId, activeThread.title);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Mesaj gönderilemedi.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── Prompt Update ───────────────────────────────────────────────────────

  const handleUpdatePrompt = async () => {
    setIsUpdatingPrompt(true);
    try {
      await chatService.updateSystemPrompt("Yavuz AI", systemPrompt);
      toast.success("Yavuz AI sistem promptu başarıyla güncellendi!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sistem promptu güncellenirken hata oldu.";
      toast.error(msg);
    } finally {
      setIsUpdatingPrompt(false);
    }
  };

  const isEmpty = !activeThread || activeThread.messages.length === 0;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`flex-shrink-0 bg-muted/30 border-r flex flex-col transition-all duration-300 ${sidebarCollapsed ? "w-[64px]" : "w-[240px]"
          }`}
      >
        {/* Header / Logo */}
        <div className="p-4 border-b flex items-center justify-between overflow-hidden">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-sm font-semibold truncate">openclaw</span>
            </div>
          ) : (
            <div className="mx-auto w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
          )}

          {/* Toggle Button */}
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Expand Trigger when collapsed */}
        {sidebarCollapsed && (
          <div className="p-3 border-b flex justify-center">
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="p-3 space-y-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`w-full flex items-center gap-3 text-sm rounded-lg h-10 transition-all ${sidebarCollapsed ? "justify-center" : "px-3"
              } ${activeTab === "chat" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {!sidebarCollapsed && <span>Asistan Sohbet</span>}
          </button>

          <button
            onClick={() => setActiveTab("skills")}
            className={`w-full flex items-center gap-3 text-sm rounded-lg h-10 transition-all ${sidebarCollapsed ? "justify-center" : "px-3"
              } ${activeTab === "skills" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            {!sidebarCollapsed && <span>AI Skills</span>}
          </button>

          <button
            onClick={() => setActiveTab("prompt")}
            className={`w-full flex items-center gap-3 text-sm rounded-lg h-10 transition-all ${sidebarCollapsed ? "justify-center" : "px-3"
              } ${activeTab === "prompt" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            {!sidebarCollapsed && <span>Prompt Yönetimi</span>}
          </button>

          <button
            onClick={() => setActiveTab("account")}
            className={`w-full flex items-center gap-3 text-sm rounded-lg h-10 transition-all ${sidebarCollapsed ? "justify-center" : "px-3"
              } ${activeTab === "account" ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            {!sidebarCollapsed && <span>Hesabım</span>}
          </button>
        </div>

        {/* Conditional Thread list in Sidebar if Chat is active */}
        {!sidebarCollapsed && activeTab === "chat" && (
          <div className="flex-1 overflow-y-auto px-3 border-t pt-3 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Sohbetler</span>
              <button
                onClick={handleNewThread}
                className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-0.5 min-h-0">
              {threads.map((t) => (
                <div
                  key={t.id}
                  onClick={() => { setActiveThreadId(t.id); setEditingThreadId(null); }}
                  className={`group w-full text-left text-xs rounded-lg px-2.5 py-2 transition-colors leading-snug cursor-pointer flex items-center gap-1 ${activeThreadId === t.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  {editingThreadId === t.id ? (
                    <input
                      ref={editInputRef}
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={saveTitle}
                      onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditingThreadId(null); }}
                      className="bg-background border rounded px-1 py-0.5 text-xs w-full outline-none focus:border-primary"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{t.title}</div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 flex-shrink-0 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEditingTitle(t.id, t.title); }}
                          className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setThreadToDeleteId(t.id); setIsDeleteDialogOpen(true); }}
                          className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Profile avatar bottom section */}
        <div className="p-3 border-t mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-muted cursor-pointer transition-colors ${sidebarCollapsed ? "justify-center" : ""}`}>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              {!sidebarCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs font-medium text-foreground truncate">{user?.name || "Kullanıcı"}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{user?.role?.name || "Üye"}</p>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground flex-shrink-0">
                    <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                  </svg>
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={sidebarCollapsed ? "center" : "start"} className="w-48 bg-popover border-border">
              <div className="px-3 py-2">
                <p className="text-sm font-medium">{user?.name || "Kullanıcı"}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-sm cursor-pointer" onClick={() => { setActiveTab("account"); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm cursor-pointer" onClick={() => setIsLogoutDialogOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-red-500">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* ─── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 bg-background text-foreground">
        {/* Header */}
        <header className="flex items-center justify-between px-6 h-14 border-b flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
            <span className="capitalize">{activeTab === "chat" ? (activeThread?.title || "Sohbet") : activeTab === "skills" ? "AI Skills" : activeTab === "prompt" ? "Prompt Yönetimi" : "Hesabım"}</span>
          </div>

          {/* Right side: dark mode toggle */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              </button>
            )}
          </div>
        </header>

        {/* Tab Contents */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* 1. CHAT TAB */}
          {activeTab === "chat" && (
            <>
              {/* Messages / Empty State */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {isEmpty ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                        </svg>
                      </div>
                      <h1 className="text-xl font-bold">Sana nasıl yardımcı olabilirim?</h1>
                      <p className="text-sm text-muted-foreground">Yavuz AI&apos;a bir şeyler sor veya dosya yükle</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    <ChatMessages messages={activeThread?.messages || []} isLoading={isLoading} />
                    <div ref={bottomRef} />
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="px-6 pb-6 flex-shrink-0">
                <div className="max-w-3xl mx-auto">
                  <div className="bg-muted/30 border border-border/80 dark:border-border/30 rounded-2xl overflow-hidden focus-within:border-foreground/20 transition-colors">
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
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept=".txt,.pdf,.md,.csv,.json,.png,.jpg,.jpeg,.gif,.webp"
                          className="hidden"
                          onChange={(e) => { handleFileSelect(e.target.files, "chat"); e.target.value = ""; }}
                        />
                        <Tooltip>
                          <TooltipTrigger
                            onClick={() => fileInputRef.current?.click()}
                            className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Dosya Ekle
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Send Button */}
                      <button
                        onClick={handleSend}
                        disabled={(!input.trim() && attachments.length === 0) || isLoading}
                        className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-all active:scale-95 animate-in fade-in zoom-in"
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
            </>
          )}

          {/* 2. AI SKILLS TAB */}
          {activeTab === "skills" && (
            <div className="flex-1 overflow-y-auto p-6 max-w-4xl w-full mx-auto space-y-8 animate-in fade-in duration-300">
              {/* Yetenek Toggles */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="border rounded-xl p-5 bg-muted/20 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Veritabanı Araması (RAG)</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      AI asistanı yüklü dökümanları tarar ve oradan yanıt üretir.
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <span className={`text-xs font-semibold ${skillsEnabled.rag ? "text-green-500" : "text-muted-foreground"}`}>
                      {skillsEnabled.rag ? "Aktif" : "Pasif"}
                    </span>
                    <button
                      onClick={() => setSkillsEnabled(prev => ({ ...prev, rag: !prev.rag }))}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${skillsEnabled.rag ? "bg-primary" : "bg-muted-foreground/30"}`}
                    >
                      <div className={`w-4 h-4 bg-background rounded-full transition-transform ${skillsEnabled.rag ? "translate-x-4" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="border rounded-xl p-5 bg-muted/20 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Web Search (Google)</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Bilmediği konuları internette aratarak güncel veriyle cevaplar.
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <span className={`text-xs font-semibold ${skillsEnabled.webSearch ? "text-green-500" : "text-muted-foreground"}`}>
                      {skillsEnabled.webSearch ? "Aktif" : "Pasif"}
                    </span>
                    <button
                      onClick={() => setSkillsEnabled(prev => ({ ...prev, webSearch: !prev.webSearch }))}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${skillsEnabled.webSearch ? "bg-primary" : "bg-muted-foreground/30"}`}
                    >
                      <div className={`w-4 h-4 bg-background rounded-full transition-transform ${skillsEnabled.webSearch ? "translate-x-4" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="border rounded-xl p-5 bg-muted/20 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Dosya Analizi</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      Gönderdiğiniz görselleri ve dosyaları analiz eder.
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <span className={`text-xs font-semibold ${skillsEnabled.fileAnalysis ? "text-green-500" : "text-muted-foreground"}`}>
                      {skillsEnabled.fileAnalysis ? "Aktif" : "Pasif"}
                    </span>
                    <button
                      onClick={() => setSkillsEnabled(prev => ({ ...prev, fileAnalysis: !prev.fileAnalysis }))}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${skillsEnabled.fileAnalysis ? "bg-primary" : "bg-muted-foreground/30"}`}
                    >
                      <div className={`w-4 h-4 bg-background rounded-full transition-transform ${skillsEnabled.fileAnalysis ? "translate-x-4" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* RAG Belge Yükleme alanı */}
              <div className="border rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-base">Belge Hafızası (RAG)</h3>
                  <p className="text-xs text-muted-foreground mt-1">Yavuz AI asistanına öğretmek için yeni bir dosya yükleyin veya mevcuttakileri silin.</p>
                </div>

                {/* Drag Drop & Upload Input */}
                <input
                  ref={skillFileInputRef}
                  type="file"
                  multiple
                  accept=".txt,.pdf,.md,.csv,.json"
                  className="hidden"
                  onChange={(e) => { handleFileSelect(e.target.files, "skills"); e.target.value = ""; }}
                />
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files, "skills"); }}
                  onClick={() => skillFileInputRef.current?.click()}
                  className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? "border-primary/50 bg-primary/5" : "border-border hover:border-foreground/20 hover:bg-muted/20"
                    }`}
                >
                  <svg className="mx-auto mb-3 text-muted-foreground" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-sm font-medium">Dosyayı buraya sürükleyin veya <span className="underline text-primary">seçin</span></p>
                  <p className="text-[11px] text-muted-foreground mt-1">TXT, PDF, MD, CSV, JSON — maks 10MB</p>
                </div>

                {/* Yüklü Belgelerin Listesi */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">Hafızadaki Dosyalar ({documents.length})</span>
                  <div className="grid gap-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between border rounded-lg px-4 py-3 bg-muted/10">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-semibold truncate max-w-[250px]">{doc.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{doc.size} • {doc.status === "success" ? "Öğretildi" : "Vektörleniyor..."}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => deleteDocument(doc.id)}
                          className="w-8 h-8 rounded hover:bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. SYSTEM PROMPT TAB */}
          {activeTab === "prompt" && (
            <div className="flex-1 overflow-y-auto p-6 max-w-2xl w-full mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Yavuz AI Prompt Yönetimi</h3>
                <p className="text-xs text-muted-foreground">Yavuz AI asistanının davranışlarını ve konuşurken takınacağı rolü buradan dinamik olarak güncelleyin.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prompt-input" className="text-xs font-semibold text-muted-foreground">Sistem Talimatı (System Prompt)</label>
                  <textarea
                    id="prompt-input"
                    rows={8}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full bg-muted/20 border rounded-xl p-4 text-sm focus:outline-none focus:border-primary transition-colors leading-relaxed"
                  />
                </div>

                {showPromptInfo && (
                  <div className="p-4 bg-green-500/5 dark:bg-green-500/10 border border-green-500/20 text-foreground text-xs rounded-2xl flex items-start justify-between gap-4 shadow-xs">
                    <div className="flex-1 space-y-1">
                      <p className="font-bold text-green-500 dark:text-green-400">Önemli Hatırlatma</p>
                      <p className="text-muted-foreground leading-relaxed">Sistem promptunu değiştirdiğinizde Yavuz AI yeni gelen bütün sohbetlerde bu kuralları derhal uygulamaya başlar. Aktif açık sohbetleri etkilemeyebilir.</p>
                    </div>
                    <button
                      onClick={() => setShowPromptInfo(false)}
                      className="bg-green-500/10 hover:bg-green-500/20 active:bg-green-500/30 text-green-500 rounded-xl px-3 py-2 flex items-center gap-1.5 transition-all flex-shrink-0 font-semibold"
                    >
                      <span>Bilgilendim</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <Button
                  onClick={handleUpdatePrompt}
                  disabled={isUpdatingPrompt || !systemPrompt.trim()}
                  className="bg-primary text-primary-foreground hover:opacity-90 font-semibold h-11 w-full"
                >
                  {isUpdatingPrompt ? "Prompt Güncelleniyor..." : "Sistem Promptunu Kaydet"}
                </Button>
              </div>
            </div>
          )}

          {/* 4. ACCOUNT TAB */}
          {activeTab === "account" && (
            <div className="flex-1 overflow-y-auto p-6 max-w-2xl w-full mx-auto space-y-8 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Hesap Bilgileri</h3>
                <p className="text-xs text-muted-foreground">Profil bilgilerinizi ve üyelik planınızı görüntüleyin.</p>
              </div>

              {/* Profile Card */}
              <div className="border rounded-xl p-6 bg-muted/10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{user?.name || "Kullanıcı"}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                    <span className="inline-block text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold mt-2 uppercase">
                      {user?.role?.name || "Üye"}
                    </span>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-border/50" />

                <div className="grid gap-4 md:grid-cols-2 pt-2">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Kullanıcı Rolü</span>
                    <p className="text-sm font-semibold">{user?.role?.name || "Kullanıcı"}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Yetki Sayısı</span>
                    <p className="text-sm font-semibold">{user?.role?.permissions?.length || 0} adet aktif yetki</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button onClick={() => setIsLogoutDialogOpen(true)} variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 h-10 px-5">
                  Çıkış Yap
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── Dialogs & Modals ────────────────────────────────────────────── */}

      {/* 1. New Chat Name Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => { setIsCreateDialogOpen(open); if (!open) setNewThreadTitle(""); }}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Yeni Sohbet Başlığı</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <input
              type="text"
              placeholder="Sohbet ismini girin..."
              value={newThreadTitle}
              onChange={(e) => setNewThreadTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateThreadSubmit()}
              className="w-full bg-muted/20 border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary text-foreground"
            />
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsCreateDialogOpen(false); setNewThreadTitle(""); }} className="h-9 text-xs">
              İptal
            </Button>
            <Button onClick={handleCreateThreadSubmit} disabled={!newThreadTitle.trim()} className="h-9 text-xs bg-primary text-primary-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2. Logout Confirm Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Çıkış Yap</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-xs text-muted-foreground leading-relaxed">
            Çıkış yapmak istediğinize emin misiniz? Oturumunuz sonlandırılacaktır.
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsLogoutDialogOpen(false)} className="h-9 text-xs">
              Hayır, İptal Et
            </Button>
            <Button variant="destructive" onClick={() => { setIsLogoutDialogOpen(false); logout(); }} className="h-9 text-xs">
              Evet, Çıkış Yap
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 3. Delete Chat Confirm Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => { setIsDeleteDialogOpen(open); if (!open) setThreadToDeleteId(null); }}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Sohbeti Sil</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-xs text-muted-foreground leading-relaxed">
            Bu sohbeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setThreadToDeleteId(null); }} className="h-9 text-xs">
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteThreadSubmit} className="h-9 text-xs">
              Evet, Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
