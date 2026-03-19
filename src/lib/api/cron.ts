import { unauthorized } from "@/lib/api/responses";

export function requireCronSecret(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return { response: unauthorized("CRON_SECRET is not configured.") } as const;
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${cronSecret}`) {
    return { response: unauthorized("Invalid cron authorization.") } as const;
  }

  return { ok: true } as const;
}
