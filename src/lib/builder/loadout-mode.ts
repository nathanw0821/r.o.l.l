import {
  BASE_GEAR_PIECES,
  getBaseGearPiece,
  type BaseGearPiece,
} from "@/lib/builder/base-gear";
import { defaultArmorPieceCrafting } from "@/lib/builder/armor-piece-mods";
import { emptyArmorLegendaryGrid } from "@/lib/builder/normalize-builder-payload";
import {
  DEFAULT_POWER_ARMOR_PIECES_EQUIPPED,
  type BuilderArmorPieceCrafting,
  type BuilderPayload,
  type BuilderPowerArmorHelmetCrafting,
  type PowerArmorPiecesEquipped,
} from "@/lib/builder/types";

/**
 * Armor mode of the Gear tab: the chassis is either a regular 5-piece armor set (with underarmor)
 * or a power armor frame (which removes both). The mode is derived from the active chassis; the
 * snapshots below let the Bay switch modes without throwing the other loadout away.
 */
export type ArmorMode = "regular" | "powerArmor";

export const ARMOR_MODE_LABEL: Record<ArmorMode, string> = {
  regular: "Regular armor",
  powerArmor: "Power armor",
};

export function armorModeOf(chassis: Pick<BaseGearPiece, "kind">): ArmorMode {
  return chassis.kind === "powerArmor" ? "powerArmor" : "regular";
}

/** Everything the regular-armor bay edits that the power-armor bay would otherwise overwrite. */
export type RegularLoadoutSnapshot = {
  chassisId: string;
  armorPieceSetKeys?: (string | null)[];
  armorLegendaryModIds: (string | null)[][];
  armorPieceCrafting: BuilderArmorPieceCrafting[];
};

/** Everything the power-armor bay edits that the regular bay would otherwise overwrite. */
export type PowerArmorLoadoutSnapshot = {
  frameId: string;
  armorLegendaryModIds: (string | null)[][];
  armorPieceCrafting: BuilderArmorPieceCrafting[];
  powerArmorHelmetId: string | null;
  powerArmorHelmetCrafting: BuilderPowerArmorHelmetCrafting;
  powerArmorPiecesEquipped: PowerArmorPiecesEquipped;
};

export function snapshotRegularLoadout(
  payload: BuilderPayload,
  chassisId: string,
): RegularLoadoutSnapshot {
  return {
    chassisId,
    armorPieceSetKeys: payload.armorPieceSetKeys ? [...payload.armorPieceSetKeys] : undefined,
    armorLegendaryModIds: payload.armorLegendaryModIds.map((row) => [...row]),
    armorPieceCrafting: payload.armorPieceCrafting.map((row) => ({ ...row })),
  };
}

export function snapshotPowerArmorLoadout(
  payload: BuilderPayload,
  frameId: string,
): PowerArmorLoadoutSnapshot {
  return {
    frameId,
    armorLegendaryModIds: payload.armorLegendaryModIds.map((row) => [...row]),
    armorPieceCrafting: payload.armorPieceCrafting.map((row) => ({ ...row })),
    powerArmorHelmetId: payload.powerArmorHelmetId,
    powerArmorHelmetCrafting: { ...payload.powerArmorHelmetCrafting },
    powerArmorPiecesEquipped: [...payload.powerArmorPiecesEquipped] as unknown as PowerArmorPiecesEquipped,
  };
}

/** First armor set in the catalog: the Bay's fallback when no regular loadout was ever built. */
export function defaultChassisIdForMode(mode: ArmorMode): string {
  const kind = mode === "powerArmor" ? "powerArmor" : "armor";
  const first = BASE_GEAR_PIECES.find((p) => p.kind === kind);
  if (!first) throw new Error(`No base gear piece of kind ${kind}`);
  return first.id;
}

/**
 * Payload after equipping an armor set or a power armor frame as the chassis.
 *
 * An armor set resets the per-slot mixed-set keys to five copies of the new set: the Bay's slot
 * dropdowns and `aggregateEffectMath` (which prefers `armorPieceSetKeys` over the frame's stats)
 * then agree with the frame. Before this the keys, once touched, silently outranked any set picked
 * later.
 */
