"use client";

import * as React from "react";
import { SpecialCategory, PERK_CATALOG, PerkCard } from "@/lib/perks/catalog";
import PipBoyCardArt from "@/components/perks/pipboy-card-art";
import { getPerkCardArtworkUrl } from "@/lib/perks/perk-artwork";
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

// In-Game FO76 Authentic S.P.E.C.I.A.L. Theme Colors
const INGAME_SPECIAL_THEMES: Record<
  SpecialCategory,
  {
    cardBg: string;
    border: string;
    bgHeader: string;
    textHeader: string;
    badgeBg: string;
    stampBg: string;
    artWindowBg: string;
    glowColor: string;
  }
> = {
  S: {
    cardBg: "bg-gradient-to-b from-[#2a1708] via-[#1a0f05] to-[#0c0602]",
    border: "border-amber-600/90 hover:border-amber-400 ring-1 ring-amber-500/30",
    bgHeader: "bg-amber-900/90 text-amber-100 border-amber-600/80",
    textHeader: "text-amber-200",
    badgeBg: "bg-amber-950 border-amber-500 text-amber-100",
    stampBg: "bg-amber-900 border-amber-500 text-amber-100",
    artWindowBg: "from-amber-500/25 via-[#1a0f05] to-[#0a0502]",
    glowColor: "#f59e0b",
  },
  P: {
    cardBg: "bg-gradient-to-b from-[#062436] via-[#041724] to-[#020b12]",
    border: "border-cyan-600/90 hover:border-cyan-400 ring-1 ring-cyan-500/30",
    bgHeader: "bg-cyan-900/90 text-cyan-100 border-cyan-600/80",
    textHeader: "text-cyan-200",
    badgeBg: "bg-cyan-950 border-cyan-500 text-cyan-100",
    stampBg: "bg-cyan-900 border-cyan-500 text-cyan-100",
    artWindowBg: "from-cyan-500/25 via-[#041724] to-[#020b12]",
    glowColor: "#06b6d4",
  },
  E: {
    cardBg: "bg-gradient-to-b from-[#063326] via-[#042018] to-[#02100c]",
    border: "border-emerald-600/90 hover:border-emerald-400 ring-1 ring-emerald-500/30",
    bgHeader: "bg-emerald-900/90 text-emerald-100 border-emerald-600/80",
    textHeader: "text-emerald-200",
    badgeBg: "bg-emerald-950 border-emerald-500 text-emerald-100",
    stampBg: "bg-emerald-900 border-emerald-500 text-emerald-100",
    artWindowBg: "from-emerald-500/25 via-[#042018] to-[#02100c]",
    glowColor: "#10b981",
  },
  C: {
    cardBg: "bg-gradient-to-b from-[#362706] via-[#221804] to-[#100b02]",
    border: "border-yellow-600/90 hover:border-yellow-400 ring-1 ring-yellow-500/30",
    bgHeader: "bg-yellow-900/90 text-yellow-100 border-yellow-600/80",
    textHeader: "text-yellow-200",
    badgeBg: "bg-yellow-950 border-yellow-500 text-yellow-100",
    stampBg: "bg-yellow-900 border-yellow-500 text-yellow-100",
    artWindowBg: "from-yellow-500/25 via-[#221804] to-[#100b02]",
    glowColor: "#eab308",
  },
  I: {
    cardBg: "bg-gradient-to-b from-[#1e293b] via-[#111827] to-[#070a0f]",
    border: "border-slate-500/90 hover:border-slate-300 ring-1 ring-slate-400/30",
    bgHeader: "bg-slate-800/90 text-slate-100 border-slate-500/80",
    textHeader: "text-slate-200",
    badgeBg: "bg-slate-900 border-slate-400 text-slate-100",
    stampBg: "bg-slate-800 border-slate-400 text-slate-100",
    artWindowBg: "from-slate-400/25 via-[#111827] to-[#070a0f]",
    glowColor: "#94a3b8",
  },
  A: {
    cardBg: "bg-gradient-to-b from-[#3b0717] via-[#24040e] to-[#120207]",
    border: "border-rose-600/90 hover:border-rose-400 ring-1 ring-rose-500/30",
    bgHeader: "bg-rose-900/90 text-rose-100 border-rose-600/80",
    textHeader: "text-rose-200",
    badgeBg: "bg-rose-950 border-rose-500 text-rose-100",
    stampBg: "bg-rose-900 border-rose-500 text-rose-100",
    artWindowBg: "from-rose-500/25 via-[#24040e] to-[#120207]",
    glowColor: "#f43f5e",
  },
  L: {
    cardBg: "bg-gradient-to-b from-[#381d06] via-[#221104] to-[#100802]",
    border: "border-amber-500/90 hover:border-amber-300 ring-1 ring-amber-400/30",
    bgHeader: "bg-amber-900/90 text-amber-100 border-amber-500/80",
    textHeader: "text-amber-200",
    badgeBg: "bg-amber-950 border-amber-400 text-amber-100",
    stampBg: "bg-amber-900 border-amber-400 text-amber-100",
    artWindowBg: "from-amber-400/25 via-[#221104] to-[#100802]",
    glowColor: "#fbbf24",
  },
  LEGENDARY: {
    cardBg: "bg-gradient-to-b from-[#3f2005] via-[#261303] to-[#120901]",
    border: "border-yellow-400 hover:border-yellow-200 ring-2 ring-yellow-400/50 shadow-yellow-500/20",
    bgHeader: "bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 text-yellow-100 border-yellow-400/90",
    textHeader: "text-yellow-100 font-black",
    badgeBg: "bg-yellow-950 border-yellow-400 text-yellow-100 font-black",
    stampBg: "bg-yellow-900 border-yellow-400 text-yellow-100 font-black",
    artWindowBg: "from-yellow-400/30 via-[#261303] to-[#120901]",
    glowColor: "#f59e0b",
  },
};

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
  const theme = INGAME_SPECIAL_THEMES[special] || INGAME_SPECIAL_THEMES.S;
  const [imgError, setImgError] = React.useState(false);
  const [showInspector, setShowInspector] = React.useState(false);
  const artworkUrl = getPerkCardArtworkUrl(cardId || name, special, isFemale);
  const isLegendary = special === "LEGENDARY" || cardId?.includes("legendary");

  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const hoverTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Full Catalog Card for All Ranks Inspection
  const fullCard = React.useMemo(() => {
    return PERK_CATALOG.find((c) => c.id === cardId || c.name.toLowerCase() === name.toLowerCase());
  }, [cardId, name]);

  const wikiSlug = name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

  const openWikiSource = React.useCallback(() => {
    window.open(`/wiki?q=${encodeURIComponent(name)}`, "_blank", "noopener,noreferrer");
  }, [name]);

  // Mobile-only touch long press
  const handleTouchStart = (e: React.TouchEvent) => {
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
          isEquipped ? "ring-2 ring-amber-400 shadow-amber-500/40" : "opacity-95 group-hover:opacity-100"
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
        {!imgError ? (
          <img
            src={artworkUrl}
            alt={name}
            className="w-full h-full object-cover object-center rounded-xl block drop-shadow-xl transform-none"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className={`w-full h-full p-3 rounded-xl border-2 ${theme.border} ${theme.cardBg} flex flex-col justify-between`}>
            {/* Header Stamp Bar */}
            <div className="flex items-center justify-between gap-1.5 border-b border-slate-700/80 pb-1.5">
              <span className={`h-6 w-6 rounded flex items-center justify-center font-bold text-xs border ${theme.badgeBg}`}>
                {cost}
              </span>
              <span className="text-[0.68rem] font-black uppercase tracking-wider text-slate-100 truncate">
                {name}
              </span>
              <span className={`text-[0.58rem] font-black px-1.5 py-0.5 rounded border uppercase ${theme.stampBg}`}>
                {special}
              </span>
            </div>

            {/* Central Vault Boy Graphic */}
            <div className="my-2 flex-1 flex items-center justify-center min-h-0 overflow-hidden">
              <PipBoyCardArt special={special} name={name} className="w-full h-full max-h-[140px]" />
            </div>

            {/* Description Text Box */}
            <p className="text-[0.62rem] font-mono text-slate-200 leading-tight bg-slate-950/90 p-2 rounded border border-slate-800 shrink-0 line-clamp-3">
              {description}
            </p>
          </div>
        )}

        {/* Legendary Badge Crest Banner */}
        {isLegendary && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[0.58rem] px-2 py-0.5 rounded-md shadow-lg border border-yellow-300 tracking-wider flex items-center gap-1">
            <Sparkles className="h-3 w-3 fill-slate-950" /> LEGENDARY
          </div>
        )}

        {/* Rank Inspector Trigger Badge Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowInspector(true);
          }}
          className="absolute bottom-2 left-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-amber-400 hover:text-white p-1 rounded shadow-md opacity-80 group-hover:opacity-100 transition-all"
          title="Inspect All Ranks & Stats"
        >
          <Info className="h-3.5 w-3.5" />
        </button>

        {/* Equipped Badge Ribbon */}
        {isEquipped && (
          <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-black text-[0.62rem] px-2 py-0.5 rounded-full shadow-lg border border-amber-300 tracking-wider">
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
          className={`h-7 w-7 rounded border font-black text-sm flex items-center justify-center transition-all disabled:opacity-30 ${
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
          <span className={`text-[0.68rem] font-bold block leading-none ${isLegendary ? "text-yellow-200" : "text-slate-300"}`}>
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
          className={`h-7 w-7 rounded border font-black text-sm flex items-center justify-center transition-all disabled:opacity-30 ${
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
              isEquipped ? onUnequip?.() : onEquip?.();
            }}
            className={`text-[0.60rem] font-black uppercase px-2 py-1.5 rounded border transition-all shadow-sm ${
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
                  <span className={`text-xs font-black px-2 py-0.5 rounded border uppercase ${theme.stampBg}`}>
                    {special}
                  </span>
                </div>
                <p className="text-[0.72rem] text-slate-400 flex items-center gap-2">
                  <span>🔓 Unlocks at Level {minLevel || (fullCard?.minLevel || 1)}</span>
                  <span>•</span>
                  <span>Max Rank: {maxRank} Stars</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInspector(false)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: Mobile Fluid Scaled Card & All Ranks Table */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Large Mobile-Fluid Crystal-Clear Card Preview */}
              <div className="sm:col-span-5 flex justify-center">
                <div className="w-48 sm:w-56 aspect-[3/4.2] rounded-xl overflow-hidden shadow-2xl border-2 border-amber-400/70 ring-2 ring-amber-500/30">
                  <img
                    src={artworkUrl}
                    alt={name}
                    className="w-full h-full object-cover object-center rounded-xl"
                  />
                </div>
              </div>

              {/* All Ranks Breakdown List */}
              <div className="sm:col-span-7 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  All Rank Stat Levels ({maxRank} Total Ranks):
                </h4>
                <div className="space-y-2 max-h-56 sm:max-h-72 overflow-y-auto pr-1">
                  {(fullCard?.ranks || Array.from({ length: maxRank }, (_, i) => ({ rank: i + 1, cost: i + 1, description }))).map((r) => {
                    const isSelected = r.rank === rank;
                    return (
                      <div
                        key={r.rank}
                        className={`p-2.5 rounded-lg border text-xs leading-relaxed transition-all ${
                          isSelected
                            ? "bg-amber-950/60 border-amber-500/80 text-amber-200 ring-1 ring-amber-400/30"
                            : "bg-slate-900/80 border-slate-800 text-slate-300"
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
                  className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border ${
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
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs transition-all"
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
