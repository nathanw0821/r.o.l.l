"use client";

import * as React from "react";
import { SpecialCategory } from "@/lib/perks/catalog";
import PipBoyCardArt from "@/components/perks/pipboy-card-art";
import { getPerkCardArtworkUrl, getGenderedPerkName } from "@/lib/perks/perk-artwork";

export interface ProceduralPerkCardProps {
  cardId?: string;
  name: string;
  special: SpecialCategory;
  cost: number;
  rank: number;
  maxRank: number;
  description: string;
  isLegendary?: boolean;
  isGhoul?: boolean;
  isFemale?: boolean;
  className?: string;
}

const PROCEDURAL_THEMES: Record<
  SpecialCategory,
  {
    headerBg: string;
    artBg: string;
    ribbonBg: string;
    stampColor: string;
    costBorder: string;
  }
> = {
  S: {
    headerBg: "bg-[#55816f]", // Sage strength green
    artBg: "bg-[#a6cfbe]",
    ribbonBg: "bg-[#55816f] border-[#3e6656]",
    stampColor: "text-[#3e6656] border-[#3e6656]",
    costBorder: "border-[#3e6656]",
  },
  P: {
    headerBg: "bg-[#2f7387]", // Perception cyan
    artBg: "bg-[#9cc8d7]",
    ribbonBg: "bg-[#2f7387] border-[#1e5868]",
    stampColor: "text-[#1e5868] border-[#1e5868]",
    costBorder: "border-[#1e5868]",
  },
  E: {
    headerBg: "bg-[#437751]", // Endurance forest green
    artBg: "bg-[#a4cfb0]",
    ribbonBg: "bg-[#437751] border-[#2c5838]",
    stampColor: "text-[#2c5838] border-[#2c5838]",
    costBorder: "border-[#2c5838]",
  },
  C: {
    headerBg: "bg-[#8b7536]", // Charisma ochre gold
    artBg: "bg-[#dcce9f]",
    ribbonBg: "bg-[#8b7536] border-[#6b5825]",
    stampColor: "text-[#6b5825] border-[#6b5825]",
    costBorder: "border-[#6b5825]",
  },
  I: {
    headerBg: "bg-[#536577]", // Intelligence steel slate
    artBg: "bg-[#afc1d2]",
    ribbonBg: "bg-[#536577] border-[#394a5a]",
    stampColor: "text-[#394a5a] border-[#394a5a]",
    costBorder: "border-[#394a5a]",
  },
  A: {
    headerBg: "bg-[#8c3947]", // Agility crimson
    artBg: "bg-[#dba3ad]",
    ribbonBg: "bg-[#8c3947] border-[#6a2732]",
    stampColor: "text-[#6a2732] border-[#6a2732]",
    costBorder: "border-[#6a2732]",
  },
  L: {
    headerBg: "bg-[#895125]", // Luck warm amber
    artBg: "bg-[#dcb28d]",
    ribbonBg: "bg-[#895125] border-[#683b17]",
    stampColor: "text-[#683b17] border-[#683b17]",
    costBorder: "border-[#683b17]",
  },
  LEGENDARY: {
    headerBg: "bg-gradient-to-r from-[#6e4612] via-[#9e6b23] to-[#6e4612]",
    artBg: "bg-[#e2c797]",
    ribbonBg: "bg-gradient-to-r from-[#6e4612] to-[#9e6b23] border-[#f59e0b]",
    stampColor: "text-[#784813] border-[#f59e0b]",
    costBorder: "border-[#f59e0b]",
  },
};

