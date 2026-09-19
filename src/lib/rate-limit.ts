import { headers } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const localCache = new Map<string, { count: number; expiresAt: number }>();

interface CloudflareKVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

/**
 * Distributed rate limiter.
 * Leverages Cloudflare KV (using `KV_LIMITER` namespace) if deployed to Cloudflare,
 * with an automatic fallback to local in-memory caching during development and tests.
 */
/**
 * Caller IP. On Cloudflare `cf-connecting-ip` is set by the edge and cannot be spoofed; the first
 * X-Forwarded-For entry is whatever the caller sent, so it is only a local-development fallback.
 */
export function clientIpFrom(h: Pick<Headers, "get">): string {
  const cf = h.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const real = h.get("x-real-ip")?.trim();
  if (real) return real;
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
}

/**
 * Production and preview bind the same KV namespace, so keys carry the deployment's host
 * (preview traffic must not share production's buckets).
 */
function environmentPrefix(): string {
  try {
    const host = new URL(process.env.NEXTAUTH_URL ?? "").host;
    return host ? `${host}:` : "";
  } catch {
    return "";
  }
}

/** Cloudflare KV rejects expirationTtl below 60 seconds; the window itself lives in `expiresAt`. */
const KV_MIN_TTL_SECONDS = 60;
function kvTtl(ms: number) {
  return Math.max(KV_MIN_TTL_SECONDS, Math.ceil(ms / 1000));
}

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const ip = clientIpFrom(await headers());
  const fullKey = `${environmentPrefix()}${key}:${ip}`;
  const now = Date.now();

  // Try to retrieve Cloudflare KV_LIMITER namespace if running in Cloudflare context
  let kv: CloudflareKVNamespace | null = null;
  try {
    const ctx = getCloudflareContext();
    if (ctx && ctx.env) {
      kv = (ctx.env as Record<string, unknown>).KV_LIMITER as CloudflareKVNamespace;
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
          expirationTtl: kvTtl(windowMs)
        });
        return { success: true, remaining: limit - 1 };
      }

      const entry = JSON.parse(entryStr);
      if (now > entry.expiresAt) {
        const expiresAt = now + windowMs;
        await kv.put(fullKey, JSON.stringify({ count: 1, expiresAt }), {
          expirationTtl: kvTtl(windowMs)
        });
        return { success: true, remaining: limit - 1 };
      }

      if (entry.count >= limit) {
        return { success: false, remaining: 0 };
      }

      entry.count += 1;
      await kv.put(fullKey, JSON.stringify(entry), { expirationTtl: kvTtl(entry.expiresAt - now) });
      return { success: true, remaining: limit - entry.count };
    } catch (err) {
      console.error("[Rate Limit] Cloudflare KV operation failed, falling back to local cache:", err);
    }
  }

  // Fallback to in-memory local cache (Local development / Preview deployments)
  if (localCache.size > 5000) pruneLocalCache(now);
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

/** Drops expired local entries (lazily: Workers forbid timers in global scope). */
function pruneLocalCache(now: number) {
  for (const [key, entry] of localCache.entries()) {
    if (now > entry.expiresAt) {
      localCache.delete(key);
    }
  }
}
