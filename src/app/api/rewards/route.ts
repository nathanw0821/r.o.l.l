import { z } from "zod";
import { getServerSession } from "next-auth";
import { parseJson } from "@/lib/api/validation";
import { badRequest, ok } from "@/lib/api/responses";
import { authOptions } from "@/lib/auth";
import { getRewardsStatus, setAdsOptIn } from "@/lib/monetization";
import { requireAdmin } from "@/lib/api/auth";

const rewardsSettingsSchema = z.object({
  adsEnabled: z.boolean()
});

export async function GET() {
  const session = await getServerSession(authOptions);
  const status = await getRewardsStatus(session?.user?.id);
  return ok(status);
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, rewardsSettingsSchema);
  if ("response" in parsed) return parsed.response;

  try {
    await setAdsOptIn(auth.user.id, parsed.data.adsEnabled);
    const status = await getRewardsStatus(auth.user.id);
    return ok(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not update ad preferences.";
    return badRequest(message);
  }
}
