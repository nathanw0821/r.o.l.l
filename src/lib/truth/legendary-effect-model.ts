/**
 * Typed loader for `src/data/truth/legendary-effect-model.json`.
 *
 * The pack is the single source for every legendary-effect NUMBER used by the
 * builder maths: the combat engine reads its per-effect models
 * (`src/lib/builder/combat-firepower-engine.ts`) and the catalog seeds derive
 * `effectMath` from the same rows (`src/lib/builder/legendary-mod-catalog-seeds.ts`).
 *
 * Not here on purpose:
 *  - defensive legendary reducers (Bolstering, Vanguard's, Sentinel's, armour
 *    Mutant's, Unstoppable Monster) — `src/data/truth/defensive-perks.json`;
 *  - crit-fill and the mitigation curve — `src/lib/calculator/creation-engine-math.ts`.
 *
 * The pack is hand-validated at module load: a malformed entry throws on import
 * rather than silently feeding NaN into the damage maths.
 */

import rawLegendaryEffectModel from "@/data/truth/legendary-effect-model.json";

export type LegendaryEffectKind =
  | "additive-damage"
  | "conditional-damage"
  | "stack-damage"
  | "armor-pen"
  | "ap-cost-mult"
  | "crit-damage"
  | "flat-resist"
  | "special"
  | "max-hp"
  | "ap-regen"
  | "reducer"
  | "fire-rate-mult"
  | "mag-mult"
  | "explosive-damage";

export type LegendaryEffectAppliesTo = "weapon" | "armor" | "universal";

export type LegendaryEffectConfidence = "verified" | "datamined" | "approximate";

export type LegendaryEffectModel = {
  slug: string;
  star: 1 | 2 | 3 | 4;
  appliesTo: LegendaryEffectAppliesTo;
  kind: LegendaryEffectKind;
  /** Primary magnitude (fraction of base damage, percent, or flat points — see `kind`). */
  value?: number;
  /** Magnitude added per stack / addiction / mutation / crippled limb. */
  perUnit?: number;
  /** Highest number of units counted before the cap applies. */
  maxStacks?: number;
  /** Hard ceiling on the accumulated magnitude, same unit as `value`. */
  cap?: number;
  /** Input level at which the effect starts (Juggernaut's health, Lucid lucidity). */
  threshold?: number;
  /** Input level at which the effect reaches its cap (Aristocrat's caps carried). */
  capThreshold?: number;
  /** Missing-health fraction at which a health-scaled effect reaches its cap (Bloodied). */
  capAtMissingHealth?: number;
  /** Resist key for `flat-resist` entries. */
  resist?: "dr" | "er" | "fr" | "cr" | "pr" | "rr";
  condition: string;
  confidence: LegendaryEffectConfidence;
  source: string;
  /** Verbatim `effectMath` row for the builder catalog seeds. */
  catalogMath?: Record<string, number>;
};

export type LegendaryEffectPack = {
  patch: number;
  verifiedAt: string;
  effects: Record<string, LegendaryEffectModel>;
};

const KINDS = new Set<string>([
  "additive-damage",
  "conditional-damage",
  "stack-damage",
  "armor-pen",
  "ap-cost-mult",
  "crit-damage",
  "flat-resist",
  "special",
  "max-hp",
  "ap-regen",
  "reducer",
  "fire-rate-mult",
  "mag-mult",
  "explosive-damage",
]);

const APPLIES_TO = new Set<string>(["weapon", "armor", "universal"]);
const CONFIDENCE = new Set<string>(["verified", "datamined", "approximate"]);
const RESIST_KEYS = new Set<string>(["dr", "er", "fr", "cr", "pr", "rr"]);

const NUMERIC_FIELDS = [
  "value",
  "perUnit",
  "maxStacks",
  "cap",
  "threshold",
  "capThreshold",
  "capAtMissingHealth",
] as const;

/** Numeric field of a model entry that `requireEffectNumber` can read. */
export type LegendaryEffectNumberField = (typeof NUMERIC_FIELDS)[number];

function fail(message: string): never {
  throw new Error(`legendary-effect-model.json is malformed: ${message}`);
}

