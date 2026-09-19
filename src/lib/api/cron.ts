import { createHash, timingSafeEqual } from "node:crypto";
import { unauthorized } from "@/lib/api/responses";

function digest(value: string) {
  return createHash("sha256").update(value, "utf8").digest();
}

export function requireCronSecret(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization") ?? "";
  // Constant-time compare, and one message whether or not the secret is configured.
  if (!cronSecret || !timingSafeEqual(digest(authorization), digest(`Bearer ${cronSecret}`))) {
    return { response: unauthorized("Invalid cron authorization.") } as const;
  }

  return { ok: true } as const;
}
