import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

import { authController } from "./modules/auth";
import { chatController } from "./modules/chat";
import { aiController } from "./modules/ai";
import { agentController } from "./modules/agent";

const app = new Elysia()
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

  .use(authController)
  .use(chatController)
  .use(aiController)
  .use(agentController)
  .listen(3001);

console.log(`🦊 Elysia Sunucusu çalışıyor: ${app.server?.url}`);
