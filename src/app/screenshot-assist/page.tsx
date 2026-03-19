import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAllEffectTiers } from "@/lib/data";
import ScreenshotAssistClient from "@/components/screenshot-assist-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ScreenshotAssistPage() {
  const session = await getServerSession(authOptions);
  const rows = await getAllEffectTiers(session?.user?.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Screenshot Assist</CardTitle>
          <CardDescription>
            Use a screenshot as a reference while you manually confirm new unlocks from a play session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-foreground/70">
            This tool does not read the live game process or parse the image. You choose what to confirm, and R.O.L.L. saves only the changes you approve.
          </div>
        </CardContent>
      </Card>

      <ScreenshotAssistClient rows={rows} />
    </div>
  );
}
