"use client";

import * as React from "react";
import { SpecialCategory } from "@/lib/perks/catalog";

export interface PureSvgPerkCardProps {
  displayName?: string;
  special?: SpecialCategory;
  cost?: number;
  rank?: number;
  maxRank?: number;
  description?: string;
  artImagePath?: string;
  className?: string;
}

const SPECIAL_THEME_COLORS: Record<
  SpecialCategory,
  {
    header: string;
    artBg: string;
    stamp: string;
    stampText: string;
  }
> = {
  S: {
    header: "#527d6d", // Strength Sage Green
    artBg: "#a4cebe",
    stamp: "#3e6353",
    stampText: "#3e6353",
  },
  P: {
    header: "#2e7488", // Perception Cyan
    artBg: "#9cc8d7",
    stamp: "#1f596b",
    stampText: "#1f596b",
  },
  E: {
    header: "#437751", // Endurance Forest Green
    artBg: "#a4cfb0",
    stamp: "#2c5838",
    stampText: "#2c5838",
  },
  C: {
    header: "#8b7536", // Charisma Gold
    artBg: "#dcce9f",
    stamp: "#6b5825",
    stampText: "#6b5825",
  },
  I: {
    header: "#536577", // Intelligence Slate
    artBg: "#afc1d2",
    stamp: "#394a5a",
    stampText: "#394a5a",
  },
  A: {
    header: "#8c3947", // Agility Crimson
    artBg: "#dba3ad",
    stamp: "#6a2732",
    stampText: "#6a2732",
  },
  L: {
    header: "#895125", // Luck Warm Amber
    artBg: "#dcb28d",
    stamp: "#683b17",
    stampText: "#683b17",
  },
  LEGENDARY: {
    header: "#8a5c1e",
    artBg: "#dfbe88",
    stamp: "#784813",
    stampText: "#784813",
  },
};

