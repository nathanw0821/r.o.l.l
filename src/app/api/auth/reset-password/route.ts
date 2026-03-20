import { z } from "zod";
import { badRequest, ok } from "@/lib/api/responses";
import { parseJson } from "@/lib/api/validation";
import { resetPasswordByToken } from "@/lib/password-reset";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const parsed = await parseJson(request, resetPasswordSchema);
  if ("response" in parsed) return parsed.response;

  const result = await resetPasswordByToken(parsed.data.token, parsed.data.password);
  if (!result.ok) {
    return badRequest("Reset link is invalid or expired.");
  }

  return ok({ reset: true });
}
