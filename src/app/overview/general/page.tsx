import { prisma } from "@/lib/prisma";
import { getAppSession } from "@/lib/auth";
import UsernameSettingsForm from "@/components/username-settings-form";
import ProfileEmailSettingsForm from "@/components/profile-email-settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OverviewGeneralPage() {
  const session = await getAppSession();
  const user =
    session?.user?.id
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, username: true }
        })
      : null;

  if (!session?.user?.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>General Profile</CardTitle>
          <CardDescription>Manage your account profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3 text-xs text-foreground/60">
            Sign in to access your account profile panel.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground/90">General</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Username</CardTitle>
              <CardDescription>This is used for local credential sign-in and display name.</CardDescription>
            </CardHeader>
            <CardContent>
              <UsernameSettingsForm initialUsername={user?.username ?? null} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email</CardTitle>
              <CardDescription>Update the email tied to this account profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileEmailSettingsForm initialEmail={user?.email ?? null} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
