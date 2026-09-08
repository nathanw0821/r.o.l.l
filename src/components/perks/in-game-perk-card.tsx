"use client";

import * as React from "react";
import { SpecialCategory, PERK_CATALOG, isGhoulPerkCard, getPerkCardById, OutdatedPerkMeta, ReworkedPerkMeta } from "@/lib/perks/catalog";
import PipBoyCardArt from "@/components/perks/pipboy-card-art";
import { getPerkCardArtworkUrl, getGenderedPerkName } from "@/lib/perks/perk-artwork";
import {
  OFFICIAL_SPECIAL_COLORS,
  OFFICIAL_SPECIAL_NAMES,
  OFFICIAL_SPECIAL_PLAQUES,
  CLEAN_TEXTURES,
  getCleanPerkForeground,
  getLegendaryRankStarSprite,
  getGhoulPerkCardImage,
  getInGamePerkCardImage,
} from "@/lib/perks/clean-perk-assets";
import { Sparkles, Star, Info, X, ExternalLink, AlertTriangle } from "lucide-react";

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
  isOutdated?: boolean;
  outdatedMeta?: OutdatedPerkMeta;
  reworkedFrom?: ReworkedPerkMeta;
  priority?: boolean;
  onEquip?: () => void;
  onUnequip?: () => void;
  onRankChange?: (newRank: number) => void;
  footerExtra?: React.ReactNode;
  isAccordion?: boolean;
  isForefront?: boolean;
  onSelect?: () => void;
}

