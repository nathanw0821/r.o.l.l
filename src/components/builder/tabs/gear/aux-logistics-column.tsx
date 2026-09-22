"use client";

import { Save, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BuilderPayload } from "@/lib/builder/types";

export interface SavedLoadoutItem {
  id: string;
  name: string;
  payload: BuilderPayload;
}

export interface AuxLogisticsShoppingList {
  modules: number;
  lines: Array<{ label: string; count: number }>;
}

export interface AuxLogisticsColumnProps {
  readOnly?: boolean;
  activeLoadoutIndex: number | null;
  savedLoadouts: SavedLoadoutItem[];
  loadLoadout: (index: number) => void;
  saveLoadout: (index: number) => void;
  clearAllSelections: () => void;
  undoPayload: BuilderPayload | null;
  undoClear: () => void;
  shopping: AuxLogisticsShoppingList;
}

export default function AuxLogisticsColumn({
  readOnly,
  activeLoadoutIndex,
  savedLoadouts,
  loadLoadout,
  saveLoadout,
  clearAllSelections,
  undoPayload,
  undoClear,
  shopping,
}: AuxLogisticsColumnProps) {
  return (
    <div className="space-y-4">
      {/* Holotape presets compact dropdown saver */}
      {readOnly ? (
        <div className="pip-terminal-panel p-3.5 rounded-xl space-y-2 font-mono">
          <div className="flex items-center justify-between border-b border-border/20 pb-1.5">
            <div className="text-xs font-black uppercase tracking-widest text-accent">
              [ ARCHIVED LOADOUT TAPE ]
            </div>
            <span className="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
              VERIFIED SNAPSHOT
            </span>
          </div>
          <p className="text-2xs text-foreground/60 leading-normal">
            Viewing archived 4-tab transmission snapshot. To tweak or modify, use{" "}
            <span className="text-accent font-bold">Clone in Builder</span> at the top header to
            load it into your local terminal.
          </p>
        </div>
      ) : (
        <div className="pip-terminal-panel p-3.5 rounded-xl space-y-2.5 font-mono">
          <div className="flex items-center justify-between border-b border-border/20 pb-1.5">
            <div className="text-xs font-black uppercase tracking-widest text-accent">
              [ PRESETS HOLOTAPE DECK ]
            </div>
            <div
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded text-[0.78rem] font-black uppercase border tracking-wider",
                activeLoadoutIndex === null
                  ? "bg-amber-400/10 border-amber-400/20 text-amber-500/90"
                  : "bg-emerald-400/10 border-emerald-400/20 text-emerald-500/90",
              )}
            >
              <div
                className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse",
                  activeLoadoutIndex === null ? "bg-amber-500" : "bg-emerald-500",
                )}
              />
              <span>{activeLoadoutIndex === null ? "SANDBOX" : `SLOT ${activeLoadoutIndex + 1}`}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              aria-label="Active loadout slot"
              className="h-8 flex-1 min-w-0 rounded border border-border/30 bg-background/90 px-2 text-xs font-mono uppercase text-foreground/80 cursor-pointer truncate focus:outline-none focus:border-accent"
              value={activeLoadoutIndex ?? -1}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (val >= 0 && savedLoadouts[val]) {
                  loadLoadout(val);
                }
              }}
            >
              <option value={-1} className="bg-background text-foreground">
                -- Select Saved Holotape Slot --
              </option>
              {Array.from({ length: 10 }).map((_, i) => {
                const saved = savedLoadouts[i];
                return (
                  <option key={i} value={i} className="bg-background text-foreground">
                    {saved ? `Tape ${i + 1}: ${saved.name}` : `Tape Slot ${i + 1} (Empty)`}
                  </option>
                );
              })}
            </select>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-2xs uppercase font-mono px-2.5 font-bold shrink-0 hover:text-accent hover:border-accent"
              onClick={() => {
                const idx = activeLoadoutIndex ?? 0;
                saveLoadout(idx);
              }}
              title="Write current loadout to selected slot"
            >
              <Save className="h-3 w-3 mr-1" /> Write
            </Button>
          </div>
        </div>
      )}

      {/* Global Actions (Flush & Restore) */}
      {!readOnly && (
        <div className="pip-terminal-panel p-3 rounded-xl font-mono flex items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-foreground/60">
            [ ARMORY CONTROLS ]
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={clearAllSelections}
              className="gap-1.5 h-7 text-2xs uppercase font-mono bg-danger/10 hover:bg-danger/25 text-danger font-bold border border-danger/20"
            >
              <Trash2 className="h-3 w-3" />
              <span>Flush Registry</span>
            </Button>
            {undoPayload ? (
              <Button
                variant="outline"
                size="sm"
                onClick={undoClear}
                className="gap-1.5 h-7 text-2xs uppercase font-mono font-bold"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Restore</span>
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {/* Shopping list of modules required (Compact High-Density Matrix) */}
      <div className="pip-terminal-panel p-3 rounded-xl space-y-2 font-mono">
        <div className="flex items-center justify-between border-b border-border/20 pb-1.5 text-xs font-black uppercase tracking-widest text-accent">
          <span>[ BENCH MATERIALS LIST ]</span>
          {shopping.modules > 0 && (
            <span className="text-2xs px-1.5 py-0.2 rounded bg-accent/10 border border-accent/30 text-accent font-bold">
              {shopping.modules} MODS TOTAL
            </span>
          )}
        </div>

        {shopping.lines.length === 0 ? (
          <p className="text-2xs text-foreground/30 italic uppercase py-1">
            &gt; legendary bench is idle. no modules required.
          </p>
        ) : (
          <div tabIndex={0} role="region" aria-label="Legendary module shopping list" className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-36 overflow-y-auto pr-1">
            {shopping.lines.map((line) => (
              <div
                key={line.label}
                className="flex items-center justify-between gap-1 rounded border border-border/20 bg-background/30 px-2 py-1 text-2xs font-bold text-foreground/80 hover:border-accent/30 transition-colors"
              >
                <span className="truncate">{line.label}</span>
                <span className="text-accent font-black shrink-0">×{line.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
