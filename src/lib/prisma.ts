import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { normalizeDatabaseUrl } from "@/lib/database-url";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Set up WebSocket constructor for Neon serverless in non-worker environments (e.g. Node.js local dev or build time)
if (typeof globalThis.WebSocket === "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ws = require("ws");
    neonConfig.webSocketConstructor = ws;
    console.log("[Prisma] Configured neonConfig.webSocketConstructor with ws polyfill");
  } catch (e) {
    console.error("[Prisma] Failed to load ws polyfill for Neon WebSocket:", e);
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// Helper function to resolve the database URL safely
function getConnectionString(): string | undefined {
  let connectionString: string | undefined;

  // 1. Try to get it from Cloudflare request context
  try {
    const ctx = getCloudflareContext();
    console.log("[Prisma] getCloudflareContext returned ctx:", !!ctx);
    if (ctx) {
      const env = ctx.env as Record<string, string | undefined>;
      console.log("[Prisma] ctx.env keys:", Object.keys(env || {}));
      if (env?.DATABASE_URL) {
        connectionString = env.DATABASE_URL;
        console.log("[Prisma] Found DATABASE_URL in Cloudflare context");
      }
    }
  } catch (e) {
    console.log("[Prisma] getCloudflareContext threw error:", e instanceof Error ? e.message : String(e));
  }

  // 2. Fall back to process.env
  if (!connectionString) {
    connectionString = process.env.DATABASE_URL;
    if (connectionString) {
      console.log("[Prisma] Found DATABASE_URL in process.env");
    } else {
      console.log("[Prisma] DATABASE_URL not found in process.env either!");
    }
  }

  return normalizeDatabaseUrl(connectionString);
}

// Helper to create a new Prisma Client instance
function createPrismaClient(connectionString?: string): PrismaClient {
  // Use a fallback placeholder connection string if undefined to prevent constructor crashes during startup/module evaluation
  const activeConnectionString = connectionString || "postgresql://placeholder:placeholder@localhost:5432/placeholder";

  if (!connectionString) {
    console.warn("[Prisma] DATABASE_URL is not defined at runtime. Using placeholder to prevent startup crash.");
  }

  // Set the environment variable for Prisma's query engine and PG driver!
  process.env.DATABASE_URL = activeConnectionString;

  // Pass the pool configuration object to PrismaNeon (complying with Prisma 7's PoolConfig requirement)
  const adapter = new PrismaNeon({
    connectionString: activeConnectionString,
    connectionTimeoutMillis: 5000,
  });

  return new PrismaClient({
    adapter,
    log: ["error", "warn"]
  });
}

// Request-scoped getter using React cache (only active during production request lifecycle)
const getRequestScopedPrisma = cache(() => {
  const connectionString = getConnectionString();
  return createPrismaClient(connectionString);
});

// Main initialization function
function initPrisma(): PrismaClient {
  // In development, use global caching to avoid hot-reloading connection leaks
  if (process.env.NODE_ENV !== "production") {
    if (globalForPrisma.prisma) return globalForPrisma.prisma;
    const client = createPrismaClient(getConnectionString());
    globalForPrisma.prisma = client;
    return client;
  }

  // In production (Cloudflare Workers), get the per-request cached instance
  return getRequestScopedPrisma();
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

