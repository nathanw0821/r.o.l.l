"use client";

import * as React from "react";
import { SpecialCategory, PERK_CATALOG, isGhoulPerkCard } from "@/lib/perks/catalog";
import PipBoyCardArt from "@/components/perks/pipboy-card-art";
import { getPerkCardArtworkUrl, getGenderedPerkName } from "@/lib/perks/perk-artwork";
import { Sparkles, Star, Info, X, ExternalLink } from "lucide-react";

export interface InGamePerkCardProps {
  cardId?: string;
  name: string;
  special: SpecialCategory;
  cost: number;
  rank: number;
  maxRank: number;
  minLevel?: number;
  description: string;
  isEquipped?: boolean;
  isOverflow?: boolean;
  isFemale?: boolean;
  onEquip?: () => void;
  onUnequip?: () => void;
  onRankChange?: (newRank: number) => void;
  footerExtra?: React.ReactNode;
}

// Authentic Fallout 76 In-Game S.P.E.C.I.A.L. Theme Styling
const AUTHENTIC_SPECIAL_THEMES: Record<
  SpecialCategory,
  {
    headerBg: string;
    headerBorder: string;
    artBg: string;
    stampBorder: string;
    stampText: string;
    ribbonBg: string;
    ribbonBorder: string;
    costBorder: string;
    costText: string;
    accentGlow: string;
  }
> = {
  S: {
    headerBg: "bg-[#4e7a68]", // Sage Strength Green
    headerBorder: "border-[#3b6353]",
    artBg: "bg-[#9ec4b5]",
    stampBorder: "border-[#3b6353]",
    stampText: "text-[#3b6353]",
    ribbonBg: "bg-[#4e7a68]",
    ribbonBorder: "border-[#3b6353]",
    costBorder: "border-[#3b6353]",
    costText: "text-[#2b4c3e]",
    accentGlow: "shadow-emerald-900/40",
  },
  P: {
    headerBg: "bg-[#2c6e80]", // Perception Cyan
    headerBorder: "border-[#1e5463]",
    artBg: "bg-[#94c8d5]",
    stampBorder: "border-[#1e5463]",
    stampText: "text-[#1e5463]",
    ribbonBg: "bg-[#2c6e80]",
    ribbonBorder: "border-[#1e5463]",
    costBorder: "border-[#1e5463]",
    costText: "text-[#16414d]",
    accentGlow: "shadow-cyan-900/40",
  },
  E: {
    headerBg: "bg-[#3e6d49]", // Endurance Green
    headerBorder: "border-[#2b5235]",
    artBg: "bg-[#9cc7a5]",
    stampBorder: "border-[#2b5235]",
    stampText: "text-[#2b5235]",
    ribbonBg: "bg-[#3e6d49]",
    ribbonBorder: "border-[#2b5235]",
    costBorder: "border-[#2b5235]",
    costText: "text-[#1d3b24]",
    accentGlow: "shadow-emerald-900/40",
  },
  C: {
    headerBg: "bg-[#7e682e]", // Charisma Gold
    headerBorder: "border-[#5e4c1f]",
    artBg: "bg-[#d8c79a]",
    stampBorder: "border-[#5e4c1f]",
    stampText: "text-[#5e4c1f]",
    ribbonBg: "bg-[#7e682e]",
    ribbonBorder: "border-[#5e4c1f]",
    costBorder: "border-[#5e4c1f]",
    costText: "text-[#473914]",
    accentGlow: "shadow-yellow-900/40",
  },
  I: {
    headerBg: "bg-[#4c5b6b]", // Intelligence Slate
    headerBorder: "border-[#354250]",
    artBg: "bg-[#a6b6c8]",
    stampBorder: "border-[#354250]",
    stampText: "text-[#354250]",
    ribbonBg: "bg-[#4c5b6b]",
    ribbonBorder: "border-[#354250]",
    costBorder: "border-[#354250]",
    costText: "text-[#242f3a]",
    accentGlow: "shadow-slate-900/40",
  },
  A: {
    headerBg: "bg-[#7e323e]", // Agility Red
    headerBorder: "border-[#5c202a]",
    artBg: "bg-[#d89da7]",
    stampBorder: "border-[#5c202a]",
    stampText: "text-[#5c202a]",
    ribbonBg: "bg-[#7e323e]",
    ribbonBorder: "border-[#5c202a]",
    costBorder: "border-[#5c202a]",
    costText: "text-[#47151e]",
    accentGlow: "shadow-rose-900/40",
  },
  L: {
    headerBg: "bg-[#7d4920]", // Luck Amber
    headerBorder: "border-[#5c3314]",
    artBg: "bg-[#d8a883]",
    stampBorder: "border-[#5c3314]",
    stampText: "text-[#5c3314]",
    ribbonBg: "bg-[#7d4920]",
    ribbonBorder: "border-[#5c3314]",
    costBorder: "border-[#5c3314]",
    costText: "text-[#47250c]",
    accentGlow: "shadow-amber-900/40",
  },
  LEGENDARY: {
    headerBg: "bg-gradient-to-r from-[#6b4210] via-[#94611d] to-[#6b4210]",
    headerBorder: "border-[#f59e0b]",
    artBg: "bg-[#dfbe88]",
    stampBorder: "border-[#f59e0b]",
    stampText: "text-[#784813]",
    ribbonBg: "bg-gradient-to-r from-[#784813] to-[#94611d]",
    ribbonBorder: "border-[#f59e0b]",
    costBorder: "border-[#f59e0b]",
    costText: "text-[#6b4210]",
    accentGlow: "shadow-yellow-500/50",
  },
};

