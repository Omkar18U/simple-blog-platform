import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

function getDirectUrl(): string {
  const dbUrl = process.env.DATABASE_URL!;
  const url = new URL(dbUrl);
  const apiKey = url.searchParams.get("api_key")!;
  const decoded = JSON.parse(
    Buffer.from(apiKey, "base64url").toString("utf-8")
  );
  return decoded.databaseUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

if (!globalForPrisma.pool) {
  globalForPrisma.pool = new pg.Pool({
    connectionString: getDirectUrl(),
    max: 5,
    ssl: false,
  });
}

const adapter = new PrismaPg(globalForPrisma.pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
