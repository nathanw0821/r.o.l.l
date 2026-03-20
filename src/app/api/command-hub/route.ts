import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { getActiveDatasetVersion, getProgressSummary, getTierProgressSummary } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/responses";
import { applyImportedProfileIfNeeded } from "@/lib/profile";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHint = searchParams.get("auth");
  const isGuestHint = authHint === "guest";

  const session = isGuestHint ? null : await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (userId) {
    await applyImportedProfileIfNeeded(userId);
  }

  const summary = await getProgressSummary(userId);
  const tierProgress = await getTierProgressSummary(userId);
  const dataset = await getActiveDatasetVersion();

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, username: true }
      })
    : null;

  const response = ok({
    summary,
    tierProgress,
    isAdmin: isAdminUser(user),
    dataset: {
      importedAt: dataset?.importedAt ? dataset.importedAt.toISOString() : null,
      sourceType: dataset?.sourceType ?? null,
      sourceName: dataset?.sourceName ?? null
    }
  });

  if (userId) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  } else {
    response.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
  }
  return response;
}
