import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "@neondatabase/serverless";
import { normalizeDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

let _prismaInstance: PrismaClient | null = null;

function initPrisma(): PrismaClient {
  if (_prismaInstance) return _prismaInstance;
  if (globalForPrisma.prisma) {
    _prismaInstance = globalForPrisma.prisma;
    return _prismaInstance;
  }

  const connectionString = normalizeDatabaseUrl(process.env.DATABASE_URL);
  if (!connectionString) {
    console.error("DATABASE_URL is not defined in process.env at runtime!");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log: ["error", "warn"]
  });

  _prismaInstance = client;
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

// Transparent Proxy that lazy-instantiates Prisma on first property/method access
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = initPrisma();
    const value = Reflect.get(client, prop);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
});
