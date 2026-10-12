/**
 * Typed loader for `src/data/truth/unique-items.json`: named unique weapons
 * (Patch 70 "The Slasher" innate-effect rework) and the eight Patch 66
 * Backwoods unique armor pieces with fixed legendary mods.
 *
 * `baseItemId` is the unique's own builder row when `base-gear.ts` has one
 * (e.g. `ticket-to-revenge`), otherwise the base chassis id it is built on
 * (e.g. `railway` for Lickety-Split), or `null` when no builder row matches.
 *
 * `model` is the optional machine-readable form of `innateEffect`, and it is the
 * single source for the unique-innate numbers the combat engine applies
 * (`src/lib/builder/combat-firepower-engine.ts`). An innate only gets a model
 * when its official text carries a number AND the engine already has the input
 * that gates it; everything else stays `model: null` with a `modelNote` saying
 * why, and is shown for reference on the gear card.
 */

import rawUniqueItems from "@/data/truth/unique-items.json";

export type UniqueItemKind = "weapon" | "armor";

/** One modelled innate shape per unique effect the engine can apply. */
export type UniqueEffectKind =
  | "damage-per-crippled-limb"
  | "armor-pen-per-onslaught-stack"
  | "crit-damage-per-onslaught-stack"
  | "power-attack-damage-per-onslaught-stack"
  | "attack-speed-multiplier"
  | "swing-speed-per-addiction"
  | "grants-perk-rank"
  | "bullet-storm-min-stacks"
  | "bullet-storm-bonus-stacks-below-health"
  | "flat-action-points"
  | "weak-spot-damage"
  | "weak-spot-damage-while-aiming"
  | "weak-spot-per-kill-streak"
  | "extra-projectiles"
  | "conditional-damage-buff";

export type UniqueEffectConfidence = "verified" | "datamined" | "approximate";

export type UniqueEffectModel = {
  kind: UniqueEffectKind;
  /** Single magnitude: a multiplier, a flat count or a flat point total — see `kind`. */
  value?: number;
  /** Magnitude added per stack / addiction / crippled limb (fraction, or percentage points for armor pen). */
  perUnit?: number;
  /** Highest number of units counted before the effect stops growing. */
  maxUnits?: number;
  /** Hard ceiling on the accumulated magnitude, same unit as `perUnit`. */
  cap?: number;
  /** Health fraction the effect needs the player to be under (Foundation's Vengeance). */
  healthThreshold?: number;
  /** Perk card a `grants-perk-rank` innate hands out. */
  perkId?: string;
  /** Rank of that perk card. */
  perkRank?: number;
  /** How long a conditional buff lasts once triggered (Love Tap: 30 s). Display only. */
  durationSeconds?: number;
  condition: string;
  confidence: UniqueEffectConfidence;
  source: string;
};

export type UniqueItem = {
  id: string;
  name: string;
  kind: UniqueItemKind;
  baseItemId: string | null;
  /** Exact innate-effect text from the release notes / wiki table. */
  innateEffect: string;
  sourceNotes: string;
  moddable: true;
  fourthStar: true;
  /**
   * True for a builder unique that is not in the Patch 70 official unique table (Cold Shoulder,
   * V63 Zweihänder): its `innateEffect` comes from the client data instead and is not checked
   * against `unique-items-official-p70.json`.
   */
  notInOfficialTable?: true;
  /** Patch that introduced the item in its current form (70 = weapon rework, 66 = Backwoods armor). */
  introducedIn: number;
  /** Armor only: body slot the unique occupies. */
  slot?: string;
  /** Armor only: fixed legendary mods the piece ships with. */
  legendaryMods?: string[];
  /** Machine-readable innate, or `null`/absent when the effect is reference-only. */
  model?: UniqueEffectModel | null;
  /** Why a reference-only innate has no model. */
  modelNote?: string;
  /** Armor only: the body slot the piece occupies. */
  armorSlot?: UniqueArmorSlot;
  /** Armor only: catalog slugs of `legendaryMods`, star 1 first (legendary-mod-catalog-seeds.ts). */
  legendaryModSlugs?: string[];
  /** Armor only: machine-readable innate, or `null` when it is shown as text. */
  armorModel?: UniqueArmorEffectModel | null;
  /** Armor only: why the innate is text only, or what applies it elsewhere. */
  armorModelNote?: string;
};

