import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getProgressSummary, getActiveDatasetVersion } from "@/lib/data";
import CommandHub from "@/components/command-hub";

export default async function CommandHubShell() {
  const session = await getServerSession(authOptions);
  const summary = await getProgressSummary(session?.user?.id);
  const dataset = await getActiveDatasetVersion();

  return (
    <CommandHub
      summary={summary}
      dataset={{
        importedAt: dataset?.importedAt ? dataset.importedAt.toISOString() : null,
        sourceType: dataset?.sourceType ?? null,
        sourceName: dataset?.sourceName ?? null
      }}
    />
  );
}