export function applyChassisSelection(payload: BuilderPayload, next: BaseGearPiece): BuilderPayload {
  if (next.kind !== "armor" && next.kind !== "powerArmor") return payload;
  const isNextPA = next.kind === "powerArmor";
  const slotCount = isNextPA ? 6 : 5;
  return {
    ...payload,
    basePieceId: next.id,
    equipmentKind: next.kind,
    armorLegendaryModIds:
      payload.armorLegendaryModIds.length === slotCount
        ? payload.armorLegendaryModIds
        : emptyArmorLegendaryGrid(isNextPA),
    armorPieceCrafting:
      payload.armorPieceCrafting.length === slotCount
        ? payload.armorPieceCrafting
        : defaultArmorPieceCrafting(isNextPA),
    armorPieceSetKeys: isNextPA
      ? payload.armorPieceSetKeys
      : next.armorSetKey
        ? Array.from({ length: 5 }, () => next.armorSetKey as string)
        : undefined,
    powerArmorHelmetId: isNextPA ? payload.powerArmorHelmetId : null,
    powerArmorPiecesEquipped: isNextPA
      ? payload.powerArmorPiecesEquipped
      : DEFAULT_POWER_ARMOR_PIECES_EQUIPPED,
  };
}

/** Restore a regular loadout (chassis + its per-slot state) on top of `payload`. */
export function applyRegularSnapshot(
  payload: BuilderPayload,
  snap: RegularLoadoutSnapshot,
): BuilderPayload {
  const chassis = getBaseGearPiece(snap.chassisId);
  const base = chassis && chassis.kind === "armor"
    ? applyChassisSelection(payload, chassis)
    : applyChassisSelection(payload, getBaseGearPiece(defaultChassisIdForMode("regular"))!);
  return {
    ...base,
    armorPieceSetKeys: snap.armorPieceSetKeys ?? base.armorPieceSetKeys,
    armorLegendaryModIds:
      snap.armorLegendaryModIds.length === 5 ? snap.armorLegendaryModIds : base.armorLegendaryModIds,
    armorPieceCrafting:
      snap.armorPieceCrafting.length === 5 ? snap.armorPieceCrafting : base.armorPieceCrafting,
  };
}

/** Restore a power armor loadout (frame + pieces) on top of `payload`. */
export function applyPowerArmorSnapshot(
  payload: BuilderPayload,
  snap: PowerArmorLoadoutSnapshot,
): BuilderPayload {
  const frame = getBaseGearPiece(snap.frameId);
  const base = frame && frame.kind === "powerArmor"
    ? applyChassisSelection(payload, frame)
    : applyChassisSelection(payload, getBaseGearPiece(defaultChassisIdForMode("powerArmor"))!);
  return {
    ...base,
    armorLegendaryModIds:
      snap.armorLegendaryModIds.length === 6 ? snap.armorLegendaryModIds : base.armorLegendaryModIds,
    armorPieceCrafting:
      snap.armorPieceCrafting.length === 6 ? snap.armorPieceCrafting : base.armorPieceCrafting,
    powerArmorHelmetId: snap.powerArmorHelmetId,
    powerArmorHelmetCrafting: snap.powerArmorHelmetCrafting,
    powerArmorPiecesEquipped: snap.powerArmorPiecesEquipped,
  };
}

/** How many of the six power armor attach points are filled. */
export function powerArmorSetCompletion(payload: BuilderPayload): { equipped: number; total: 6 } {
  return {
    equipped: payload.powerArmorPiecesEquipped.filter(Boolean).length,
    total: 6,
  };
}

/** The base-gear id of the underarmor shell currently worn, for the ledger's IN BAY badge. */
export function underarmorBasePieceIdForShell(shellId: string | null | undefined): string | null {
  if (!shellId) return null;
  return BASE_GEAR_PIECES.find((p) => p.kind === "underarmor" && p.defaultUnderarmorShellId === shellId)?.id ?? null;
}