/** Machine-readable innates of the unique armor pieces (applied by `src/lib/builder/unique-armor.ts`). */
export type UniqueArmorEffectKind = "rage-stacks" | "armor-resist-bonus" | "dr-per-move-speed";

export type UniqueArmorEffectModel = {
  kind: UniqueArmorEffectKind;
  /** `armor-resist-bonus`: fraction added to the piece's own resistances; `dr-per-move-speed`: DR at the top of the curve. */
  value?: number;
  /** `rage-stacks`: damage dealt per stack (fraction). */
  perUnit?: number;
  /** `rage-stacks`: damage taken per stack (fraction). */
  perUnitTaken?: number;
  /** `rage-stacks`: most stacks counted. */
  maxUnits?: number;
  /** `dr-per-move-speed`: movement speed (percent of base) where the bonus is 0. */
  minSpeedPct?: number;
  /** `dr-per-move-speed`: movement speed (percent of base) where the bonus reaches `value` and stops. */
  maxSpeedPct?: number;
  condition: string;
  confidence: UniqueEffectConfidence;
  source: string;
};

/** Armor body slot, payload order: chest, left arm, right arm, left leg, right leg. */
export type UniqueArmorSlot = "chest" | "leftArm" | "rightArm" | "leftLeg" | "rightLeg";

const ARMOR_SLOTS = new Set<string>(["chest", "leftArm", "rightArm", "leftLeg", "rightLeg"]);

const ARMOR_EFFECT_REQUIRED_FIELDS: Record<UniqueArmorEffectKind, readonly string[]> = {
  "rage-stacks": ["perUnit", "perUnitTaken", "maxUnits"],
  "armor-resist-bonus": ["value"],
  "dr-per-move-speed": ["value", "minSpeedPct", "maxSpeedPct"],
};

const ARMOR_EFFECT_NUMERIC_FIELDS = ["value", "perUnit", "perUnitTaken", "maxUnits", "minSpeedPct", "maxSpeedPct"] as const;

const EFFECT_KINDS = new Set<string>([
  "damage-per-crippled-limb",
  "armor-pen-per-onslaught-stack",
  "crit-damage-per-onslaught-stack",
  "power-attack-damage-per-onslaught-stack",
  "attack-speed-multiplier",
  "swing-speed-per-addiction",
  "grants-perk-rank",
  "bullet-storm-min-stacks",
  "bullet-storm-bonus-stacks-below-health",
  "flat-action-points",
  "weak-spot-damage",
  "weak-spot-damage-while-aiming",
  "weak-spot-per-kill-streak",
  "extra-projectiles",
  "conditional-damage-buff",
]);

const EFFECT_CONFIDENCE = new Set<string>(["verified", "datamined", "approximate"]);

const EFFECT_NUMERIC_FIELDS = ["value", "perUnit", "maxUnits", "cap", "healthThreshold", "perkRank", "durationSeconds"] as const;

