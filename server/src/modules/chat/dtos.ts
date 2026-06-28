import { z } from "zod";

// ─────────────────────────────────────────────
// Chat Modülü - Zod DTO Şemaları
// ─────────────────────────────────────────────

// ── Request Şemaları ─────────────────────────

export const SendMessageDto = z.object({
  chatId: z.string().cuid().optional(),
  message: z.string().min(1, "Mesaj boş olamaz.").max(4000, "Mesaj çok uzun."),
});

export const GetChatMessagesDto = z.object({
  chatId: z.string().cuid("Geçersiz chat ID."),
});

// ── Response Şemaları ─────────────────────────

export const ChatMessageResponseSchema = z.object({
  chatId: z.string(),
  messageId: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  createdAt: z.date(),
});

export const ChatListItemSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  messageCount: z.number(),
});

export const MessageListItemSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  createdAt: z.date(),
});

// ── Çıkarılmış TS Tipleri (Zod'dan) ──────────

export type SendMessageDtoType = z.infer<typeof SendMessageDto>;
export type GetChatMessagesDtoType = z.infer<typeof GetChatMessagesDto>;
