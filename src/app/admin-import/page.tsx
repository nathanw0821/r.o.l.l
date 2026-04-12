import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";
import AdminSyncPanel from "@/components/admin-sync-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminImportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, username: true }
  });
  if (!isAdminUser(user)) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Source sync</CardTitle>
          <CardDescription>Remote feeds and change checks. Workbook upload is under Settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminSyncPanel />
        </CardContent>
      </Card>

      <details className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3 text-sm">
        <summary className="cursor-pointer font-medium text-foreground/90">Importer validation (reference)</summary>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-foreground/70">
          <li>Required sheets: canonical all-tiers plus each star tier sheet.</li>
          <li>Headers match workspace TSVs; trailing columns may be ignored.</li>
          <li>Progress migrates by tier + effect name across dataset versions.</li>
        </ul>
      </details>
    </div>
  );
}
