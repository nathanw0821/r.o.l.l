import { z } from "zod";
import { parseJson } from "@/lib/api/validation";
import { badRequest, ok, tooManyRequests } from "@/lib/api/responses";
import { requestPasswordReset } from "@/lib/password-reset";
import { rateLimit } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
  turnstileToken: z.string().nullable().optional()
});

export async function POST(request: Request) {
  const limiter = await rateLimit("forgot-password", 3, 60000); // 3 per minute
  if (!limiter.success) {
    return tooManyRequests("Too many requests. Please try again later.");
  }

  const parsed = await parseJson(request, forgotPasswordSchema);
  if ("response" in parsed) return parsed.response;

  const turnstile = await verifyTurnstileToken(parsed.data.turnstileToken);
  if (!turnstile.success) {
    return badRequest("Security verification failed. Please complete the anti-bot verification.");
  }

  const result = await requestPasswordReset(parsed.data.email);

  return ok({
    accepted: result.accepted,
    delivered: result.delivered
  });
}
