import type { ChatListItem, MessageListItem } from "./types";
import type { ChatMessageResponseSchema } from "./dtos";
import type { z } from "zod";

// ─────────────────────────────────────────────
// Chat Modülü - Formatter (Response Şekillendirici)
// ─────────────────────────────────────────────

type ChatMessageResponse = z.infer<typeof ChatMessageResponseSchema>;

/**
 * Asistan yanıtını standart API response formatına dönüştürür.
 */
export function formatChatResponse(params: {
  chatId: string;
  messageId: string;
  content: string;
  createdAt: Date;
}): ChatMessageResponse {
  return {
    chatId: params.chatId,
    messageId: params.messageId,
    role: "assistant",
    content: params.content,
    createdAt: params.createdAt,
  };
}

/**
 * Sohbet listesini API response formatına dönüştürür.
 */
export function formatChatList(chats: ChatListItem[]) {
  return {
    data: chats,
    total: chats.length,
  };
}

/**
 * Mesaj listesini API response formatına dönüştürür.
 */
export function formatMessageList(chatId: string, messages: MessageListItem[]) {
  return {
    chatId,
    data: messages,
    total: messages.length,
  };
}
