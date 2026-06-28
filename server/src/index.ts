import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

import { authController } from "./modules/auth";
import { chatController } from "./modules/chat";

const app = new Elysia()
  // Global eklentiler
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: "OpenClaw API",
          version: "1.0.0",
        },
      },
    })
  )

  // Modüller (Endpointler)
  .use(authController)
  .use(chatController)

  .listen(3000);

console.log(`🦊 Elysia Sunucusu çalışıyor: ${app.server?.url}`);
