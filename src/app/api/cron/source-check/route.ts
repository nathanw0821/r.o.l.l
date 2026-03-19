import { checkSyncSourcesForChanges } from "@/lib/sync";
import { requireCronSecret } from "@/lib/api/cron";
import { internalError, ok } from "@/lib/api/responses";

export async function GET(request: Request) {
  const auth = requireCronSecret(request);
  if ("response" in auth) return auth.response;

  try {
    const results = await checkSyncSourcesForChanges();
    const changedCount = results.filter((result) => result.status === "changed").length;
    const failedCount = results.filter((result) => result.status === "failed").length;

    return ok({
      changedCount,
      failedCount,
      results
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Source check failed";
    return internalError(message);
  }
}
