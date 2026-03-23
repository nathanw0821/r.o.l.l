import { Suspense } from "react";
import SummaryClient from "@/components/summary-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppSession } from "@/lib/auth";
import { getAllEffectTiers, getProgressSummary } from "@/lib/data";

async function HomeSummaryOverview() {
  const session = await getAppSession();
  const summary = await getProgressSummary(session?.user?.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>
          Track legendary crafting unlocks across tiers with a compact, high-signal view.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="text-xs text-foreground/60">Total Effects</div>
            <div className="text-2xl font-semibold">{summary.total}</div>
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="text-xs text-foreground/60">Unlocked</div>
            <div className="text-2xl font-semibold">{summary.unlocked}</div>
          </div>
          <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
            <div className="text-xs text-foreground/60">Completion</div>
            <div className="text-2xl font-semibold">{summary.percent}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function HomeSummaryTracker() {
  const session = await getAppSession();
  const rows = await getAllEffectTiers(session?.user?.id);

  return <SummaryClient rows={rows} isSignedIn={Boolean(session?.user?.id)} />;
}

function HomeSummaryTrackerFallback() {
  return (
    <div aria-hidden="true" className="space-y-6">
      <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
        <div className="space-y-3">
          <div className="h-4 w-28 rounded bg-foreground/10" />
          <div className="h-3 w-64 max-w-full rounded bg-foreground/10" />
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="h-8 w-20 rounded-full bg-foreground/10" />
            <div className="h-8 w-16 rounded-full bg-foreground/10" />
            <div className="h-8 w-16 rounded-full bg-foreground/10" />
          </div>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-h-[220px] rounded-[var(--radius)] border border-border bg-panel/70 p-4" />
        <div className="min-h-[220px] rounded-[var(--radius)] border border-border bg-panel/70 p-4" />
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-6">
      <HomeSummaryOverview />
      <Suspense fallback={<HomeSummaryTrackerFallback />}>
        <HomeSummaryTracker />
      </Suspense>
    </div>
  );
}
