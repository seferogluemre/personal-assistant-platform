"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export interface Attachment {
  name: string;
  type: string; // "image" | "document"
  url?: string; // data URL for preview
  size?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const USER_AVATAR = (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
    E
  </div>
);

const AI_AVATAR = (
  <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  </div>
);

function AttachmentPreview({ attachment }: { attachment: Attachment }) {
  const [open, setOpen] = useState(false);

  const isImage = attachment.type === "image";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-lg px-3 py-2 hover:bg-white/10 transition-colors text-left max-w-[200px]"
      >
        {isImage && attachment.url ? (
          <img src={attachment.url} alt={attachment.name} className="w-8 h-8 rounded object-cover flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 bg-blue-500/20 rounded flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-white truncate">{attachment.name}</p>
          {attachment.size && <p className="text-[10px] text-gray-500">{attachment.size}</p>}
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#111] dark:bg-[#111] border-white/10 text-white max-w-2xl">
          <div className="space-y-3">
            <p className="font-semibold text-sm">{attachment.name}</p>
            {isImage && attachment.url ? (
              <img src={attachment.url} alt={attachment.name} className="w-full rounded-lg max-h-[60vh] object-contain" />
            ) : (
              <div className="flex items-center gap-3 p-6 bg-white/5 rounded-xl border border-white/10">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-medium">{attachment.name}</p>
                  {attachment.size && <p className="text-sm text-gray-400">{attachment.size}</p>}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-3xl mx-auto w-full">
      {messages.map((msg) => {
        const isUser = msg.role === "user";
        return (
          <div key={msg.id} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
            {isUser ? USER_AVATAR : AI_AVATAR}
            <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
              {/* Name + time */}
              <div className={`flex items-center gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
                <span className="text-xs font-semibold text-foreground/80">
                  {isUser ? "Emre" : "Yavuz AI"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {format(msg.timestamp, "HH:mm", { locale: tr })}
                </span>
              </div>

              {/* Attachments */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {msg.attachments.map((att, i) => (
                    <AttachmentPreview key={i} attachment={att} />
                  ))}
                </div>
              )}

              {/* Bubble */}
              {msg.content && (
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm transition-all duration-200 ${
                    isUser
                      ? "bg-primary/95 hover:bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-muted/75 dark:bg-muted/30 border border-border/40 dark:border-border/10 text-foreground rounded-tl-sm backdrop-blur-[1px]"
                  }`}
                >
                  {msg.content}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {isLoading && (
        <div className="flex items-start gap-3">
          {AI_AVATAR}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-foreground/80">Yavuz AI</span>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
