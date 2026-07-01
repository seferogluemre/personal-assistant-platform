import { prisma } from "../../config/prisma";

export async function getOrCreateAgent(userId: string, name: string) {
  let agent = await prisma.agent.findUnique({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
  });

  if (!agent) {
    agent = await prisma.agent.create({
      data: {
        userId,
        name,
      },
    });
  }

  return agent;
}

export async function updateAgentPrompt(userId: string, name: string, systemPrompt: string) {
  // getOrCreateAgent ile kaydın varlığından emin oluyoruz
  await getOrCreateAgent(userId, name);

  return prisma.agent.update({
    where: {
      userId_name: {
        userId,
        name,
      },
    },
    data: {
      systemPrompt,
    },
  });
}
