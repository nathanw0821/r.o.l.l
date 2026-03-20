import { requireAdmin } from "@/lib/api/auth";
import { badRequest, ok } from "@/lib/api/responses";
import { startRewardedAdSession } from "@/lib/monetization";

export async function POST() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  try {
    const session = await startRewardedAdSession(auth.user.id);
    return ok(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start rewarded ad.";
    return badRequest(message);
  }
}
