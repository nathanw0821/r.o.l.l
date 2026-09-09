"use client";

import * as React from "react";
import { SpecialCategory, getPerkCardById, PerkCard } from "@/lib/perks/catalog";
import { OFFICIAL_SPECIAL_THEMES as SPECIAL_THEMES } from "@/lib/perks/special-theme";
import PipBoyPerkCard from "@/components/perks/pipboy-perk-card";
import { Plus, AlertTriangle } from "lucide-react";

export interface PipBoyPerkAccordionColumnProps {
  special: SpecialCategory;
  equippedCards: { cardId: string; rank: number }[];
  capacity: number;
  basePoints: number;
  legendaryBonus: number;
  isOverCapacity: boolean;
  isFemale: boolean;
  onEquipCard: (card: PerkCard, rank: number) => void;
  onUnequipCard: (cardId: string) => void;
  onFilterSpecial?: (special: SpecialCategory) => void;
  readOnly?: boolean;
}

export default function PipBoyPerkAccordionColumn({
  special,
  equippedCards,
  capacity,
  isOverCapacity,
  isFemale,
  onEquipCard,
  onUnequipCard,
  onFilterSpecial,
  readOnly = false,
}: PipBoyPerkAccordionColumnProps) {
  const theme = SPECIAL_THEMES[special] || SPECIAL_THEMES.S;
  const [hoveredCardId, setHoveredCardId] = React.useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = React.useState<string | null>(null);

  // Calculate points used in this SPECIAL attribute
  const pointsUsed = React.useMemo(() => {
    return equippedCards.reduce((total, item) => {
      const card = getPerkCardById(item.cardId);
      if (!card) return total;
      const rankObj = card.ranks.find((r) => r.rank === item.rank) || card.ranks[0];
      return total + (rankObj?.cost ?? item.rank);
    }, 0);
  }, [equippedCards]);

  const activeCardId = hoveredCardId ?? selectedCardId;

  return (
    <div className="w-full flex flex-col rounded-xl border border-slate-800/90 bg-slate-950/80 shadow-xl overflow-visible">
      {/* Column S.P.E.C.I.A.L. Header Plaque */}
      <div
        className={`p-2.5 border-b flex items-center justify-between rounded-t-xl transition-all ${
          isOverCapacity
            ? "bg-red-950/80 border-red-500/70 text-red-200"
            : "bg-slate-900/90 border-slate-800 text-slate-200"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`h-6 w-6 rounded flex items-center justify-center font-black text-xs font-mono shrink-0 border ${theme.badge}`}
          >
            {special}
          </span>
          <div className="truncate">
            <span className="font-mono font-bold text-xs uppercase tracking-wider block truncate text-slate-100">
              {theme.name}
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`font-mono text-[0.68rem] font-black ${
                  isOverCapacity
                    ? "text-red-400"
                    : pointsUsed === capacity
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              >
                {pointsUsed} / {capacity} pts
              </span>
              {isOverCapacity && (
                <AlertTriangle className="h-3 w-3 text-red-400 inline shrink-0 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Add Perk Filter Button */}
        {!readOnly && onFilterSpecial && (
          <button
            type="button"
            onClick={() => onFilterSpecial(special)}
            className="h-6 w-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700 text-xs shrink-0"
            title={`Browse & add ${theme.name} perks`}
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Accordion Deck Stack Area */}
      <div className="p-2 relative flex flex-col items-center w-full min-h-[300px] overflow-visible">
        {equippedCards.length === 0 ? (
          /* Diegetic Empty Card Slot Placeholder */
          <div
            onClick={readOnly ? undefined : () => onFilterSpecial?.(special)}
            className={`w-full aspect-[310/490] rounded-xl border-2 border-dashed ${theme.border} ${
              readOnly
                ? "bg-slate-900/15 opacity-60 cursor-default"
                : "bg-slate-900/30 hover:bg-slate-900/60 transition-all cursor-pointer group"
            } flex flex-col items-center justify-center p-3 text-center`}
            title={readOnly ? `No ${theme.name} perks equipped` : `Click to browse ${theme.name} perks`}
          >
            <div
              className={`h-12 w-12 rounded-full border border-dashed flex items-center justify-center mb-2 font-mono font-black text-lg ${theme.badge} opacity-70`}
            >
              {special}
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
              Empty Slot
            </span>
            <span className="text-[0.65rem] font-mono text-slate-500 mt-1">
              Cap: {capacity} pts
            </span>
            {!readOnly && (
              <span className="mt-3 text-[0.62rem] font-mono font-bold px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-slate-300 group-hover:border-amber-500/50 group-hover:text-amber-300 transition-all">
                + Add Perk
              </span>
            )}
          </div>
        ) : (
          /* Overlapping Accordion Stack of Cards */
          <div className="w-full relative flex flex-col items-center overflow-visible">
            {equippedCards.map((item, index) => {
              const card = getPerkCardById(item.cardId);
              if (!card) return null;
              const activeRankObj = card.ranks.find((r) => r.rank === item.rank) || card.ranks[0];
              const isForefront = activeCardId === item.cardId;

              return (
                <div
                  key={card.id}
                  style={{
                    zIndex: isForefront ? 50 : 10 + index,
                  }}
                  className={`w-full transition-all duration-200 ease-out will-change-transform ${
                    index === 0 ? "mt-0" : "-mt-[112%]"
                  } ${
                    isForefront
                      ? "transform -translate-y-2 scale-[1.03]"
                      : ""
                  }`}
                  onMouseEnter={() => setHoveredCardId(item.cardId)}
                  onMouseLeave={() => setHoveredCardId(null)}
                >
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
                    isAccordion={true}
                    isForefront={isForefront}
                    onSelect={() => {
                      setSelectedCardId((prev) => (prev === item.cardId ? null : item.cardId));
                    }}
                    onUnequip={readOnly ? undefined : () => {
                      onUnequipCard(card.id);
                      if (selectedCardId === item.cardId) setSelectedCardId(null);
                      if (hoveredCardId === item.cardId) setHoveredCardId(null);
                    }}
                    onRankChange={readOnly ? undefined : (newRank) => onEquipCard(card, newRank)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Accordion Stack Footer Meta */}
      {equippedCards.length > 1 && (
        <div className="px-2.5 py-1.5 border-t border-slate-900 bg-slate-950/60 text-center">
          <span className="text-[0.62rem] font-mono text-slate-400">
            {equippedCards.length} cards • hover/tap to view
          </span>
        </div>
      )}
    </div>
  );
}
