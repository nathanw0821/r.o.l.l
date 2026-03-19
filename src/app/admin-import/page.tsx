import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";
import AdminImportForm from "@/components/admin-import-form";
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
          <CardTitle>Admin Import</CardTitle>
          <CardDescription>
            Upload a multi-sheet workbook (.xlsx, .xlsm, .xls) to create a new dataset version and migrate progress when possible. Legacy .xls files are converted server-side.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminImportForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Websheet Sync</CardTitle>
          <CardDescription>
            Pull data from configured Fallout 76 sources and refresh the dataset. Partial failures are reported per source.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminSyncPanel />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Validation Rules</CardTitle>
          <CardDescription>
            The importer validates required sheets and headers against the TSV structure in this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-foreground/70">
            <li>Required sheets include the canonical all-tiers sheet and each star tier sheet.</li>
            <li>Headers must match the TSV columns; extra trailing columns are allowed.</li>
            <li>Progress is migrated by matching tier + effect name between versions.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