/**
 * Authentic 1:1 In-Game Fallout 76 Perk Card Face Component
 * Renders the authentic cream frame, dynamic cost badge, uppercase header,
 * centered Vault Boy artwork, dynamic patch description box, SPECIAL stamp, and live star ribbon.
 */
export function AuthenticPerkCardFace({
  displayName,
  special,
  cost,
  rank,
  maxRank,
  description,
  artworkUrl,
  isLegendary = false,
  isGhoul = false,
  isFemale = false,
  cardId,
  name,
}: {
  displayName: string;
  special: SpecialCategory;
  cost: number;
  rank: number;
  maxRank: number;
  description: string;
  artworkUrl: string;
  isLegendary?: boolean;
  isGhoul?: boolean;
  isFemale?: boolean;
  cardId?: string;
  name: string;
}) {
  const style = AUTHENTIC_SPECIAL_THEMES[special] || AUTHENTIC_SPECIAL_THEMES.S;
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={`w-full h-full bg-[#ede5d0] border-2 ${
        isGhoul ? "border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]" : isLegendary ? "border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]" : "border-[#ded0b6]"
      } rounded-xl p-[2.5px] shadow-xl flex flex-col justify-between select-none relative overflow-hidden`}
    >
      {/* Inner Card Framing */}
      <div className="w-full h-full bg-[#f6f2e8] border border-[#2b2824]/80 rounded-lg flex flex-col justify-between overflow-hidden relative">
        {/* Top Header Banner */}
        <div
          className={`w-full h-8 sm:h-9 ${style.headerBg} border-b border-[#2b2824] px-1.5 flex items-center justify-between relative shrink-0 z-10`}
        >
          {/* Top-Left Point Cost Badge Tab */}
          <div
            className={`w-6 h-6 sm:w-7 sm:h-7 bg-[#f6f2e8] rounded border-2 ${style.costBorder} flex items-center justify-center font-black text-sm sm:text-base ${style.costText} shadow-sm shrink-0 font-serif -ml-0.5`}
            title={`Equip Cost: ${cost} SPECIAL Point${cost > 1 ? "s" : ""}`}
          >
            {cost}
          </div>

          {/* Card Title Header */}
          <span className="font-black text-[0.72rem] sm:text-sm tracking-wider uppercase text-white truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] px-1 font-mono flex-1 text-center">
            {displayName}
          </span>
        </div>

        {/* Central Artwork Window */}
        <div className={`relative flex-1 w-full ${style.artBg} flex items-center justify-center overflow-hidden min-h-0`}>
          {/* Authentic Fallout 76 Diamond Motif Background Watermark */}
          <svg
            className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon points="50,0 100,50 50,100 0,50" fill="white" />
            <polygon points="50,12 88,50 50,88 12,50" fill="none" stroke="white" strokeWidth="4" opacity="0.7" />
            <polygon points="50,24 76,50 50,76 24,50" fill="none" stroke="white" strokeWidth="3" opacity="0.5" />
          </svg>

          {!imgError ? (
            <img
              src={artworkUrl}
              alt={displayName}
              className="w-full h-full object-cover object-[center_35%] scale-[1.38] drop-shadow-md pointer-events-none z-10"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full p-2 flex items-center justify-center z-10">
              <PipBoyCardArt special={special} name={name} isFemale={isFemale} className="w-full h-full" />
            </div>
          )}
        </div>

        {/* Lower Description Box */}
        <div className="w-full bg-[#ede5d0] border-t border-[#2b2824] p-1.5 sm:p-2 flex flex-col justify-between relative shrink-0 min-h-[62px] sm:min-h-[76px] max-h-[88px] sm:max-h-[102px] z-10">
          <p className="text-[0.62rem] sm:text-[0.72rem] leading-tight font-serif text-[#1e1c18] font-semibold tracking-tight line-clamp-3 pr-8 pb-3">
            {description}
          </p>

          {/* Bottom-Left SPECIAL Stamp */}
          <div
            className={`absolute bottom-1 left-1.5 bg-[#f6f2e8] border ${style.stampBorder} rounded px-1.5 py-0.2 shadow-sm font-black font-serif text-[0.62rem] sm:text-[0.70rem] ${style.stampText} transform -rotate-3`}
          >
            {special}
          </div>

          {/* Bottom-Right Star Ribbon */}
          <div
            className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded-sm border ${style.ribbonBg} ${style.ribbonBorder} text-white shadow-md flex items-center gap-0.5 text-[0.60rem] sm:text-[0.68rem] font-black`}
            title={`Rank ${rank} of ${maxRank}`}
          >
            {Array.from({ length: maxRank }, (_, i) => {
              const filled = i < rank;
              return (
                <span
                  key={i}
                  className={filled ? "text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" : "text-white/30"}
                >
                  ★
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InGamePerkCard({
  cardId,
  name,
  special,
  cost,
  rank,
  maxRank,
  minLevel,
  description,
  isEquipped = false,
  isOverflow = false,
  isFemale = false,
  onEquip,
  onUnequip,
  onRankChange,
  footerExtra,
}: InGamePerkCardProps) {
  const [showInspector, setShowInspector] = React.useState(false);
  const [inspectedRank, setInspectedRank] = React.useState(rank);
  const artworkUrl = getPerkCardArtworkUrl(cardId || name, special, isFemale);
  const displayName = getGenderedPerkName(name, isFemale);
  const isLegendary = special === "LEGENDARY" || cardId?.includes("legendary");
  const isGhoul = isGhoulPerkCard(cardId || name);

  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Synchronize inspectedRank when rank prop changes
  React.useEffect(() => {
    setInspectedRank(rank);
  }, [rank]);

  // Full Catalog Card for All Ranks Inspection
  const fullCard = React.useMemo(() => {
    return PERK_CATALOG.find((c) => c.id === cardId || c.name.toLowerCase() === name.toLowerCase());
  }, [cardId, name]);

  const activeRankData = React.useMemo(() => {
    if (!fullCard || !fullCard.ranks || fullCard.ranks.length === 0) {
      return { rank, cost, description };
    }
    const match = fullCard.ranks.find((r) => r.rank === rank);
    return match || fullCard.ranks[0];
  }, [fullCard, rank, cost, description]);

  const activeInspectedRankData = React.useMemo(() => {
    if (!fullCard || !fullCard.ranks || fullCard.ranks.length === 0) {
      return { rank: inspectedRank, cost, description };
    }
    const match = fullCard.ranks.find((r) => r.rank === inspectedRank);
    return match || fullCard.ranks[0];
  }, [fullCard, inspectedRank, cost, description]);

  const openWikiSource = React.useCallback(() => {
    window.open(`/wiki?q=${encodeURIComponent(name)}`, "_blank", "noopener,noreferrer");
  }, [name]);

  // Mobile-only touch long press
  const handleTouchStart = () => {
    longPressTimerRef.current = setTimeout(() => {
      openWikiSource();
    }, 550);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div
      className={`group relative w-full flex flex-col items-center justify-between transition-all duration-200 font-mono ${
        isOverflow ? "ring-4 ring-red-500 rounded-xl" : ""
      }`}
    >
      {/* Style Bible Container: Aspect Ratio 3:4 Uniform Framing */}
      <div
        className={`relative w-full aspect-[3/4.2] rounded-xl overflow-hidden shadow-xl transition-all duration-200 group-hover:scale-[1.03] cursor-pointer flex flex-col justify-between ${
          isEquipped
            ? "ring-2 ring-amber-400 shadow-amber-500/40"
            : isGhoul
            ? "ring-2 ring-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
            : "opacity-95 group-hover:opacity-100"
        }`}
        onClick={() => (isEquipped ? onUnequip?.() : onEquip?.())}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowInspector(true);
        }}
        title="Click to equip • Right-click for perk details & Truth Wiki"
      >
        {/* Dynamic 1:1 In-Game Authentic Card Face */}
        <AuthenticPerkCardFace
          displayName={displayName}
          special={special}
          cost={activeRankData.cost}
          rank={rank}
          maxRank={maxRank}
          description={activeRankData.description}
          artworkUrl={artworkUrl}
          isLegendary={isLegendary}
          isGhoul={isGhoul}
          isFemale={isFemale}
          cardId={cardId}
          name={name}
        />

        {/* Legendary Badge Crest Banner */}
        {isLegendary && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[0.58rem] px-2 py-0.5 rounded-md shadow-lg border border-yellow-300 tracking-wider flex items-center gap-1 z-20">
            <Sparkles className="h-3 w-3 fill-slate-950" /> LEGENDARY
          </div>
        )}

        {/* Ghoul Specific Badge Banner */}
        {isGhoul && !isLegendary && (
          <div className="absolute top-2 right-2 bg-emerald-950/90 border border-emerald-500 text-emerald-300 font-mono font-black text-[0.55rem] px-1.5 py-0.5 rounded shadow-md tracking-wider z-20">
            GHOUL
          </div>
        )}

        {/* Rank Inspector Trigger Badge Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowInspector(true);
          }}
          className="absolute bottom-2 left-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-amber-400 hover:text-white p-1 rounded shadow-md opacity-80 group-hover:opacity-100 transition-all z-20"
          title="Inspect All Ranks & Stats"
        >
          <Info className="h-3.5 w-3.5" />
        </button>

        {/* Equipped Badge Ribbon */}
        {isEquipped && (
          <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-black text-[0.62rem] px-2 py-0.5 rounded-full shadow-lg border border-amber-300 tracking-wider z-20">
            ✓ EQUIPPED
          </div>
        )}
      </div>

      {/* Clean Rank Level Up / Down Interactive Control Bar */}
      <div
        className={`w-full mt-2 rounded-lg p-1.5 flex items-center justify-between gap-1 shadow-md border ${
          isLegendary
            ? "bg-gradient-to-r from-[#241403] via-[#382006] to-[#241403] border-yellow-500/70"
            : "bg-slate-950/90 border-slate-800"
        }`}
      >
        {/* Rank Level Down Button */}
        <button
          type="button"
          disabled={rank <= 1}
          onClick={(e) => {
            e.stopPropagation();
            if (rank > 1) onRankChange?.(rank - 1);
          }}
          className={`h-7 w-7 rounded border font-black text-sm flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer ${
            isLegendary
              ? "bg-yellow-950 border-yellow-500/80 text-yellow-300 hover:bg-yellow-400 hover:text-slate-950"
              : "bg-slate-900 border-slate-700 text-amber-400 hover:bg-amber-500 hover:text-slate-950"
          }`}
          title="Rank Down"
        >
          -
        </button>

        {/* Current Rank Display */}
        <div className="flex-1 text-center font-mono">
          <span
            className={`text-[0.68rem] font-bold block leading-none ${
              isLegendary ? "text-yellow-200" : "text-slate-300"
            }`}
          >
            RANK {rank} / {maxRank}
          </span>
          <div className="flex items-center justify-center gap-0.5 mt-0.5">
            {Array.from({ length: maxRank }, (_, i) => {
              const isActive = i + 1 <= rank;
              return (
                <Star
                  key={i}
                  className={`h-2.5 w-2.5 ${
                    isActive
                      ? isLegendary
                        ? "text-yellow-300 fill-yellow-300 drop-shadow-[0_0_4px_rgba(234,179,8,0.8)]"
                        : "text-amber-400 fill-amber-400"
                      : "text-slate-700 fill-none"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Rank Level Up Button */}
        <button
          type="button"
          disabled={rank >= maxRank}
          onClick={(e) => {
            e.stopPropagation();
            if (rank < maxRank) onRankChange?.(rank + 1);
          }}
          className={`h-7 w-7 rounded border font-black text-sm flex items-center justify-center transition-all disabled:opacity-30 cursor-pointer ${
            isLegendary
              ? "bg-yellow-950 border-yellow-500/80 text-yellow-300 hover:bg-yellow-400 hover:text-slate-950"
              : "bg-slate-900 border-slate-700 text-amber-400 hover:bg-amber-500 hover:text-slate-950"
          }`}
          title="Rank Up"
        >
          +
        </button>

        {/* Equip / Remove Button */}
        {onEquip || onUnequip ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isEquipped) {
                onUnequip?.();
              } else {
                onEquip?.();
              }
            }}
            className={`text-[0.60rem] font-black uppercase px-2 py-1.5 rounded border transition-all shadow-sm cursor-pointer ${
              isEquipped
                ? "bg-red-950/90 border-red-700 text-red-300 hover:bg-red-900"
                : isLegendary
                ? "bg-yellow-400 text-slate-950 border-yellow-300 font-black hover:bg-yellow-300"
                : "bg-amber-500 text-slate-950 border-amber-400 font-black hover:bg-amber-400"
            }`}
          >
            {isEquipped ? "REMOVE" : "EQUIP"}
          </button>
        ) : null}
      </div>

      {footerExtra && <div className="mt-1.5 w-full">{footerExtra}</div>}

      {/* ALL RANKS INSPECTOR MODAL POPUP */}
      {showInspector && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setShowInspector(false)}
        >
          <div
            className="relative w-full max-w-xl md:max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-950 border border-amber-500/50 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black uppercase text-amber-400 tracking-wider">
                    {name}
                  </h3>
                  <span className="text-xs font-black px-2 py-0.5 rounded border uppercase bg-slate-900 border-amber-500 text-amber-200">
                    {special}
                  </span>
                </div>
                <p className="text-[0.72rem] text-slate-400 flex items-center gap-2">
                  <span>🔓 Unlocks at Level {minLevel || fullCard?.minLevel || 1}</span>
                  <span>•</span>
                  <span>Max Rank: {maxRank} Stars</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInspector(false)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 shrink-0 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Mobile Fluid Scaled Card & All Ranks Table */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Large Mobile-Fluid Dynamic 1:1 In-Game Card Preview */}
              <div className="sm:col-span-5 flex justify-center">
                <div className="w-48 sm:w-56 aspect-[3/4.2] rounded-xl overflow-hidden shadow-2xl">
                  <AuthenticPerkCardFace
                    displayName={displayName}
                    special={special}
                    cost={activeInspectedRankData.cost}
                    rank={inspectedRank}
                    maxRank={maxRank}
                    description={activeInspectedRankData.description}
                    artworkUrl={artworkUrl}
                    isLegendary={isLegendary}
                    isGhoul={isGhoul}
                    isFemale={isFemale}
                    cardId={cardId}
                    name={name}
                  />
                </div>
              </div>

              {/* All Ranks Breakdown List */}
              <div className="sm:col-span-7 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  All Rank Stat Levels ({maxRank} Total Ranks):
                </h4>
                <div className="space-y-2 max-h-56 sm:max-h-72 overflow-y-auto pr-1">
                  {(fullCard?.ranks ||
                    Array.from({ length: maxRank }, (_, i) => ({ rank: i + 1, cost: i + 1, description }))
                  ).map((r) => {
                    const isSelected = r.rank === inspectedRank;
                    return (
                      <div
                        key={r.rank}
                        onClick={() => setInspectedRank(r.rank)}
                        className={`p-2.5 rounded-lg border text-xs leading-relaxed transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-950/60 border-amber-500/80 text-amber-200 ring-1 ring-amber-400/30 shadow-md"
                            : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold mb-1">
                          <span className="text-amber-400 flex items-center gap-1 text-xs">
                            RANK {r.rank}
                            <span className="flex">
                              {Array.from({ length: r.rank }, (_, k) => (
                                <Star key={k} className="h-3 w-3 text-amber-400 fill-amber-400" />
                              ))}
                            </span>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[0.65rem] text-slate-400 font-mono">
                            Cost: {r.cost} SPECIAL Pt{r.cost > 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-[0.74rem] text-slate-200 leading-snug">{r.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <a
                href={`/wiki?q=${encodeURIComponent(name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <span>📖 Open Truth Wiki Codex</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <div className="flex items-center gap-2">
                {onRankChange && inspectedRank !== rank && (
                  <button
                    type="button"
                    onClick={() => {
                      onRankChange(inspectedRank);
                      setShowInspector(false);
                    }}
                    className="px-3 py-2 rounded-lg font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 border border-amber-400 shadow-sm cursor-pointer"
                  >
                    Apply Rank {inspectedRank}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (isEquipped) {
                      onUnequip?.();
                    } else {
                      onEquip?.();
                    }
                    setShowInspector(false);
                  }}
                  className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border cursor-pointer ${
                    isEquipped
                      ? "bg-red-950/80 border-red-500/80 text-red-300 hover:bg-red-900"
                      : "bg-emerald-950/80 border-emerald-500/80 text-emerald-300 hover:bg-emerald-900"
                  }`}
                >
                  {isEquipped ? "❌ Unequip Card" : "➕ Equip Card"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowInspector(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

