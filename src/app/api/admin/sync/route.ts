import { requireUser } from "@/lib/api/auth";
import { ok, badRequest, internalError } from "@/lib/api/responses";
import { parseJson } from "@/lib/api/validation";
import { getSyncSources, runSync, updateSyncSource } from "@/lib/sync";
import { syncUpdateSchema } from "@/lib/validation/sync";

export async function GET() {
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const sources = await getSyncSources();
  return ok({
    sources: sources.map((source) => ({
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
  const auth = await requireUser();
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
  const auth = await requireUser();
  if ("response" in auth) return auth.response;

  const parsed = await parseJson(request, syncUpdateSchema);
  if ("response" in parsed) return parsed.response;

  const updated = await updateSyncSource(parsed.data);
  return ok({
    id: updated.id,
    name: updated.name,
    url: updated.url,
    format: updated.format,
    enabled: updated.enabled
  });
}
