import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Document" ALTER COLUMN embedding TYPE vector(3072);');
    console.log("Postgres sütunu 3072'ye güncellendi!");
  } catch (e: any) {
    console.error("Hata:", e.message);
  }
}
run();
