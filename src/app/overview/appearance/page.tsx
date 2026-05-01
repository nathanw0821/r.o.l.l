import { getAppSession } from "@/lib/auth";
import ThemeSettings from "@/components/theme-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OverviewAppearancePage() {
  const session = await getAppSession();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground/90">Theme & Appearance</h2>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Display Settings</CardTitle>
              <CardDescription>Customize colors, density, and interface contrast.</CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSettings canPersist={Boolean(session?.user?.id)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
