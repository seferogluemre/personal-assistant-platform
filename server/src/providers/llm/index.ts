import { createGoogleGenerativeAI } from "@ai-sdk/google";

// Çevre değişkeninden API anahtarını alıyoruz
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY bulunamadı! AI özellikleri çalışmayacaktır.");
}

export const googleProvider = createGoogleGenerativeAI({
  apiKey: apiKey || "",
});

// Standart mesajlaşma ve asistan modeli
export const defaultModel = googleProvider("gemini-2.5-flash");

// RAG işlemleri için Vektör (Embedding) modeli
export const embeddingModel = googleProvider.textEmbeddingModel("gemini-embedding-2");