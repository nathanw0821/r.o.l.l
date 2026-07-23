import {
  ARMOR_SET_SLOT_LABELS,
  armorSetKeyFromBasePieceId,
  type ArmorSetStats
} from "@/lib/builder/armor-sets";
import { type BaseGearPiece, getBaseGearPiece } from "@/lib/builder/base-gear";
import { isGhoulBlockedLegendarySlug } from "@/lib/builder/ghoul-legendary-rules";
import type { BuilderModDTO, BuilderPayload } from "@/lib/builder/types";
import { UNDERARMOR_STYLES } from "@/lib/builder/underarmor";

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
  if (piece.kind === "powerArmor") {
    if (mod.slug === "unyielding") return true;
    return mod.allowedOnPowerArmor;
  }
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
  // Helmets in PA/Armor are handled by the grid UI disabling stars, 
  // but we keep the equipment check for safety.
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

export const SPECIAL_FULL_NAMES: Record<string, string> = {
  str: "Strength",
  per: "Perception",
  end: "Endurance",
  cha: "Charisma",
  int: "Intelligence",
  agi: "Agility",
  lck: "Luck"
};

export const RESIST_FULL_NAMES: Record<string, string> = {
  dr: "Damage Resistance",
  er: "Energy Resistance",
  fr: "Fire Resistance",
  cr: "Cryo Resistance",
  pr: "Poison Resistance",
  rr: "Radiation Resistance"
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

export type LegendaryPerkDef = {
  id: string;
  label: string;
  category: "special" | "combat" | "utility";
  desc: string;
  specialBonus?: Partial<Record<BuilderSpecialKey, number>>;
  resBonus?: Partial<Record<"fr" | "pr" | "dr" | "er" | "rr" | "cr", number>>;
};

export const LEGENDARY_PERK_CARDS: Record<string, LegendaryPerkDef> = {
  // SPECIAL Attribute Cards (7)
  "legendary-strength": { id: "legendary-strength", label: "Legendary Strength (+5)", category: "special", desc: "+5 Strength & +5 Perk Points", specialBonus: { str: 5 } },
  "legendary-perception": { id: "legendary-perception", label: "Legendary Perception (+5)", category: "special", desc: "+5 Perception & +5 Perk Points", specialBonus: { per: 5 } },
  "legendary-endurance": { id: "legendary-endurance", label: "Legendary Endurance (+5)", category: "special", desc: "+5 Endurance & +5 Perk Points", specialBonus: { end: 5 } },
  "legendary-charisma": { id: "legendary-charisma", label: "Legendary Charisma (+5)", category: "special", desc: "+5 Charisma & +5 Perk Points", specialBonus: { cha: 5 } },
  "legendary-intelligence": { id: "legendary-intelligence", label: "Legendary Intelligence (+5)", category: "special", desc: "+5 Intelligence & +5 Perk Points", specialBonus: { int: 5 } },
  "legendary-agility": { id: "legendary-agility", label: "Legendary Agility (+5)", category: "special", desc: "+5 Agility & +5 Perk Points", specialBonus: { agi: 5 } },
  "legendary-luck": { id: "legendary-luck", label: "Legendary Luck (+5)", category: "special", desc: "+5 Luck & +5 Perk Points", specialBonus: { lck: 5 } },

  // Combat & Damage Cards (9)
  "blood-sacrifice": { id: "blood-sacrifice", label: "Blood Sacrifice", category: "combat", desc: "Teammates gain +40 DR & heal over 10s upon your death", resBonus: { dr: 40 } },
  "collateral-damage": { id: "collateral-damage", label: "Collateral Damage", category: "combat", desc: "Melee kills have a 20% chance to cause an explosion" },
  "detonation-contagion": { id: "detonation-contagion", label: "Detonation Contagion", category: "combat", desc: "Thrown explosive kills have a 20% chance to cause an explosion" },
  "exploding-palm": { id: "exploding-palm", label: "Exploding Palm", category: "combat", desc: "Unarmed attacks have a 20% chance to trigger an explosion" },
  "far-flung-fireworks": { id: "far-flung-fireworks", label: "Far-Flung Fireworks", category: "combat", desc: "Ranged kills have a 20% chance to cause an explosion" },
  "follow-through": { id: "follow-through", label: "Follow Through", category: "combat", desc: "Ranged sneak attacks increase target damage taken by 40% for 10s" },
  "hack-and-slash": { id: "hack-and-slash", label: "Hack and Slash", category: "combat", desc: "Melee VATS attacks have a 50% chance to deal area damage" },
  "retribution": { id: "retribution", label: "Retribution", category: "combat", desc: "Blocking a melee attack restores 40 HP & 40 AP" },
  "taking-one-for-the-team": { id: "taking-one-for-the-team", label: "Taking One for the Team", category: "combat", desc: "Enemies take +40% damage when attacking you on a team" },

  // Utility & Survival Cards (10)
  "ammo-factory": { id: "ammo-factory", label: "Ammo Factory", category: "utility", desc: "Produce +150% more rounds when crafting ammo" },
  "brawling-chemist": { id: "brawling-chemist", label: "Brawling Chemist", category: "utility", desc: "Generates 1 combat-enhancing chem every 40 seconds" },
  "electric-absorption": { id: "electric-absorption", label: "Electric Absorption", category: "utility", desc: "20% chance energy attacks recharge PA Fusion Core & heal HP" },
  "funky-duds": { id: "funky-duds", label: "Funky Duds (+200 PR)", category: "utility", desc: "+200 Poison Resistance with matching armor set", resBonus: { pr: 200 } },
  "master-infiltrator": { id: "master-infiltrator", label: "Master Infiltrator", category: "utility", desc: "Auto-unlock lvl 3 locks & terminals (+3 Lockpick & Hack)" },
  "nuclear-prolificator": { id: "nuclear-prolificator", label: "Nuclear Prolificator", category: "utility", desc: "Generates 1 Mini Nuke every 60 seconds" },
  "power-armor-reboot": { id: "power-armor-reboot", label: "Power Armor Reboot", category: "utility", desc: "40% chance to auto-revive with full health in PA" },
  "power-sprinter": { id: "power-sprinter", label: "Power Sprinter", category: "utility", desc: "Sprinting in PA consumes 50% less AP" },
  "sizzling-style": { id: "sizzling-style", label: "Sizzling Style (+200 FR)", category: "utility", desc: "+200 Fire Resistance with matching armor set", resBonus: { fr: 200 } },
  "survival-shortcut": { id: "survival-shortcut", label: "Survival Shortcut", category: "utility", desc: "Generates 1 Survival Syringe every 15 minutes" },
};

/** Roll up resist / HP hints from `effectMath` blobs (MVP, not full game sim). */
export function aggregateEffectMath(
  mods: BuilderModDTO[],
  opts: {
    ghoul: boolean;
    extraLayers: Record<string, number>[];
    /** Full-set armor table (Nuka Knights Backwoods article). */
    baseArmorStats?: ArmorSetStats | null;
    baseSpecial?: Record<string, number>;
    legendaryPerkIds?: string[];
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
    carryWeight: 0,
  };

  if (opts.baseArmorStats) {
    acc.dr += opts.baseArmorStats.dr;
    acc.er += opts.baseArmorStats.er;
    acc.fr += opts.baseArmorStats.fr;
    acc.cr += opts.baseArmorStats.cr;
    acc.pr += opts.baseArmorStats.pr;
    acc.rr += opts.baseArmorStats.rr;
  }

  if (opts.baseSpecial) {
    acc.str += opts.baseSpecial.str || 0;
    acc.per += opts.baseSpecial.per || 0;
    acc.end += opts.baseSpecial.end || 0;
    acc.cha += opts.baseSpecial.cha || 0;
    acc.int += opts.baseSpecial.int || 0;
    acc.agi += opts.baseSpecial.agi || 0;
    acc.lck += opts.baseSpecial.lck || 0;
  }

  if (opts.legendaryPerkIds) {
    for (const id of opts.legendaryPerkIds) {
      const perk = LEGENDARY_PERK_CARDS[id];
      if (perk) {
        if (perk.specialBonus) {
          acc.str += perk.specialBonus.str || 0;
          acc.per += perk.specialBonus.per || 0;
          acc.end += perk.specialBonus.end || 0;
          acc.cha += perk.specialBonus.cha || 0;
          acc.int += perk.specialBonus.int || 0;
          acc.agi += perk.specialBonus.agi || 0;
          acc.lck += perk.specialBonus.lck || 0;
        }
        if (perk.resBonus) {
          if (perk.resBonus.dr) acc.dr += perk.resBonus.dr;
          if (perk.resBonus.er) acc.er += perk.resBonus.er;
          if (perk.resBonus.fr) acc.fr += perk.resBonus.fr;
          if (perk.resBonus.cr) acc.cr += perk.resBonus.cr;
          if (perk.resBonus.pr) acc.pr += perk.resBonus.pr;
          if (perk.resBonus.rr) acc.rr += perk.resBonus.rr;
        }
      }
    }
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

export function isMultiPiecePayload(payload: BuilderPayload): boolean {
  if (payload.equipmentKind === "armor" && Boolean(armorSetKeyFromBasePieceId(payload.basePieceId))) return true;
  if (payload.equipmentKind === "powerArmor") {
    const piece = getBaseGearPiece(payload.basePieceId);
    return Boolean(piece && piece.powerArmorSlot !== "helmet");
  }
  return false;
}

/** @deprecated Use isMultiPiecePayload */
export const isFullArmorSetPayload = isMultiPiecePayload;

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
  if (isMultiPiecePayload(payload)) {
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
  if (isMultiPiecePayload(payload)) {
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

  if (isMultiPiecePayload(payload)) {
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

import {
  STAR_MODULE_COSTS,
  getBaseRandomizeModuleCost,
  calculateCraftingLogistics,
} from "@/lib/builder/crafting-costs";

export type ShoppingLine = { label: string; count: number };

export function buildShoppingList(
  mods: BuilderModDTO[],
  opts?: {
    underarmor?: { shellId?: string | null; liningId?: string | null; styleId?: string | null };
    pieceKind?: string;
    isMultiPiece?: boolean;
  }
): { modules: number; lines: ShoppingLine[] } {
  let modBoxModules = 0;
  let maxStarRank = 0;
  const map = new Map<string, number>();

  for (const mod of mods) {
    if (mod.starRank > maxStarRank) maxStarRank = mod.starRank;
    const cost = mod.craftingCost;
    const modCount = readEffectMathNumber(cost?.legendaryModules) || STAR_MODULE_COSTS[mod.starRank] || 15;
    modBoxModules += modCount;

    const items = cost?.items;
    if (Array.isArray(items) && items.length > 0) {
      for (const row of items) {
        if (!row || typeof row !== "object") continue;
        const name = (row as { name?: string }).name;
        const count = readEffectMathNumber((row as { count?: number }).count);
        if (!name || count <= 0) continue;
        map.set(name, (map.get(name) ?? 0) + count);
      }
    } else if (mod.extraComponent) {
      // Parse extraComponent strings like "1 Adrenal Reaction Serum" or "1 Bloodbug Proboscis"
      const parts = mod.extraComponent.split(/;|,|•/);
      for (const part of parts) {
        const trimmed = part.trim();
        if (!trimmed) continue;
        const match = /^(\d+)\s*x?\s*(.+)$/i.exec(trimmed);
        if (match) {
          const count = parseInt(match[1], 10) || 1;
          const name = match[2].trim();
          map.set(name, (map.get(name) ?? 0) + count);
        } else {
          map.set(trimmed, (map.get(trimmed) ?? 0) + 1);
        }
      }
    }
  }

  // Calculate logistics (Modules + Scrip)
  const logistics = calculateCraftingLogistics(mods.length, modBoxModules, {
    isMultiPiece: opts?.isMultiPiece,
    pieceCount: 5,
    maxStarRank,
  });

  // Underarmor Linings & Styles Requirements
  if (opts?.underarmor) {
    const { liningId, styleId } = opts.underarmor;
    if (liningId && liningId !== "none") {
      if (liningId === "shielded") {
        map.set("Ballistic Fiber", (map.get("Ballistic Fiber") ?? 0) + 11);
        map.set("Adhesive", (map.get("Adhesive") ?? 0) + 15);
        map.set("Circuitry", (map.get("Circuitry") ?? 0) + 12);
        map.set("Pure Cobalt Flux", (map.get("Pure Cobalt Flux") ?? 0) + 4);
      } else if (liningId === "protective") {
        map.set("Ballistic Fiber", (map.get("Ballistic Fiber") ?? 0) + 9);
        map.set("Adhesive", (map.get("Adhesive") ?? 0) + 12);
        map.set("Circuitry", (map.get("Circuitry") ?? 0) + 10);
        map.set("Pure Cobalt Flux", (map.get("Pure Cobalt Flux") ?? 0) + 2);
      } else if (liningId === "resistant") {
        map.set("Ballistic Fiber", (map.get("Ballistic Fiber") ?? 0) + 7);
        map.set("Adhesive", (map.get("Adhesive") ?? 0) + 9);
        map.set("Circuitry", (map.get("Circuitry") ?? 0) + 8);
      } else if (liningId === "treated") {
        map.set("Ballistic Fiber", (map.get("Ballistic Fiber") ?? 0) + 4);
        map.set("Adhesive", (map.get("Adhesive") ?? 0) + 6);
      } else if (liningId === "standard") {
        map.set("Ballistic Fiber", (map.get("Ballistic Fiber") ?? 0) + 2);
        map.set("Adhesive", (map.get("Adhesive") ?? 0) + 3);
      }
    }

    if (styleId && styleId !== "none") {
      const styleObj = UNDERARMOR_STYLES.find((s) => s.id === styleId);
      const styleName = styleObj ? styleObj.label.split(" (")[0] : "Underarmor Style Plan";
      map.set(`Plan: ${styleName}`, (map.get(`Plan: ${styleName}`) ?? 0) + 1);
      map.set("Adhesive", (map.get("Adhesive") ?? 0) + 15);
      map.set("Rubber", (map.get("Rubber") ?? 0) + 10);
    }
  }

  // Base Gear Crafting Scraps
  const pieceCount = opts?.isMultiPiece ? 5 : 1;
  if (opts?.pieceKind !== "weapon") {
    map.set("Ballistic Fiber", (map.get("Ballistic Fiber") ?? 0) + 10 * pieceCount);
    map.set("Screws", (map.get("Screws") ?? 0) + 8 * pieceCount);
    map.set("Springs", (map.get("Springs") ?? 0) + 6 * pieceCount);
    map.set("Steel", (map.get("Steel") ?? 0) + 20 * pieceCount);
    map.set("Leather", (map.get("Leather") ?? 0) + 6 * pieceCount);
  } else {
    map.set("Steel", (map.get("Steel") ?? 0) + 25);
    map.set("Screws", (map.get("Screws") ?? 0) + 10);
    map.set("Wood / Plastic", (map.get("Wood / Plastic") ?? 0) + 15);
  }

  const lines = Array.from(map.entries())
    .filter(([label]) => {
      const lower = label.toLowerCase();
      return lower !== "legendary module" && lower !== "legendary modules";
    })
    .map(([label, count]) => ({ label, count }));

  if (logistics.legendaryModules > 0) {
    lines.unshift({ label: "Legendary modules (total)", count: logistics.legendaryModules });
    if (logistics.baseRandomizeModules > 0) {
      const feePerPiece = getBaseRandomizeModuleCost(maxStarRank);
      lines.unshift({ label: `Base random roll modules (${feePerPiece}/pc)`, count: logistics.baseRandomizeModules });
    }
  }

  if (logistics.legendaryScrip > 0) {
    lines.unshift({ label: "Legendary Scrip (mod application fee)", count: logistics.legendaryScrip });
  }

  return { modules: logistics.legendaryModules, lines };
}
