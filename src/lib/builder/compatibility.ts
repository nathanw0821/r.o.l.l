import {
  ARMOR_SET_SLOT_LABELS,
  armorSetKeyFromBasePieceId,
  type ArmorSetStats
} from "@/lib/builder/armor-sets";
import type { BaseGearPiece } from "@/lib/builder/base-gear";
import { isGhoulBlockedLegendarySlug } from "@/lib/builder/ghoul-legendary-rules";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";

/** Normalize catalog subCategory for comparison (matches site-style labels). */
function normalizeWeaponSubLabel(raw: string | null | undefined): string {
  return (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Align with site filters: ballistic + energy guns share the ranged-style legendary pool;
 * melee stays separate. Unknown / null subCategory matches all weapon bases.
 */
function weaponSubMatches(mod: BuilderModDTO, piece: BaseGearPiece): boolean {
  if (piece.kind !== "weapon") return true;
  const sub = piece.weaponSub;
  const modSub = normalizeWeaponSubLabel(mod.subCategory);
  if (!modSub) return true;
  if (!sub) return true;

  const pieceIsRangedStyle = sub === "ranged" || sub === "energy";
  if (modSub === "ranged" || modSub === "guns" || modSub === "gun" || modSub === "ballistic" || modSub === "heavy") {
    return pieceIsRangedStyle;
  }
  if (modSub === "melee") {
    return sub === "melee";
  }
  if (modSub === "energy") {
    return sub === "energy" || sub === "ranged";
  }
  return modSub === sub;
}

function equipmentAllowsMod(mod: BuilderModDTO, piece: BaseGearPiece): boolean {
  if (piece.kind === "underarmor") return false;
  if (piece.kind === "powerArmor") return mod.allowedOnPowerArmor;
  if (piece.kind === "armor") return mod.allowedOnArmor;
  return mod.allowedOnWeapon;
}

function starMatchesSlot(mod: BuilderModDTO, slotIndex: number): boolean {
  const slotStar = slotIndex + 1;
  if (mod.infestationOnly) return false;
  if (mod.starRank === 5) return false;
  if (mod.fifthStarEligible) return false;
  return mod.starRank === slotStar;
}

/** Mods allowed in `slotIndex` (0-based) for the selected base piece. */
/** MVP weapon–mod sanity checks (extend with DB rules later). */
function baseAllowsMod(pieceId: string, mod: BuilderModDTO): boolean {
  if (pieceId === "gamma-gun" && mod.slug === "explosive") return false;
  return true;
}

export type FilterModsForSlotContext = {
  /** When true, hunger/thirst–gated legendaries are omitted from the picker. */
  ghoul?: boolean;
};

export function filterModsForSlot(
  mods: BuilderModDTO[],
  piece: BaseGearPiece,
  slotIndex: number,
  ctx?: FilterModsForSlotContext
): BuilderModDTO[] {
  if (piece.kind === "underarmor") return [];
  if (piece.kind === "powerArmor" && piece.powerArmorSlot === "helmet") return [];
  return mods.filter((mod) => {
    if (ctx?.ghoul && isGhoulBlockedLegendarySlug(mod.slug)) return false;
    if (!baseAllowsMod(piece.id, mod)) return false;
    if (!equipmentAllowsMod(mod, piece)) return false;
    if (!weaponSubMatches(mod, piece)) return false;
    if (!starMatchesSlot(mod, slotIndex)) return false;
    if (piece.kind === "weapon" && mod.category === "Armor") return false;
    if ((piece.kind === "armor" || piece.kind === "powerArmor") && mod.category === "Weapon") return false;
    return true;
  });
}

export function readEffectMathNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

/** Per-stat SPECIAL keys on `effectMath` (S.P.E.C.I.A.L. order). */
export const BUILDER_SPECIAL_KEYS = ["str", "per", "end", "cha", "int", "agi", "lck"] as const;
export type BuilderSpecialKey = (typeof BUILDER_SPECIAL_KEYS)[number];

export const BUILDER_SPECIAL_LABELS: Record<BuilderSpecialKey, string> = {
  str: "STR",
  per: "PER",
  end: "END",
  cha: "CHA",
  int: "INT",
  agi: "AGI",
  lck: "LCK"
};

function addLayerFromRecord(
  m: Record<string, unknown>,
  acc: {
    dr: number;
    er: number;
    fr: number;
    cr: number;
    pr: number;
    rr: number;
    hp: number;
    damagePct: number;
    str: number;
    per: number;
    end: number;
    cha: number;
    int: number;
    agi: number;
    lck: number;
    specialBonus: number;
    apRegen: number;
    carryWeight: number;
  },
  ghoul: boolean,
  ghoulCap: number | null
) {
  acc.dr += readEffectMathNumber(m.dr);
  acc.er += readEffectMathNumber(m.er);
  acc.fr += readEffectMathNumber(m.fr);
  acc.cr += readEffectMathNumber(m.cr);
  acc.pr += readEffectMathNumber(m.pr);
  acc.rr += readEffectMathNumber(m.rr);
  acc.hp += readEffectMathNumber(m.hp);
  acc.damagePct += readEffectMathNumber(m.damagePct);
  acc.apRegen += readEffectMathNumber(m.apRegen);
  acc.carryWeight += readEffectMathNumber(m.carryWeight);
  acc.str += readEffectMathNumber(m.str);
  acc.per += readEffectMathNumber(m.per);
  acc.end += readEffectMathNumber(m.end);
  acc.cha += readEffectMathNumber(m.cha);
  acc.int += readEffectMathNumber(m.int);
  acc.agi += readEffectMathNumber(m.agi);
  acc.lck += readEffectMathNumber(m.lck);
  let add = readEffectMathNumber(m.specialBonus);
  if (ghoul && ghoulCap != null) {
    add = Math.min(add, ghoulCap);
  }
  acc.specialBonus += add;
}

export type BuilderEffectTotals = {
  dr: number;
  er: number;
  fr: number;
  cr: number;
  pr: number;
  rr: number;
  hp: number;
  damagePct: number;
  str: number;
  per: number;
  end: number;
  cha: number;
  int: number;
  agi: number;
  lck: number;
  /** Legacy roll-up from catalog mods that only expose `specialBonus`. */
  specialBonus: number;
  apRegen: number;
  carryWeight: number;
};

/** Roll up resist / HP hints from `effectMath` blobs (MVP, not full game sim). */
export function aggregateEffectMath(
  mods: BuilderModDTO[],
  opts: {
    ghoul: boolean;
    extraLayers: Record<string, number>[];
    /** Full-set armor table (Nuka Knights Backwoods article). */
    baseArmorStats?: ArmorSetStats | null;
  }
): BuilderEffectTotals {
  const acc: BuilderEffectTotals = {
    dr: 0,
    er: 0,
    fr: 0,
    cr: 0,
    pr: 0,
    rr: 0,
    hp: 0,
    damagePct: 0,
    str: 0,
    per: 0,
    end: 0,
    cha: 0,
    int: 0,
    agi: 0,
    lck: 0,
    specialBonus: 0,
    apRegen: 0,
    carryWeight: 0
  };

  if (opts.baseArmorStats) {
    acc.dr += opts.baseArmorStats.dr;
    acc.er += opts.baseArmorStats.er;
    acc.fr += opts.baseArmorStats.fr;
    acc.cr += opts.baseArmorStats.cr;
    acc.pr += opts.baseArmorStats.pr;
    acc.rr += opts.baseArmorStats.rr;
  }

  for (const mod of mods) {
    if (opts.ghoul && isGhoulBlockedLegendarySlug(mod.slug)) continue;
    addLayerFromRecord(mod.effectMath, acc, opts.ghoul, mod.ghoulSpecialCap);
  }

  for (const layer of opts.extraLayers) {
    addLayerFromRecord(layer, acc, opts.ghoul, null);
  }

  /** Playable ghouls: permanent effective CHA penalty vs human (approximation; perk-card slots unchanged in-game). */
  if (opts.ghoul) {
    acc.cha -= 10;
  }

  return acc;
}

/** Human-readable deltas from one mod's `effectMath` (for UI chips). */
export function formatEffectMathDeltas(effectMath: Record<string, unknown>): string {
  const parts: string[] = [];
  const push = (label: string, n: number, signed = true) => {
    if (!n) return;
    parts.push(signed && n > 0 ? `+${n} ${label}` : `${n} ${label}`);
  };
  push("DR", readEffectMathNumber(effectMath.dr));
  push("ER", readEffectMathNumber(effectMath.er));
  push("FR", readEffectMathNumber(effectMath.fr));
  push("CR", readEffectMathNumber(effectMath.cr));
  push("PR", readEffectMathNumber(effectMath.pr));
  push("RR", readEffectMathNumber(effectMath.rr));
  push("HP", readEffectMathNumber(effectMath.hp));
  for (const key of BUILDER_SPECIAL_KEYS) {
    push(BUILDER_SPECIAL_LABELS[key], readEffectMathNumber(effectMath[key]));
  }
  const dmg = readEffectMathNumber(effectMath.damagePct);
  if (dmg) parts.push(`+${Math.round(dmg * 100)}% dmg`);
  const sp = readEffectMathNumber(effectMath.specialBonus);
  if (sp) parts.push(`+${sp} SPECIAL (other)`);
  const ap = readEffectMathNumber(effectMath.apRegen);
  if (ap) parts.push(`+${Math.round(ap * 100)}% AP regen`);
  push("carry wt", readEffectMathNumber(effectMath.carryWeight));
  return parts.length ? `(${parts.join(" ")})` : "";
}

/** Keys that feed sandbox totals / `formatEffectMathDeltas` (everything else is “extra” for display). */
export const MODELED_EFFECT_MATH_KEYS = new Set<string>([
  "dr",
  "er",
  "fr",
  "cr",
  "pr",
  "rr",
  "hp",
  "damagePct",
  "specialBonus",
  "apRegen",
  "carryWeight",
  ...BUILDER_SPECIAL_KEYS
]);

/** True when any modeled numeric field on `effectMath` is non-zero. */
export function hasModeledLegendaryStats(effectMath: Record<string, unknown>): boolean {
  if (!effectMath || typeof effectMath !== "object") return false;
  for (const key of MODELED_EFFECT_MATH_KEYS) {
    if (readEffectMathNumber(effectMath[key]) !== 0) return true;
  }
  return false;
}

function formatEffectMathExtraScalar(raw: unknown): string {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return "";
    if (Number.isInteger(raw)) return String(raw);
    const t = raw.toFixed(4).replace(/\.?0+$/, "");
    return t || "";
  }
  if (typeof raw === "string") {
    const t = raw.trim();
    return t;
  }
  if (typeof raw === "boolean") return raw ? "on" : "off";
  if (raw === null || raw === undefined) return "";
  try {
    return JSON.stringify(raw);
  } catch {
    return String(raw);
  }
}

/** `effectMath` entries not folded into sandbox totals — list for UI footnotes. */
export function listExtraEffectMathEntries(
  effectMath: Record<string, unknown>
): { key: string; value: string }[] {
  if (!effectMath || typeof effectMath !== "object") return [];
  const out: { key: string; value: string }[] = [];
  for (const [key, raw] of Object.entries(effectMath)) {
    if (MODELED_EFFECT_MATH_KEYS.has(key)) continue;
    const value = formatEffectMathExtraScalar(raw);
    if (!value) continue;
    out.push({ key, value });
  }
  return out;
}

export function isFullArmorSetPayload(payload: BuilderPayload): boolean {
  return payload.equipmentKind === "armor" && Boolean(armorSetKeyFromBasePieceId(payload.basePieceId));
}

/** Distinct legendary mod ids (for DB `where: { id: { in } }`). */
/** Clear star slots whose mods are incompatible with Ghoul mode (catalog slugs). */
export function stripGhoulBlockedLegendarySelections(
  payload: BuilderPayload,
  mods: Pick<BuilderModDTO, "id" | "slug">[]
): BuilderPayload {
  const slugById = new Map(mods.map((m) => [m.id, m.slug]));
  const clear = (id: string | null): string | null => {
    if (!id) return null;
    const slug = slugById.get(id);
    if (slug && isGhoulBlockedLegendarySlug(slug)) return null;
    return id;
  };
  return {
    ...payload,
    legendaryModIds: payload.legendaryModIds.map((id) => clear(id)),
    armorLegendaryModIds: payload.armorLegendaryModIds.map((row) => row.map((id) => clear(id)))
  };
}

export function collectEquippedLegendaryModIds(payload: BuilderPayload): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const push = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    out.push(id);
  };
  if (isFullArmorSetPayload(payload)) {
    for (const row of payload.armorLegendaryModIds) {
      for (const id of row) {
        if (id) push(id);
      }
    }
    return out;
  }
  for (const id of payload.legendaryModIds) {
    if (id) push(id);
  }
  return out;
}

