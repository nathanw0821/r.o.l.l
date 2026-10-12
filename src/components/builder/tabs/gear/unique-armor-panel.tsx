"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import LinkifiedText from "@/components/linkified-text";
import { cn } from "@/lib/utils";
import { getArmorSetRow } from "@/lib/builder/armor-sets";
import type { ArmorSlot, BuilderPayload } from "@/lib/builder/types";
import {
  ARMOR_SLOT_LABEL,
  DEFAULT_MOVEMENT_SPEED_PCT,
  DEFAULT_RAGE_STACKS,
  SELECTABLE_UNIQUE_ARMOR_SLOTS,
  getUniqueArmorPiece,
  rageModel,
  sanitizeUniqueArmorConditions,
  setUniqueArmorPiece,
  standFastDrBonus,
  standFastModel,
  uniqueArmorEffectLayer,
  uniqueArmorPiecesForSlot,
  type UniqueArmorPiece,
} from "@/lib/builder/unique-armor";

export interface UniqueArmorPanelProps {
  payload: BuilderPayload;
  setPayload: React.Dispatch<React.SetStateAction<BuilderPayload>>;
  /** Set key of the regular-armor chassis (Secret Settler shows its set bonus here). */
  chassisSetKey: string | null;
  readOnly?: boolean;
}

const RESIST_LABEL: Record<string, string> = { dr: "DR", er: "ER", fr: "FR", cr: "CR", pr: "PR", rr: "RR" };

/** "Unique chest" / "Unique left arm" label for a slot. */
function slotChoiceLabel(slot: ArmorSlot): string {
  return `Unique ${ARMOR_SLOT_LABEL[slot].toLowerCase()}`;
}

/**
 * Unique armor beside the regular set (Gear tab): one choice per slot that has unique pieces, the
 * worn piece's fixed stars and innate, and the inputs Rage and Stand Fast read. The data model is
 * per slot (`payload.uniqueArmorPieceIds`), so the choice can later move into each slot's own picker.
 */
