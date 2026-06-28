import { Elysia, t } from "elysia";
import {
  getOrCreateChat,
  saveUserMessage,
  saveAssistantMessage,
  getChatHistory,
  getChatList,
  getMessagesByChatId,
} from "./service";
import {
  formatChatResponse,
  formatChatList,
  formatMessageList,
} from "./formatters";

// ─────────────────────────────────────────────
// Chat Modülü - Controller (Endpoint Tanımları)
// ─────────────────────────────────────────────
//
// Mastra agent entegrasyonu: providers/mastra/index.ts'den import edilecek.
// Şimdilik servis + formatter katmanları bağlandı, ajan bağlantısı
// bir sonraki adımda (providers refaktörü) yapılacak.
// ─────────────────────────────────────────────

export const chatController = new Elysia({ prefix: "/chat" })

  // ── POST /chat/send ──────────────────────────────────────────
  // Yeni mesaj gönder → DB'ye kaydet → Yavuz'a ilet → Yanıtı DB'ye kaydet → Döndür
  .post(
    "/send",
    async ({ body, error }) => {
      const { chatId: incomingChatId, message } = body;

      // 1. Sohbeti getir ya da yeni aç
      const chatId = await getOrCreateChat(incomingChatId);

      // 2. Kullanıcı mesajını DB'ye kaydet
      await saveUserMessage(chatId, message);

      // 3. Geçmiş mesajları çek (Yavuz'a hafıza olarak verilecek)
      const history = await getChatHistory(chatId);

      // 4. TODO: Mastra → Yavuz ajanını çağır (bir sonraki adımda bağlanacak)
      //    const agentResponse = await yavuz.generate(history);
      //    const replyText = agentResponse.text;
      const replyText = `[Yavuz placeholder] Mesajın alındı: "${message}"`; // geçici

      // 5. Yavuz yanıtını DB'ye kaydet
      const assistantMessageId = await saveAssistantMessage(chatId, replyText);

      // 6. Formatter → standart response
      return formatChatResponse({
        chatId,
        messageId: assistantMessageId,
        content: replyText,
        createdAt: new Date(),
      });
    },
    {
      body: t.Object({
        chatId: t.Optional(t.String()),
        message: t.String({ minLength: 1, maxLength: 4000 }),
      }),
    }
  )

  // ── GET /chat/list ───────────────────────────────────────────
  // Tüm sohbetleri listele
  .get("/list", async () => {
    const chats = await getChatList();
    return formatChatList(chats);
  })

  // ── GET /chat/:chatId/messages ───────────────────────────────
  // Belirli bir sohbetin mesajlarını getir
  .get(
    "/:chatId/messages",
    async ({ params, error }) => {
      const messages = await getMessagesByChatId(params.chatId);
      if (!messages.length) {
        return error(404, { message: "Sohbet bulunamadı veya mesaj yok." });
      }
      return formatMessageList(params.chatId, messages);
    },
    {
      params: t.Object({
        chatId: t.String(),
      }),
    }
  );
