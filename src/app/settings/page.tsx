import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";
import AdminImportForm from "@/components/admin-import-form";
import ThemeSettings from "@/components/theme-settings";
import ProgressControls from "@/components/progress-controls";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const user =
    session?.user?.id
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, username: true }
        })
      : null;
  const canManageWorkbookImport = isAdminUser(user);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings & Accessibility</CardTitle>
          <CardDescription>
            Tune contrast, accent color, and color assistance for your companion-tracker setup. Density controls live in the Command Hub.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSettings canPersist={Boolean(session)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tracker Notes</CardTitle>
          <CardDescription>
            R.O.L.L. is built for safe, user-managed progress tracking.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-foreground/70">
            <li>Your legendary progress is entered and reviewed by you.</li>
            <li>R.O.L.L. does not read the live game process, inspect memory, or rely on patch-sensitive hooks.</li>
            <li>This companion-app approach is lower risk for public hosting and easier to maintain across game updates.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessibility Notes</CardTitle>
          <CardDescription>
            Status badges include text and icons so lock state never relies on color alone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-foreground/70">
            <li>Tab through controls; focus rings are always visible.</li>
            <li>Use the Skip to content link at the top of each page.</li>
            <li>Color-blind presets adjust success/alert palettes for clearer contrast.</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress Reset</CardTitle>
          <CardDescription>
            Restore your tracked selections to an imported backup or the public defaults.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressControls enabled={Boolean(session)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Backup & Sync</CardTitle>
          <CardDescription>
            Use sign-in for cloud save, and use imports or exports for backup and migration when needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 text-sm text-foreground/70">
            <li>Signed-in accounts keep progress available across devices.</li>
            <li>Imports and exports are optional tools for backup, restore, or moving your data.</li>
            <li>Manual tracking stays the source of truth for everyday use.</li>
          </ul>
        </CardContent>
      </Card>

      {canManageWorkbookImport ? (
        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
            <CardDescription>Import, feedback, session assist.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-foreground/50">Workbook</div>
              <AdminImportForm />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
              <Link href="/admin-feedback" className="text-accent hover:underline">
                Feedback inbox
              </Link>
              <Link href="/admin-import" className="text-accent hover:underline">
                Source sync
              </Link>
              <Link href="/screenshot-assist" className="text-accent hover:underline">
                Session assist
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}

    </div>
  );
}