function validatePack(raw: unknown): LegendaryEffectPack {
  if (!raw || typeof raw !== "object") fail("the pack is not an object");
  const pack = raw as Record<string, unknown>;

  if (typeof pack.patch !== "number" || !Number.isFinite(pack.patch)) {
    fail("`patch` must be a number");
  }
  if (typeof pack.verifiedAt !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(pack.verifiedAt)) {
    fail("`verifiedAt` must be an ISO date (YYYY-MM-DD)");
  }
  if (!pack.effects || typeof pack.effects !== "object") {
    fail("`effects` must be an object keyed by slug");
  }

  const rawEffects = pack.effects as Record<string, unknown>;
  const effects: Record<string, LegendaryEffectModel> = {};

  for (const [key, value] of Object.entries(rawEffects)) {
    if (!value || typeof value !== "object") fail(`effect "${key}" is not an object`);
    const entry = value as Record<string, unknown>;

    if (entry.slug !== key) fail(`effect "${key}" has slug "${String(entry.slug)}"`);
    if (typeof entry.star !== "number" || ![1, 2, 3, 4].includes(entry.star)) {
      fail(`effect "${key}" has star "${String(entry.star)}" (expected 1-4)`);
    }
    if (typeof entry.appliesTo !== "string" || !APPLIES_TO.has(entry.appliesTo)) {
      fail(`effect "${key}" has appliesTo "${String(entry.appliesTo)}"`);
    }
    if (typeof entry.kind !== "string" || !KINDS.has(entry.kind)) {
      fail(`effect "${key}" has kind "${String(entry.kind)}"`);
    }
    if (typeof entry.condition !== "string" || entry.condition.length === 0) {
      fail(`effect "${key}" has no condition`);
    }
    if (typeof entry.confidence !== "string" || !CONFIDENCE.has(entry.confidence)) {
      fail(`effect "${key}" has confidence "${String(entry.confidence)}"`);
    }
    if (typeof entry.source !== "string" || entry.source.length === 0) {
      fail(`effect "${key}" has no source`);
    }
    if (entry.resist !== undefined && (typeof entry.resist !== "string" || !RESIST_KEYS.has(entry.resist))) {
      fail(`effect "${key}" has resist "${String(entry.resist)}"`);
    }
    if (entry.kind === "flat-resist" && entry.resist === undefined) {
      fail(`effect "${key}" is a flat-resist entry without a resist key`);
    }

    let hasNumber = false;
    for (const field of NUMERIC_FIELDS) {
      const num = entry[field];
      if (num === undefined) continue;
      if (typeof num !== "number" || !Number.isFinite(num)) {
        fail(`effect "${key}" field "${field}" is not a finite number`);
      }
      hasNumber = true;
    }
    if (!hasNumber) fail(`effect "${key}" has no numeric model at all`);

    if (entry.catalogMath !== undefined) {
      if (!entry.catalogMath || typeof entry.catalogMath !== "object") {
        fail(`effect "${key}" has a non-object catalogMath`);
      }
      for (const [mathKey, mathValue] of Object.entries(entry.catalogMath as Record<string, unknown>)) {
        if (typeof mathValue !== "number" || !Number.isFinite(mathValue)) {
          fail(`effect "${key}" catalogMath."${mathKey}" is not a finite number`);
        }
      }
    }

    effects[key] = entry as unknown as LegendaryEffectModel;
  }

  if (Object.keys(effects).length === 0) fail("the pack has no effects");

  return {
    patch: pack.patch as number,
    verifiedAt: pack.verifiedAt as string,
    effects,
  };
}

const PACK = validatePack(rawLegendaryEffectModel);

/** Patch the pack was verified against. */
export const LEGENDARY_EFFECT_MODEL_PATCH: number = PACK.patch;

/** ISO date the pack was last checked against the game / release notes. */
export const LEGENDARY_EFFECT_MODEL_VERIFIED_AT: string = PACK.verifiedAt;

/** Every modelled legendary effect, keyed by catalog slug. */
export const LEGENDARY_EFFECT_MODELS: Readonly<Record<string, LegendaryEffectModel>> = Object.freeze(PACK.effects);

/** All modelled slugs, in pack order. */
export const LEGENDARY_EFFECT_SLUGS: readonly string[] = Object.freeze(Object.keys(PACK.effects));

/** Model row for a slug, or `undefined` when the effect has no numeric model. */
export function getEffectModel(slug: string): LegendaryEffectModel | undefined {
  return PACK.effects[slug];
}

/**
 * Numeric field of a modelled effect. Throws when the effect or the field is
 * missing, so a typo in the engine fails at import time instead of turning a
 * damage number into NaN.
 */
export function requireEffectNumber(slug: string, field: LegendaryEffectNumberField): number {
  const entry = PACK.effects[slug];
  if (!entry) {
    throw new Error(`legendary-effect-model.json has no effect "${slug}"`);
  }
  const value = entry[field];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`legendary-effect-model.json effect "${slug}" has no numeric "${field}"`);
  }
  return value;
}

/**
 * `effectMath` rows for the builder catalog seeds, keyed by slug. Only effects
 * that carry a `catalogMath` block appear; everything else seeds as `{}`.
 */
export function getCatalogEffectMath(): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const [slug, entry] of Object.entries(PACK.effects)) {
    if (entry.catalogMath) out[slug] = { ...entry.catalogMath };
  }
  return out;
}
