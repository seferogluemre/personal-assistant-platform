import { z } from "zod";

// Öğrenme (Learn) isteği için veri doğrulama şeması
export const LearnRequestSchema = z.object({
  content: z.string().min(5, "Öğretilecek bilgi en az 5 karakter olmalıdır."),
  metadata: z.record(z.any()).optional(), // Örn: { kaynak: "SirketKurallari", yazar: "Emre" }
});

export type LearnRequestDTO = z.infer<typeof LearnRequestSchema>;