/** Numeric fields every kind must carry, so a typo fails at import instead of turning damage into NaN. */
const EFFECT_REQUIRED_FIELDS: Record<string, readonly string[]> = {
  "damage-per-crippled-limb": ["perUnit", "maxUnits", "cap"],
  "armor-pen-per-onslaught-stack": ["perUnit", "maxUnits"],
  "crit-damage-per-onslaught-stack": ["perUnit", "maxUnits"],
  "power-attack-damage-per-onslaught-stack": ["perUnit", "maxUnits"],
  "attack-speed-multiplier": ["value"],
  "swing-speed-per-addiction": ["perUnit", "cap"],
  "grants-perk-rank": ["perkId", "perkRank"],
  "bullet-storm-min-stacks": ["value"],
  "bullet-storm-bonus-stacks-below-health": ["value", "healthThreshold"],
  "flat-action-points": ["value"],
  "weak-spot-damage": ["value"],
  "weak-spot-damage-while-aiming": ["value"],
  "weak-spot-per-kill-streak": ["perUnit", "maxUnits"],
  "extra-projectiles": ["value"],
  "conditional-damage-buff": ["value"],
};

function fail(message: string): never {
  throw new Error(`unique-items.json is malformed: ${message}`);
}

/** Armor rows: a real slot, one slug per fixed legendary mod, and a well-formed `armorModel` when present. */
function validateArmorFields(id: string, item: Record<string, unknown>): void {
  if (item.kind !== "armor") {
    if (item.armorSlot !== undefined || item.armorModel !== undefined || item.legendaryModSlugs !== undefined) {
      fail(`"${id}" is not armor but carries armor fields`);
    }
    return;
  }
  if (typeof item.armorSlot !== "string" || !ARMOR_SLOTS.has(item.armorSlot)) {
    fail(`"${id}" has armorSlot "${String(item.armorSlot)}"`);
  }
  const slugs = item.legendaryModSlugs;
  const names = item.legendaryMods;
  if (!Array.isArray(slugs) || !Array.isArray(names) || slugs.length !== names.length) {
    fail(`"${id}" needs one legendaryModSlugs entry per legendaryMods name`);
  }
  if (!(slugs as unknown[]).every((s) => typeof s === "string" && s.length > 0)) {
    fail(`"${id}" has an empty legendary mod slug`);
  }
  if (item.armorModelNote !== undefined && typeof item.armorModelNote !== "string") {
    fail(`"${id}" has a non-string armorModelNote`);
  }
  const model = item.armorModel;
  if (model === null || model === undefined) return;
  if (typeof model !== "object") fail(`"${id}" has a non-object armorModel`);
  const m = model as Record<string, unknown>;
  const required = ARMOR_EFFECT_REQUIRED_FIELDS[m.kind as UniqueArmorEffectKind];
  if (!required) fail(`"${id}" has armorModel kind "${String(m.kind)}"`);
  if (typeof m.condition !== "string" || m.condition.length === 0) fail(`"${id}" has no armorModel condition`);
  if (typeof m.confidence !== "string" || !EFFECT_CONFIDENCE.has(m.confidence)) {
    fail(`"${id}" has armorModel confidence "${String(m.confidence)}"`);
  }
  if (typeof m.source !== "string" || m.source.length === 0) fail(`"${id}" has no armorModel source`);
  for (const field of ARMOR_EFFECT_NUMERIC_FIELDS) {
    const num = m[field];
    if (num === undefined) continue;
    if (typeof num !== "number" || !Number.isFinite(num)) fail(`"${id}" armorModel field "${field}" is not a finite number`);
  }
  for (const field of required) {
    if (m[field] === undefined) fail(`"${id}" armorModel kind "${String(m.kind)}" needs "${field}"`);
  }
}

