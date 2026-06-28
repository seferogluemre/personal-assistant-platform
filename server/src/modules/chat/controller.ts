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
import { assistantAgent } from "../../providers/mastra/agents/assistant";
import { searchSimilarDocuments } from "../ai/rag";

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

          // 3. Geçmiş mesajları çek (Asistana hafıza olarak verilecek)
          const history = await getChatHistory(chatId);

          // 4. RAG: Konuyla ilgili bilgileri Vektör veritabanından çek
          const relevantDocs = await searchSimilarDocuments(message, 3);
          const contextStr = relevantDocs.length > 0
            ? `\n\n[SİSTEM BİLGİSİ (Kullanıcıya Gösterme) - Vektör Arama Sonuçları (Bu bilgileri kullanarak cevap ver):]\n` + relevantDocs.map(d => `- ${d.content}`).join("\n")
            : "";

          // 5. Mastra'ya mesaj listesini hazırla
          // history dizisinin en son elemanı zaten az önce kaydettiğimiz mevcut 'message' oluyor.
          const promptMessages = history.map(m => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
          }));

          // Vektörden gelen ek bilgiyi (RAG Context) son kullanıcı mesajının ardına gizlice iliştiriyoruz
          if (contextStr && promptMessages.length > 0) {
            promptMessages[promptMessages.length - 1].content += contextStr;
          }

          // 6. Mastra'dan LLM (Gemini) cevabını üret (AI SDK v4 uyumluluğu için generateLegacy)
          const result = await assistantAgent.generateLegacy(promptMessages);
          const replyText = result.text;

          // 7. Asistanın yanıtını DB'ye kaydet
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
