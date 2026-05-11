import { z } from "zod";
import { badRequest, ok, tooManyRequests } from "@/lib/api/responses";
import { rateLimit } from "@/lib/rate-limit";
import { parseJson } from "@/lib/api/validation";
import { resetPasswordByToken } from "@/lib/password-reset";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const limiter = await rateLimit("reset-password", 5, 60000); // 5 per minute
  if (!limiter.success) {
    return tooManyRequests("Too many requests. Please try again later.");
  }

  const parsed = await parseJson(request, resetPasswordSchema);
  if ("response" in parsed) return parsed.response;

  const result = await resetPasswordByToken(parsed.data.token, parsed.data.password);
  if (!result.ok) {
    return badRequest("Reset link is invalid or expired.");
  }

  return ok({ reset: true });
}
