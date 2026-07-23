import * as React from "react";
import { Card } from "@/components/ui/card";
import { PRIMARY_REFERENCE_SITES } from "@/content/sources-and-credits";
import { Boxes, Camera, Cpu, Layers, ShieldCheck, Zap, ExternalLink, RefreshCw, BookmarkCheck } from "lucide-react";

export default async function OverviewReadmePage() {
  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner Card */}
      <Card className="border border-border/30 bg-panel shadow-sm font-mono overflow-hidden">
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent text-xs font-black uppercase tracking-widest">
              <Cpu className="h-4 w-4" />
              <span>System Protocol &amp; Guide</span>
            </div>
            <span className="text-[0.72rem] text-foreground/45 uppercase tracking-wider">v0.1.0 · Cloudflare Edge</span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-foreground">
            R.O.L.L. · Record Of Legendary Loadouts
          </h1>
          <p className="text-sm text-foreground/70 leading-relaxed max-w-3xl font-mono">
            A premium, high-fidelity Wasteland companion engineered for Fallout 76. Track 1★–4★ legendary crafting unlocks, run in-browser OCR inventory scans, and simulate character loadouts with real-time SPECIAL telemetry.
          </p>
        </div>
      </Card>

      {/* High-Signal Feature Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-border/30 bg-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-accent">
            <Layers className="h-5 w-5" />
            <h3 className="text-sm font-black uppercase tracking-wider">Legendary Registry</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Track 148 legendary mod effects across 1★ to 4★ tiers. Sync unlocked or seeking status per character with local &amp; cloud storage.
          </p>
        </div>

        <div className="rounded-xl border border-border/30 bg-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-accent">
            <Boxes className="h-5 w-5" />
            <h3 className="text-sm font-black uppercase tracking-wider">B.U.I.L.D. Sandbox</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Simulate custom gear sets (Armor, Power Armor, Weapons, Mutations). Calculate DR/ER/RR and SPECIAL stats with schematic bench tools.
          </p>
        </div>

        <div className="rounded-xl border border-border/30 bg-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-accent">
            <Camera className="h-5 w-5" />
            <h3 className="text-sm font-black uppercase tracking-wider">S.C.A.N. Terminal</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Local-first OCR screenshot scanner. Drop Pip-Boy inventory captures to auto-parse and unlock learned mod recipes in seconds.
          </p>
        </div>

        <div className="rounded-xl border border-border/30 bg-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-accent">
            <RefreshCw className="h-5 w-5" />
            <h3 className="text-sm font-black uppercase tracking-wider">Live Auto-Pull Sync</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Daily 1:00 PM EST automated patch scraping from NukaKnights. Imports dataset changes with atomic DB cutover &amp; Discord alerts.
          </p>
        </div>

        <div className="rounded-xl border border-border/30 bg-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-accent">
            <BookmarkCheck className="h-5 w-5" />
            <h3 className="text-sm font-black uppercase tracking-wider">1080p/4K Exporters</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Export single-screen 1080p and 4K summary PNG checklist grids alongside visual Pip-Boy loadout card exports for Discord &amp; Reddit.
          </p>
        </div>

        <div className="rounded-xl border border-border/30 bg-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-accent">
            <Zap className="h-5 w-5" />
            <h3 className="text-sm font-black uppercase tracking-wider">Offline PWA Mode</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Progressive Web App support. Install to mobile, tablet, or second monitor for zero-latency offline companion use while playing.
          </p>
        </div>
      </div>

      {/* Quick Controls Cheat Sheet */}
      <Card className="border border-border/30 bg-panel p-6 space-y-4">
        <h2 className="text-sm font-black uppercase tracking-wider text-accent border-b border-border/20 pb-2">
          &gt; COMMAND HUB &amp; INTERACTIVE CONTROLS
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="border border-border/20 bg-background/25 p-3 rounded-lg space-y-1">
            <span className="font-bold text-foreground uppercase">Summary Lock Mode</span>
            <p className="text-foreground/65">Toggle lock icon on Summary page to prevent accidental edits. Clicking a card jumps straight to its detail row.</p>
          </div>
          <div className="border border-border/20 bg-background/25 p-3 rounded-lg space-y-1">
            <span className="font-bold text-foreground uppercase">Command Hub Search</span>
            <p className="text-foreground/65">Press Command Hub filter to search by category, origins, acquisition source, or unlocked/seeking status.</p>
          </div>
          <div className="border border-border/20 bg-background/25 p-3 rounded-lg space-y-1">
            <span className="font-bold text-foreground uppercase">Multi-Character Roster</span>
            <p className="text-foreground/65">Manage up to 5 distinct character profiles or track account-wide unique unlocks across all your main/alt builds.</p>
          </div>
          <div className="border border-border/20 bg-background/25 p-3 rounded-lg space-y-1">
            <span className="font-bold text-foreground uppercase">Local &amp; Cloud Persistence</span>
            <p className="text-foreground/65">Guests save data locally in-browser. Signed-in users sync securely to Cloudflare Edge + Neon PostgreSQL.</p>
          </div>
        </div>
      </Card>

      {/* Sources & Community Attributions */}
      <Card className="border border-border/30 bg-panel p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/20 pb-2">
          <h2 className="text-sm font-black uppercase tracking-wider text-accent">
            &gt; COMMUNITY ATTRIBUTION &amp; DATA SOURCES
          </h2>
          <ShieldCheck className="h-4 w-4 text-accent" />
        </div>
        <p className="text-xs text-foreground/70 leading-relaxed">
          Express credit for data retrieval, research, verification, and compilation belongs to the dedicated Fallout 76 community creators. R.O.L.L. re-sorts and presents this knowledge to empower player research:
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pt-1">
          {PRIMARY_REFERENCE_SITES.map((site) => (
            <a
              key={site.href}
              href={site.href}
              target="_blank"
              rel="noreferrer"
              className="border border-border/20 bg-background/30 hover:border-accent/40 p-3.5 rounded-lg transition-all flex flex-col justify-between group space-y-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-foreground group-hover:text-accent transition-colors">{site.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-foreground/40 group-hover:text-accent transition-colors" />
                </div>
                <p className="text-[0.78rem] text-foreground/60 mt-1 line-clamp-2">{site.description}</p>
              </div>
              {site.secondary && (
                <span className="text-[0.72rem] text-accent/80 underline tracking-wider uppercase font-semibold">
                  {site.secondary.label}
                </span>
              )}
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
