import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";
import { resolve } from "path";
import { prisma } from "../config/prisma";

async function main() {
  console.log("Roller oluşturuluyor...");

  // Standart Kullanıcı Rolü
  await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      description: "Standart asistan kullanıcısı",
      permissions: ["chat"], // Şimdilik sadece sohbet edebilsin
    },
  });

  // Yönetici Rolü
  await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      description: "Sistem yöneticisi",
      permissions: ["chat", "manage_prompts", "manage_users"], // Prompt ve kullanıcıları yönetebilir
    },
  });

  console.log("✅ Seed işlemi başarıyla tamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
