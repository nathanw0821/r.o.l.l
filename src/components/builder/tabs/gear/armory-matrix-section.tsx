"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProgressToggle from "@/components/progress-toggle";
import BuilderGearSelector from "@/components/builder/builder-gear-selector";
import RollHelperTooltip from "@/components/roll-helper-tooltip";
import { exportBuilderLoadoutCard } from "@/components/builder/builder-card-exporter";
import { cn } from "@/lib/utils";
import { getEquipmentSynergies } from "@/lib/builder/synergy-engine";
import { getSortedMutationLabels } from "@/lib/builder/sandbox-mutations";
import {
  isPowerArmorTorsoRowLearned,
  isTrackableBasePieceId,
  type BaseGearPiece,
} from "@/lib/builder/base-gear";
import {
  findUnderarmorOption,
  UNDERARMOR_LININGS,
  UNDERARMOR_SHELLS,
  UNDERARMOR_STYLES,
} from "@/lib/builder/underarmor";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";
import type { BuilderEffectTotals } from "@/lib/builder/compatibility";
import type { UseBuilderTotalsResult } from "@/components/builder/hooks/use-builder-totals";
import type { AuxLogisticsShoppingList } from "@/components/builder/tabs/gear/aux-logistics-column";

export interface ArmoryMatrixSectionProps {
  payload: BuilderPayload;
  setPayload: React.Dispatch<React.SetStateAction<BuilderPayload>>;
  setBase: (newBaseId: string) => void;
  activeChassisPiece: BaseGearPiece;
  activeWeaponPiece: BaseGearPiece;
  piece: BaseGearPiece;
  isPA: boolean;
  pieceMaxLevel: number | null;
  learnedBasePieceIds: Set<string>;
  totals: BuilderEffectTotals;
  groupedLegendaryEffects: UseBuilderTotalsResult["groupedLegendaryEffects"];
  mods: BuilderModDTO[];
  shopping: AuxLogisticsShoppingList;
  setIsComparisonOpen: (open: boolean) => void;
  currentBaseLearned: boolean;
  isSignedIn: boolean;
  pendingLearnedPieceId: string | null;
  readOnly?: boolean;
  toggleLearnedBasePiece: (pieceId: string, learned: boolean) => Promise<void> | void;
  learnedToggleError: string | null;
}