// In-Game FO76 Official S.P.E.C.I.A.L. Theme Colors (Fallout 76 Exact Palette)
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
    cardBg: "bg-gradient-to-b from-[#1b2820] via-[#121c16] to-[#080d0a]",
    border: "border-[#749B85] hover:border-[#96b8a4] ring-1 ring-[#749B85]/30",
    bgHeader: "bg-[#749B85]/90 text-white border-[#749B85]",
    textHeader: "text-emerald-100",
    badgeBg: "bg-[#182a20] border-[#749B85] text-emerald-100",
    stampBg: "bg-[#749B85] border-[#96b8a4] text-slate-950 font-black",
    artWindowBg: "from-[#749B85]/25 via-[#121c16] to-[#080d0a]",
    glowColor: "#749B85",
  },
  P: {
    cardBg: "bg-gradient-to-b from-[#252217] via-[#19170e] to-[#0d0c07]",
    border: "border-[#877B56] hover:border-[#a89b72] ring-1 ring-[#877B56]/30",
    bgHeader: "bg-[#877B56]/90 text-white border-[#877B56]",
    textHeader: "text-amber-100",
    badgeBg: "bg-[#252217] border-[#877B56] text-amber-100",
    stampBg: "bg-[#877B56] border-[#a89b72] text-slate-950 font-black",
    artWindowBg: "from-[#877B56]/25 via-[#19170e] to-[#0d0c07]",
    glowColor: "#877B56",
  },
  E: {
    cardBg: "bg-gradient-to-b from-[#13262d] via-[#0c191e] to-[#050c0f]",
    border: "border-[#4A8FA1] hover:border-[#6cb1c4] ring-1 ring-[#4A8FA1]/30",
    bgHeader: "bg-[#4A8FA1]/90 text-white border-[#4A8FA1]",
    textHeader: "text-cyan-100",
    badgeBg: "bg-[#10242b] border-[#4A8FA1] text-cyan-100",
    stampBg: "bg-[#4A8FA1] border-[#6cb1c4] text-slate-950 font-black",
    artWindowBg: "from-[#4A8FA1]/25 via-[#0c191e] to-[#050c0f]",
    glowColor: "#4A8FA1",
  },
  C: {
    cardBg: "bg-gradient-to-b from-[#332313] via-[#21160a] to-[#0f0903]",
    border: "border-[#C89053] hover:border-[#dfaa70] ring-1 ring-[#C89053]/30",
    bgHeader: "bg-[#C89053]/90 text-white border-[#C89053]",
    textHeader: "text-amber-100",
    badgeBg: "bg-[#332313] border-[#C89053] text-amber-100",
    stampBg: "bg-[#C89053] border-[#dfaa70] text-slate-950 font-black",
    artWindowBg: "from-[#C89053]/25 via-[#21160a] to-[#0f0903]",
    glowColor: "#C89053",
  },
  I: {
    cardBg: "bg-gradient-to-b from-[#1d231a] via-[#131811] to-[#080b07]",
    border: "border-[#7E8B75] hover:border-[#a0ad97] ring-1 ring-[#7E8B75]/30",
    bgHeader: "bg-[#7E8B75]/90 text-white border-[#7E8B75]",
    textHeader: "text-slate-100",
    badgeBg: "bg-[#1d231a] border-[#7E8B75] text-slate-100",
    stampBg: "bg-[#7E8B75] border-[#a0ad97] text-slate-950 font-black",
    artWindowBg: "from-[#7E8B75]/25 via-[#131811] to-[#080b07]",
    glowColor: "#7E8B75",
  },
  A: {
    cardBg: "bg-gradient-to-b from-[#33211d] via-[#211411] to-[#100907]",
    border: "border-[#C88F7F] hover:border-[#e2aba0] ring-1 ring-[#C88F7F]/30",
    bgHeader: "bg-[#C88F7F]/90 text-white border-[#C88F7F]",
    textHeader: "text-rose-100",
    badgeBg: "bg-[#33211d] border-[#C88F7F] text-rose-100",
    stampBg: "bg-[#C88F7F] border-[#e2aba0] text-slate-950 font-black",
    artWindowBg: "from-[#C88F7F]/25 via-[#211411] to-[#100907]",
    glowColor: "#C88F7F",
  },
  L: {
    cardBg: "bg-gradient-to-b from-[#24212c] via-[#16141d] to-[#0a080e]",
    border: "border-[#928BA8] hover:border-[#b4aecd] ring-1 ring-[#928BA8]/30",
    bgHeader: "bg-[#928BA8]/90 text-white border-[#928BA8]",
    textHeader: "text-purple-100",
    badgeBg: "bg-[#24212c] border-[#928BA8] text-purple-100",
    stampBg: "bg-[#928BA8] border-[#b4aecd] text-slate-950 font-black",
    artWindowBg: "from-[#928BA8]/25 via-[#16141d] to-[#0a080e]",
    glowColor: "#928BA8",
  },
  LEGENDARY: {
    cardBg: "bg-gradient-to-b from-[#141b24] via-[#0d1218] to-[#05070a]",
    border: "border-amber-400/90 hover:border-amber-200 ring-2 ring-amber-400/50 shadow-amber-500/20",
    bgHeader: "bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 text-yellow-100 border-amber-400/90",
    textHeader: "text-yellow-100 font-black",
    badgeBg: "bg-amber-950 border-amber-400 text-yellow-100 font-black",
    stampBg: "bg-amber-900 border-amber-400 text-yellow-100 font-black",
    artWindowBg: "from-amber-400/30 via-[#0d1218] to-[#05070a]",
    glowColor: "#f59e0b",
  },
};

/**
 * ScaleformSpecialVisual: Authentic Bethesda 1:1 In-Game Standard Perk Card
 */
