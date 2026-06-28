import { Mastra } from "@mastra/core";
import { assistantAgent } from "./agents/assistant";

// İleride farklı yetenekler (tools) veya ajanlar eklendiğinde buradan kaydedilecek
export const mastra = new Mastra({
  agents: { assistantAgent },
});
