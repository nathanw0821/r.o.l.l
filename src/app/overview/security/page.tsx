import { prisma } from "@/lib/prisma";
import { getAppSession } from "@/lib/auth";
import AccountLinks from "@/components/account-links";
import ProfilePasswordSettingsForm from "@/components/profile-password-settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OverviewSecurityPage() {
  const session = await getAppSession();
  const user =
    session?.user?.id
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { passwordHash: true }
        })
      : null;

  if (!session?.user?.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Password and Security</CardTitle>
          <CardDescription>Manage your account credentials and linked sign-in providers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3 text-xs text-foreground/60">
            Sign in to access security settings.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground/90">Password and Security</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                {user?.passwordHash
                  ? "Change your local account password."
                  : "You signed in with a provider account. Set a local password if you want username/password login too."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilePasswordSettingsForm hasPassword={Boolean(user?.passwordHash)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Linked Sign-In Methods</CardTitle>
              <CardDescription>
                Link or unlink Google and other providers. Keep at least one method active to avoid lockout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AccountLinks />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
