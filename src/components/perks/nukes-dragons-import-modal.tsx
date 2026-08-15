"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  parseNukesDragonsBuild,
  type NukesDragonsParsedBuild,
} from "@/lib/perks/nukes-dragons-parser";
import { OFFICIAL_SPECIAL_THEMES as SPECIAL_THEMES } from "@/lib/perks/special-theme";
import {
  Link2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Shield,
  ArrowRight,
} from "lucide-react";

interface NukesDragonsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyBuild: (build: NukesDragonsParsedBuild) => void;
}

const GOLDEN_EXAMPLE_URL =
  "https://nukesdragons.com/fallout-76/character?cd=kk0131000k10&ef=MgM0M5MhMaM1McM9MeMfM7M2MbMiM6M4MdM8M3&s=aa547aa&p=sd3su1sq3sx1sp10B1p03pd3pg3pu1pp2li1eo1es10l3ee1cu1ce1lb2ic3lq1au30H3ak1af1a52ai1ab3ad3lv3lk3lg10v30j10n3e31ej2&lp=x94x64x74x44x84xa4&v=2";

export default function NukesDragonsImportModal({
  isOpen,
  onClose,
  onApplyBuild,
}: NukesDragonsImportModalProps) {
  const [urlInput, setUrlInput] = React.useState("");
  const [applied, setApplied] = React.useState(false);

  const parsedBuild = React.useMemo<NukesDragonsParsedBuild | null>(() => {
    if (!urlInput.trim()) return null;
    return parseNukesDragonsBuild(urlInput);
  }, [urlInput]);

  const isValid = Boolean(
    parsedBuild &&
      (parsedBuild.equippedCards.length > 0 ||
        parsedBuild.legendaryPerks.length > 0 ||
        parsedBuild.mutations.length > 0)
  );

  const handleApply = () => {
    if (!parsedBuild || !isValid) return;
    onApplyBuild(parsedBuild);
    setApplied(true);
    setTimeout(() => {
      setApplied(false);
      onClose();
    }, 600);
  };

  const handleLoadExample = () => {
    setUrlInput(GOLDEN_EXAMPLE_URL);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-slate-950/95 border-emerald-500/40 text-slate-100 font-mono shadow-[0_0_50px_rgba(16,185,129,0.15)] rounded-2xl p-6">
        <DialogHeader className="border-b border-emerald-500/20 pb-3">
          <DialogTitle className="flex items-center gap-2 text-emerald-400 text-sm font-black uppercase tracking-widest">
            <Link2 className="h-4 w-4 animate-pulse" />
            [ NUKES &amp; DRAGONS // UNIVERSAL BUILD IMPORTER ]
          </DialogTitle>
          <p className="text-xs text-slate-400">
            Paste any Nukes &amp; Dragons character planner link to instantly convert and load its SPECIAL allocations, regular perk cards, legendary perks, and mutations into R.O.L.L.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Input field and example button */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[0.72rem] text-slate-400">
              <span className="font-bold uppercase text-emerald-400/90">&gt; Target Share URL or Parameters:</span>
              <button
                type="button"
                onClick={handleLoadExample}
                className="text-[0.68rem] text-emerald-400 underline hover:text-emerald-300 transition-colors"
              >
                Paste Example N&amp;D Spec
              </button>
            </div>
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://nukesdragons.com/fallout-76/character?v=1&s=...&p=..."
              className="bg-slate-900 border-slate-700 text-emerald-300 font-mono text-xs focus-visible:ring-emerald-500 placeholder:text-slate-600 h-9"
            />
          </div>

          {/* Validation warnings / hints */}
          {urlInput && !isValid && (
            <div className="rounded-lg p-2.5 bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>No recognizable N&amp;D perk cards or parameters found. Make sure the URL contains &apos;p=&apos; or &apos;s=&apos;.</span>
            </div>
          )}

          {/* Live Preview Card */}
          {parsedBuild && isValid && (
            <div className="rounded-xl border border-emerald-500/30 bg-slate-900/70 p-4 space-y-4 shadow-inner">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" /> DECODED TELEMETRY
                  </span>
                  {parsedBuild.isGhoul && (
                    <span className="text-[0.65rem] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/60 text-emerald-300 font-bold uppercase tracking-wider">
                      Ghoul Deck
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[0.68rem] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                    {parsedBuild.equippedCards.length} CARDS ({parsedBuild.totalCardPoints} PTS)
                  </span>
                  {parsedBuild.legendaryPerks.length > 0 && (
                    <span className="text-[0.68rem] px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-500/40 font-bold">
                      {parsedBuild.legendaryPerks.length} LEGENDARY PERKS
                    </span>
                  )}
                </div>
              </div>

              {/* S.P.E.C.I.A.L. Distribution */}
              <div className="space-y-1.5">
                <div className="text-[0.7rem] uppercase tracking-widest text-slate-400 font-bold">
                  S.P.E.C.I.A.L. ALLOCATION
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {(
                    [
                      { k: "str", label: "S", theme: SPECIAL_THEMES.S },
                      { k: "per", label: "P", theme: SPECIAL_THEMES.P },
                      { k: "end", label: "E", theme: SPECIAL_THEMES.E },
                      { k: "cha", label: "C", theme: SPECIAL_THEMES.C },
                      { k: "int", label: "I", theme: SPECIAL_THEMES.I },
                      { k: "agi", label: "A", theme: SPECIAL_THEMES.A },
                      { k: "lck", label: "L", theme: SPECIAL_THEMES.L },
                    ] as const
                  ).map(({ k, label, theme }) => {
                    const val = parsedBuild.specials[k];
                    return (
                      <div
                        key={k}
                        className="rounded-lg border border-slate-800 bg-slate-950 p-2 flex flex-col items-center justify-center space-y-0.5"
                      >
                        <span className={`text-[0.7rem] font-black ${theme.text}`}>
                          {label}
                        </span>
                        <span className="text-sm font-bold text-white">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Regular Perk Cards Decoded */}
              {parsedBuild.cardDetails.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[0.7rem] uppercase tracking-widest text-slate-400 font-bold flex items-center justify-between">
                    <span>EQUIPPED PERK CARDS ({parsedBuild.cardDetails.length})</span>
                    <span className="text-[0.65rem] text-slate-500">Auto-clamped to in-game max ranks</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {parsedBuild.cardDetails.map((card, idx) => {
                      const theme = SPECIAL_THEMES[card.special as keyof typeof SPECIAL_THEMES] || SPECIAL_THEMES.S;
                      return (
                        <div
                          key={`${card.cardId}-${idx}`}
                          className="flex items-center justify-between gap-1.5 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-[0.72rem]"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className={`font-black text-[0.65rem] px-1 rounded border ${theme.badge} shrink-0`}>
                              {card.special}
                            </span>
                            <span className="truncate font-bold text-slate-200">{card.name}</span>
                          </div>
                          <span className="text-amber-400 font-bold shrink-0 text-[0.7rem]">
                            {"★".repeat(card.rank)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Legendary Perks Decoded */}
              {parsedBuild.legendaryPerkDetails.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[0.7rem] uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5" />
                    LEGENDARY PERKS ({parsedBuild.legendaryPerkDetails.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {parsedBuild.legendaryPerkDetails.map((lp) => (
                      <div
                        key={lp.id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-950/20 px-2.5 py-1 text-[0.72rem] text-amber-200"
                      >
                        <span className="truncate font-bold">{lp.label}</span>
                        <span className="text-amber-400 font-black shrink-0">Rank {lp.rank}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mutations Decoded */}
              {parsedBuild.mutations.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[0.7rem] uppercase tracking-widest text-purple-400 font-bold flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    ACTIVE MUTATIONS ({parsedBuild.mutations.length})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {parsedBuild.mutations.map((mut) => (
                      <span
                        key={mut}
                        className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-200 text-[0.68rem] font-bold uppercase"
                      >
                        {mut.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Diagnostics / Warnings */}
              {parsedBuild.warnings.length > 0 && (
                <div className="rounded p-2 bg-slate-950/90 border border-amber-500/30 text-amber-400/90 text-[0.68rem] space-y-0.5">
                  {parsedBuild.warnings.map((w, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <AlertTriangle className="h-3 w-3 shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-mono border-slate-700 hover:bg-slate-800 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!isValid || applied}
              onClick={handleApply}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black font-mono text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5"
            >
              {applied ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> APPLIED!
                </>
              ) : (
                <>
                  <ArrowRight className="h-3.5 w-3.5" /> APPLY TO ACTIVE LOADOUT
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
