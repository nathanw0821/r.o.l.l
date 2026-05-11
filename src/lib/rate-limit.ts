import { headers } from "next/headers";

const cache = new Map<string, { count: number; expiresAt: number }>();

/**
 * Simple in-memory rate limiter for serverless environments.
 * Note: This is per-instance. In a multi-instance production environment,
 * a distributed store like Redis is recommended for strict limits.
 */
export async function rateLimit(key: string, limit: number, windowMs: number) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0] || "anonymous";
  const fullKey = `${key}:${ip}`;
  
  const now = Date.now();
  const entry = cache.get(fullKey);
  
  if (!entry || now > entry.expiresAt) {
    cache.set(fullKey, { count: 1, expiresAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }
  
  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }
  
  entry.count += 1;
  return { success: true, remaining: limit - entry.count };
}

/**
 * Clean up expired entries periodically to prevent memory leaks.
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of cache.entries()) {
    if (now > entry.expiresAt) {
      cache.delete(key);
    }
  }
}, 60000); // Every minute
