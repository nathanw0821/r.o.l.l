import { z } from "zod";
import { requireAdmin } from "@/lib/api/auth";
import { parseJson } from "@/lib/api/validation";
import { badRequest, ok } from "@/lib/api/responses";
import { getRewardsStatus, purchaseStoreItem } from "@/lib/monetization";

const purchaseSchema = z.object({
  itemId: z.string().min(1)
});

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, purchaseSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const item = await purchaseStoreItem(auth.user.id, parsed.data.itemId);
    const status = await getRewardsStatus(auth.user.id);
    return ok({ item, status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not unlock store item.";
    return badRequest(message);
  }
}
