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
            Screenshot Assist is manual by default. It never reads the live game process, and it never auto-saves anything from a screenshot. You review the checklist yourself and save only the changes you approve.
          </div>
          <div className="mt-3 text-xs text-foreground/60">
            Optional AI suggestions can be requested with your own OpenAI API key, but they are still only suggestions from the current shortlist. You can also keep Session Assist open as a floating in-app window while navigating the rest of the tracker.
          </div>
        </CardContent>
      </Card>

      <ScreenshotAssistClient rows={rows} />
    </div>
  );
}
