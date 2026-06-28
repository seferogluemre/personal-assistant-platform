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
import { authPlugin } from "../auth/plugins/authPlugin";

// ─────────────────────────────────────────────
// Chat Modülü - Controller
// ─────────────────────────────────────────────

export const chatController = new Elysia({ prefix: "/chat" })
  // Sadece yetkili kullanıcılar (cookie'si olanlar) girebilsin
  .use(authPlugin)
  .guard({ requireAuth: true }, (app) =>
    app

      // ── POST /chat/send ──────────────────────────────────────────
      .post(
        "/send",
        async ({ body, user }) => {
          const { chatId: incomingChatId, message } = body;

          // 1. Sohbeti getir ya da yeni aç (gerçek user.id ile)
          const chatId = await getOrCreateChat(user!.id, incomingChatId);

          // 2. Kullanıcı mesajını DB'ye kaydet
          await saveUserMessage(chatId, message);

          // 3. Geçmiş mesajları çek (Yavuz'a hafıza olarak verilecek)
          const history = await getChatHistory(chatId);

          // 4. TODO: Mastra → Yavuz ajanı (sonraki modül)
          const replyText = `[Yavuz placeholder] Mesajın alındı: "${message}"`;

          // 5. Yavuz yanıtını DB'ye kaydet
          const assistantMessageId = await saveAssistantMessage(chatId, replyText);

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
      .get("/list", async ({ user }) => {
        const chats = await getChatList(user!.id);
        return formatChatList(chats);
      })

      // ── GET /chat/:chatId/messages ───────────────────────────────
      .get(
        "/:chatId/messages",
        async ({ params, error, user }) => {
          // Güvenlik: chat'in bu kullanıcıya ait olup olmadığı da service'de kontrol edilebilir.
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
      )
  );
