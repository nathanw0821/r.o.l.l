import { z } from "zod";
import { parseJson } from "@/lib/api/validation";
import { ok, badRequest, tooManyRequests } from "@/lib/api/responses";
import { requestPasswordReset } from "@/lib/password-reset";
import { rateLimit } from "@/lib/rate-limit";

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const limiter = await rateLimit("forgot-password", 3, 60000); // 3 per minute
  if (!limiter.success) {
    return tooManyRequests("Too many requests. Please try again later.");
  }

  const parsed = await parseJson(request, forgotPasswordSchema);
  if ("response" in parsed) return parsed.response;

  const result = await requestPasswordReset(parsed.data.email);

  return ok({
    accepted: result.accepted,
    delivered: result.delivered
  });
}
