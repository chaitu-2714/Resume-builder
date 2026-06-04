import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Utility to check if DB is connected/configured
export async function checkDbConnection(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    return false;
  }
  try {
    // Quick query to verify database is reachable
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.warn("Database connection failed, using mock layer. Error:", error);
    return false;
  }
}
