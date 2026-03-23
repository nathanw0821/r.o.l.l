import SummaryClient from "@/components/summary-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAppSession } from "@/lib/auth";
import { getAllEffectTiers } from "@/lib/data";

export default async function SummaryPage() {
  const session = await getAppSession();
  const rows = await getAllEffectTiers(session?.user?.id);
  const unlocked = rows.filter((row) => row.unlocked).length;
  const summary = {
    total: rows.length,
    unlocked,
    percent: rows.length > 0 ? Math.round((unlocked / rows.length) * 100) : 0
  };

  return (
    <div className="space-y-6">
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
      <SummaryClient rows={rows} isSignedIn={Boolean(session?.user?.id)} />
    </div>
  );
}
