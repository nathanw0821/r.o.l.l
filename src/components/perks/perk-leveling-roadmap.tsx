"use client";

import * as React from "react";
import { PERK_CATALOG, getPerkCardById } from "@/lib/perks/catalog";
import { OFFICIAL_SPECIAL_THEMES as SPECIAL_THEMES } from "@/lib/perks/special-theme";
import { Calendar, CheckCircle2 } from "lucide-react";

type EquippedItem = { cardId: string; rank: number };

interface PerkLevelingRoadmapProps {
  equippedCards: EquippedItem[];
}

export default function PerkLevelingRoadmap({ equippedCards }: PerkLevelingRoadmapProps) {
  const roadmapSteps = React.useMemo(() => {
    const cardMap: { minLevel: number; cardName: string; special: string; rank: number; cardId: string }[] = [];

    for (const item of equippedCards) {
      const cardDef = getPerkCardById(item.cardId);
      if (cardDef) {
        cardMap.push({
          cardId: cardDef.id,
          cardName: cardDef.name,
          special: cardDef.special,
          minLevel: cardDef.minLevel,
          rank: item.rank,
        });
      }
    }

    // Sort chronologically by minLevel ascending
    return cardMap.sort((a, b) => a.minLevel - b.minLevel);
  }, [equippedCards]);

  if (equippedCards.length === 0) {
    return (
      <div className="py-8 text-center text-xs font-mono text-slate-500 border border-dashed border-slate-800 rounded-lg">
        Equip perk cards in your deck to generate your Level 2–50 Leveling Roadmap!
      </div>
    );
  }

  return (
    <div className="pip-terminal-panel p-4 rounded-xl space-y-4 font-mono border border-emerald-500/30 bg-slate-950/90 shadow-xl">
      <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">
          <Calendar className="h-4 w-4" />
          <span>📅 LEVELING ROADMAP (LEVEL 2 – LEVEL 50 UNLOCK SEQUENCE)</span>
        </div>
        <span className="text-[0.68rem] px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
          {roadmapSteps.length} CARDS UNLOCKED
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {roadmapSteps.map((step, idx) => {
          const theme = SPECIAL_THEMES[step.special as keyof typeof SPECIAL_THEMES] || SPECIAL_THEMES.S;
          return (
            <div
              key={`${step.cardId}-${idx}`}
              className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 flex flex-col justify-between space-y-2 hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                <span className="text-[0.68rem] font-bold font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                  Level {step.minLevel}
                </span>
                <span className={`text-[0.65rem] font-bold font-mono px-1.5 py-0.5 rounded border ${theme.badge}`}>
                  {step.special}
                </span>
              </div>

              <div className="text-xs font-bold font-mono text-white leading-snug">
                {step.cardName}
              </div>

              <div className="flex items-center justify-between text-[0.68rem] font-mono text-slate-400 border-t border-slate-800/80 pt-1.5">
                <span>Equip Rank: {"★".repeat(step.rank)}</span>
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
