import { Elysia, t } from "elysia";
import { authPlugin } from "../auth/plugins/authPlugin";
import { getOrCreateAgent, updateAgentPrompt } from "./service";

export const agentController = new Elysia({ prefix: "/agent" })
  .use(authPlugin)
  .guard({ requireAuth: true }, (app) =>
    app
      // ── GET /agent/:name ─────────────────────────────────────────
      .get(
        "/:name",
        async ({ params, user }) => {
          const agent = await getOrCreateAgent(user!.id, params.name);
          return {
            success: true,
            agent: {
              name: agent.name,
              systemPrompt: agent.systemPrompt,
            },
          };
        },
        {
          params: t.Object({
            name: t.String(),
          }),
        }
      )

      // ── PUT /agent/:name ─────────────────────────────────────────
      .put(
        "/:name",
        async ({ params, body, user }) => {
          const agent = await updateAgentPrompt(user!.id, params.name, body.systemPrompt);
          return {
            success: true,
            agent: {
              name: agent.name,
              systemPrompt: agent.systemPrompt,
            },
          };
        },
        {
          params: t.Object({
            name: t.String(),
          }),
          body: t.Object({
            systemPrompt: t.String({ minLength: 1, maxLength: 5000 }),
          }),
        }
      )
  );