export default function UniqueArmorPanel({ payload, setPayload, chassisSetKey, readOnly }: UniqueArmorPanelProps) {
  const pathname = usePathname();
  const settler = chassisSetKey ? getArmorSetRow(chassisSetKey)?.unique : undefined;
  const settlerLabel = chassisSetKey ? getArmorSetRow(chassisSetKey)?.label : undefined;
  const layer = React.useMemo(() => uniqueArmorEffectLayer(payload), [payload]);

  const setConditions = (patch: { rageStacks?: number; movementSpeedPct?: number }) =>
    setPayload((p) => ({
      ...p,
      uniqueArmorConditions: sanitizeUniqueArmorConditions({ ...(p.uniqueArmorConditions ?? {}), ...patch }),
    }));

  const worn: UniqueArmorPiece[] = SELECTABLE_UNIQUE_ARMOR_SLOTS.flatMap((slot) => {
    const piece = getUniqueArmorPiece(payload.uniqueArmorPieceIds?.[slot]);
    return piece && piece.slot === slot ? [piece] : [];
  });

  return (
    <section
      aria-label="Unique armor"
      className="relative z-10 rounded-lg border border-amber-500/25 bg-slate-950/70 p-2.5 space-y-2 font-mono"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-2xs font-black uppercase tracking-widest text-amber-300">Unique armor</span>
        <span className="text-3xs text-dim">Fixed legendary stars · 10x scrip for a 4th star</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SELECTABLE_UNIQUE_ARMOR_SLOTS.map((slot) => {
          const current = getUniqueArmorPiece(payload.uniqueArmorPieceIds?.[slot]);
          const options = uniqueArmorPiecesForSlot(slot);
          return (
            <label key={slot} className="flex flex-col gap-1">
              <span className="text-3xs uppercase tracking-wider text-amber-300 font-bold">{slotChoiceLabel(slot)}</span>
              {readOnly ? (
                <span className="min-h-8 flex items-center rounded bg-slate-950 border border-slate-800 px-2 text-xs text-slate-200 truncate">
                  {current?.name ?? "None (set piece)"}
                </span>
              ) : (
                <select
                  className="w-full min-h-8 touch:min-h-11 rounded bg-slate-950 border border-slate-800 px-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                  value={current?.id ?? ""}
                  onChange={(e) => setPayload((p) => setUniqueArmorPiece(p, slot, e.target.value || null))}
                >
                  <option value="" className="bg-slate-950 text-slate-200">
                    None (set piece)
                  </option>
                  {options.map((piece) => (
                    <option key={piece.id} value={piece.id} className="bg-slate-950 text-slate-200">
                      {piece.name} ({getArmorSetRow(piece.baseSetKey)?.label ?? piece.baseSetKey})
                    </option>
                  ))}
                </select>
              )}
            </label>
          );
        })}
      </div>

      {worn.map((piece) => {
        const applied = piece.model !== null || piece.id === "last-stand";
        return (
          <div key={piece.id} className="rounded border border-border/20 bg-background/30 p-2 space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                {piece.name} · {ARMOR_SLOT_LABEL[piece.slot]}
              </span>
              <span
                className={cn(
                  "text-3xs px-1.5 py-0.5 rounded border font-bold shrink-0",
                  applied
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-500/15 border-slate-500/40 text-slate-300",
                )}
              >
                {applied ? "Applied to the numbers" : "Shown for reference"}
              </span>
            </div>
            <p className="text-2xs text-slate-200 leading-relaxed">
              <LinkifiedText text={piece.innateEffect} currentPath={pathname} />
            </p>
            <p className="text-3xs text-dim leading-relaxed">
              Fixed stars: {piece.legendaryModNames.map((name, i) => `${i + 1}★ ${name}`).join(" · ")}. Resistances
              from the {getArmorSetRow(piece.baseSetKey)?.label ?? piece.baseSetKey} set row.
              {piece.modelNote ? ` ${piece.modelNote}` : ""}
            </p>
            {piece.id === "rage" && rageModel() && (
              <label className="flex flex-wrap items-center gap-2 text-2xs text-slate-200">
                <span>Rage stacks</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={rageModel()?.maxUnits ?? 0}
                  step={1}
                  disabled={readOnly}
                  value={payload.uniqueArmorConditions?.rageStacks ?? DEFAULT_RAGE_STACKS}
                  onChange={(e) => setConditions({ rageStacks: Number(e.target.value) })}
                  className="w-20 min-h-8 touch:min-h-11 rounded bg-slate-950 border border-slate-800 px-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <span className="text-3xs text-dim">
                  +{Math.round((payload.uniqueArmorConditions?.rageStacks ?? 0) * (rageModel()?.perUnit ?? 0) * 100)}% damage
                  dealt (firepower) · +
                  {Math.round((payload.uniqueArmorConditions?.rageStacks ?? 0) * (rageModel()?.perUnitTaken ?? 0) * 100)}% damage
                  taken (damage preview)
                </span>
              </label>
            )}
            {piece.id === "stand-fast" && standFastModel() && (
              <label className="flex flex-wrap items-center gap-2 text-2xs text-slate-200">
                <span>Movement speed %</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={standFastModel()?.minSpeedPct ?? DEFAULT_MOVEMENT_SPEED_PCT}
                  max={standFastModel()?.maxSpeedPct ?? DEFAULT_MOVEMENT_SPEED_PCT}
                  step={5}
                  disabled={readOnly}
                  value={payload.uniqueArmorConditions?.movementSpeedPct ?? DEFAULT_MOVEMENT_SPEED_PCT}
                  onChange={(e) => setConditions({ movementSpeedPct: Number(e.target.value) })}
                  className="w-20 min-h-8 touch:min-h-11 rounded bg-slate-950 border border-slate-800 px-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <span className="text-3xs text-dim">
                  +{standFastDrBonus(payload.uniqueArmorConditions?.movementSpeedPct ?? DEFAULT_MOVEMENT_SPEED_PCT)} DR (100% =
                  base speed, 200% = base plus a 100% bonus)
                </span>
              </label>
            )}
          </div>
        );
      })}

      {layer && (
        <p className="text-3xs text-dim">
          Added to the sheet:{" "}
          {Object.entries(layer)
            .map(([key, value]) => `+${value} ${RESIST_LABEL[key] ?? key}`)
            .join(" · ")}
        </p>
      )}

      {settler && (
        <p className="text-3xs text-dim leading-relaxed">
          {settlerLabel}: every piece&apos;s stars are fixed. Set bonus (shown, not modelled): {settler.setBonus}.
        </p>
      )}
    </section>
  );
}
