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
              Record Of Legendary Loadouts is a Fallout 76 companion tracker for logging unlocks, checking farm targets, and syncing progress without touching the live game process.
            </div>
            <div>
              It stays manual, patch-safe, and public-hosting friendly.
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Track</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Summary, All Effects, star-tier pages, and Still Need.</li>
                  <li>Direct Locked or Unlocked editing across views.</li>
                  <li>Per-tier completion in the sidebar and Command Hub.</li>
                  <li>Undo for the last five changes.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Sync</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Guest progress saves locally in the browser.</li>
                  <li>Signed-in progress syncs to your account.</li>
                  <li>Imports and exports cover backup, restore, and migration.</li>
                  <li>Settings handles theme, accessibility, linked accounts, and reset tools.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Command Hub</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Search plus filters for source, status, origin, and category.</li>
                  <li>Theme, accent, scanlines, color assistance, and density.</li>
                  <li>Compact and Comfortable switch instantly across the app.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Session Assist</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Upload a screenshot for local reference and confirm unlocks manually.</li>
                  <li>Available from Admin Tools for controlled testing and review.</li>
                  <li>Modes: Manual Review, New Unlock Sweep, or AI Suggestions.</li>
                  <li>Optional OpenAI review uses your own key and stays suggestion-only.</li>
                </ul>
                <div className="mt-4 rounded-[var(--radius)] border border-border bg-background/40 p-3">
                  <div className="text-xs uppercase text-foreground/60">Status</div>
                  <div className="mt-2 text-sm text-foreground/75">
                    Nothing auto-detects or auto-saves. You review and save only the changes you want.
                  </div>
                </div>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Data</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Effects include categories, descriptions, costs, and notes.</li>
                  <li>Named scrap-source notes are appended where confirmed.</li>
                  <li>Crafting costs use consistent module and component colors.</li>
                  <li>Achievements track progress, exploration, and hidden finds.</li>
                </ul>
              </div>

              <div className="rounded-[var(--radius)] border border-border bg-panel p-4">
                <div className="text-xs uppercase text-foreground/60">Admin and Hosting</div>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                  <li>Admin Import and source monitoring maintain the public dataset.</li>
                  <li>Saved sync sources support manual checks and controlled feed updates.</li>
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
