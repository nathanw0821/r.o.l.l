import { requireAdmin } from "@/lib/api/auth";
import { ok } from "@/lib/api/responses";
import { detectLibreOffice } from "@/lib/convert-xls";

export async function GET() {
  const auth = await requireAdmin();
  if ("response" in auth) return auth.response;

  const libreOffice = await detectLibreOffice();
  const fallbackAvailable = Boolean(process.env.XLS_CONVERTER_URL);

  return ok({
    libreOffice,
    fallbackAvailable
  });
}
