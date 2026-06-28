import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";
import { resolve } from "path";

config({ path: resolve(process.cwd(), '../config/server/.env') });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
