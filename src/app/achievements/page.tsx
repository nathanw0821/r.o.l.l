import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { awardAchievementsView, getUserAchievements, syncUserAchievements } from "@/lib/achievements";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const groups = [
  {
    key: "visible",
    title: "Visible Achievements",
    description: "Open goals for steady wasteland progress."
  },
  {
    key: "hidden",
    title: "Hidden Achievements",
    description: "Secret milestones stay concealed until you earn them."
  },
  {
    key: "easterEgg",
    title: "Easter Eggs",
    description: "Playful extras for terminal tinkerers."
  }
] as const;

export default async function AchievementsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/sign-in");
  }

  await awardAchievementsView(session.user.id);
  await syncUserAchievements(session.user.id);
  const achievements = await getUserAchievements(session.user.id);
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;

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
          <div className="mb-4 text-sm text-foreground/70">
            Achievements are based on the progress you manage in R.O.L.L. They are companion-tracker milestones, not live game detections.
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="text-xs text-foreground/60">Unlocked</div>
              <div className="text-2xl font-semibold">{unlockedCount}</div>
            </div>
            <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="text-xs text-foreground/60">Remaining</div>
              <div className="text-2xl font-semibold">{achievements.length - unlockedCount}</div>
            </div>
            <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <div className="text-xs text-foreground/60">Total</div>
              <div className="text-2xl font-semibold">{achievements.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {groups.map((group) => {
        const items = achievements.filter((achievement) => achievement.group === group.key);
        return (
          <section key={group.key} className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <p className="text-sm text-foreground/60">{group.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((achievement) => (
                <div
                  key={achievement.key}
                  className={cn(
                    "rounded-[var(--radius)] border bg-panel p-4",
                    achievement.unlocked
                      ? "border-accent/70 shadow-[0_0_0_1px_rgba(99,196,121,0.2)]"
                      : "border-border"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">
                        {achievement.concealed ? "Hidden Achievement" : achievement.name}
                      </div>
                      <div className="mt-1 text-xs text-foreground/60">
                        {achievement.concealed ? "Keep exploring the registry." : achievement.description}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                        achievement.unlocked
                          ? "border-accent/60 text-accent"
                          : "border-border text-foreground/50"
                      )}
                    >
                      {achievement.unlocked ? "Unlocked" : "Locked"}
                    </div>
                  </div>
                  {achievement.unlockedAt ? (
                    <div className="mt-3 text-[11px] text-foreground/50">
                      Earned {achievement.unlockedAt.toLocaleString()}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