export function ScaleformSpecialVisual({
  displayName,
  special,
  cost,
  rank,
  maxRank,
  description,
  cleanForeground,
}: {
  displayName: string;
  special: SpecialCategory;
  cost: number;
  rank: number;
  maxRank: number;
  description: string;
  cleanForeground: string;
}) {
  const specialKey = (special === "LEGENDARY" ? "S" : special) as Exclude<SpecialCategory, "LEGENDARY">;
  const plaqueSrc = OFFICIAL_SPECIAL_PLAQUES[specialKey] || OFFICIAL_SPECIAL_PLAQUES.S;
  const headerColor = OFFICIAL_SPECIAL_COLORS[special] || "#749B85";
  const specialName = OFFICIAL_SPECIAL_NAMES[special] || special;

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-xl bg-[#efe8d8]">
      {/* Layer 1: Bethesda Authentic Card Grunge Texture Overlay */}
      <img
        src={CLEAN_TEXTURES.cardGrunge}
        alt=""
        className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-80 pointer-events-none z-[1]"
      />

      {/* Layer 2: Golden Die-Cut Border Frame */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none z-[30]"
        style={{
          border: "4px solid #caa85b",
          boxShadow: "inset 0 0 0 2px #735926, 0 0 0 1px #261f12",
        }}
      >
        <div
          className="absolute inset-[3px] rounded-[7px] pointer-events-none"
          style={{ border: "1px solid rgba(138, 107, 43, 0.45)" }}
        />
      </div>

      {/* Layer 3: Top Header Bar (Category & Perk Title) */}
      <div
        className="absolute top-[2%] inset-x-[3.2%] h-[10%] rounded-[5px] pl-[15%] pr-2 flex flex-col items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.35)] border border-black/30 z-[20] pointer-events-none"
        style={{ backgroundColor: headerColor }}
      >
        <span
          className="text-[0.55rem] sm:text-[0.64rem] font-medium tracking-[0.16em] text-white/90 uppercase leading-none"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {specialName}
        </span>
        <span
          className="text-[0.76rem] sm:text-[0.90rem] font-bold tracking-wide text-white uppercase truncate max-w-full leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-0.5"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {displayName}
        </span>
      </div>

      {/* Layer 4: Top-Left Point Cost Badge */}
      <div className="absolute top-[1.2%] left-[2%] w-[13.5%] h-[10.2%] bg-[#dfd5be] border-[2px] border-[#b8984d] rounded-tl-lg rounded-br-md shadow-[2px_2px_5px_rgba(0,0,0,0.45),inset_0_0_0_1px_#59451d] flex flex-col items-center justify-center z-[35] pointer-events-none">
        <span
          className="text-base sm:text-xl font-bold text-slate-850 leading-none drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {cost}
        </span>
      </div>

      {/* Layer 5: Character Illustration Art Window (Tight-cropped, Comic Scale) */}
      <div
        className="absolute top-[13.5%] inset-x-[3.5%] bottom-[29%] flex items-center justify-center z-[10] pointer-events-none rounded-md"
        style={{
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.55) 0%, rgba(220,205,175,0.2) 65%, transparent 100%)",
        }}
      >
        <img
          src={cleanForeground}
          alt={displayName}
          className="max-w-[94%] max-h-[96%] object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]"
        />
      </div>

      {/* Layer 6: Description Plaque Area with Authentic Bethesda Seal */}
      <div className="absolute bottom-[2.2%] inset-x-[3.2%] h-[27.5%] z-[25] pointer-events-none">
        {/* Authentic Bethesda Plaque Graphic with Engraved SPECIAL Seal */}
        <img
          src={plaqueSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-fill drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] pointer-events-none"
        />

        {/* Description Text */}
        <div className="absolute top-[8%] left-[6%] right-[6%] h-[48%] flex items-center">
          <p
            className="text-[0.62rem] sm:text-[0.74rem] font-bold text-slate-900 leading-snug line-clamp-3 drop-shadow-[0_1px_0_rgba(255,255,255,0.6)]"
            style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
          >
            {description}
          </p>
        </div>

        {/* Rank Stars Rack Ribbon */}
        <div className="absolute bottom-[10%] right-[5%] h-[24%] px-1.5 sm:px-2 bg-[#6a7c6f] border border-[#3c4940] rounded flex items-center gap-0.5 sm:gap-1 shadow-sm">
          {Array.from({ length: maxRank }, (_, i) => {
            const isFilled = i + 1 <= rank;
            return (
              <Star
                key={i}
                className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                  isFilled
                    ? "text-yellow-200 fill-yellow-200 drop-shadow-[0_0_3px_rgba(254,240,138,0.9)]"
                    : "text-black/35 fill-none"
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * ScaleformLegendaryVisual: Authentic Bethesda 1:1 In-Game Legendary Perk Card
 */
export function ScaleformLegendaryVisual({
  displayName,
  rank,
  maxRank,
  description,
  cleanForeground,
}: {
  displayName: string;
  rank: number;
  maxRank: number;
  description: string;
  cleanForeground: string;
}) {
  return (
    <div className="relative w-full h-full select-none rounded-lg bg-transparent">
      {/* 1. Official Bethesda Legendary Plaque Frame (Cleaned, No Padlock, No Bleed) */}
      <img
        src={CLEAN_TEXTURES.legendaryFrame}
        alt="Legendary Card Frame"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none z-[5] drop-shadow-[0_18px_30px_rgba(0,0,0,0.9)]"
      />

      {/* 2. Header Banner: - LEGENDARY - & Perk Title */}
      <div className="absolute top-[6%] inset-x-[8%] h-[12%] flex flex-col items-center justify-center text-center z-[25] leading-tight pointer-events-none">
        <span
          className="text-[0.6rem] sm:text-[0.68rem] font-bold tracking-[0.22em] text-amber-300 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          - LEGENDARY -
        </span>
        <span
          className="text-[0.8rem] sm:text-[0.95rem] font-bold tracking-wide text-white uppercase truncate max-w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]"
          style={{ fontFamily: "'Oswald', sans-serif" }}
        >
          {displayName}
        </span>
      </div>

      {/* 3. Character Illustration Art Window (Tight-cropped, Centered) */}
      <div className="absolute top-[18%] inset-x-[4%] h-[53%] flex items-center justify-center z-[20] pointer-events-none">
        <img
          src={cleanForeground}
          alt={displayName}
          className="max-w-[95%] max-h-[98%] object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
        />
      </div>

      {/* 4. Bethesda 4-Star Rank Sprite Pill (Clean, centered, zero bleed) */}
      <div className="absolute bottom-[19%] left-1/2 -translate-x-1/2 w-[44%] h-[7%] flex items-center justify-center z-[25] pointer-events-none">
        <img
          src={getLegendaryRankStarSprite(rank)}
          alt={`Rank ${rank} of ${maxRank}`}
          className="w-full h-full object-contain drop-shadow"
        />
      </div>

      {/* 5. Description Text Box */}
      <div className="absolute bottom-[4.5%] inset-x-[7%] h-[13.5%] flex items-center justify-center text-center z-[25] pointer-events-none px-1">
        <p
          className="text-[0.62rem] sm:text-[0.74rem] font-bold text-white leading-tight line-clamp-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
          style={{ fontFamily: "'Roboto Condensed', sans-serif" }}
        >
          {description}
        </p>
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
  isOutdated,
  outdatedMeta,
  reworkedFrom,
  priority = false,
  onEquip,
  onUnequip,
  onRankChange,
  footerExtra,
  isAccordion = false,
  isForefront = false,
  onSelect,
}: InGamePerkCardProps) {
  const theme = INGAME_SPECIAL_THEMES[special] || INGAME_SPECIAL_THEMES.S;
  const [imgError, setImgError] = React.useState(false);
  const [showInspector, setShowInspector] = React.useState(false);
  const [inspectRank, setInspectRank] = React.useState(rank);

  const artworkUrl = getPerkCardArtworkUrl(cardId || name, special, isFemale);
  const displayName = getGenderedPerkName(name, isFemale);
  const isLegendary = special === "LEGENDARY" || cardId?.includes("legendary");
  const isGhoul = isGhoulPerkCard(cardId || name);

  // Full Catalog Card for All Ranks Inspection & Outdated Metadata Resolution
  const fullCard = React.useMemo(() => {
    return getPerkCardById(cardId || "") || PERK_CATALOG.find((c) => c.id === cardId || c.name.toLowerCase() === name.toLowerCase());
  }, [cardId, name]);

  const effectiveIsOutdated = isOutdated ?? fullCard?.isOutdated ?? false;
  const effectiveOutdatedMeta = outdatedMeta ?? fullCard?.outdatedMeta;
  const effectiveReworkedFrom = reworkedFrom ?? fullCard?.reworkedFrom;

  // Check if official isolated vector foreground is available
  const cleanForeground = getCleanPerkForeground(cardId || name);
  const ghoulPerkImage = isGhoul ? getGhoulPerkCardImage(cardId || name, rank) : null;
  const inGameCardImage = getInGamePerkCardImage(cardId || name, rank, isFemale);

  const longPressTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setImgError(false);
  }, [artworkUrl, ghoulPerkImage, inGameCardImage]);

  // Keep inspectRank in sync when rank prop changes
  React.useEffect(() => {
    setInspectRank(rank);
  }, [rank]);

  // Inspect rank description & cost resolution
  const inspectRankData = React.useMemo(() => {
    if (fullCard?.ranks) {
      const match = fullCard.ranks.find((r) => r.rank === inspectRank);
      if (match) return match;
    }
    return { rank: inspectRank, cost, description };
  }, [fullCard, inspectRank, cost, description]);

  const inGameInspectImage = getInGamePerkCardImage(cardId || name, inspectRankData.rank, isFemale);

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
        isOverflow && !isAccordion ? "ring-4 ring-red-500 rounded-xl" : ""
      }`}
    >
      {/* Style Bible Container: Aspect Ratio Uniform Framing */}
      <div
        className={`relative w-full aspect-[310/490] transition-all duration-200 cursor-pointer flex flex-col justify-between ${
          isAccordion
            ? "border-0 ring-0 shadow-none bg-transparent overflow-visible"
            : isEquipped
            ? "rounded-xl ring-2 ring-amber-400 shadow-amber-500/40 overflow-hidden group-hover:scale-[1.03]"
            : isGhoul
            ? "rounded-xl ring-1 ring-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.85),0_0_12px_rgba(16,185,129,0.4)] overflow-hidden group-hover:scale-[1.03]"
            : isLegendary && cleanForeground
            ? "shadow-none bg-transparent overflow-visible group-hover:scale-[1.03]"
            : "rounded-xl shadow-xl overflow-hidden opacity-95 group-hover:opacity-100 group-hover:scale-[1.03]"
        }`}
        onClick={(e) => {
          if (isAccordion && !isForefront) {
            e.stopPropagation();
            onSelect?.();
          } else if (isEquipped) {
            onUnequip?.();
          } else {
            onEquip?.();
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchEnd}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowInspector(true);
        }}
        title={isAccordion && !isForefront ? "Click to bring to forefront" : "Click to equip • Right-click for perk details & Truth Wiki"}
      >
        {/* 1. Literal 1:1 In-Game Bitmap Cards (Pip-Boy Slanted & Curved for Regular, Ghoul, and Legendary) */}
        {inGameCardImage && !imgError ? (
          <img
            src={inGameCardImage}
            alt={displayName}
            className={`w-full h-full object-contain bg-transparent block select-none transform-none transition-all duration-200 ${
              isAccordion
                ? isForefront
                  ? "drop-shadow-[0_0_14px_rgba(251,191,36,0.85)] drop-shadow-[0_12px_24px_rgba(0,0,0,0.95)]"
                  : "drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]"
                : "rounded-xl drop-shadow-xl"
            }`}
            loading={priority ? "eager" : "lazy"}
            decoding={priority ? "sync" : "async"}
            fetchPriority={priority ? "high" : "auto"}
            draggable={false}
            onError={() => setImgError(true)}
          />
        ) : isLegendary && cleanForeground ? (
          /* 2. Scaleform Legendary Vector Recreation Fallback */
          <ScaleformLegendaryVisual
            displayName={displayName}
            rank={rank}
            maxRank={maxRank}
            description={description}
            cleanForeground={cleanForeground}
          />
        ) : cleanForeground ? (
          /* 3. Scaleform Vector Fallback */
          <ScaleformSpecialVisual
            displayName={displayName}
            special={special}
            cost={cost}
            rank={rank}
            maxRank={maxRank}
            description={description}
            cleanForeground={cleanForeground}
          />
        ) : !imgError ? (
          /* 4. Default Catalog Artwork Fallback */
          <img
            src={ghoulPerkImage || artworkUrl}
            alt={displayName}
            className={`w-full h-full ${isGhoul ? "object-contain bg-[#0a100d]" : "object-cover object-center"} rounded-xl block drop-shadow-xl transform-none`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`w-full h-full p-3 rounded-xl border-2 ${
              isGhoul ? "border-emerald-500 bg-[#081210]" : `${theme.border} ${theme.cardBg}`
            } flex flex-col justify-between`}
          >
            {/* Header Stamp Bar */}
            <div className="flex items-center justify-between gap-1.5 border-b border-slate-700/80 pb-1.5">
              <span
                className={`h-6 w-6 rounded flex items-center justify-center font-bold text-xs border ${theme.badgeBg}`}
              >
                {cost}
              </span>
              <span className="text-[0.68rem] font-black uppercase tracking-wider text-slate-100 truncate">
                {displayName}
              </span>
              <span className={`text-[0.58rem] font-black px-1.5 py-0.5 rounded border uppercase ${theme.stampBg}`}>
                {special}
              </span>
            </div>

            {/* Central Vault Boy Graphic */}
            <div className="my-2 flex-1 flex items-center justify-center min-h-0 overflow-hidden">
              <PipBoyCardArt special={special} name={name} isFemale={isFemale} className="w-full h-full max-h-[140px]" />
            </div>

            {/* Description Text Box */}
            <p className="text-[0.62rem] font-mono text-slate-200 leading-tight bg-slate-950/90 p-2 rounded border border-slate-800 shrink-0 line-clamp-3">
              {description}
            </p>
          </div>
        )}

        {/* Outdated Warning Badge Banner */}
        {effectiveIsOutdated && (!isAccordion || isForefront) && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 text-white font-black text-[0.58rem] px-2 py-0.5 rounded shadow-lg border border-amber-300 tracking-wider flex items-center gap-1 z-40 animate-pulse">
            <AlertTriangle className="h-3 w-3" /> OUTDATED
          </div>
        )}

        {/* Legendary Badge Crest Banner (only for fallback images that lack built-in title) */}
        {isLegendary && (!inGameCardImage || imgError) && !cleanForeground && (!isAccordion || isForefront) && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[0.58rem] px-2 py-0.5 rounded-md shadow-lg border border-yellow-300 tracking-wider flex items-center gap-1 z-40">
            <Sparkles className="h-3 w-3 fill-slate-950" /> LEGENDARY
          </div>
        )}

        {/* Ghoul Specific Badge Banner */}
        {isGhoul && !isLegendary && (!inGameCardImage || imgError) && (!isAccordion || isForefront) && (
          <div className="absolute top-2 right-2 bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-mono font-black text-[0.58rem] px-2 py-0.5 rounded shadow-[0_0_10px_rgba(16,185,129,0.6)] tracking-wider z-40 flex items-center gap-1">
            <span className="text-emerald-400">☢</span> GHOUL
          </div>
        )}

        {/* Rank Inspector Trigger Badge Button */}
        {(!isAccordion || isForefront) && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowInspector(true);
            }}
            className="absolute bottom-2 left-2 bg-slate-950/80 hover:bg-slate-900 border border-slate-700 text-amber-400 hover:text-white p-1 rounded shadow-md opacity-80 group-hover:opacity-100 transition-all z-40"
            title="Inspect All Ranks & Stats"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Equipped Badge Ribbon */}
        {isEquipped && !isAccordion && (
          <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-black text-[0.62rem] px-2 py-0.5 rounded-full shadow-lg border border-amber-300 tracking-wider z-40">
            ✓ EQUIPPED
          </div>
        )}
      </div>

      {/* Clean Rank Level Up / Down Interactive Control Bar */}
      <div
        className={`w-full mt-2 rounded-lg p-1.5 items-center justify-between gap-1 shadow-md border transition-all duration-150 ${
          isAccordion && !isForefront ? "hidden" : "flex"
        } ${
          isLegendary
            ? "bg-gradient-to-r from-[#141b24] via-[#1d2734] to-[#141b24] border-yellow-500/70"
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
          <span
            className={`text-[0.68rem] font-bold block leading-none ${isLegendary ? "text-yellow-200" : "text-slate-300"}`}
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
              if (isEquipped) {
                onUnequip?.();
              } else {
                onEquip?.();
              }
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
                    {displayName}
                  </h3>
                  <span className={`text-xs font-black px-2 py-0.5 rounded border uppercase ${theme.stampBg}`}>
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
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Outdated Advisory Banner */}
            {effectiveIsOutdated && effectiveOutdatedMeta && (
              <div className="rounded-xl border-2 border-amber-500/70 bg-amber-950/60 p-4 space-y-2.5 text-amber-200 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5 tracking-wide">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                    OUTDATED GAME KNOWLEDGE ({effectiveOutdatedMeta.patchVersion})
                  </span>
                  <span className="text-[0.65rem] px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold uppercase">
                    Reworked in Live FO76
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 leading-relaxed font-mono">
                  {effectiveOutdatedMeta.reason}
                </p>
                {effectiveOutdatedMeta.legacyEffect && (
                  <p className="text-[0.72rem] text-amber-300/80 italic font-mono bg-amber-950/80 p-2 rounded border border-amber-800/40">
                    Legacy Effect: &quot;{effectiveOutdatedMeta.legacyEffect}&quot;
                  </p>
                )}
                <div className="pt-1 flex items-center gap-2 flex-wrap">
                  <a
                    href={effectiveOutdatedMeta.href || effectiveOutdatedMeta.replacedBy.href || `/perks?q=${effectiveOutdatedMeta.replacedBy.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-black uppercase transition-all shadow-md active:scale-95"
                  >
                    Equip / View Modern Perk: {effectiveOutdatedMeta.replacedBy.name} ➔
                  </a>
                </div>
              </div>
            )}

            {/* Modern Rework Info Callout */}
            {effectiveReworkedFrom && !effectiveIsOutdated && (
              <div className="rounded-xl border border-sky-500/40 bg-sky-950/40 p-3 space-y-1 text-slate-200">
                <div className="text-[0.72rem] font-bold uppercase text-sky-400 flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                  PATCH 69 LIVE GROUND TRUTH: Formerly &quot;{effectiveReworkedFrom.formerName}&quot;
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {effectiveReworkedFrom.summary} <span className="text-sky-300">({effectiveReworkedFrom.patchVersion})</span>
                </p>
              </div>
            )}

            {/* Modal Body: Mobile Fluid Scaled Card Preview & All Ranks Table */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
              {/* Large Mobile-Fluid Crystal-Clear Card Preview */}
              <div className="sm:col-span-5 flex justify-center">
                <div
                  className={`w-52 sm:w-60 aspect-[310/490] rounded-xl transition-all ${
                    isGhoul
                      ? "ring-2 ring-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.85),0_0_60px_rgba(74,222,128,0.5)] overflow-hidden"
                      : isLegendary && cleanForeground
                      ? "shadow-none bg-transparent overflow-visible"
                      : "overflow-hidden shadow-2xl border-2 border-amber-400/70 ring-2 ring-amber-500/30"
                  }`}
                >
                  {inGameInspectImage ? (
                    <img
                      src={inGameInspectImage}
                      alt={displayName}
                      className="w-full h-full object-contain rounded-xl block drop-shadow-xl select-none"
                      loading="eager"
                      decoding="async"
                      draggable={false}
                    />
                  ) : cleanForeground ? (
                    isLegendary ? (
                      <ScaleformLegendaryVisual
                        displayName={displayName}
                        rank={inspectRankData.rank}
                        maxRank={maxRank}
                        description={inspectRankData.description}
                        cleanForeground={cleanForeground}
                      />
                    ) : (
                      <ScaleformSpecialVisual
                        displayName={displayName}
                        special={special}
                        cost={inspectRankData.cost}
                        rank={inspectRankData.rank}
                        maxRank={maxRank}
                        description={inspectRankData.description}
                        cleanForeground={cleanForeground}
                      />
                    )
                  ) : (
                    <img
                      src={artworkUrl}
                      alt={name}
                      className="w-full h-full object-cover object-center rounded-xl"
                    />
                  )}
                </div>
              </div>

              {/* All Ranks Breakdown List */}
              <div className="sm:col-span-7 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
                  All Rank Stat Levels ({maxRank} Total Ranks) - Click to Preview:
                </h4>
                <div className="space-y-2 max-h-56 sm:max-h-72 overflow-y-auto pr-1">
                  {(
                    fullCard?.ranks ||
                    Array.from({ length: maxRank }, (_, i) => ({
                      rank: i + 1,
                      cost: i + 1,
                      description,
                    }))
                  ).map((r) => {
                    const isSelected = r.rank === inspectRank;
                    return (
                      <div
                        key={r.rank}
                        onClick={() => setInspectRank(r.rank)}
                        className={`p-2.5 rounded-lg border text-xs leading-relaxed transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-950/60 border-amber-500/80 text-amber-200 ring-1 ring-amber-400/30 shadow-md"
                            : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/90"
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
                {isEquipped && inspectRank !== rank && onRankChange && (
                  <button
                    type="button"
                    onClick={() => {
                      onRankChange(inspectRank);
                    }}
                    className="px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all border bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 font-mono shadow-sm"
                  >
                    ⭐ Apply Rank {inspectRank}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (isEquipped) {
                      onUnequip?.();
                    } else {
                      if (inspectRank !== rank && onRankChange) {
                        onRankChange(inspectRank);
                      }
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
                  {isEquipped ? "❌ Unequip Card" : `➕ Equip Card (Rank ${inspectRank})`}
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
