// ─────────────────────────────────────────────
// Chat Modülü - TypeScript Tipleri
// ─────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

// ── Request Tipleri ───────────────────────────

export interface SendMessageRequest {
  /** Kullanıcının sohbet geçmişi ID'si (varsa devam eder, yoksa yeni açılır) */
  chatId?: string;
  /** Gönderilen mesaj */
  message: string;
}

// ── Response Tipleri ─────────────────────────

export interface ChatResponse {
  chatId: string;
  messageId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export interface ChatListItem {
  id: string;
  title: string | null;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
}

export interface MessageListItem {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}
