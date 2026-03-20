import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ReadmePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>R.O.L.L Readme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-foreground/80">
            <div>
              Record Of Legendary Loadouts is a Fallout 76 companion tracker for recording legendary unlocks, checking progress, and syncing account data without touching the live game process.
            </div>
            <div>
              It is manual-first, patch-safe, and designed for reliable public hosting.
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Track</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Summary, All Effects, star-tier pages, Still Need, and Achievements.</li>
                  <li>Locked and Unlocked status editing syncs across views.</li>
                  <li>Per-tier completion in sidebar and Command Hub.</li>
                  <li>Undo for the last five changes.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Summary Mode</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Summary can be locked to prevent accidental toggles.</li>
                  <li>When locked, selecting an effect opens its location in All Effects.</li>
                  <li>Long press or hold tap opens All Effects even when unlocked.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Account and Profile</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Sign in with username/email or linked providers like Google.</li>
                  <li>Dedicated Profile page for username, email, password, and linked accounts.</li>
                  <li>Link or unlink providers from your account panel.</li>
                  <li>Password reset is supported by email.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Sync and Backup</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Guest progress saves locally in this browser.</li>
                  <li>Signed-in progress syncs to your account.</li>
                  <li>Imports and exports support backup, restore, and migration.</li>
                  <li>Progress reset tools are available in Settings.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Command Hub and Layout</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Search and filter by status, source, origins, and categories.</li>
                  <li>Theme, accent, density, scanlines, and color assistance controls.</li>
                  <li>Sidebar can be collapsed; mobile top bar auto-hides on downward scroll.</li>
                  <li>Compact is the default density for faster scanning.</li>
                </ul>
                <div className="mt-4 rounded-[var(--radius)] border border-border bg-background/40 p-3">
                  <div className="text-xs uppercase text-foreground/60">Status</div>
                  <div className="mt-2 text-sm text-foreground/75">
                    Nothing auto-detects or auto-saves. You review and save only the changes you choose.
                  </div>
                </div>
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

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Admin and Hosting</div>
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
