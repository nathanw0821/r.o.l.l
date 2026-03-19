import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { getProgressSummary, getActiveDatasetVersion } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import CommandHub from "@/components/command-hub";

export default async function CommandHubShell() {
  const session = await getServerSession(authOptions);
  const summary = await getProgressSummary(session?.user?.id);
  const dataset = await getActiveDatasetVersion();
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, username: true }
      })
    : null;

  return (
    <CommandHub
      summary={summary}
      isAdmin={isAdminUser(user)}
      dataset={{
        importedAt: dataset?.importedAt ? dataset.importedAt.toISOString() : null,
        sourceType: dataset?.sourceType ?? null,
        sourceName: dataset?.sourceName ?? null
      }}
    />
  );
}
