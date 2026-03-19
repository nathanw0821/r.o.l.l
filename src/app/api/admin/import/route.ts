import { requireAdmin } from "@/lib/api/auth";
import { parseFormData } from "@/lib/api/validation";
import { badRequest, internalError, ok } from "@/lib/api/responses";
import { importWorkbookSchema } from "@/lib/validation/admin-import";
import { importWorkbook } from "@/lib/importer";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const parsed = await parseFormData(request, importWorkbookSchema);
  if ("response" in parsed) return parsed.response;

  const buffer = Buffer.from(await parsed.data.file.arrayBuffer());

  try {
    const result = await importWorkbook(buffer, parsed.data.file.name, auth.session.user.id);
    if (!result.ok) {
      const details = result.errors.map((error) => ({
        path: error.sheet ? `sheet:${error.sheet}` : undefined,
        message: error.message
      }));
      return badRequest("Import failed. Fix the errors and try again.", details);
    }
    return ok({ datasetVersionId: result.datasetVersionId, baseline: result.baseline }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import error";
    return internalError(message);
  }
}
