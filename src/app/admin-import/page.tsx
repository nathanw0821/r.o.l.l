import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminImportForm from "@/components/admin-import-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminImportPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Import</CardTitle>
          <CardDescription>
            Upload a multi-sheet workbook to create a new dataset version and migrate progress when possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session ? (
            <AdminImportForm />
          ) : (
            <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3 text-sm">
              Sign in to import a workbook.
            </div>
          )}
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
