import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CREDIT_PARAGRAPHS, PRIMARY_REFERENCE_SITES } from "@/content/sources-and-credits";

export default async function OverviewReadmePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>R.O.L.L. readme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-foreground/80">
            <p>
              Record Of Legendary Loadouts is a Fallout 76 companion for tracking legendary unlocks, browsing effects,
              and syncing progress. It is manual-first and built for reliable public hosting.
            </p>

            <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Sources &amp; credit</h2>
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-foreground/78">
                {CREDIT_PARAGRAPHS.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <p className="mt-3 text-xs text-foreground/60">
                Reference links are for attribution and further reading. R.O.L.L. is not affiliated with these sites.
              </p>
              <ul className="mt-3 list-none space-y-3 border-t border-border/70 pt-3 text-sm text-foreground/80">
                {PRIMARY_REFERENCE_SITES.map((s) => (
                  <li key={s.href}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
                    >
                      {s.title}
                    </a>
                    <span className="text-foreground/65"> — {s.description}</span>
                    {s.secondary ? (
                      <div className="mt-1.5 text-xs text-foreground/60">
                        <a
                          href={s.secondary.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent underline decoration-accent/35 underline-offset-2 hover:decoration-accent"
                        >
                          {s.secondary.label}
                        </a>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Track</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Summary, Overview, All Effects, star-tier pages, and Still Need.</li>
                  <li>Locked and Unlocked status editing syncs across views.</li>
                  <li>Per-tier completion in sidebar and Command Hub.</li>
                  <li>Undo for the last five changes.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Summary mode</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Summary can be locked to prevent accidental toggles.</li>
                  <li>When locked, selecting an effect opens its location in All Effects.</li>
                  <li>Long press or hold tap opens All Effects even when unlocked.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Overview tabs</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Profile, Achievements, and Readme live under Overview.</li>
                  <li>Sign in with username/email or linked providers like Google.</li>
                  <li>Link or unlink providers from your account panel.</li>
                  <li>Password reset is supported by email.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Sync and backup</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Guest progress saves locally in this browser.</li>
                  <li>Signed-in progress syncs to your account.</li>
                  <li>Imports and exports support backup, restore, and migration.</li>
                  <li>Progress reset tools are available in Settings.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Command Hub and layout</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Search and filter by status, source, origins, and categories.</li>
                  <li>Theme, accent, density, scanlines, and color assistance controls.</li>
                  <li>Sidebar can be collapsed; mobile top bar auto-hides on downward scroll.</li>
                  <li>Compact is the default density for faster scanning.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Data</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Effects include categories, descriptions, costs, notes, and origins.</li>
                  <li>Named scrap-source notes are appended where confirmed.</li>
                  <li>Crafting costs use consistent module and component colors.</li>
                  <li>Achievements track progress, exploration, and hidden finds.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4 md:col-span-2">
                <div className="text-xs uppercase text-foreground/60">Admin and hosting</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Admin Import and source monitoring maintain the public dataset.</li>
                  <li>Saved sync sources support manual checks and controlled update runs.</li>
                  <li>Feedback inbox and Session Assist are available for admin workflows.</li>
                  <li>The app is built for safer long-term public hosting across patches.</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