/** Same mod may appear on multiple pieces — order follows bench (row-major). */
export function listEquippedModsInBenchOrder(
  payload: BuilderPayload,
  mods: BuilderModDTO[]
): BuilderModDTO[] {
  const map = new Map(mods.map((m) => [m.id, m]));
  const ids: string[] = [];
  if (isFullArmorSetPayload(payload)) {
    for (const row of payload.armorLegendaryModIds) {
      for (const id of row) {
        if (id) ids.push(id);
      }
    }
  } else {
    for (const id of payload.legendaryModIds) {
      if (id) ids.push(id);
    }
  }
  const out: BuilderModDTO[] = [];
  for (const id of ids) {
    const m = map.get(id);
    if (m) out.push(m);
  }
  return out;
}

const BENCH_STAR_LABELS = ["1st star", "2nd star", "3rd star", "4th star"] as const;

/** One equipped legendary with a short bench location label for UI lists. */
export type EquippedLegendaryBenchLine = {
  mod: BuilderModDTO;
  /** e.g. `Chest · 2nd star` for sets, or `3rd star` for single weapon / PA torso. */
  benchLabel: string;
};

/** Row-major order matches `listEquippedModsInBenchOrder` (full set: five slots × four stars). */
export function listEquippedLegendariesWithBenchLabels(
  payload: BuilderPayload,
  mods: BuilderModDTO[]
): EquippedLegendaryBenchLine[] {
  const byId = new Map(mods.map((m) => [m.id, m]));
  const out: EquippedLegendaryBenchLine[] = [];

  if (isFullArmorSetPayload(payload)) {
    payload.armorLegendaryModIds.forEach((row, pieceIndex) => {
      const slot = ARMOR_SET_SLOT_LABELS[pieceIndex] ?? `Slot ${pieceIndex + 1}`;
      row.forEach((id, starIndex) => {
        if (!id) return;
        const mod = byId.get(id);
        if (!mod) return;
        const star = BENCH_STAR_LABELS[starIndex] ?? `Star ${starIndex + 1}`;
        out.push({ mod, benchLabel: `${slot} · ${star}` });
      });
    });
    return out;
  }

  payload.legendaryModIds.forEach((id, starIndex) => {
    if (!id) return;
    const mod = byId.get(id);
    if (!mod) return;
    const star = BENCH_STAR_LABELS[starIndex] ?? `Star ${starIndex + 1}`;
    out.push({ mod, benchLabel: star });
  });
  return out;
}

export type ShoppingLine = { label: string; count: number };

export function buildShoppingList(mods: BuilderModDTO[]): { modules: number; lines: ShoppingLine[] } {
  let modules = 0;
  const map = new Map<string, number>();

  for (const mod of mods) {
    const cost = mod.craftingCost;
    const modCount = readEffectMathNumber(cost.legendaryModules);
    modules += modCount;
    const items = cost.items;
    if (Array.isArray(items)) {
      for (const row of items) {
        if (!row || typeof row !== "object") continue;
        const name = (row as { name?: string }).name;
        const count = readEffectMathNumber((row as { count?: number }).count);
        if (!name || count <= 0) continue;
        map.set(name, (map.get(name) ?? 0) + count);
      }
    }
  }

  const lines = Array.from(map.entries()).map(([label, count]) => ({ label, count }));
  if (modules > 0) {
    lines.unshift({ label: "Legendary modules (total)", count: modules });
  }
  return { modules, lines };
}
