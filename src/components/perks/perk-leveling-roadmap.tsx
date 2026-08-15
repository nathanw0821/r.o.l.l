"use client";

import * as React from "react";
import { getPerkCardById, isGhoulPerkCard } from "@/lib/perks/catalog";
import { OFFICIAL_SPECIAL_THEMES as SPECIAL_THEMES } from "@/lib/perks/special-theme";
import { Calendar, CheckCircle2, Sparkles } from "lucide-react";

type EquippedItem = { cardId: string; rank: number };

interface PerkLevelingRoadmapProps {
  equippedCards: EquippedItem[];
}

export default function PerkLevelingRoadmap({ equippedCards }: PerkLevelingRoadmapProps) {
  const roadmapSteps = React.useMemo(() => {
    const cardMap: { minLevel: number; cardName: string; special: string; rank: number; cardId: string; isGhoul: boolean }[] = [];

    for (const item of equippedCards) {
      const cardDef = getPerkCardById(item.cardId);
      if (cardDef) {
        cardMap.push({
          cardId: cardDef.id,
          cardName: cardDef.name,
          special: cardDef.special,
          minLevel: cardDef.minLevel || 2,
          rank: item.rank,
          isGhoul: isGhoulPerkCard(cardDef.id),
        });
      }
    }

    // Sort chronologically by minLevel ascending, then alphabetically by card name
    return cardMap.sort((a, b) => {
      if (a.minLevel !== b.minLevel) return a.minLevel - b.minLevel;
      return a.cardName.localeCompare(b.cardName);
    });
  }, [equippedCards]);

  const maxLevel = React.useMemo(() => {
    if (roadmapSteps.length === 0) return 50;
    const highest = Math.max(...roadmapSteps.map((s) => s.minLevel));
    return Math.max(50, highest);
  }, [roadmapSteps]);

  const hasGhoulPerks = React.useMemo(() => {
    return roadmapSteps.some((s) => s.isGhoul || s.minLevel > 50);
  }, [roadmapSteps]);

  if (equippedCards.length === 0) {
    return (
      <div className="py-8 text-center text-xs font-mono text-slate-400 border border-dashed border-slate-800 rounded-lg bg-slate-950/40">
        Equip perk cards in your deck to generate your dynamic Level 2 – 100+ progression roadmap!
      </div>
    );
  }

  return (
    <div className="pip-terminal-panel p-4 rounded-xl space-y-4 font-mono border border-emerald-500/30 bg-slate-950/90 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-500/20 pb-3">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">
          <Calendar className="h-4 w-4 shrink-0" />
          <span>LEVELING ROADMAP // LEVEL 2 – {maxLevel}+ PROGRESSION TIMELINE</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {hasGhoulPerks && (
            <span className="text-[0.62rem] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="h-3 w-3 fill-emerald-400" /> Ghoul 50–100+ Unlocks
            </span>
          )}
          <span className="text-[0.68rem] px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
            {roadmapSteps.length} CARDS UNLOCKED
          </span>
        </div>
      </div>

      {/* Grid of Progression Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {roadmapSteps.map((step, idx) => {
          const theme = SPECIAL_THEMES[step.special as keyof typeof SPECIAL_THEMES] || SPECIAL_THEMES.S;
          const isPost50 = step.minLevel > 50;

          return (
            <div
              key={`${step.cardId}-${idx}`}
              className={`rounded-lg p-3 flex flex-col justify-between space-y-2 border transition-all ${
                step.isGhoul
                  ? "bg-[#091511] border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.15)] hover:border-emerald-400"
                  : isPost50
                  ? "bg-slate-900/90 border-amber-500/40 hover:border-amber-400/80"
                  : "bg-slate-900/80 border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-1">
                <span
                  className={`text-[0.68rem] font-bold font-mono px-2 py-0.5 rounded border ${
                    step.isGhoul
                      ? "bg-emerald-950 text-emerald-300 border-emerald-500/70"
                      : isPost50
                      ? "bg-amber-950/80 text-amber-300 border-amber-500/50"
                      : "bg-slate-950 text-slate-300 border-slate-700"
                  }`}
                >
                  Level {step.minLevel}
                </span>

                <div className="flex items-center gap-1">
                  {step.isGhoul && (
                    <span className="text-[0.58rem] font-black px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                      GHOUL
                    </span>
                  )}
                  <span className={`text-[0.62rem] font-bold font-mono px-1.5 py-0.5 rounded border ${theme.badge}`}>
                    {step.special}
                  </span>
                </div>
              </div>

              <div className="text-xs font-bold font-mono text-white leading-snug">
                {step.cardName}
              </div>

              <div className="flex items-center justify-between text-[0.68rem] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5">
                <span>Rank: {"★".repeat(step.rank)}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Ready
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
