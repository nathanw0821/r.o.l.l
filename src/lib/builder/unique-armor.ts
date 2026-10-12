/**
 * Unique armor in the builder: the Backwoods unique pieces of `src/data/truth/unique-items.json`
 * (kind "armor") and the Secret Settler unique set (`ARMOR_SET_ROWS`, key "secret-settler").
 *
 * Data model (per slot, so a per-slot picker needs no migration later):
 *  - `payload.uniqueArmorPieceIds` maps a body slot to the unique worn there, e.g. `{ chest: "bulwark" }`.
 *    The Gear tab offers it as a "Unique chest" / "Unique left arm" choice beside the set.
 *  - A slot whose set key is a unique set (Secret Settler) is locked the same way.
 *  - A locked slot's legendary stars are the piece's fixed mods. They are written into
 *    `armorLegendaryModIds` (catalog slugs) so every existing consumer (aggregate totals, defensive
 *    layer, HUD, card export, firepower engine) reads them like rolled stars; the Gear tab shows the
 *    row read-only and `applyUniqueArmorLocks` re-asserts the slugs after any other edit.
 *  - A unique piece takes its resistances from its base set row (`baseItemId`), one fifth of it,
 *    like a mixed-set slot (`effectiveArmorPieceSetKeys`).
 *
 * Every number comes from `unique-items.json` (`armorModel`) or `defensive-perks.json`; this file only
 * applies them.
 */

import { armorSetKeyFromBasePieceId, getArmorSetRow, type ArmorSetStats } from "@/lib/builder/armor-sets";
import type { ArmorSlot, BuilderPayload, UniqueArmorConditions } from "@/lib/builder/types";
import { getUniqueItems, type UniqueArmorEffectModel } from "@/lib/truth/unique-items";

/** Payload order of the five regular-armor body slots (matches `ARMOR_SET_SLOT_LABELS`). */
export const ARMOR_SLOTS: readonly ArmorSlot[] = ["chest", "leftArm", "rightArm", "leftLeg", "rightLeg"];

export const ARMOR_SLOT_LABEL: Record<ArmorSlot, string> = {
  chest: "Chest",
  leftArm: "Left arm",
  rightArm: "Right arm",
  leftLeg: "Left leg",
  rightLeg: "Right leg",
};

/** Slots the Gear tab offers a unique choice for today (every unique piece is a chest or a left arm). */
export const SELECTABLE_UNIQUE_ARMOR_SLOTS: readonly ArmorSlot[] = ["chest", "leftArm"];

export function armorSlotIndex(slot: ArmorSlot): number {
  return ARMOR_SLOTS.indexOf(slot);
}

export type UniqueArmorPiece = {
  id: string;
  name: string;
  slot: ArmorSlot;
  /** Armor set row the piece is built on (its resistances are one fifth of that row). */
  baseSetKey: string;
  legendaryModNames: readonly string[];
  /** Catalog slugs of the fixed stars, star 1 first. */
  legendaryModSlugs: readonly string[];
  innateEffect: string;
  model: UniqueArmorEffectModel | null;
  modelNote: string | null;
  sourceNotes: string;
};

export const UNIQUE_ARMOR_PIECES: readonly UniqueArmorPiece[] = getUniqueItems("armor").flatMap((item) => {
  const baseSetKey = item.baseItemId ? armorSetKeyFromBasePieceId(item.baseItemId) : null;
  if (!item.armorSlot || !baseSetKey || !getArmorSetRow(baseSetKey) || !item.legendaryModSlugs) return [];
  return [
    {
      id: item.id,
      name: item.name,
      slot: item.armorSlot,
      baseSetKey,
      legendaryModNames: item.legendaryMods ?? [],
      legendaryModSlugs: item.legendaryModSlugs,
      innateEffect: item.innateEffect,
      model: item.armorModel ?? null,
      modelNote: item.armorModelNote ?? null,
      sourceNotes: item.sourceNotes,
    },
  ];
});

const PIECE_BY_ID = new Map(UNIQUE_ARMOR_PIECES.map((piece) => [piece.id, piece]));

export function getUniqueArmorPiece(id: string | null | undefined): UniqueArmorPiece | undefined {
  return id ? PIECE_BY_ID.get(id) : undefined;
}

export function uniqueArmorPiecesForSlot(slot: ArmorSlot): UniqueArmorPiece[] {
  return UNIQUE_ARMOR_PIECES.filter((piece) => piece.slot === slot);
}

