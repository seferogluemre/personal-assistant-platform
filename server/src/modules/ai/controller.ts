import { Elysia } from "elysia";
import { aiService } from "./service";
import { LearnRequestSchema } from "./dtos";
import { authPlugin } from "../auth/plugins/authPlugin";

export const aiController = new Elysia({ prefix: "/ai" })
  // Herkesin ajana bir şey öğretmesini engellemek için Auth eklentisini takıyoruz
  .use(authPlugin)
  .post("/learn", async ({ body, user, error }) => {
    // Eğer kimliği doğrulanmamışsa veya yetkisi yoksa reddet
    if (!user) {
      return error(401, { message: "Bu işlemi yapmak için oturum açmalısınız." });
    }

    // (İleride buraya sadece adminlerin öğretebileceği bir kontrol eklenebilir)

    const parsed = LearnRequestSchema.safeParse(body);
    if (!parsed.success) {
      return error(400, { message: "Hatalı veri.", details: parsed.error.format() });
    }

    return await aiService.learn(parsed.data);
  });
