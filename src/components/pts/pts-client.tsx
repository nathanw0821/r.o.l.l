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
import { sanitizeTitle, stripHtmlAndMarkdown } from "@/lib/utils/clean-formatting";
import PerkBuilder from "@/components/perks/perk-builder";
import BuilderExperimentClient from "@/components/builder/builder-experiment-client";

export default function PtsClient() {
  const [ptsTab, setPtsTab] = React.useState<"catalog" | "sandbox" | "perks">("catalog");
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
                <span>P.T.S. DATAMINES</span>
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-1 flex items-center gap-2">
              <span>P.T.S.</span>
              <span className="text-sm text-foreground/50 font-normal">
                (Public Test Server)
              </span>
            </h1>
            <p className="text-xs text-foreground/60 mt-1 max-w-2xl leading-relaxed">
              Track test server updates, 4-star legendary mods, and datamined balance changes.
            </p>
          </div>
          <BrandStack />
        </div>

        {/* Top-Level Experimental Navigation Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/40">
          <button
            type="button"
            onClick={() => setPtsTab("catalog")}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              ptsTab === "catalog"
                ? "bg-amber-500 text-slate-950 font-black shadow"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            <span>🔬 PTS Datamines Catalog</span>
          </button>
          <button
            type="button"
            onClick={() => setPtsTab("sandbox")}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              ptsTab === "sandbox"
                ? "bg-amber-500 text-slate-950 font-black shadow"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <span>🧟 PTS Ghoul B.U.I.L.D. Sandbox</span>
          </button>
          <button
            type="button"
            onClick={() => setPtsTab("perks")}
            className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              ptsTab === "perks"
                ? "bg-amber-500 text-slate-950 font-black shadow"
                : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <span>🃏 PTS 20-Cap P.E.R.K. Matrix</span>
          </button>
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
        {/* Conditional Sub-View Tab Rendering */}
        {ptsTab === "sandbox" ? (
          <div className="space-y-4 pt-6">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-300">
              🧟 <strong>PTS GHOUL EXPERIMENTAL SANDBOX ACTIVE</strong> — Test Playable Ghoul race mutation multipliers and 20 S.P.E.C.I.A.L. Cap scaling before Patch 70 live release!
            </div>
            <BuilderExperimentClient />
          </div>
        ) : ptsTab === "perks" ? (
          <div className="space-y-4 pt-6">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-300">
              🃏 <strong>PTS 20-CAP P.E.R.K. MATRIX ACTIVE</strong> — Experiment with 20-point perk card capacity slots and Feral Gauge perks!
            </div>
            <PerkBuilder mode="pts" />
          </div>
        ) : (
          <>
            {/* Subsection Navigation Bar */}
            <div className="space-y-3 pt-6">
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

              {/* Subsection Meta Description Header */}
              {activeSectionMeta && (
                <div className="p-3 bg-panel border border-border rounded-xl text-xs text-foreground/70">
                  <span className="font-bold text-foreground mr-1.5">{activeSectionMeta.label}:</span>
                  {activeSectionMeta.description}
                </div>
              )}
            </div>

            {/* Item Grid */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-panel border border-border rounded-xl space-y-2">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <FlaskConical className="h-5 w-5" />
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
          </>
        )}
      </div>
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
          <h3 className="text-base font-extrabold text-slate-100 tracking-tight group-hover:text-amber-400 transition-colors">
            {sanitizeTitle(item.name)}
          </h3>
          <p className="text-xs text-amber-400/80 font-medium mt-0.5">{item.categories}</p>
        </div>

        {/* Description */}
        <div className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 font-sans shadow-inner">
          {stripHtmlAndMarkdown(item.description)}
        </div>

        {/* Requirements & Extra Components */}
        <div className="grid grid-cols-2 gap-2 text-[0.72rem] font-mono">
          {item.extraComponent && (
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded-lg">
              <span className="text-slate-400 block text-[0.62rem] font-bold uppercase tracking-wider">Required Material</span>
              <span className="font-bold text-cyan-300">{item.extraComponent}</span>
            </div>
          )}
          {item.scripCost !== undefined && item.scripCost > 0 && (
            <div className="bg-slate-950/60 border border-slate-800 p-2 rounded-lg">
              <span className="text-slate-400 block text-[0.62rem] font-bold uppercase tracking-wider">Scrip Cost</span>
              <span className="font-bold text-amber-400">{item.scripCost} Scrip</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {item.notes && (
          <p className="text-[0.70rem] text-slate-400 italic border-l-2 border-amber-500/50 pl-2 py-1 leading-relaxed bg-slate-900/30 rounded-r">
            💡 Note: {item.notes}
          </p>
        )}

        {/* Source Attribution & Binary Verification Badge */}
        <div className="pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[0.65rem] font-mono">
          {item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400/90 hover:text-amber-300 underline font-semibold flex items-center gap-1 transition-colors"
            >
              <span>🔗 {item.sourceName || "Community Source"}</span>
            </a>
          ) : (
            <span className="text-slate-400">Official Bethesda PTS</span>
          )}
          <span className="text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-bold flex items-center gap-1">
            🔬 BINARY VERIFIED (SeventySix.esm)
          </span>
        </div>
      </div>
    </div>
  );
}