function validateItems(raw: unknown): UniqueItem[] {
  if (!Array.isArray(raw)) fail("the pack is not an array");

  for (const value of raw as unknown[]) {
    if (!value || typeof value !== "object") fail("an entry is not an object");
    const item = value as Record<string, unknown>;
    const id = typeof item.id === "string" ? item.id : "(no id)";
    validateArmorFields(id, item);

    if (item.model === undefined || item.model === null) {
      if (item.modelNote !== undefined && typeof item.modelNote !== "string") {
        fail(`"${id}" has a non-string modelNote`);
      }
      continue;
    }
    if (typeof item.model !== "object") fail(`"${id}" has a non-object model`);
    const model = item.model as Record<string, unknown>;

    if (typeof model.kind !== "string" || !EFFECT_KINDS.has(model.kind)) {
      fail(`"${id}" has model kind "${String(model.kind)}"`);
    }
    if (typeof model.condition !== "string" || model.condition.length === 0) {
      fail(`"${id}" has no model condition`);
    }
    if (typeof model.confidence !== "string" || !EFFECT_CONFIDENCE.has(model.confidence)) {
      fail(`"${id}" has model confidence "${String(model.confidence)}"`);
    }
    if (typeof model.source !== "string" || model.source.length === 0) {
      fail(`"${id}" has no model source`);
    }
    for (const field of EFFECT_NUMERIC_FIELDS) {
      const num = model[field];
      if (num === undefined) continue;
      if (typeof num !== "number" || !Number.isFinite(num)) {
        fail(`"${id}" model field "${field}" is not a finite number`);
      }
    }
    if (model.perkId !== undefined && (typeof model.perkId !== "string" || model.perkId.length === 0)) {
      fail(`"${id}" model has an empty perkId`);
    }
    for (const field of EFFECT_REQUIRED_FIELDS[model.kind as string]) {
      if (model[field] === undefined) fail(`"${id}" model kind "${model.kind}" needs "${field}"`);
    }
  }

  return raw as UniqueItem[];
}

export const UNIQUE_ITEMS: readonly UniqueItem[] = validateItems(rawUniqueItems);

const BY_ID = new Map<string, UniqueItem>(UNIQUE_ITEMS.map((item) => [item.id, item]));

/** All unique items, optionally filtered by kind. */
export function getUniqueItems(kind?: UniqueItemKind): UniqueItem[] {
  return kind ? UNIQUE_ITEMS.filter((item) => item.kind === kind) : [...UNIQUE_ITEMS];
}

export function getUniqueItemById(id: string): UniqueItem | undefined {
  return BY_ID.get(id);
}

/**
 * First unique whose `baseItemId` matches the given builder/catalog id.
 * Several uniques can share a chassis (e.g. Camden Whacker and Molerat Bat on
 * `baseball-bat`); use `getUniqueItemsByBaseId` for all of them.
 */
export function getUniqueItemByBaseId(baseItemId: string): UniqueItem | undefined {
  return UNIQUE_ITEMS.find((item) => item.baseItemId === baseItemId);
}

export function getUniqueItemsByBaseId(baseItemId: string): UniqueItem[] {
  return UNIQUE_ITEMS.filter((item) => item.baseItemId === baseItemId);
}

/** True when the builder/catalog id has a unique row of its own (scrip ×10, Vault Steel on craft). */
export function isUniqueBaseItem(baseItemId: string): boolean {
  return UNIQUE_ITEMS.some((item) => item.id === baseItemId && item.baseItemId === baseItemId);
}

/**
 * The unique an equipped builder/catalog id IS, or `undefined`.
 *
 * Matching is on the unique's own id only — deliberately never on a shared
 * chassis `baseItemId`, so equipping a plain Baseball Bat does not inherit
 * Molerat Bat's innate. Ids that reach the engine from older payloads may use
 * underscores, so they are normalised first.
 */
export function resolveUniqueForBuilderId(builderItemId: string): UniqueItem | undefined {
  return BY_ID.get(builderItemId.toLowerCase().trim().replace(/_/g, "-"));
}

/** Machine-readable innate of an equipped builder/catalog id, or `null` when it is reference-only. */
export function getUniqueEffectModel(builderItemId: string): UniqueEffectModel | null {
  return resolveUniqueForBuilderId(builderItemId)?.model ?? null;
}

/** Every unique carrying a machine-readable innate. */
export function getModelledUniqueItems(): UniqueItem[] {
  return UNIQUE_ITEMS.filter((item) => item.model != null);
}
