import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { getProgressSummary, getTierProgressSummary } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/responses";
import { applyImportedProfileIfNeeded } from "@/lib/profile";




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

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, username: true }
      })
    : null;

  /** Only show catalog sync metadata when this account has a successful workbook import (admin import), not the global active dataset. */
  let dataset: {
    importedAt: string | null;
    sourceType: string | null;
    sourceName: string | null;
  } | null = null;
  if (userId) {
    const audit = await prisma.importAudit.findFirst({
      where: { userId, status: "success", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      select: {
        filename: true,
        completedAt: true,
        datasetVersion: {
          select: { sourceType: true, sourceName: true, importedAt: true }
        }
      }
    });
    if (audit) {
      const when = audit.completedAt ?? audit.datasetVersion?.importedAt ?? null;
      dataset = {
        importedAt: when ? when.toISOString() : null,
        sourceType: audit.datasetVersion?.sourceType ?? null,
        sourceName: audit.datasetVersion?.sourceName ?? audit.filename ?? null
      };
    }
  }

  const response = ok({
    summary,
    tierProgress,
    isAdmin: isAdminUser(user),
    dataset
  });

  if (userId) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  } else {
    response.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
  }
  return response;
}
