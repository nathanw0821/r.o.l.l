"use client";

import * as React from "react";
import { Search, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ModPickerOption from "@/components/builder/mod-picker-option";
import { activePickLabel, type ActivePick } from "@/lib/builder/active-pick";
import type { BaseGearPiece } from "@/lib/builder/base-gear";
import type { BuilderModDTO } from "@/lib/builder/types";
import { cn } from "@/lib/utils";

export type ModalTrackerFilter = "all" | "unlocked" | "stash";

/**
 * The legendary mod picker ("bench") dialog. Open whenever activePick is set.
 * State stays in the builder client; this component only renders it.
 */
export type LegendaryModPickerDialogProps = {
  activePick: ActivePick;
  setActivePick: React.Dispatch<React.SetStateAction<ActivePick>>;
  slotQuery: string;
  setSlotQuery: React.Dispatch<React.SetStateAction<string>>;
  deferredSlotQuery: string;
  modalTrackerFilter: ModalTrackerFilter;
  setModalTrackerFilter: React.Dispatch<React.SetStateAction<ModalTrackerFilter>>;
  isCompactDensity: boolean;
  activeWeaponPiece: BaseGearPiece;
  activeChassisPiece: BaseGearPiece;
  baseStarsContextLabel: string;
  piece: BaseGearPiece;
  ghoulMode: boolean;
  optionsForActivePick: BuilderModDTO[];
  recommendedIds: Set<string>;
  localProgress: React.ComponentProps<typeof ModPickerOption>["localProgress"];
  assignSlot: (modId: string) => void;
};

export default function LegendaryModPickerDialog({
  activePick,
  setActivePick,
  slotQuery,
  setSlotQuery,
  deferredSlotQuery,
  modalTrackerFilter,
  setModalTrackerFilter,
  isCompactDensity,
  activeWeaponPiece,
  activeChassisPiece,
  baseStarsContextLabel,
  piece,
  ghoulMode,
  optionsForActivePick,
  recommendedIds,
  localProgress,
  assignSlot,
}: LegendaryModPickerDialogProps) {
  return (
<Dialog
  open={activePick !== null}
  onOpenChange={(open) => {
    if (!open) {
      setActivePick(null);
      setSlotQuery("");
    }
  }}
>
  <DialogContent
    className={cn(
      "pip-terminal-panel flex max-h-[min(94vh,56rem)] flex-col gap-0 border-accent/40 rounded-xl overflow-hidden font-mono",
      isCompactDensity
        ? "max-w-xl p-3 sm:p-4"
        : "max-w-2xl p-5 sm:p-6",
    )}
  >
    {(() => {
      const targetPiece = activePick?.scope === "single" ? activeWeaponPiece : activeChassisPiece;
      const targetLabel = activePick?.scope === "single" ? activeWeaponPiece.label : baseStarsContextLabel;
      return (
        <>
          <DialogHeader className={cn("shrink-0 pr-8 relative z-10", isCompactDensity && "space-y-1")}>
            <DialogTitle className={cn("font-black uppercase tracking-widest text-accent", isCompactDensity ? "text-xs" : "text-sm")}>
              {activePick
                ? `> CONFIGURE SLOT: ${activePickLabel(activePick, targetLabel, targetPiece?.kind === "powerArmor")}`
                : "CHOOSE MOD"}
            </DialogTitle>
            <DialogDescription className="text-[0.78rem] text-foreground/50 uppercase tracking-widest leading-relaxed">
              {isCompactDensity
                ? "Search compatible catalog mods. Tap row to equip."
                : "Search compatibilities. Unlocked entries sync from legendary ledger tracker database values."}
              {ghoulMode ? (
                <span className="mt-1.5 block text-2xs text-warning/90 font-bold bg-warning/5 p-1 rounded border border-warning/20">
                  GHOUL NOTICE: FOOD/WATER ACCENTS STRIPPED FROM EFFECT MATH.
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative mt-3 shrink-0 relative z-10">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-foreground/40" />
            <Input
              className={cn(
                "pl-8 h-9 text-xs bg-background/60 font-mono text-foreground border-border/30 focus-visible:ring-accent",
                isCompactDensity && "h-8"
              )}
              placeholder="SEARCH EFFECT CODENAME..."
              value={slotQuery}
              onChange={(e) => setSlotQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5 mt-2 text-2xs font-mono shrink-0 relative z-10">
            <button
              type="button"
              onClick={() => setModalTrackerFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded border transition-colors cursor-pointer",
                modalTrackerFilter === "all"
                  ? "bg-accent/20 border-accent text-accent font-black"
                  : "border-border/30 text-foreground/50 hover:text-foreground hover:border-border/60"
              )}
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() => setModalTrackerFilter("unlocked")}
              className={cn(
                "px-2.5 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1",
                modalTrackerFilter === "unlocked"
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-black"
                  : "border-border/30 text-foreground/50 hover:text-emerald-400 hover:border-emerald-500/40"
              )}
            >
              <Check className="w-3 h-3" /> UNLOCKED ONLY
            </button>
            <button
              type="button"
              onClick={() => setModalTrackerFilter("stash")}
              className={cn(
                "px-2.5 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1",
                modalTrackerFilter === "stash"
                  ? "bg-amber-500/20 border-amber-500 text-amber-300 font-black"
                  : "border-border/30 text-foreground/50 hover:text-amber-400 hover:border-amber-500/40"
              )}
            >
              📦 IN STASH
            </button>
          </div>
          
          {slotQuery.trim() !== deferredSlotQuery.trim() ? (
            <p className="mt-1 text-2xs text-foreground/35 uppercase tracking-wider relative z-10 animate-pulse">
              &gt; searching matrices database...
            </p>
          ) : null}
          
          <div
            className={cn(
              "mt-3 min-h-[min(32vh,14rem)] flex-1 overflow-y-auto pr-1 [scrollbar-gutter:stable] relative z-10",
              isCompactDensity
                ? "max-h-[min(74vh,30rem)] space-y-1 sm:max-h-[min(76vh,32rem)]"
                : "max-h-[min(70vh,38rem)] space-y-2 sm:max-h-[min(72vh,40rem)] min-h-[min(36vh,18rem)]",
            )}
          >
            {targetPiece?.kind === "underarmor" ? (
              <div className="text-foreground/40 text-xs italic uppercase">
                &gt; underarmor does not equip legendary stars.
              </div>
            ) : optionsForActivePick.length === 0 ? (
              <div className="text-foreground/40 text-xs italic uppercase">
                &gt; no matching catalog mods found.
              </div>
            ) : (
              <div className="grid gap-2">
                {optionsForActivePick.map((m) => (
                  <ModPickerOption
                    key={m.id}
                    mod={m}
                    piece={targetPiece ?? piece}
                    compact={isCompactDensity}
                    ghoulMode={ghoulMode}
                    isRecommended={recommendedIds.has(m.id)}
                    localProgress={localProgress}
                    onPick={assignSlot}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      );
    })()}
    
    <div className="mt-4 pt-3 border-t border-border/15 shrink-0 flex items-center justify-between relative z-10">
      <Button
        type="button"
        className="h-8 text-[0.78rem] uppercase font-mono hover:text-accent font-bold"
        variant="outline"
        size="sm"
        onClick={() => {
          setActivePick(null);
          setSlotQuery("");
        }}
      >
        EJECT BENCH
      </Button>
      <span className="text-[0.84rem] text-foreground/30 uppercase tracking-widest font-mono">
        SECURE LEDGER CONNECTION ENABLED
      </span>
    </div>
  </DialogContent>
</Dialog>
  );
}