export default function ProceduralPerkCard({
  cardId,
  name,
  special,
  cost,
  rank,
  maxRank,
  description,
  isLegendary = false,
  isGhoul = false,
  isFemale = false,
  className = "",
}: ProceduralPerkCardProps) {
  const style = PROCEDURAL_THEMES[special] || PROCEDURAL_THEMES.S;
  const displayName = getGenderedPerkName(name, isFemale);
  const artworkUrl = getPerkCardArtworkUrl(cardId || name, special, isFemale);
  const [imgError, setImgError] = React.useState(false);

  return (
    <div
      className={`relative w-full aspect-[3/4.2] rounded-2xl bg-[#ede5d0] border-[2.5px] ${
        isGhoul
          ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.35)]"
          : isLegendary
          ? "border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]"
          : "border-[#ded0b6] shadow-xl"
      } p-[3px] flex flex-col justify-between select-none overflow-hidden ${className}`}
    >
      {/* Inner Card Container */}
      <div className="w-full h-full bg-[#f6f2e8] border border-[#2b2824] rounded-xl flex flex-col justify-between overflow-hidden relative">
        {/* Top Header Banner */}
        <div
          className={`w-full h-[14%] ${
            isGhoul
              ? "bg-gradient-to-r from-[#1b4e3b] via-[#2d7358] to-[#1b4e3b]"
              : style.headerBg
          } border-b border-[#2b2824] px-1.5 flex items-center justify-between relative shrink-0 z-10`}
        >
          {/* Top-Left Point Cost Badge Tab */}
          <div
            className={`h-7 w-7 sm:h-8 sm:w-8 bg-[#f6f2e8] rounded-md border-2 ${
              isGhoul ? "border-emerald-700 text-emerald-950" : `${style.costBorder} text-[#1c1b18]`
            } flex items-center justify-center font-black text-sm sm:text-base shadow-sm shrink-0 font-serif -ml-0.5`}
            title={`Equip Cost: ${cost} SPECIAL Point${cost > 1 ? "s" : ""}`}
          >
            {cost}
          </div>

          {/* Card Title Header */}
          <span className="font-black text-[0.72rem] sm:text-xs md:text-sm tracking-wider uppercase text-white truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] px-1 font-mono flex-1 text-center">
            {displayName}
          </span>
        </div>

        {/* Central Artwork Canvas */}
        <div
          className={`relative flex-1 w-full ${
            isGhoul ? "bg-[#8dc5ae]" : style.artBg
          } flex items-center justify-center overflow-hidden min-h-0`}
        >
          {/* Authentic Diamond Sunburst Watermark Pattern */}
          <svg
            className="absolute inset-0 w-full h-full opacity-25 pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polygon points="50,0 100,50 50,100 0,50" fill="white" />
            <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="white" strokeWidth="4" opacity="0.7" />
            <polygon points="50,22 78,50 50,78 22,50" fill="none" stroke="white" strokeWidth="3" opacity="0.5" />
          </svg>

          {/* Center Vault Boy / Vault Girl Artwork */}
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
        <div className="w-full bg-[#ede5d0] border-t border-[#2b2824] p-2 sm:p-2.5 flex flex-col justify-between relative shrink-0 min-h-[26%] max-h-[35%] z-10">
          {/* Rules Description Text */}
          <p className="text-[0.62rem] sm:text-[0.72rem] md:text-[0.78rem] leading-tight font-serif text-[#1e1c18] font-semibold tracking-tight line-clamp-4 pr-9 pb-3">
            {description}
          </p>

          {/* Bottom-Left SPECIAL Stamp */}
          <div
            className={`absolute bottom-1.5 left-2 bg-[#f6f2e8] border ${
              isGhoul ? "border-emerald-700 text-emerald-900" : style.stampColor
            } rounded px-1.5 py-0.2 shadow-sm font-black font-serif text-[0.62rem] sm:text-[0.72rem] transform -rotate-3`}
          >
            {special}
          </div>

          {/* Bottom-Right Star Ribbon */}
          <div
            className={`absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-sm border ${
              isGhoul
                ? "bg-[#1b4e3b] border-emerald-500 text-emerald-200"
                : `${style.ribbonBg} text-white`
            } shadow-md flex items-center gap-0.5 text-[0.60rem] sm:text-[0.70rem] font-black`}
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
