import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const localCache = new Map<string, { count: number; expiresAt: number }>();

/**
 * Distributed rate limiter.
 * Leverages Cloudflare KV (using `KV_LIMITER` namespace) if deployed to Cloudflare,
 * with an automatic fallback to local in-memory caching during development and tests.
 */
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] || "anonymous";
  const fullKey = `${key}:${ip}`;
  const now = Date.now();

  // Try to retrieve Cloudflare KV_LIMITER namespace if running in Cloudflare context
  let kv: { get: (key: string) => Promise<string | null>; put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void> } | null = null;
  try {
    const ctx = getCloudflareContext();
    if (ctx && ctx.env) {
      kv = (ctx.env as Record<string, unknown>).KV_LIMITER as typeof kv;
    }
  } catch {
    // Fail silently in local development/test/build environments
  }

  if (kv) {
    try {
      const entryStr = await kv.get(fullKey);
      if (!entryStr) {
        const expiresAt = now + windowMs;
        await kv.put(fullKey, JSON.stringify({ count: 1, expiresAt }), {
          expirationTtl: Math.ceil(windowMs / 1000)
        });
        return { success: true, remaining: limit - 1 };
      }

      const entry = JSON.parse(entryStr);
      if (now > entry.expiresAt) {
        const expiresAt = now + windowMs;
        await kv.put(fullKey, JSON.stringify({ count: 1, expiresAt }), {
          expirationTtl: Math.ceil(windowMs / 1000)
        });
        return { success: true, remaining: limit - 1 };
      }

      if (entry.count >= limit) {
        return { success: false, remaining: 0 };
      }

      entry.count += 1;
      const ttl = Math.max(1, Math.ceil((entry.expiresAt - now) / 1000));
      await kv.put(fullKey, JSON.stringify(entry), { expirationTtl: ttl });
      return { success: true, remaining: limit - entry.count };
    } catch (err) {
      console.error("[Rate Limit] Cloudflare KV operation failed, falling back to local cache:", err);
    }
  }

  // Fallback to in-memory local cache (Local development / Preview deployments)
  const entry = localCache.get(fullKey);
  
  if (!entry || now > entry.expiresAt) {
    localCache.set(fullKey, { count: 1, expiresAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  
  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }
  
  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}

/**
 * Clean up expired local entries periodically to prevent memory leaks in long-running processes.
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of localCache.entries()) {
    if (now > entry.expiresAt) {
      localCache.delete(key);
    }
  }
}, 60000); // Every minute
