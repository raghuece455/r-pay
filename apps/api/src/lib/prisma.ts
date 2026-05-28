import "dotenv/config";
import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL ??= "postgresql://rpay:rpay@localhost:5432/rpay?schema=public";

export const prisma = new PrismaClient({
  log: process.env.PRISMA_LOG === "true" ? ["query", "error", "warn"] : ["error"]
});
