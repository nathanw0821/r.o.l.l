import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>R.O.L.L Readme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-foreground/80">
            <div>
              Registry Of Legendary Loadouts is a Fallout 76 companion tracker for manually managing your legendary
              unlock progress across every star tier.
            </div>
            <div>
              Your data is user-managed. R.O.L.L. does not read the live game process, inspect memory, or depend on
              patch-sensitive hooks, which makes it safer to host publicly and easier to maintain over time.
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Core Views</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Summary dashboard with tier snapshots, filters, and quick progress editing.</li>
                  <li>All Effects registry with full detail tables and compact tile mode.</li>
                  <li>Tier-specific views from 1-star through 4-star, plus Still Need for anything still locked.</li>
                </ul>
              </div>
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Progress & Profiles</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Manual tracking is the core system.</li>
                  <li>Sign in to sync your personal progress across devices.</li>
                  <li>Manual edits always stay under your control and override imported defaults.</li>
                </ul>
              </div>
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Import & Export</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Use import and export for backup, restore, or migration.</li>
                  <li>Admin Import supports multi-sheet Excel workbooks.</li>
                  <li>Export filtered or full progress as Excel, CSV, or JSON.</li>
                </ul>
              </div>
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Safe Companion Workflow</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>No live game-process reading or passive auto-detection.</li>
                  <li>User-managed entries are clearer, more trustworthy, and patch-friendly.</li>
                  <li>Reference-source updates are handled in admin tools, separate from player progress.</li>
                </ul>
              </div>
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4 md:col-span-2">
                <div className="text-xs uppercase text-foreground/60">Accessibility & Display</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Light/dark themes, accent palettes, and color-assistance presets.</li>
                  <li>Compact density switches list tables to tile layouts.</li>
                  <li>Sticky navigation with a floating Command Hub panel.</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
