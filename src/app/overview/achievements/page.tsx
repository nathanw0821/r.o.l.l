import { awardAchievementsView, getUserAchievements, syncUserAchievements } from "@/lib/achievements";
import { getAppSession } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementsClient } from "@/components/achievements-client";

export default async function OverviewAchievementsPage() {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            Wasteland milestones, hidden surprises, and a few cheeky extras tied to your tracked progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3 text-xs text-foreground/60">
            Sign in to view and unlock account achievements.
          </div>
        </CardContent>
      </Card>
    );
  }

  await awardAchievementsView(session.user.id);
  await syncUserAchievements(session.user.id);
  const achievements = await getUserAchievements(session.user.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>
            Wasteland milestones, hidden surprises, and a few cheeky extras tied to your tracked progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-foreground/70">
            Achievements are based on the progress you manage in R.O.L.L. They are companion-tracker milestones, not live game detections.
          </div>
        </CardContent>
      </Card>

      <AchievementsClient initialAchievements={achievements} />
    </div>
  );
}
