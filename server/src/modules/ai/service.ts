import { ingestDocument } from "./rag";
import type { LearnRequestDTO } from "./dtos";

export const aiService = {
  async learn(data: LearnRequestDTO) {
    // RAG modülündeki vektörel kayıt fonksiyonunu çağırıyoruz
    const documentId = await ingestDocument(data.content, data.metadata);

    return {
      success: true,
      message: "Yeni bilgi ajanın uzun süreli hafızasına başarıyla kazındı.",
      documentId,
    };
  }
};
