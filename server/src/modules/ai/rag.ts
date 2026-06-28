import { embed } from "ai";
import { embeddingModel } from "../../providers/llm";
import { prisma } from "../../config/prisma";
import crypto from "crypto";

/**
 * 1. ÖĞRENME (Ingestion) AŞAMASI
 * Sistemimize verilen bir metni anlamsal bir vektöre çevirir ve kaydeder.
 */
export async function ingestDocument(content: string, metadata?: any) {
  // 1. Google Gemini (text-embedding-004) modeline metni gönderip 768 boyutlu bir sayı dizisi (vektör) alıyoruz.
  const { embedding } = await embed({
    model: embeddingModel,
    value: content,
  });

  const id = crypto.randomUUID();
  const metadataJson = metadata ? JSON.stringify(metadata) : null;
  const embeddingStr = JSON.stringify(embedding);

  // 2. Prisma pgvector'u doğrudan native olarak desteklemediği için ham SQL ($executeRaw) kullanarak yazıyoruz.
  // Burada 'embeddingStr' dizisini PostgreSQL'in anlayacağı '::vector' formatına dönüştürüyoruz.
  await prisma.$executeRaw`
    INSERT INTO "Document" (id, content, embedding, metadata, "createdAt")
    VALUES (${id}, ${content}, ${embeddingStr}::vector, ${metadataJson}::jsonb, NOW())
  `;

  return id;
}

/**
 * 2. HATIRLAMA (Retrieval) AŞAMASI
 * Kullanıcının sorusuna matematiksel olarak en çok benzeyen belgeleri getirir.
 */
export async function searchSimilarDocuments(query: string, limit: number = 3) {
  // 1. Kullanıcının sorduğu soruyu/metni aynı şekilde vektöre çeviriyoruz.
  const { embedding } = await embed({
    model: embeddingModel,
    value: query,
  });

  // 2. pgvector'un `<->` operatörünü kullanarak veritabanındaki belgelerle kullanıcının sorusu arasındaki anlamsal mesafeyi hesaplıyoruz.
  // Mesafe ne kadar küçükse, belge soruya o kadar ilgili demektir (En ilgili olanlar ORDER BY ile en üste gelir).
  // pgvector köşeli parantezli string formatında ( [0.1, 0.2] ) bekler
  const embeddingStr = JSON.stringify(embedding);

  const results = await prisma.$queryRaw<Array<{ id: string; content: string; metadata: any }>>`
    SELECT id, content, metadata
    FROM "Document"
    ORDER BY embedding <-> ${embeddingStr}::vector
    LIMIT ${limit}
  `;

  return results;
}
