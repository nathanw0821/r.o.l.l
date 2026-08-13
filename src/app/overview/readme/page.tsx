import * as React from "react";
import { Card } from "@/components/ui/card";
import { PRIMARY_REFERENCE_SITES } from "@/content/sources-and-credits";
import { Boxes, Camera, Cpu, Layers, ShieldCheck, Zap, ExternalLink, BookmarkCheck } from "lucide-react";

export default async function OverviewReadmePage() {
  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner Card */}
      <Card className="border border-border/30 bg-panel shadow-sm font-mono overflow-hidden">
        <div className="p-6 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest">
              <Cpu className="h-4 w-4" />
              <span>R.O.L.L. Guide</span>
            </div>
            <span className="text-[0.72rem] text-foreground/45 uppercase tracking-wider">v0.1.0</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-foreground">
            Record Of Legendary Loadouts
          </h1>
          <p className="text-xs text-foreground/70 leading-relaxed max-w-3xl font-mono">
            Track 1★–4★ legendary crafting recipes, plan character builds &amp; perks, scan screenshots, and export loadouts.
          </p>
        </div>
      </Card>

      {/* High-Signal Feature Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border border-border/30 bg-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-accent">
            <Layers className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Legendary Tracker</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Track 148 legendary mod effects across 1★ to 4★ tiers per character.
          </p>
        </div>

        <div className="rounded-xl border border-border/30 bg-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-accent">
            <Boxes className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">B.U.I.L.D. Sandbox</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Configure armor, power armor, weapons, and mutations to test DR/ER/RR and SPECIAL stats.
          </p>
        </div>

        <div className="rounded-xl border border-border/30 bg-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-accent">
            <Camera className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">S.C.A.N. Scanner</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Drop Pip-Boy screenshots to automatically detect learned mod recipes.
          </p>
        </div>

        <div className="rounded-xl border border-border/30 bg-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-accent">
            <Zap className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Ghoul Mode &amp; Math</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Test Playable Ghoul 20 S.P.E.C.I.A.L. capacity and inspect raw damage formulas.
          </p>
        </div>

        <div className="rounded-xl border border-border/30 bg-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-accent">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Creation Engine Data</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Datamined from game files (`SeventySix.esm`) for 1:1 FormID accuracy.
          </p>
        </div>

        <div className="rounded-xl border border-border/30 bg-panel p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-accent">
            <BookmarkCheck className="h-5 w-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Image Exporter</h3>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">
            Export 1080p and 4K checklist images and Pip-Boy loadouts.
          </p>
        </div>
      </div>

      {/* Controls Cheat Sheet */}
      <Card className="border border-border/30 bg-panel p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-accent border-b border-border/20 pb-2">
          &gt; CONTROLS &amp; FEATURES
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 text-xs">
          <div className="border border-border/20 bg-background/25 p-3 rounded-lg space-y-1">
            <span className="font-bold text-foreground uppercase">Summary Lock</span>
            <p className="text-foreground/65">Lock Summary view to prevent accidental clicks.</p>
          </div>
          <div className="border border-border/20 bg-background/25 p-3 rounded-lg space-y-1">
            <span className="font-bold text-foreground uppercase">Filter &amp; Search</span>
            <p className="text-foreground/65">Search by category, source, or unlocked status.</p>
          </div>
          <div className="border border-border/20 bg-background/25 p-3 rounded-lg space-y-1">
            <span className="font-bold text-foreground uppercase">Multiple Characters</span>
            <p className="text-foreground/65">Save up to 5 character profiles or track account-wide.</p>
          </div>
          <div className="border border-border/20 bg-background/25 p-3 rounded-lg space-y-1">
            <span className="font-bold text-foreground uppercase">Cloud Sync</span>
            <p className="text-foreground/65">Guest data saves locally. Accounts sync to Cloudflare + Neon DB.</p>
          </div>
        </div>
      </Card>

      {/* Sources & Community Attributions */}
      <Card className="border border-border/30 bg-panel p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border/20 pb-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-accent">
            &gt; SOURCES &amp; ATTRIBUTIONS
          </h2>
          <ShieldCheck className="h-4 w-4 text-accent" />
        </div>
        <p className="text-xs text-foreground/70 leading-relaxed">
          Community tools and references that support Fallout 76 data:
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
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
