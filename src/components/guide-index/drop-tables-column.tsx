"use client";

import * as React from "react";
import { ExternalLink, Database, ShoppingBag, ArrowUpRight } from "lucide-react";

interface TelemetryResource {
  id: string;
  title: string;
  provider: "Nuka Knights" | "TheDuchessFlame" | "Unofficial Atomic Shop" | "Fallout Fandom";
  category: "Vendors & Minerva" | "Events & Seasons" | "Drop Odds & Loot" | "Atomic Shop";
  url: string;
  abstract: string;
}

const TELEMETRY_LINKS: TelemetryResource[] = [
  {
    id: "nk-minerva",
    title: "Minerva Sales Calendar & Location Tracker",
    provider: "Nuka Knights",
    category: "Vendors & Minerva",
    url: "https://nukaknights.com/minerva-dates-inventory.html",
    abstract:
      "Live tracking matrix of recurring vendor inventories, discount rotations, and Gold Bullion item locations, as compiled by the data tracking team at Nuka Knights."
  },
  {
    id: "nk-expeditions",
    title: "Expeditions & Raid Loot Tables (The Pitt & Atlantic City)",
    provider: "Nuka Knights",
    category: "Drop Odds & Loot",
    url: "https://nukaknights.com/articles/all-about-expeditions-rewards-and-stamps.html",
    abstract:
      "Comprehensive reward probability tables and rare plan drop percentages across all expedition zones, maintained by the datamine specialists at Nuka Knights."
  },
  {
    id: "nk-events",
    title: "Public Event Seasonal Schedules & Rotations",
    provider: "Nuka Knights",
    category: "Events & Seasons",
    url: "https://nukaknights.com/events-calendar.html",
    abstract:
      "Real-time calendar tracking Mutated Events, Double XP weekends, and seasonal community milestones, authored by the Nuka Knights team."
  },
  {
    id: "duchess-holiday",
    title: "Holiday & Spooky Scorched Reward Pools",
    provider: "TheDuchessFlame",
    category: "Drop Odds & Loot",
    url: "https://theduchessflame.com/post/holiday-santa-scorched-all-rewards",
    abstract:
      "Exhaustive breakdown of holiday gift and mystery bag drop tables, including historical rarity odds and plan checklists verified by TheDuchessFlame."
  },
  {
    id: "duchess-fasnacht",
    title: "Fasnacht Day Mask Tier List & Drop Chances",
    provider: "TheDuchessFlame",
    category: "Drop Odds & Loot",
    url: "https://theduchessflame.com/post/fasnacht-day-event-guide-and-rewards-list",
    abstract:
      "Verified drop percentage distribution across Common, Uncommon, and Glowing Rare Fasnacht mask tiers, documented by the research team at TheDuchessFlame."
  },
  {
    id: "duchess-meatweek",
    title: "Meat Week & Primal Cuts Rewards Guide",
    provider: "TheDuchessFlame",
    category: "Events & Seasons",
    url: "https://theduchessflame.com/post/meat-week-and-primal-cuts-event-guide",
    abstract:
      "Complete index of Grahm's Meat Cook rewards, Chally the Moo-Moo outfits, and tenderizer weapon mod drop rates curated by TheDuchessFlame."
  },
  {
    id: "atomic-shop-tracker",
    title: "Atomic Shop Live Asset Tracker",
    provider: "Unofficial Atomic Shop",
    category: "Atomic Shop",
    url: "https://uf.atomicshop.fyi/",
    abstract:
      "Atomic Shop live asset tracker. Features real-time validation of weekly bundles, limited-time discounts, and historic cosmetic drop tables."
  },
  {
    id: "fandom-quests",
    title: "Fallout 76 Canonical Quest & Lore Archives",
    provider: "Fallout Fandom",
    category: "Events & Seasons",
    url: "https://fallout.fandom.com/wiki/Fallout_76",
    abstract:
      "Canonical encyclopedic reference documenting step-by-step quest walkthroughs, dialogue branches, and Fallout 76 lore records maintained by the Fandom community."
  }
];

export default function DropTablesColumn({ searchQuery = "" }: { searchQuery?: string }) {
  const filtered = TELEMETRY_LINKS.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 font-mono">
      {/* Column Header & Abstraction Constraint */}
      <div className="rounded-xl border border-border/60 bg-panel/90 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Drop Tables & Events
            </h2>
          </div>
          <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/30">
            Semantic Index
          </span>
        </div>
        <p className="mt-2 text-sm text-foreground/80 leading-relaxed font-sans">
          Highly targeted deep-linking with semantic abstraction. In accordance with our{" "}
          <strong className="text-slate-200">Zero Scrape Invariant</strong>, external data arrays
          are never mirrored locally to honor community research labor and ensure authoritative telemetry.
        </p>
      </div>

      {/* Dedicated Atomic Shop Live Asset Tracker Tile */}
      <div className="rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-panel to-slate-950 p-4 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wide">
              Atomic Shop Asset Tracker
            </span>
          </div>
          <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold uppercase text-amber-300 border border-amber-500/40">
            uf.atomicshop.fyi
          </span>
        </div>
        <p className="mt-2 text-sm text-foreground/80 leading-relaxed font-sans">
          Atomic Shop live asset tracker. Features real-time validation of weekly bundles, limited-time discounts, and historic cosmetic drop tables.
        </p>
        <div className="mt-3 flex items-center justify-between pt-2 border-t border-amber-500/20">
          <span className="text-xs text-foreground/50">Zero local DB overhead</span>
          <a
            href="https://uf.atomicshop.fyi/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs uppercase hover:bg-amber-400 transition"
          >
            <span>Launch Tracker</span>
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Semantic Deep Links List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs font-bold uppercase tracking-wider text-foreground/60">
          <span>Curated Community Data Tracking</span>
          <span>{filtered.length} Endpoints</span>
        </div>

        {filtered.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg border border-border/50 bg-background/40 p-3.5 transition hover:border-emerald-500/60 hover:bg-background/80"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                  {item.provider}
                </span>
                <h3 className="text-xs font-bold text-foreground group-hover:text-emerald-300 transition-colors">
                  {item.title}
                </h3>
              </div>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-foreground/40 group-hover:text-emerald-400 transition-colors" />
            </div>

            <p className="mt-2 text-sm text-foreground/80 font-sans leading-relaxed">
              {item.abstract}
            </p>

            <div className="mt-2.5 flex items-center justify-between border-t border-border/30 pt-2 text-xs text-foreground/60">
              <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-slate-300">
                {item.category}
              </span>
              <span className="flex items-center gap-1 text-emerald-400 group-hover:underline">
                View Source Table <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </a>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-lg border border-border/30 bg-background/20 p-4 text-center text-xs text-foreground/40">
            No matching drop tables found.
          </div>
        )}
      </div>
    </div>
  );
}
