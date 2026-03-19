import { requireCronSecret } from "@/lib/api/cron";
import { internalError, ok } from "@/lib/api/responses";
import { runSync } from "@/lib/sync";

export async function GET(request: Request) {
  const auth = requireCronSecret(request);
  if ("response" in auth) return auth.response;

  try {
    const result = await runSync();
    return ok({
      datasetVersionId: result.datasetVersionId,
      ok: result.ok,
      errorCount: result.errors.length,
      errors: result.errors
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return internalError(message);
  }
}