function isArmorSlot(value: string): value is ArmorSlot {
  return (ARMOR_SLOTS as readonly string[]).includes(value);
}

/** Keep only `slot -> id` pairs naming a real unique for that slot; `undefined` when none is left. */
export function sanitizeUniqueArmorPieceIds(raw: unknown): Partial<Record<ArmorSlot, string>> | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const out: Partial<Record<ArmorSlot, string>> = {};
  for (const [slot, id] of Object.entries(raw as Record<string, unknown>)) {
    if (!isArmorSlot(slot) || typeof id !== "string") continue;
    if (getUniqueArmorPiece(id)?.slot === slot) out[slot] = id;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function modelOf(id: string): UniqueArmorEffectModel | null {
  return getUniqueArmorPiece(id)?.model ?? null;
}

/** Rage's stack model (`unique-items.json` rage.armorModel). */
export function rageModel(): UniqueArmorEffectModel | null {
  const model = modelOf("rage");
  return model?.kind === "rage-stacks" ? model : null;
}

/** Stand Fast's movement-speed curve (`unique-items.json` stand-fast.armorModel). */
export function standFastModel(): UniqueArmorEffectModel | null {
  const model = modelOf("stand-fast");
  return model?.kind === "dr-per-move-speed" ? model : null;
}

export const DEFAULT_RAGE_STACKS = 0;
/** Base movement speed (100% of base). */
export const DEFAULT_MOVEMENT_SPEED_PCT = 100;

function clampNumber(value: unknown, lo: number, hi: number): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.min(hi, Math.max(lo, value));
}

/** Clamp the inputs to the ranges the models read; `undefined` when both are at their defaults. */
export function sanitizeUniqueArmorConditions(raw: unknown): UniqueArmorConditions | undefined {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return undefined;
  const v = raw as Record<string, unknown>;
  const rage = rageModel();
  const standFast = standFastModel();
  const out: UniqueArmorConditions = {};
  const stacks = clampNumber(v.rageStacks, 0, rage?.maxUnits ?? 0);
  if (stacks !== undefined && Math.round(stacks) !== DEFAULT_RAGE_STACKS) out.rageStacks = Math.round(stacks);
  const speed = clampNumber(
    v.movementSpeedPct,
    standFast?.minSpeedPct ?? DEFAULT_MOVEMENT_SPEED_PCT,
    standFast?.maxSpeedPct ?? DEFAULT_MOVEMENT_SPEED_PCT,
  );
  if (speed !== undefined && Math.round(speed) !== DEFAULT_MOVEMENT_SPEED_PCT) out.movementSpeedPct = Math.round(speed);
  return Object.keys(out).length > 0 ? out : undefined;
}

function isRegularArmorPayload(payload: Pick<BuilderPayload, "equipmentKind" | "armorLegendaryModIds">): boolean {
  return payload.equipmentKind !== "powerArmor" && payload.armorLegendaryModIds.length === ARMOR_SLOTS.length;
}

/** Set key of the regular-armor chassis in the payload, or null (power armor, weapon base). */
export function chassisSetKeyOf(payload: Pick<BuilderPayload, "basePieceId">): string | null {
  return armorSetKeyFromBasePieceId(payload.basePieceId);
}

/** Unique pieces worn on regular armor, in slot order. Power armor wears none. */
export function wornUniqueArmorPieces(
  payload: Pick<BuilderPayload, "equipmentKind" | "armorLegendaryModIds" | "uniqueArmorPieceIds">,
): UniqueArmorPiece[] {
  if (!isRegularArmorPayload(payload)) return [];
  const out: UniqueArmorPiece[] = [];
  for (const slot of ARMOR_SLOTS) {
    const piece = getUniqueArmorPiece(payload.uniqueArmorPieceIds?.[slot]);
    if (piece && piece.slot === slot) out.push(piece);
  }
  return out;
}

export function isWearingUniqueArmor(
  payload: Pick<BuilderPayload, "equipmentKind" | "armorLegendaryModIds" | "uniqueArmorPieceIds">,
  id: string,
): boolean {
  return wornUniqueArmorPieces(payload).some((piece) => piece.id === id);
}

export type ArmorSlotLock = {
  kind: "unique-piece" | "unique-set";
  /** Unique armor id or unique set key. */
  id: string;
  name: string;
  legendaryModSlugs: readonly string[];
};

type LockPayload = Pick<
  BuilderPayload,
  "equipmentKind" | "basePieceId" | "armorLegendaryModIds" | "armorPieceSetKeys" | "uniqueArmorPieceIds"
