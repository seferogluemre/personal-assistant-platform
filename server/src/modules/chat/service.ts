import { prisma } from "../../config/prisma";
import type { ChatListItem, MessageListItem } from "./types";

// ─────────────────────────────────────────────
// Chat Modülü - Servis (DB İşlemleri)
// ─────────────────────────────────────────────

/**
 * Yeni bir sohbet oluşturur ya da var olanı getirir.
 */
export async function getOrCreateChat(userId: string, chatId?: string): Promise<string> {
  if (chatId) {
    const existing = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { id: true, userId: true },
    });
    // Sohbetin sahibi bu kullanıcı mı kontrol et
    if (existing && existing.userId === userId) return existing.id;
  }

  // Yeni sohbet aç (artık gerçek userId ile açılıyor)
  const chat = await prisma.chat.create({
    data: {
      title: null,
      userId: userId,
    },
  });

  return chat.id;
}

/**
 * Kullanıcı mesajını DB'ye kaydeder.
 */
export async function saveUserMessage(
  chatId: string,
  content: string
): Promise<string> {
  const msg = await prisma.message.create({
    data: { chatId, role: "user", content },
  });
  return msg.id;
}

/**
 * Asistan (Yavuz) yanıtını DB'ye kaydeder.
 */
export async function saveAssistantMessage(
  chatId: string,
  content: string
): Promise<string> {
  const msg = await prisma.message.create({
    data: { chatId, role: "assistant", content },
  });

  // İlk asistan mesajı ise sohbete otomatik başlık ata (ilk 60 karakter)
  await prisma.chat.update({
    where: { id: chatId },
    data: {
      title: {
        set: content.slice(0, 60).trim(),
      },
    },
  });

  return msg.id;
}

/**
 * Sohbetin geçmiş mesajlarını (son 20) getirir.
 * Mastra'ya hafıza olarak göndermek için kullanılır.
 */
export async function getChatHistory(
  chatId: string
): Promise<{ role: string; content: string }[]> {
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { role: true, content: true },
  });
  return messages;
}

/**
 * Kullanıcının tüm sohbet listesini getirir.
 */
export async function getChatList(userId: string): Promise<ChatListItem[]> {
  const chats = await prisma.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
    },
  });

  return chats.map((c) => ({
    id: c.id,
    title: c.title,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    messageCount: c._count.messages,
  }));
}

/**
 * Belirli bir sohbetin tüm mesajlarını getirir.
 */
export async function getMessagesByChatId(
  chatId: string
): Promise<MessageListItem[]> {
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, content: true, createdAt: true },
  });

  return messages.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
    createdAt: m.createdAt,
  }));
}
