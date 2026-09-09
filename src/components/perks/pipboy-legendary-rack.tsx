"use client";

import * as React from "react";
import { getPerkCardById, PerkCard } from "@/lib/perks/catalog";
import PipBoyPerkCard from "@/components/perks/pipboy-perk-card";
import { Sparkles, Plus } from "lucide-react";

export interface PipBoyLegendaryRackProps {
  equippedLegendaryCards: { cardId: string; rank: number }[];
  isFemale: boolean;
  onEquipCard: (card: PerkCard, rank: number) => void;
  onUnequipCard: (cardId: string) => void;
  onFilterLegendary?: () => void;
  readOnly?: boolean;
}

const LEGENDARY_UNLOCK_LEVELS = [50, 75, 100, 150, 200, 300];

export default function PipBoyLegendaryRack({
  equippedLegendaryCards,
  isFemale,
  onEquipCard,
  onUnequipCard,
  onFilterLegendary,
  readOnly = false,
}: PipBoyLegendaryRackProps) {
  return (
    <div className="w-full rounded-xl border border-yellow-500/40 bg-gradient-to-r from-yellow-950/20 via-slate-950 to-yellow-950/20 p-3 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-yellow-500/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="font-mono font-bold text-xs uppercase tracking-wider text-yellow-300">
            Legendary Perk Slots {readOnly && "· Read-Only"}
          </span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 font-bold">
            {equippedLegendaryCards.length} / 6 Slots Active
          </span>
        </div>
        {!readOnly && onFilterLegendary && (
          <button
            type="button"
            onClick={onFilterLegendary}
            className="text-[0.68rem] font-mono font-bold px-2.5 py-0.5 rounded bg-yellow-950/60 border border-yellow-500/40 hover:bg-yellow-900/60 text-yellow-300 transition-all flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Browse Legendary Catalog
          </button>
        )}
      </div>

      {/* 6 Legendary Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {Array.from({ length: 6 }, (_, index) => {
          const item = equippedLegendaryCards[index];
          const unlockLevel = LEGENDARY_UNLOCK_LEVELS[index];

          if (item) {
            const card = getPerkCardById(item.cardId);
            if (!card) return null;
            const activeRankObj = card.ranks.find((r) => r.rank === item.rank) || card.ranks[0];

            return (
              <div
                key={card.id}
                className="w-full flex flex-col items-center relative group transition-all"
              >
                <div className="w-full text-center pb-1">
                  <span className="text-[0.62rem] font-mono font-bold text-yellow-400/90 tracking-wider">
                    SLOT {index + 1} • LVL {unlockLevel}
                  </span>
                </div>
                <PipBoyPerkCard
                  cardId={card.id}
                  name={card.name}
                  special={card.special}
                  cost={activeRankObj?.cost ?? item.rank}
                  rank={item.rank}
                  maxRank={card.ranks.length}
                  description={activeRankObj?.description || ""}
                  isEquipped={true}
                  isFemale={isFemale}
                  isOutdated={card.isOutdated}
                  outdatedMeta={card.outdatedMeta}
                  reworkedFrom={card.reworkedFrom}
                  onUnequip={readOnly ? undefined : () => onUnequipCard(card.id)}
                  onRankChange={readOnly ? undefined : (newRank) => onEquipCard(card, newRank)}
                />
              </div>
            );
          }

          return (
            <div
              key={`empty-slot-${index}`}
              onClick={readOnly ? undefined : onFilterLegendary}
              className={`w-full aspect-[310/490] rounded-xl border-2 border-dashed border-yellow-500/30 ${
                readOnly
                  ? "bg-yellow-950/5 opacity-60 cursor-default"
                  : "hover:border-yellow-400 bg-yellow-950/10 hover:bg-yellow-950/30 transition-all cursor-pointer group"
              } flex flex-col items-center justify-center p-3 text-center`}
              title={readOnly ? `Empty slot ${index + 1}` : `Click to slot a legendary perk (Unlocked at Level ${unlockLevel})`}
            >
              <div className="h-10 w-10 rounded-full border border-dashed border-yellow-500/50 flex items-center justify-center mb-2 text-yellow-400 opacity-60">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-xs font-mono font-bold text-yellow-200 uppercase tracking-wider">
                Slot {index + 1}
              </span>
              <span className="text-[0.62rem] font-mono text-yellow-500/80 mt-0.5">
                Level {unlockLevel}
              </span>
              {!readOnly && (
                <span className="mt-3 text-[0.60rem] font-mono font-bold px-2 py-0.5 rounded bg-yellow-950/60 border border-yellow-500/40 text-yellow-300 group-hover:bg-yellow-900/80 transition-all">
                  + Equip
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