>;

/**
 * Per regular-armor slot: the fixed stars that slot carries, or null when its stars are rolled.
 * `chassisSetKey` defaults to the payload's base piece (the Gear tab passes the active chassis).
 */
export function armorSlotLocks(payload: LockPayload, chassisSetKey?: string | null): (ArmorSlotLock | null)[] {
  if (!isRegularArmorPayload(payload)) return ARMOR_SLOTS.map(() => null);
  const chassisKey = chassisSetKey === undefined ? chassisSetKeyOf(payload) : chassisSetKey;
  return ARMOR_SLOTS.map((slot, index) => {
    const piece = getUniqueArmorPiece(payload.uniqueArmorPieceIds?.[slot]);
    if (piece && piece.slot === slot) {
      return { kind: "unique-piece", id: piece.id, name: piece.name, legendaryModSlugs: piece.legendaryModSlugs };
    }
    const setKey = payload.armorPieceSetKeys?.[index] || chassisKey;
    const row = setKey ? getArmorSetRow(setKey) : undefined;
    if (row?.unique) {
      return { kind: "unique-set", id: row.key, name: row.label, legendaryModSlugs: row.unique.legendaryModSlugs };
    }
    return null;
  });
}

/** Write every locked slot's fixed stars into the grid. Returns the same object when nothing changes. */
export function applyUniqueArmorLocks<P extends LockPayload>(payload: P, chassisSetKey?: string | null): P {
  const locks = armorSlotLocks(payload, chassisSetKey);
  let grid: (string | null)[][] | null = null;
  for (let index = 0; index < locks.length; index++) {
    const lock = locks[index];
    if (!lock) continue;
    for (let star = 0; star < lock.legendaryModSlugs.length; star++) {
      const slug = lock.legendaryModSlugs[star]!;
      if (payload.armorLegendaryModIds[index]?.[star] === slug) continue;
      grid ??= payload.armorLegendaryModIds.map((r) => [...r]);
      grid[index]![star] = slug;
    }
  }
  return grid ? { ...payload, armorLegendaryModIds: grid } : payload;
}

/**
 * Move from `prev` to `next`: slots that were locked and no longer are (or now hold a different
 * unique) lose the fixed stars they carried, then `next`'s locks are written.
 */
export function transitionUniqueArmorLocks<P extends LockPayload>(
  prev: LockPayload,
  next: P,
  chassisSetKeys?: { prev?: string | null; next?: string | null },
): P {
  if (!isRegularArmorPayload(next)) return next;
  const before = armorSlotLocks(prev, chassisSetKeys?.prev);
  const after = armorSlotLocks(next, chassisSetKeys?.next);
  let grid: (string | null)[][] | null = null;
  for (let index = 0; index < before.length; index++) {
    const lock = before[index];
    if (!lock || after[index]?.id === lock.id) continue;
    for (let star = 0; star < lock.legendaryModSlugs.length; star++) {
      if (next.armorLegendaryModIds[index]?.[star] !== lock.legendaryModSlugs[star]) continue;
      grid ??= next.armorLegendaryModIds.map((r) => [...r]);
      grid[index]![star] = null;
    }
  }
  const cleared = grid ? { ...next, armorLegendaryModIds: grid } : next;
  return applyUniqueArmorLocks(cleared, chassisSetKeys?.next);
}

/** Wear (or with `null`, take off) a unique piece in one slot. */
export function setUniqueArmorPiece(payload: BuilderPayload, slot: ArmorSlot, id: string | null): BuilderPayload {
  const ids: Partial<Record<ArmorSlot, string>> = { ...(payload.uniqueArmorPieceIds ?? {}) };
  if (id && getUniqueArmorPiece(id)?.slot === slot) ids[slot] = id;
  else delete ids[slot];
  const next: BuilderPayload = {
    ...payload,
    uniqueArmorPieceIds: Object.keys(ids).length > 0 ? ids : undefined,
  };
  return transitionUniqueArmorLocks(payload, next);
}

/**
 * Per-slot set keys for the resistance maths: a unique slot uses its piece's base set, every other
 * slot its own key or the chassis set. Without unique pieces the payload's keys pass through unchanged.
 */
