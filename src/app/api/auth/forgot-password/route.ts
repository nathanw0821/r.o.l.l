import { z } from "zod";
import { parseJson } from "@/lib/api/validation";
import { ok } from "@/lib/api/responses";
import { requestPasswordReset } from "@/lib/password-reset";

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const parsed = await parseJson(request, forgotPasswordSchema);
  if ("response" in parsed) return parsed.response;

  const result = await requestPasswordReset(parsed.data.email);

  return ok({
    accepted: result.accepted,
    delivered: result.delivered,
    resetUrl: result.resetUrl
  });
}
