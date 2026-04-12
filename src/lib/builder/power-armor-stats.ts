import type { ArmorSetStats } from "@/lib/builder/armor-sets";
import {
  POWER_ARMOR_CHASSIS_STATS,
  POWER_ARMOR_FRAME_PIECES
} from "@/lib/builder/power-armor-frame-data";
import {
  DEFAULT_POWER_ARMOR_PIECES_EQUIPPED,
  type PowerArmorPiecesEquipped
} from "@/lib/builder/types";

/** Frame key shared by torso + helmet ids (e.g. `excavator` for `excavator-torso` / `excavator-helm`). */
export function powerArmorFrameFromPieceId(pieceId: string): string | null {
  const m = /^(.*)-(torso|helm|chest)$/.exec(pieceId);
  return m?.[1] ?? null;
}

function statsForFrame(frame: string, slot: "torso" | "helmet"): ArmorSetStats | null {
  const row = POWER_ARMOR_FRAME_PIECES[frame];
  if (!row) return null;
  return slot === "torso" ? row.torso : row.helmet;
}

/** @deprecated Use {@link POWER_ARMOR_FRAME_PIECES}; kept for callers that only need torso + helmet rows. */
export const POWER_ARMOR_FRAME_BASE: Record<string, { torso: ArmorSetStats; helmet: ArmorSetStats }> =
  Object.fromEntries(
    Object.entries(POWER_ARMOR_FRAME_PIECES).map(([frame, p]) => [
      frame,
      { torso: p.torso, helmet: p.helmet }
    ])
  );

/** UI + payload slot order: helmet, torso, arms×2, legs×2 (matches six attach points on a frame). */
export const POWER_ARMOR_PIECE_SLOT_LABELS = [
  "Helmet",
  "Torso",
  "Left arm",
  "Right arm",
  "Left leg",
  "Right leg"
] as const;

/** Backwoods-era rule of thumb: ~7% inherent flat DR per attached piece toward ~42% in a full suit. */
export const PA_INHERENT_DR_PCT_PER_PIECE = 7;
export const PA_INHERENT_DR_PCT_CAP = 42;
/** ~15% inherent rad reduction per piece toward ~90% when fully suited. */
export const PA_INHERENT_RAD_REDUCTION_PCT_PER_PIECE = 15;
export const PA_INHERENT_RAD_REDUCTION_PCT_CAP = 90;

export function mergeArmorSetStats(a: ArmorSetStats, b: ArmorSetStats): ArmorSetStats {
  return {
    dr: a.dr + b.dr,
    er: a.er + b.er,
    fr: a.fr + b.fr,
    cr: a.cr + b.cr,
    pr: a.pr + b.pr,
    rr: a.rr + b.rr
  };
}

export function getPowerArmorSlotBaseStats(pieceId: string, slot: "torso" | "helmet"): ArmorSetStats | null {
  const frame = powerArmorFrameFromPieceId(pieceId);
  if (!frame) return null;
  return statsForFrame(frame, slot);
}

export function sanitizePowerArmorPiecesEquipped(raw: unknown): PowerArmorPiecesEquipped {
  if (!Array.isArray(raw) || raw.length !== 6) return DEFAULT_POWER_ARMOR_PIECES_EQUIPPED;
  return [
    Boolean(raw[0]),
    Boolean(raw[1]),
    Boolean(raw[2]),
    Boolean(raw[3]),
    Boolean(raw[4]),
    Boolean(raw[5])
  ] as PowerArmorPiecesEquipped;
}

export function powerArmorAttachedPieceCount(mask: PowerArmorPiecesEquipped): number {
  return mask.filter(Boolean).length;
}

/** Inherent “flat” damage reduction % from wearing PA pieces (not the same as listed DR on parts). */
export function powerArmorInherentDamageReductionPercent(mask: PowerArmorPiecesEquipped): number {
  return Math.min(PA_INHERENT_DR_PCT_CAP, powerArmorAttachedPieceCount(mask) * PA_INHERENT_DR_PCT_PER_PIECE);
}

/** Inherent rad reduction % toward the ~90% full-suit cap. */
export function powerArmorInherentRadReductionPercent(mask: PowerArmorPiecesEquipped): number {
  return Math.min(
    PA_INHERENT_RAD_REDUCTION_PCT_CAP,
    powerArmorAttachedPieceCount(mask) * PA_INHERENT_RAD_REDUCTION_PCT_PER_PIECE
  );
}

/**
 * STR + carry from simply operating a PA frame (Ghoul Within / Backwoods notes: +10 STR while in-frame).
 * Listed resists from armor pieces are separate; this layer applies whenever the sandbox base is PA.
 */
export function powerArmorFrameIntrinsicEffectMath(): Record<string, number> {
  return { str: 10, carryWeight: 50 };
}

/**
 * Flat DR/ER/RR from chassis (always) plus whichever armor pieces are toggled.
 * Helmet resists apply only when `helmetPieceId` matches the same frame as the torso id.
 */
export function getPowerArmorEquippedFlatStats(
  torsoPieceId: string,
  helmetPieceId: string | null | undefined,
  piecesEquipped: PowerArmorPiecesEquipped | undefined
): ArmorSetStats | null {
  const frameT = powerArmorFrameFromPieceId(torsoPieceId);
  if (!frameT) return null;
  const row = POWER_ARMOR_FRAME_PIECES[frameT];
  if (!row) return null;

  const mask = piecesEquipped ?? DEFAULT_POWER_ARMOR_PIECES_EQUIPPED;
  let acc: ArmorSetStats = { ...POWER_ARMOR_CHASSIS_STATS };

  if (mask[1]) {
    acc = mergeArmorSetStats(acc, row.torso);
  }

  if (mask[0] && helmetPieceId && powerArmorFrameFromPieceId(helmetPieceId) === frameT) {
    acc = mergeArmorSetStats(acc, row.helmet);
  }

  if (mask[2]) acc = mergeArmorSetStats(acc, row.arm);
  if (mask[3]) acc = mergeArmorSetStats(acc, row.arm);
  if (mask[4]) acc = mergeArmorSetStats(acc, row.leg);
  if (mask[5]) acc = mergeArmorSetStats(acc, row.leg);

  return acc;
}

/** @deprecated Prefer {@link getPowerArmorEquippedFlatStats} with an explicit mask. */
export function getPowerArmorCombinedBaseStats(
  torsoPieceId: string,
  helmetPieceId: string | null | undefined
): ArmorSetStats | null {
  return getPowerArmorEquippedFlatStats(torsoPieceId, helmetPieceId, DEFAULT_POWER_ARMOR_PIECES_EQUIPPED);
}

export function defaultHelmetIdForTorsoPieceId(torsoId: string): string | null {
  const frame = powerArmorFrameFromPieceId(torsoId);
  if (!frame || !POWER_ARMOR_FRAME_PIECES[frame]) return null;
  if (torsoId.endsWith("-torso")) return `${frame}-helm`;
  if (torsoId.endsWith("-chest")) return `${frame}-helm`;
  return null;
}

export function isKnownPowerArmorHelmetPieceId(helmetId: string): boolean {
  if (!helmetId.endsWith("-helm")) return false;
  const frame = powerArmorFrameFromPieceId(helmetId);
  return Boolean(frame && POWER_ARMOR_FRAME_PIECES[frame]);
}
