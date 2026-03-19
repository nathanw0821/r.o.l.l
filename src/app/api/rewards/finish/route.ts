import { z } from "zod";
import { requireUser } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { badRequest, ok } from "@/lib/api/responses";
import { finishRewardedAdSession, getRewardsStatus } from "@/lib/monetization";

const finishSchema = z.object({
  adSessionToken: z.string().min(1),
  result: z.enum(["completed", "skipped", "error"])
});

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, finishSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const reward = await finishRewardedAdSession(
      auth.user.id,
      parsed.data.adSessionToken,
      parsed.data.result
    );
    const status = await getRewardsStatus(auth.user.id);
    return ok({ reward, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not finish rewarded ad.";
    return badRequest(message);
  }
}
