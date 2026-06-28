import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { mastra } from './providers/mastra';

const app = new Elysia()
  .use(cors())
  .use(
    swagger({
      documentation: {
        info: {
          title: 'OpenClaw API',
          version: '1.0.0',
        },
      },
    })
  )
  .post(
    '/api/chat',
    async ({ body }) => {
      // Mastra'dan "Yavuz" ajanımızı çağırıyoruz
      const agent = mastra.getAgent('Yavuz');

      // Kullanıcının mesajını ajana iletiyoruz ve stream başlatıyoruz
      const streamResult = await agent.streamLegacy([
        { role: 'user', content: body.message }
      ]);

      // Yanıtı frontend tarafına kelime kelime (stream) olarak aktarıyoruz
      return new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResult.textStream) {
              controller.enqueue(chunk);
            }
            controller.close();
          } catch (e) {
            controller.error(e);
          }
        },
      });
    },
    {
      body: t.Object({
        message: t.String(),
      }),
      detail: {
        summary: "Yavuz ajanıyla sohbet",
        description: "Yavuz ajanıyla konuşmak için stream döndürür"
      }
    }
  )
  .listen(3000);

console.log(`🦊 Elysia Sunucusu çalışıyor: http://${app.server?.hostname}:${app.server?.port}`);