export default function PureSvgPerkCard({
  displayName = "SCATTERSHOT",
  special = "S",
  cost = 2,
  rank = 1,
  maxRank = 1,
  description = "20% of the damage dealt to a limb is applied to all limbs on your target.",
  artImagePath = "/images/perks/scattershot_art_exact.png",
  className = "",
}: PureSvgPerkCardProps) {
  const theme = SPECIAL_THEME_COLORS[special] || SPECIAL_THEME_COLORS.S;

  return (
    <div className={`relative w-full aspect-[320/440] select-none ${className}`}>
      <svg
        viewBox="0 0 320 440"
        className="w-full h-full drop-shadow-2xl overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Subtle Drop Shadow for Title and Badges */}
          <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4" />
          </filter>
          <filter id="textShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodOpacity="0.75" floodColor="#000000" />
          </filter>

          {/* Diamond Ray Sunburst Pattern for Art Window */}
          <pattern id="diamondSunburst" x="0" y="0" width="100%" height="100%" patternUnits="userSpaceOnUse">
            <polygon points="160,56 310,171 160,286 10,171" fill="#bce0d3" opacity="0.45" />
            <polygon points="160,86 280,171 160,256 40,171" fill="none" stroke="#ffffff" strokeWidth="4" opacity="0.4" />
            <polygon points="160,116 250,171 160,226 70,171" fill="none" stroke="#ffffff" strokeWidth="3" opacity="0.35" />
          </pattern>
        </defs>

        {/* 1. Outer Card Body (Cream Parchment with Rounded Corners) */}
        <rect
          x="3"
          y="3"
          width="314"
          height="434"
          rx="18"
          fill="#ede6d4"
          stroke="#2a2824"
          strokeWidth="3"
        />

        {/* Inner Card Subtle Cream Inset Border */}
        <rect
          x="7"
          y="7"
          width="306"
          height="426"
          rx="14"
          fill="#f7f3e8"
          stroke="#d2c5ae"
          strokeWidth="1.2"
        />

        {/* 2. Top S.P.E.C.I.A.L. Header Banner */}
        <path
          d="M 8 20 A 12 12 0 0 1 20 8 L 300 8 A 12 12 0 0 1 312 20 L 312 56 L 8 56 Z"
          fill={theme.header}
          stroke="#2a2824"
          strokeWidth="2"
        />

        {/* Header Title Text */}
        <text
          x="180"
          y="38"
          fill="#ffffff"
          fontFamily="var(--font-share-tech-mono), 'Oswald', 'DIN Alternate', 'Impact', sans-serif"
          fontSize="17"
          fontWeight="900"
          letterSpacing="1.2"
          textAnchor="middle"
          filter="url(#textShadow)"
        >
          {displayName}
        </text>

        {/* 3. Top-Left Point Cost Badge Tab */}
        <g transform="translate(10, 8)" filter="url(#cardShadow)">
          {/* Outer Square Tab */}
          <rect
            x="0"
            y="0"
            width="38"
            height="38"
            rx="7"
            fill="#fdfbf5"
            stroke="#2a2824"
            strokeWidth="2"
          />
          {/* Inner Accent Line */}
          <rect
            x="2.5"
            y="2.5"
            width="33"
            height="33"
            rx="5"
            fill="none"
            stroke={theme.header}
            strokeWidth="1.5"
          />
          {/* Live Point Cost Number */}
          <text
            x="19"
            y="27"
            fill="#1c1a17"
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="23"
            fontWeight="900"
            textAnchor="middle"
          >
            {cost}
          </text>
        </g>

        {/* 4. Central Artwork Canvas Window */}
        <g>
          {/* Artwork Canvas Background */}
          <rect
            x="10"
            y="57"
            width="300"
            height="228"
            fill={theme.artBg}
          />
          {/* Diamond Motif */}
          <rect
            x="10"
            y="57"
            width="300"
            height="228"
            fill="url(#diamondSunburst)"
          />
          {/* Standalone Vault Boy Character Artwork */}
          <image
            href={artImagePath}
            x="10"
            y="57"
            width="300"
            height="228"
            preserveAspectRatio="xMidYMid meet"
          />
          {/* Border around Art Canvas */}
          <rect
            x="10"
            y="57"
            width="300"
            height="228"
            fill="none"
            stroke="#2a2824"
            strokeWidth="2"
          />
        </g>

        {/* 5. Lower Description Parchment Box */}
        <rect
          x="10"
          y="288"
          width="300"
          height="142"
          rx="10"
          fill="#ebe3d0"
          stroke="#2a2824"
          strokeWidth="2"
        />

        {/* Dynamic Patch Description Text */}
        <foreignObject x="18" y="296" width="284" height="88">
          <div
            style={{
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: description.length > 80 ? "13px" : "14.5px",
              fontWeight: 600,
              lineHeight: 1.35,
              color: "#1c1a17",
              letterSpacing: "-0.01em",
              padding: "2px 4px",
            }}
          >
            {description}
          </div>
        </foreignObject>

        {/* 6. Bottom-Left S.P.E.C.I.A.L. Vintage Stamp */}
        <g transform="translate(18, 394) rotate(-3.5)" filter="url(#cardShadow)">
          <rect
            x="0"
            y="0"
            width="30"
            height="30"
            rx="5"
            fill="#fdfbf5"
            stroke="#2a2824"
            strokeWidth="1.8"
          />
          <text
            x="15"
            y="22"
            fill={theme.stampText}
            fontFamily="Georgia, 'Times New Roman', serif"
            fontSize="19"
            fontWeight="900"
            textAnchor="middle"
          >
            {special}
          </text>
        </g>

        {/* 7. Bottom-Right Star Ribbon Banner */}
        <g transform="translate(242, 394)" filter="url(#cardShadow)">
          {/* Notched Ribbon Body */}
          <path
            d="M 0 0 L 58 0 L 50 14 L 58 28 L 0 28 Z"
            fill={theme.header}
            stroke="#2a2824"
            strokeWidth="1.8"
          />
          {/* Stars */}
          <g transform="translate(24, 20)">
            {Array.from({ length: maxRank }, (_, i) => {
              const isFilled = i < rank;
              const xPos = (i - (maxRank - 1) / 2) * 15;
              return (
                <text
                  key={i}
                  x={xPos}
                  y="0"
                  fill={isFilled ? "#ffffff" : "rgba(255,255,255,0.3)"}
                  fontSize="16"
                  fontWeight="900"
                  textAnchor="middle"
                  filter={isFilled ? "url(#textShadow)" : undefined}
                >
                  ★
                </text>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
}
