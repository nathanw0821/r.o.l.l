"use client";

import * as React from "react";
import { useState } from "react";
import { Search, Compass, X } from "lucide-react";
import BuildRedirectColumn from "@/components/guide-index/build-redirect-column";
import DropTablesColumn from "@/components/guide-index/drop-tables-column";
import SovereignToolsColumn from "@/components/guide-index/sovereign-tools-column";

export default function WikiGuidesPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  return (
    <div className="space-y-6 pb-12 font-mono">
      {/* Terminal Master Banner & Architecture Header */}
      <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-panel via-panel/95 to-slate-950 p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="h-5 w-5 text-amber-400" />
              <h1 className="text-lg md:text-xl font-bold uppercase tracking-wider text-foreground">
                Guides & Community Telemetry Index
              </h1>
            </div>
            <p className="text-sm text-foreground/80 font-sans max-w-3xl leading-relaxed">
              Curated <strong className="text-amber-400">Reference & Redirect</strong> architecture.
              Outbound programmatic bridges respect community research labor without third-party scraping,
              while proprietary combat math and build auditing execute strictly with localized data sovereignty.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="rounded bg-emerald-500/10 px-2.5 py-1 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              100% Non-Commercial
            </span>
            <span className="rounded bg-blue-500/10 px-2.5 py-1 text-blue-400 border border-blue-500/30 font-bold uppercase">
              ZeniMax Policy Aligned
            </span>
            <span className="rounded bg-amber-500/10 px-2.5 py-1 text-amber-400 border border-amber-500/30 font-bold uppercase">
              Zero Scrape Invariant
            </span>
          </div>
        </div>

        {/* Global Directory Search & Filter Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <input
            type="text"
            aria-label="Search guides and tools directory"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchQuery("");
            }}
            placeholder="Search guides, calculators, drop tables, Minerva schedules, and build archetypes..."
            className="w-full rounded-xl bg-slate-900/90 border border-border/70 pl-10 pr-10 py-2.5 text-xs text-foreground placeholder:text-foreground/40 focus:border-amber-400 focus:outline-none transition shadow-inner font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Responsive Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Column 1: Combat & Builds */}
        <section aria-label="Combat and Builds">
          <BuildRedirectColumn searchQuery={searchQuery} />
        </section>

        {/* Column 2: Drop Tables & Events */}
        <section aria-label="Drop Tables and Events">
          <DropTablesColumn searchQuery={searchQuery} />
        </section>

        {/* Column 3: Item Database & Custom Tools */}
        <section aria-label="Item Database and Custom Tools">
          <SovereignToolsColumn />
        </section>
      </div>
    </div>
  );
}
