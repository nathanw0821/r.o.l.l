import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AccountLinks from "@/components/account-links";
import UsernameSettingsForm from "@/components/username-settings-form";
import ProfileEmailSettingsForm from "@/components/profile-email-settings-form";
import ProfilePasswordSettingsForm from "@/components/profile-password-settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user =
    session?.user?.id
      ? await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { email: true, username: true, passwordHash: true }
        })
      : null;

  if (!session?.user?.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account credentials and linked sign-in providers.</CardDescription>
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
  );
}
