"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Boxes, BookOpen, Plus, Check } from "lucide-react";

interface RollHelperTooltipProps {
  children: React.ReactNode;
  title: string;
  kind?: "equipment" | "perk" | "mod" | "general";
  equipKey?: string;
  cardId?: string;
}

export default function RollHelperTooltip({
  children,
  title,
  kind = "general",
  equipKey,
  cardId,
}: RollHelperTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [addedBuild, setAddedBuild] = React.useState(false);
  const [addedPerk, setAddedPerk] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const panelId = React.useId();
  const lastPointerTypeRef = React.useRef("");

  // Touch has no hover: the trigger toggles on tap, and a tap outside closes it.
  React.useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleAddToBuild = (e: React.MouseEvent) => {
    e.stopPropagation();
    const key = equipKey || title.toLowerCase().replace(/\s+/g, "-");
    window.location.href = `/build?equip=${encodeURIComponent(key)}`;
    setAddedBuild(true);
    setTimeout(() => setAddedBuild(false), 2000);
  };

  const handleAddToPerk = (e: React.MouseEvent) => {
    e.stopPropagation();
    const query = cardId || title;
    window.location.href = `/perks?q=${encodeURIComponent(query)}`;
    setAddedPerk(true);
    setTimeout(() => setAddedPerk(false), 2000);
  };

  return (
    <div
      ref={rootRef}
      className="relative inline-block group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onPointerDown={(e) => {
          lastPointerTypeRef.current = e.pointerType;
        }}
        onClick={() => {
          // A mouse already opened it on hover; a click must not close it again.
          if (lastPointerTypeRef.current === "mouse") setIsOpen(true);
          else setIsOpen((open) => !open);
          lastPointerTypeRef.current = "";
        }}
        className="touch-hit cursor-pointer border-b border-dashed border-amber-400/60 hover:text-amber-400 transition-colors text-left"
      >
        {children}
      </button>

      {isOpen && (
        <div id={panelId} className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 max-w-[calc(100vw-2rem)] bg-slate-950 border border-amber-500/40 rounded-xl p-3 shadow-2xl font-mono text-left animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-400 border-b border-slate-800 pb-1.5 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>MINI R.O.L.L. HELPER // {kind}</span>
          </div>

          <div className="text-xs font-bold text-slate-100 mb-2 truncate">
            {title}
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={handleAddToBuild}
              className="w-full flex items-center justify-between text-2xs font-bold uppercase font-mono px-2 py-1.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-400 transition-all"
            >
              <span className="flex items-center gap-1">
                <Boxes className="h-3 w-3" /> Add to B.U.I.L.D.
              </span>
              {addedBuild ? <Check className="h-3 w-3 text-emerald-400" /> : <Plus className="h-3 w-3" />}
            </button>

            <button
              type="button"
              onClick={handleAddToPerk}
              className="w-full flex items-center justify-between text-2xs font-bold uppercase font-mono px-2 py-1.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all"
            >
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Add to P.E.R.K.
              </span>
              {addedPerk ? <Check className="h-3 w-3 text-emerald-400" /> : <Plus className="h-3 w-3" />}
            </button>

            <Link
              href={`/wiki?q=${encodeURIComponent(title)}`}
              className="w-full flex items-center justify-between text-2xs font-bold uppercase font-mono px-2 py-1.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all"
            >
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" /> Truth Bible Guide
              </span>
              ↗
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
