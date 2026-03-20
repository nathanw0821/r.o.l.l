import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { getActiveDatasetVersion, getProgressSummary, getTierProgressSummary } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/responses";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const [summary, tierProgress, dataset] = await Promise.all([
    getProgressSummary(userId),
    getTierProgressSummary(userId),
    getActiveDatasetVersion()
  ]);

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

  response.headers.set("Cache-Control", "private, no-store, max-age=0, must-revalidate");
  return response;
}
