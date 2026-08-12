"use client";

import * as React from "react";
import { type UserAchievementView } from "@/lib/achievements";
import { emitAchievementUnlocked } from "@/lib/achievement-events";
import { cn } from "@/lib/utils";
import { Sparkles, Trophy } from "lucide-react";

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

export function AchievementsClient({ initialAchievements }: { initialAchievements: UserAchievementView[] }) {
  const [achievements, setAchievements] = React.useState<UserAchievementView[]>(initialAchievements);
  const [loadingKey, setLoadingKey] = React.useState<string | null>(null);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const handleUnlockClick = async (achievement: UserAchievementView) => {
    if (achievement.unlocked || loadingKey) return;

    setLoadingKey(achievement.key);
    try {
      const res = await fetch("/api/achievements/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: achievement.key })
      });
      const data = await res.json();

      if (data.success) {
        // Update local state to show as unlocked immediately
        const now = new Date();
        setAchievements((prev) =>
          prev.map((item) =>
            item.key === achievement.key
              ? { ...item, unlocked: true, unlockedAt: now, concealed: false }
              : item
          )
        );

        // Emit real-time toast event!
        emitAchievementUnlocked({
          key: achievement.key,
          name: achievement.name,
          description: achievement.description,
          group: achievement.group
        });
      }
    } catch (err) {
      console.error("Failed to unlock achievement:", err);
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metrics Header */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="text-xs text-foreground/60">Unlocked</div>
          <div className="text-2xl font-semibold text-emerald-400">{unlockedCount}</div>
        </div>
        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="text-xs text-foreground/60">Remaining</div>
          <div className="text-2xl font-semibold text-amber-400">{achievements.length - unlockedCount}</div>
        </div>
        <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
          <div className="text-xs text-foreground/60">Total</div>
          <div className="text-2xl font-semibold">{achievements.length}</div>
        </div>
      </div>

      {/* Achievement Groups */}
      {groups.map((group) => {
        const items = achievements.filter((a) => a.group === group.key);
        return (
          <section key={group.key} className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                {group.key === "easterEgg" ? <Sparkles className="h-4 w-4 text-amber-400" /> : <Trophy className="h-4 w-4 text-accent" />}
                <span>{group.title}</span>
              </h2>
              <p className="text-sm text-foreground/60">{group.description}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((achievement) => {
                const isInteractive = achievement.key === "button_masher" && !achievement.unlocked;

                return (
                  <div
                    key={achievement.key}
                    onClick={() => isInteractive && handleUnlockClick(achievement)}
                    className={cn(
                      "rounded-[var(--radius)] border bg-panel p-4 transition-all duration-200 relative overflow-hidden",
                      achievement.unlocked
                        ? "border-accent/70 shadow-[0_0_12px_rgba(16,185,129,0.15)] bg-emerald-950/20"
                        : isInteractive
                        ? "border-amber-500/60 hover:border-amber-400 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:scale-[1.01] active:scale-[0.99] group ring-1 ring-amber-500/40"
                        : "border-border"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold flex items-center gap-2">
                          <span>
                            {isInteractive
                              ? achievement.name
                              : achievement.concealed
                              ? "Hidden Achievement"
                              : achievement.name}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-foreground/60 leading-relaxed">
                          {isInteractive
                            ? "Vault-Tec explicitly warns against touching this terminal switch..."
                            : achievement.concealed
                            ? "Keep exploring the registry."
                            : achievement.description}
                        </div>
                      </div>

                      <div
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-[0.75rem] font-semibold uppercase tracking-wide shrink-0",
                          achievement.unlocked
                            ? "border-emerald-500/60 bg-emerald-950/50 text-emerald-400"
                            : isInteractive
                            ? "border-amber-500 bg-amber-950 text-amber-300 animate-pulse group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors"
                            : "border-border text-foreground/50"
                        )}
                      >
                        {achievement.unlocked ? "Unlocked" : isInteractive ? "DONT TOUCH" : "Locked"}
                      </div>
                    </div>

                    {achievement.unlockedAt && (
                      <div className="mt-3 text-[0.8rem] text-emerald-400/80 font-mono flex items-center gap-1">
                        <span>✓ Earned {new Date(achievement.unlockedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