export function effectiveArmorPieceSetKeys(
  payload: Pick<BuilderPayload, "equipmentKind" | "basePieceId" | "armorLegendaryModIds" | "armorPieceSetKeys" | "uniqueArmorPieceIds">,
  chassisSetKey?: string | null,
): (string | null)[] | undefined {
  const worn = wornUniqueArmorPieces(payload);
  if (worn.length === 0) return payload.armorPieceSetKeys;
  const chassisKey = chassisSetKey === undefined ? chassisSetKeyOf(payload) : chassisSetKey;
  return ARMOR_SLOTS.map((slot, index) => {
    const piece = worn.find((p) => p.slot === slot);
    if (piece) return piece.baseSetKey;
    return payload.armorPieceSetKeys?.[index] || chassisKey || null;
  });
}

/** Stand Fast DR: linear from 0 at `minSpeedPct` to `value` at `maxSpeedPct`, capped at both ends. */
export function standFastDrBonus(movementSpeedPct: number, model: UniqueArmorEffectModel | null = standFastModel()): number {
  if (!model || model.value === undefined || model.minSpeedPct === undefined || model.maxSpeedPct === undefined) return 0;
  const span = model.maxSpeedPct - model.minSpeedPct;
  if (span <= 0) return 0;
  const t = Math.min(1, Math.max(0, (movementSpeedPct - model.minSpeedPct) / span));
  return Math.round(model.value * t);
}

/** Rage stacks that count: 0 unless Rage is worn, clamped to the model's maximum. */
export function activeRageStacks(
  payload: Pick<BuilderPayload, "equipmentKind" | "armorLegendaryModIds" | "uniqueArmorPieceIds" | "uniqueArmorConditions">,
): number {
  const model = rageModel();
  if (!model || !isWearingUniqueArmor(payload, "rage")) return 0;
  const stacks = payload.uniqueArmorConditions?.rageStacks ?? DEFAULT_RAGE_STACKS;
  return Math.round(Math.min(model.maxUnits ?? 0, Math.max(0, stacks)));
}

/** Extra damage taken from Rage, in percent (e.g. 37 for 37 stacks). */
export function rageDamageTakenPct(
  payload: Pick<BuilderPayload, "equipmentKind" | "armorLegendaryModIds" | "uniqueArmorPieceIds" | "uniqueArmorConditions">,
): number {
  const stacks = activeRageStacks(payload);
  const per = rageModel()?.perUnitTaken ?? 0;
  return Math.round(stacks * per * 1000) / 10;
}

const RESIST_KEYS = ["dr", "er", "fr", "cr", "pr", "rr"] as const;

/**
 * Flat resistance layer of the worn unique pieces for `aggregateEffectMath`: Bulwark's +35% of its
 * own piece's resistances (one fifth of the base set, as the mixed-set maths counts a piece) and
 * Stand Fast's DR from movement speed. `null` when nothing applies.
 */
export function uniqueArmorEffectLayer(
  payload: Pick<BuilderPayload, "equipmentKind" | "armorLegendaryModIds" | "uniqueArmorPieceIds" | "uniqueArmorConditions">,
): Record<string, number> | null {
  const layer: Record<string, number> = {};
  const add = (key: string, value: number) => {
    if (value !== 0) layer[key] = (layer[key] ?? 0) + value;
  };
  for (const piece of wornUniqueArmorPieces(payload)) {
    const model = piece.model;
    if (!model) continue;
    if (model.kind === "armor-resist-bonus" && model.value !== undefined) {
      const stats: ArmorSetStats | undefined = getArmorSetRow(piece.baseSetKey)?.stats;
      if (!stats) continue;
      for (const key of RESIST_KEYS) add(key, Math.round(Math.round(stats[key] / ARMOR_SLOTS.length) * model.value));
    } else if (model.kind === "dr-per-move-speed") {
      const speed = payload.uniqueArmorConditions?.movementSpeedPct ?? DEFAULT_MOVEMENT_SPEED_PCT;
      add("dr", standFastDrBonus(speed, model));
    }
  }
  return Object.keys(layer).length > 0 ? layer : null;
}

/** Grid with every fixed (shipped, not crafted) star removed: the shopping list prices only rolled stars. */
export function stripFixedUniqueArmorStars<P extends LockPayload>(payload: P, chassisSetKey?: string | null): P {
  const locks = armorSlotLocks(payload, chassisSetKey);
  if (locks.every((lock) => !lock)) return payload;
  const grid = payload.armorLegendaryModIds.map((row, index) => {
    const lock = locks[index];
    if (!lock) return [...row];
    return row.map((id, star) => (lock.legendaryModSlugs[star] === id ? null : id));
  });
  return { ...payload, armorLegendaryModIds: grid };
}
