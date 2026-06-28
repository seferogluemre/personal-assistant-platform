import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const yavuzAgent = new Agent({
  name: 'Yavuz',
  instructions: `Senin adın Yavuz. Kullanıcıya her zaman dostane, Türkçe ve net bir dille yanıt vereceksin. 
Gerektiğinde yardımcı olmak için detaylı açıklamalar yapabilirsin, ancak lafı gereksiz uzatmamaya özen göster.
Asla İngilizce konuşma.`,
  model: google(process.env.GEMINI_MODEL || 'gemini-1.5-flash'),
});

export const mastra = new Mastra({
  agents: {
    Yavuz: yavuzAgent,
  },
});