export default function ArmoryMatrixSection({
  payload,
  setPayload,
  setBase,
  activeChassisPiece,
  activeWeaponPiece,
  piece,
  isPA,
  pieceMaxLevel,
  learnedBasePieceIds,
  totals,
  groupedLegendaryEffects,
  mods,
  shopping,
  setIsComparisonOpen,
  currentBaseLearned,
  isSignedIn,
  pendingLearnedPieceId,
  readOnly,
  toggleLearnedBasePiece,
  learnedToggleError,
}: ArmoryMatrixSectionProps) {
  return (
    <div className="mt-6">
      {/* Matrix 1: Chassis & Gear Armory Matrix */}
      <div className="pip-terminal-panel p-4 rounded-xl space-y-3.5 font-mono">
        <div className="text-xs font-black uppercase tracking-widest text-accent border-b border-border/20 pb-2 flex items-center justify-between">
          <span>&gt; CHASSIS &amp; GEAR ARMORY MATRIX</span>
          <span className="text-[0.68rem] text-foreground/45 font-normal">
            Active: {activeChassisPiece?.label}
          </span>
        </div>

        {/* Categorized Tactical Gear Armory Picker */}
        <BuilderGearSelector
          selectedBaseId={payload.basePieceId}
          onSelectBase={(newBaseId) => setBase(newBaseId)}
          learnedBasePieceIds={learnedBasePieceIds}
          isPowerArmorTorsoLearned={isPowerArmorTorsoRowLearned}
          underarmor={payload.underarmor}
          onUnderarmorChange={(nextUnderarmor) =>
            setPayload((p) => ({ ...p, underarmor: nextUnderarmor }))
          }
          activeWeaponId={activeWeaponPiece.id}
          activeArmorId={activeChassisPiece.id}
          inPowerArmor={isPA}
        />

        {/* Active Selected Base Gear Render Card */}
        {piece && (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl shrink-0">
                {piece.kind === "weapon"
                  ? "🎯"
                  : piece.kind === "powerArmor"
                    ? "🦾"
                    : piece.kind === "armor"
                      ? "🛡️"
                      : "👕"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black uppercase text-slate-100 truncate">
                  {piece.label}
                </div>
                <div className="text-[0.65rem] text-emerald-400 font-bold uppercase tracking-wide truncate">
                  {piece.kind === "powerArmor"
                    ? "Power Armor Frame"
                    : piece.kind === "armor"
                      ? "5-Piece Armor Set"
                      : piece.kind === "weapon"
                        ? `Weapon · ${piece.weaponSub || "Tactical"}`
                        : "Underarmor Shell"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {pieceMaxLevel && (
                <span className="text-[0.62rem] px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono font-bold tracking-wider">
                  LVL {pieceMaxLevel} (MAX)
                </span>
              )}
              <span className="text-[0.62rem] px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                ✓ ACTIVE LOADOUT BASE
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 text-xs font-mono uppercase font-bold text-accent border-accent/40 hover:border-accent hover:bg-accent/10"
            onClick={() =>
              exportBuilderLoadoutCard({
                piece,
                payload,
                totals,
                groupedEffects: groupedLegendaryEffects,
                modRows: mods,
                shoppingLines: shopping.lines,
                underarmorLabels: {
                  shell:
                    findUnderarmorOption(UNDERARMOR_SHELLS, payload.underarmor.shellId)?.label ??
                    "Standard",
                  lining:
                    findUnderarmorOption(UNDERARMOR_LININGS, payload.underarmor.liningId)?.label ??
                    "None",
                  style:
                    findUnderarmorOption(UNDERARMOR_STYLES, payload.underarmor.styleId)?.label ??
                    "None",
                },
                mutationSummary:
                  payload.mutationIds.length > 0
                    ? getSortedMutationLabels(payload.mutationIds).join(" · ")
                    : null,
              })
            }
          >
            Export Card (PNG)
          </Button>
          <Link
            href={`/wiki?q=${encodeURIComponent(piece.label.replace(/\(full set\)|\(underarmor\)|\(shell\)/gi, "").trim())}`}
            className="h-9 flex items-center justify-center gap-1.5 text-xs font-mono uppercase font-bold text-amber-400 border border-amber-500/40 hover:border-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded px-2 transition-all shadow-sm"
          >
            📖 Read Vault Guide ↗
          </Link>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 text-xs font-mono uppercase font-bold text-cyan-400 border-cyan-500/40 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20"
            onClick={() => setIsComparisonOpen(true)}
          >
            📊 Gear &amp; PA Matrix
          </Button>
        </div>

        {/* Smart Synergy Recommendation Panel */}
        <div className="pt-2 border-t border-border/20 space-y-2 font-mono">
          <div className="text-[0.72rem] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkle className="h-3.5 w-3.5" />
            <span>⚡ Smart Synergy Recommendations for {piece.label}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {getEquipmentSynergies(piece.id).map((syn) => (
              <RollHelperTooltip key={syn.id} title={syn.name} kind="perk" cardId={syn.id}>
                <span className="text-[0.68rem] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1">
                  {syn.name} ({syn.boostLabel})
                </span>
              </RollHelperTooltip>
            ))}
          </div>
        </div>

        {isTrackableBasePieceId(piece.id) ? (
          <div
            className={cn(
              "flex items-center justify-between gap-3 border rounded px-3 py-2.5 mt-4 sm:mt-0 font-mono",
              currentBaseLearned
                ? "border-accent/40 bg-accent/5"
                : "border-border/20 bg-background/25",
            )}
          >
            <div className="min-w-0">
              <div className="text-[0.72rem] font-black uppercase text-accent tracking-wider">
                Plan Registry Sync
              </div>
              <div className="text-[0.72rem] text-foreground/45 mt-0.5 uppercase">
                {isSignedIn ? "Database persistent" : "Offline draft"}
              </div>
            </div>
            <ProgressToggle
              unlocked={currentBaseLearned}
              disabled={!isSignedIn || pendingLearnedPieceId === piece.id || readOnly}
              onToggle={() => void toggleLearnedBasePiece(piece.id, !currentBaseLearned)}
              className="shrink-0"
            />
          </div>
        ) : null}

        {learnedToggleError ? (
          <p className="text-[0.78rem] text-danger font-bold">&gt;&gt; ERROR: {learnedToggleError}</p>
        ) : null}
      </div>
    </div>
  );
}
