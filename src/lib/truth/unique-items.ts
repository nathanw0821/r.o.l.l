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
  | "flat-action-points";

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
};

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
]);

const EFFECT_CONFIDENCE = new Set<string>(["verified", "datamined", "approximate"]);

const EFFECT_NUMERIC_FIELDS = ["value", "perUnit", "maxUnits", "cap", "healthThreshold", "perkRank"] as const;

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
};

function fail(message: string): never {
  throw new Error(`unique-items.json is malformed: ${message}`);
}

function validateItems(raw: unknown): UniqueItem[] {
  if (!Array.isArray(raw)) fail("the pack is not an array");

  for (const value of raw as unknown[]) {
    if (!value || typeof value !== "object") fail("an entry is not an object");
    const item = value as Record<string, unknown>;
    const id = typeof item.id === "string" ? item.id : "(no id)";

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
