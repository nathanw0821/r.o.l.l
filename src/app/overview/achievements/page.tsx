import { ACHIEVEMENTS, awardAchievementsView, getUserAchievements, syncUserAchievements } from "@/lib/achievements";
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
        <CardContent className="space-y-4">
          <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3 text-xs text-foreground/60">
            Achievements track your legendary unlocks and shared builds. Sign in to start earning them.
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {ACHIEVEMENTS.filter((a) => a.group === "visible").map((a) => (
              <li key={a.key} className="rounded-[var(--radius)] border border-border/60 bg-panel/60 px-3 py-2 opacity-70">
                <div className="text-sm font-bold text-foreground/80">{a.name}</div>
                <div className="text-xs text-foreground/55">{a.description}</div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-foreground/50">
            Plus {ACHIEVEMENTS.filter((a) => a.group !== "visible").length} hidden ones you find along the way.
          </p>
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
