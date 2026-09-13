import { ARMOR_SET_SLOT_LABELS } from "@/lib/builder/armor-sets";
import { POWER_ARMOR_PIECE_SLOT_LABELS } from "@/lib/builder/power-armor-stats";

export const SLOT_LABELS = ["1st star", "2nd star", "3rd star", "4th star"];

export type ActivePick =
  | null
  | { scope: "single"; starIndex: number }
  | { scope: "armorSet"; pieceIndex: number; starIndex: number };

export function activePickLabel(active: ActivePick, baseLabel: string, isPA?: boolean): string {
  if (!active) return "";
  if (active.scope === "single") {
    const star = SLOT_LABELS[active.starIndex] ?? "";
    return `${star} · ${baseLabel}`;
  }
  const labels = isPA ? POWER_ARMOR_PIECE_SLOT_LABELS : ARMOR_SET_SLOT_LABELS;
  const slot = labels[active.pieceIndex] ?? "Piece";
  const star = SLOT_LABELS[active.starIndex] ?? "";
  return `${star} · ${slot} · ${baseLabel}`;
}
