import { requireAdmin } from "@/lib/api/auth";
import { ok, badRequest, internalError } from "@/lib/api/responses";
import { parseJson } from "@/lib/api/validation";
import { getSyncSources, runSync, updateSyncSource, type SyncSourceDetails } from "@/lib/sync";
import { syncUpdateSchema } from "@/lib/validation/sync";

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const sources = await getSyncSources();
  return ok({
    sources: sources.map((source: SyncSourceDetails) => ({
      id: source.id,
      name: source.name,
      kind: source.kind,
      url: source.url,
      format: source.format,
      enabled: source.enabled,
      lastSyncedAt: source.lastSyncedAt,
      lastStatus: source.lastStatus,
      lastError: source.lastError
    }))
  });
}

export async function POST() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  try {
    const result = await runSync();
    if (!result.ok) {
      return badRequest("Sync failed. Check source errors.", result.errors.map((error) => ({ message: `${error.source}: ${error.message}` })));
    }
    return ok({ datasetVersionId: result.datasetVersionId, errors: result.errors });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return internalError(message);
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, syncUpdateSchema);
  if ("response" in parsed) return parsed.response;

  try {
    const updated = await updateSyncSource({
      id: parsed.data.id,
      url: parsed.data.url,
      format: parsed.data.format,
      enabled: typeof parsed.data.enabled === "boolean" ? parsed.data.enabled : undefined
    });
    return ok({
      id: updated.id,
      name: updated.name,
      url: updated.url,
      format: updated.format,
      enabled: updated.enabled
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    return badRequest(message);
  }
}
