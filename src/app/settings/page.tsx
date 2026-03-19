import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ThemeSettings from "@/components/theme-settings";
import ProgressControls from "@/components/progress-controls";
import AccountLinks from "@/components/account-links";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Settings & Accessibility</CardTitle>
          <CardDescription>
            Tune contrast, color assistance, and layout density. All controls are keyboard accessible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeSettings canPersist={Boolean(session)} />
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
            Restore your selections to the imported profile or the public defaults.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressControls enabled={Boolean(session)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage external sign-in methods. Keep at least one method linked to avoid lockout.
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
