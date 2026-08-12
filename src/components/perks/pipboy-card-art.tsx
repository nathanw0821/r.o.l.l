"use client";

import * as React from "react";
import { SpecialCategory } from "@/lib/perks/catalog";
import { Star } from "lucide-react";

interface PipBoyCardArtProps {
  special: SpecialCategory;
  name: string;
  className?: string;
}

import { getPerkCardArtworkUrl } from "@/lib/perks/perk-artwork";

export default function PipBoyCardArt({ special, name, className = "" }: PipBoyCardArtProps) {
  const artworkUrl = getPerkCardArtworkUrl(name, special);
  const [artError, setArtError] = React.useState(false);

  return (
    <div className={`relative w-full h-full rounded-lg bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center p-2 overflow-hidden ${className}`}>
      {/* Pip-Boy Terminal Radar Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:12px_12px] opacity-15" />
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-black/40 pointer-events-none" />

      {/* Center Icon & Vault Boy Artwork Graphic */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-1 group-hover:scale-105 transition-transform duration-200 w-full h-full">
        {!artError ? (
          <img
            src={artworkUrl}
            alt={name}
            className="max-h-[110px] max-w-[130px] object-contain drop-shadow-[0_4px_10px_rgba(245,158,11,0.25)]"
            onError={() => setArtError(true)}
          />
        ) : (
          <div className="p-2 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner">
            <Star className="h-10 w-10 text-amber-400 drop-shadow-md" />
          </div>
        )}
      </div>
    </div>
  );
}
