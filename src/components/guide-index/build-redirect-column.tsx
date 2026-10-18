"use client";

import * as React from "react";
import { ExternalLink, Swords, ArrowUpRight } from "lucide-react";

interface BuildTemplate {
  name: string;
  archetype: string;
  special: string;
  description: string;
  url: string;
  tag: string;
}

const FEATURED_ARCHETYPES: BuildTemplate[] = [
  {
    name: "Stealth Bloodied Commando",
    archetype: "V.A.T.S. Critical Meta",
    special: "S:3 P:15 E:4 C:4 I:5 A:15 L:15",
    description:
      "Maximum single-target DPS leveraging Unyielding armor, 33 Luck for every-other-shot crits, and silenced automatic rifles.",
    url: "https://nukesdragons.com/fallout-76/character?v=1&s=3f445ff",
    tag: "High Damage"
  },
  {
    name: "Full-Health Overeater's Heavy",
    archetype: "Power Armor Sustained Fire",
    special: "S:15 P:3 E:8 C:4 I:14 A:6 L:6",
    description:
      "Impervious damage reduction pairing Overeater's T-65 or Union Power Armor with Stabilized and heavy ordnance (Holy Fire, Cremator).",
    url: "https://nukesdragons.com/fallout-76/character?v=1&s=f384e66",
    tag: "Tank / Raids"
  },
  {
    name: "Unyielding Auto-Melee Brawler",
    archetype: "Auto-Axe / Chainsaw Stalker",
    special: "S:15 P:1 E:10 C:4 I:8 A:10 L:8",
    description:
      "Continuous AP-driven shredding with Incisor 75% anti-armor, Makeshift Warrior durability, and Bloody Mess dismemberment.",
    url: "https://nukesdragons.com/fallout-76/character?v=1&s=f1a48a8",
    tag: "Close Quarters"
  },
  {
    name: "Gunslinger / Guerrilla Pistolier",
    archetype: "Agility & Speed Skirmisher",
    special: "S:2 P:12 E:4 C:4 I:6 A:15 L:13",
    description:
      "Rapid V.A.T.S. target acquisition using the Circuit Breaker or Crusader Pistol with Modern Renegade limb disabling.",
    url: "https://nukesdragons.com/fallout-76/character?v=1&s=2c446fd",
    tag: "Mobility"
  }
];

export default function BuildRedirectColumn({ searchQuery = "" }: { searchQuery?: string }) {
  const filtered = FEATURED_ARCHETYPES.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.archetype.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 font-mono">
      {/* Column Header & Logic Framing */}
      <div className="rounded-xl border border-border/60 bg-panel/90 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Combat & Builds
            </h2>
          </div>
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-3xs font-bold uppercase tracking-wider text-amber-400 border border-amber-500/30">
            Outbound Telemetry
          </span>
        </div>
        <p className="mt-2 text-2xs text-foreground/70 leading-relaxed font-sans">
          External programmatic routing to community character planners. Positioned as a{" "}
          <strong className="text-slate-200">comparative validation resource</strong> that users
          can cross-reference alongside our upcoming localized Iris Build Auditor module.
        </p>

        {/* Primary Anchor: Direct Nukes & Dragons Master Launcher */}
        <div className="mt-3 pt-3 border-t border-border/40">
          <a
            href="https://nukesdragons.com/fallout-76/character"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 transition hover:border-amber-400 hover:bg-amber-500/20"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <span>Nukes & Dragons Character Calculator</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="text-3xs text-foreground/60 font-sans">
                Full S.P.E.C.I.A.L. allocation, perk deck leveling roadmaps, and mutation planners.
              </p>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 text-amber-400" />
          </a>
        </div>
      </div>

      {/* Archetype Quick-Launch Templates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-3xs font-bold uppercase tracking-wider text-foreground/60">
          <span>Meta Archetypes & Templates</span>
          <span>{filtered.length} Indexed</span>
        </div>

        {filtered.map((build) => (
          <a
            key={build.name}
            href={build.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg border border-border/50 bg-background/40 p-3.5 transition hover:border-accent hover:bg-background/80"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-3xs uppercase tracking-wider text-accent font-bold">
                  {build.archetype}
                </span>
                <h3 className="text-xs font-bold text-foreground group-hover:text-amber-300 transition-colors">
                  {build.name}
                </h3>
              </div>
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-3xs text-slate-300 border border-slate-700">
                {build.tag}
              </span>
            </div>

            <p className="mt-2 text-3xs text-foreground/70 font-sans leading-relaxed">
              {build.description}
            </p>

            <div className="mt-2.5 flex items-center justify-between border-t border-border/30 pt-2 text-3xs text-foreground/50">
              <span className="font-mono text-slate-400">{build.special}</span>
              <span className="flex items-center gap-1 text-accent group-hover:underline">
                Launch in N&D <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </a>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-lg border border-border/30 bg-background/20 p-4 text-center text-xs text-foreground/40">
            No matching build archetypes found.
          </div>
        )}
      </div>
    </div>
  );
}
