"use client";

import * as React from "react";
import {
  AlertTriangle,
  ExternalLink,
  FlaskConical,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import BrandStack from "@/components/brand-stack";
import {
  PTS_SECTIONS,
  getPtsCatalog,
  filterPtsCatalog,
  type PtsSectionId,
  type PtsItem
} from "@/lib/pts/catalog";

export default function PtsClient() {
  const [activeSection, setActiveSection] = React.useState<PtsSectionId>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const allItems = getPtsCatalog();
  const filteredItems = filterPtsCatalog({ section: activeSection, searchQuery });

  const activeSectionMeta = PTS_SECTIONS.find((s) => s.id === activeSection);

  return (
    <div className="space-y-6 font-mono animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="rounded-[var(--radius-lg)] border border-border bg-panel p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-amber-500" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[0.7rem] uppercase tracking-widest text-amber-500 font-bold flex items-center gap-1.5">
                <FlaskConical className="h-3.5 w-3.5" />
                <span>SYSTEM PROTOCOL // EXPERIMENTAL V.A.U.L.T.</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-1 flex items-center gap-2">
              <span>P.T.S.</span>
              <span className="text-sm text-foreground/50 font-normal">
                (Provisional Testing System)
              </span>
            </h1>
            <p className="text-xs text-foreground/60 mt-1 max-w-2xl leading-relaxed">
              Track experimental test server builds, 4-star legendary mods, crafting overhauls, and NukaKnights datamines before they hit live Fallout 76 servers.
            </p>
          </div>
          <BrandStack />
        </div>
      </div>

      {/* Volatile Data Warning Banner */}
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 shadow-sm relative overflow-hidden backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-500 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                ⚠️ PROVISIONAL DATA NOTICE
              </span>
              <span className="text-[0.65rem] bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded text-amber-400 font-bold">
                VOLATILE / UNRELEASED
              </span>
            </div>
            <p className="text-xs text-foreground/80 leading-relaxed max-w-3xl">
              The data presented on this tab is scraped from active Bethesda PTS test builds and datamined files. Stats, Scrip costs, module crafting requirements, and legendary mod effects are experimental and subject to tuning, balance changes, or removal before official live deployment.
            </p>
          </div>
        </div>
      </div>

      {/* Subsection Navigation Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {PTS_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              const count =
                sec.id === "all"
                  ? allItems.length
                  : allItems.filter((i) => i.section === sec.id).length;

              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border",
                    isActive
                      ? "bg-accent text-white border-accent shadow-sm"
                      : "bg-panel border-border text-foreground/75 hover:bg-background hover:text-foreground"
                  )}
                >
                  <span>{sec.icon}</span>
                  <span>{sec.label}</span>
                  <span className="ml-1 text-[0.65rem] opacity-70 bg-black/20 px-1.5 py-0.2 rounded-full">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative shrink-0 w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-foreground/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search PTS datamines..."
              className="w-full h-8 pl-8 pr-3 text-xs bg-panel border border-border rounded-lg focus:outline-none focus:border-accent text-foreground placeholder:text-foreground/40 font-mono"
            />
          </div>
        </div>

        {/* Section Description */}
        {activeSectionMeta && (
          <div className="text-[0.72rem] text-foreground/60 flex items-center gap-2 px-1">
            <span className="font-bold text-accent">&gt;</span>
            <span>{activeSectionMeta.description}</span>
          </div>
        )}
      </div>

      {/* PTS Card Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-panel p-12 text-center space-y-3">
          <div className="mx-auto h-12 w-12 rounded-full bg-foreground/5 flex items-center justify-center text-foreground/40">
            <Search className="h-6 w-6" />
          </div>
          <p className="text-sm font-bold">No PTS datamines found</p>
          <p className="text-xs text-foreground/50 max-w-md mx-auto">
            Try adjusting your search term or selecting another subsection category tab above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <PtsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function PtsCard({ item }: { item: PtsItem }) {
  return (
    <div className="rounded-xl border border-border bg-panel p-5 shadow-sm hover:border-amber-500/50 transition-all flex flex-col justify-between relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent pointer-events-none rounded-bl-full" />

      <div className="space-y-3">
        {/* Card Header: Tier Badge & Source Link */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider rounded border bg-amber-500/15 border-amber-500/30 text-amber-400 flex items-center gap-1">
              <FlaskConical className="h-3 w-3" />
              <span>{item.tier}</span>
            </span>
            <span className="text-[0.65rem] bg-foreground/10 px-2 py-0.5 rounded text-foreground/70 font-mono">
              {item.status}
            </span>
          </div>

          {item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[0.65rem] text-foreground/50 hover:text-accent flex items-center gap-1 transition font-mono"
              title="View source on NukaKnights"
            >
              <span>{item.sourceName}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ) : (
            <span className="text-[0.65rem] text-foreground/50 font-mono">
              {item.sourceName}
            </span>
          )}
        </div>

        {/* Item Name */}
        <div>
          <h3 className="text-base font-bold text-foreground tracking-tight group-hover:text-amber-400 transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-foreground/60 mt-1">{item.categories}</p>
        </div>

        {/* Description */}
        <p className="text-xs text-foreground/85 leading-relaxed bg-background/50 p-3 rounded-lg border border-border/40 font-mono">
          {item.description}
        </p>

        {/* Requirements & Extra Components */}
        <div className="grid grid-cols-2 gap-2 text-[0.72rem]">
          {item.extraComponent && (
            <div className="bg-panel border border-border/60 p-2 rounded-lg">
              <span className="text-foreground/40 block text-[0.65rem] font-bold uppercase">Required Material</span>
              <span className="font-semibold text-accent">{item.extraComponent}</span>
            </div>
          )}
          {item.scripCost !== undefined && item.scripCost > 0 && (
            <div className="bg-panel border border-border/60 p-2 rounded-lg">
              <span className="text-foreground/40 block text-[0.65rem] font-bold uppercase">Scrip Cost</span>
              <span className="font-semibold text-amber-400">{item.scripCost} Scrip</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {item.notes && (
          <p className="text-[0.68rem] text-foreground/50 italic border-l-2 border-amber-500/40 pl-2 py-0.5">
            Note: {item.notes}
          </p>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[0.65rem] text-foreground/40">
        <span>PROVISIONAL DATASET // PATCH 70</span>
        <span className="text-amber-500/80 font-bold">PTS SPECULATION</span>
      </div>
    </div>
  );
}
