import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ThemeSettings from "@/components/theme-settings";
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
    </div>
  );
}
