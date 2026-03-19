import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminUser } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";
import AdminImportForm from "@/components/admin-import-form";
import ThemeSettings from "@/components/theme-settings";
import ProgressControls from "@/components/progress-controls";
import AccountLinks from "@/components/account-links";
import RewardsPanel from "@/components/rewards-panel";
import SupportLink from "@/components/support-link";
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
            Tune contrast, accent color, and color assistance for your companion-tracker setup. Density and Session Assist controls live in the Command Hub.
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

      <Card>
        <CardHeader>
          <CardTitle>Support & Rewards</CardTitle>
          <CardDescription>
            Rewarded ads stay optional. Points and donations only support cosmetic extras and future development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RewardsPanel mode="settings" />
          <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3 text-xs text-foreground/60">
            Help keep the tool alive without changing the core tracker for anyone else.
            <div className="mt-2">
              <SupportLink href={process.env.SUPPORT_URL ?? null} label="Support this App" />
            </div>
          </div>
        </CardContent>
      </Card>

      {canManageWorkbookImport ? (
        <Card>
          <CardHeader>
            <CardTitle>Workbook Import</CardTitle>
            <CardDescription>
              Upload a workbook to publish a new tracker dataset version and migrate matchable progress when possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdminImportForm />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage external sign-in methods for account sync. Keep at least one method linked to avoid lockout.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session?.user?.id ? <AccountLinks /> : (
            <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3 text-xs text-foreground/60">
              Sign in to manage linked accounts.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
