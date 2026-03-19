import { requireAdmin } from "@/lib/api/auth";
import { badRequest, internalError, ok } from "@/lib/api/responses";
import { checkSyncSourcesForChanges } from "@/lib/sync";

export async function POST() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  try {
    const results = await checkSyncSourcesForChanges();
    const changedCount = results.filter((result) => result.status === "changed").length;
    const failed = results.filter((result) => result.status === "failed");

    if (failed.length > 0) {
      return badRequest(
        "Source check completed with errors.",
        failed.map((result) => ({
          message: `${result.source}: ${result.message ?? "Check failed"}`
        }))
      );
    }

    return ok({ results, changedCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Source check failed";
    return internalError(message);
  }
}
