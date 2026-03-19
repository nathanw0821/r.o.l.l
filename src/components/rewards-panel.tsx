"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import SupportLink from "@/components/support-link";
import { useRewards } from "@/components/rewards-provider";
import { cn } from "@/lib/utils";

export default function RewardsPanel({ mode = "hub" }: { mode?: "hub" | "settings" | "assist" }) {
  const { data: session } = useSession();
  const { status, loading, actionPending, setAdsEnabled, watchRewardedAd, purchaseItem, message } = useRewards();

  if (!session?.user) {
    return (
      <div className={cn("space-y-3", mode === "assist" && "rounded-[var(--radius)] border border-border bg-panel p-4")}>
        <div className="text-sm font-semibold">Earn Points</div>
        <div className="text-xs text-foreground/60">Sign in to enable rewarded ads, collect points, and unlock cosmetic store items.</div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" asChild>
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
          <SupportLink href={status?.supportUrl} label="Support this App" />
        </div>
      </div>
    );
  }

  const statusText = loading || !status ? "Loading rewards..." : `${status.points} points`;
  const cooldownText =
    status && status.cooldownRemainingSeconds > 0
      ? `${Math.ceil(status.cooldownRemainingSeconds / 60)}m cooldown`
      : "Ready";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Earn Points</div>
          <div className="text-xs text-foreground/60">Opt in, watch a rewarded ad when available, and spend points on cosmetic unlocks.</div>
        </div>
        <div className="rounded-full border border-border px-3 py-1 text-xs text-foreground/70">{statusText}</div>
      </div>

      {status ? (
        <>
          <label className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-border bg-panel/70 px-3 py-2 text-xs text-foreground/70">
            <span>Enable rewarded ads</span>
            <input
              type="checkbox"
              checked={status.adsEnabled}
              onChange={(event) => setAdsEnabled(event.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
          </label>

          <div className="grid gap-2 md:grid-cols-3">
            <div className="rounded-[var(--radius)] border border-border bg-panel/70 px-3 py-2 text-xs">
              <div className="text-foreground/50">Reward</div>
              <div className="mt-1 font-semibold">+{status.rewardRange[0]} to +{status.rewardRange[1]}</div>
            </div>
            <div className="rounded-[var(--radius)] border border-border bg-panel/70 px-3 py-2 text-xs">
              <div className="text-foreground/50">Cooldown</div>
              <div className="mt-1 font-semibold">{cooldownText}</div>
            </div>
            <div className="rounded-[var(--radius)] border border-border bg-panel/70 px-3 py-2 text-xs">
              <div className="text-foreground/50">Today</div>
              <div className="mt-1 font-semibold">{status.dailyPoints} / {status.dailyCap}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={watchRewardedAd}
              disabled={
                actionPending ||
                !status.rewardedEnabled ||
                !status.providerConfigured ||
                !status.adsEnabled ||
                !status.availableNow
              }
            >
              <Gift className="h-4 w-4" />
              Watch Ad (+{status.rewardRange[0]}-{status.rewardRange[1]} points)
            </Button>
            {!status.providerConfigured ? (
              <div className="rounded-full border border-border px-3 py-2 text-xs text-foreground/60">
                Rewarded provider not configured
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-[0.08em] text-foreground/50">Point Store</div>
            <div className="grid gap-2">
              {status.storeItems.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius)] border border-border bg-panel/70 px-3 py-3 text-sm">
                  <div>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-foreground/60">{item.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border px-2 py-1 text-xs text-foreground/70">{item.cost} pts</span>
                    <Button
                      type="button"
                      size="sm"
                      variant={item.unlocked ? "outline" : "default"}
                      disabled={item.unlocked || actionPending || status.points < item.cost}
                      onClick={() => purchaseItem(item.id)}
                    >
                      {item.unlocked ? (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Unlocked
                        </>
                      ) : (
                        "Unlock"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {message ? <div className="text-xs text-foreground/70">{message}</div> : null}
        </>
      ) : null}

      {mode === "settings" ? (
        <div className="rounded-[var(--radius)] border border-border bg-panel/70 px-3 py-3 text-xs text-foreground/60">
          Donations stay optional and never unlock core tracking features.
          <div className="mt-2">
            <SupportLink href={status?.supportUrl} label="Support this App ❤️" />
          </div>
        </div>
      ) : mode === "assist" ? (
        <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/60">
          <span>Want to help keep the tool alive?</span>
          <SupportLink href={status?.supportUrl} label="Support this App ❤️" />
        </div>
      ) : null}
    </div>
  );
}
