import { describe, expect, it } from "vitest";

import {
  EXTENDED_LEGENDARY_MOD_SEEDS,
  deriveSeedSlug,
} from "@/lib/builder/legendary-mod-catalog-seeds";
import { FALLBACK_LEGENDARY_EFFECTS } from "@/lib/static-fallback-catalog";
import {
  LEGENDARY_EFFECT_MODELS,
  LEGENDARY_EFFECT_MODEL_PATCH,
  LEGENDARY_EFFECT_MODEL_VERIFIED_AT,
  LEGENDARY_EFFECT_SLUGS,
  getCatalogEffectMath,
  getEffectModel,
  requireEffectNumber,
} from "@/lib/truth/legendary-effect-model";

/**
 * The literal `SPECIAL_MATH_LOOKUP` that lived in
 * `src/lib/builder/legendary-mod-catalog-seeds.ts` before the truth pack owned
 * these numbers. Kept verbatim so the derived object can never drift from the
 * catalog rows it replaced.
 */
const PREVIOUS_SPECIAL_MATH_LOOKUP: Record<string, Record<string, number>> = {
  "anti-armor": { damagePct: 0.12 },
  "bloodied": { damagePct: 0.25 },
  "nocturnal": { per: 4, agi: 4 },
  "overeaters": { hp: 40 },
  "two-shot": { damagePct: 0.25 },
  "unyielding": { specialBonus: 3 },
  "powered": { apRegen: 0.05 },
  "poisoners": { pr: 50 },
  "fireproof": { fr: 50 },
  "warming": { cr: 50 },
  "hazmat": { rr: 50 },
  "rapid": { damagePct: 0.05 },
  "explosive": { damagePct: 0.2 },
  "strength-2": { str: 2 },
  "perception-2": { per: 2 },
  "endurance-2": { end: 2 },
  "charisma-2": { cha: 2 },
  "intelligence-2": { int: 2 },
  "agility-2": { agi: 2 },
  "luck-2": { lck: 2 },
  "strength-3": { str: 3 },
  "perception-3": { per: 3 },
  "endurance-3": { end: 3 },
  "charisma-3": { cha: 3 },
  "intelligence-3": { int: 3 },
  "agility-3": { agi: 3 },
  "luck-3": { lck: 3 },
};

describe("legendary effect truth pack", () => {
  it("is stamped with the patch it was verified against", () => {
    expect(LEGENDARY_EFFECT_MODEL_PATCH).toBe(70);
    expect(LEGENDARY_EFFECT_MODEL_VERIFIED_AT).toBe("2026-09-18");
  });

  it("pins the verified Patch 70 damage numbers", () => {
    expect(requireEffectNumber("bloodied", "cap")).toBe(1.3);
    expect(requireEffectNumber("bloodied", "capAtMissingHealth")).toBe(0.95);
    expect(requireEffectNumber("junkies", "perUnit")).toBe(0.1);
    expect(requireEffectNumber("junkies", "cap")).toBe(1.0);
    expect(requireEffectNumber("two-shot", "value")).toBe(0.75);
    expect(requireEffectNumber("vats-optimized", "value")).toBe(0.65);
    expect(requireEffectNumber("anti-armor", "value")).toBe(50);
    expect(requireEffectNumber("severing", "value")).toBe(0.5);
  });

  it("pins the stacking effects and their stack caps", () => {
    expect(requireEffectNumber("furious", "perUnit")).toBe(0.05);
    expect(requireEffectNumber("furious", "maxStacks")).toBe(9);
    expect(requireEffectNumber("pounders", "perUnit")).toBe(0.1);
    expect(requireEffectNumber("pounders", "maxStacks")).toBe(10);
    expect(requireEffectNumber("mutants", "perUnit")).toBe(0.05);
    expect(requireEffectNumber("mutants", "maxStacks")).toBe(5);
    expect(requireEffectNumber("bullys", "perUnit")).toBe(0.25);
    expect(requireEffectNumber("bullys", "cap")).toBe(1.0);
    expect(requireEffectNumber("adrenal", "perUnit")).toBe(0.1);
    expect(requireEffectNumber("adrenal", "maxStacks")).toBe(10);
  });

  it("pins the conditional weapon effects", () => {
    expect(requireEffectNumber("aristocrats", "value")).toBe(0.5);
    expect(requireEffectNumber("aristocrats", "capThreshold")).toBe(29000);
    expect(requireEffectNumber("nocturnal", "value")).toBe(0.5);
    expect(requireEffectNumber("stalkers", "value")).toBe(1.0);
    expect(requireEffectNumber("hitmans", "value")).toBe(0.25);
    expect(requireEffectNumber("heavy-hitters", "value")).toBe(0.4);
    expect(requireEffectNumber("steady", "value")).toBe(0.25);
    expect(requireEffectNumber("juggernauts", "cap")).toBe(0.25);
    expect(requireEffectNumber("juggernauts", "threshold")).toBe(0.75);
    expect(requireEffectNumber("gourmands", "perUnit")).toBe(0.12);
    expect(requireEffectNumber("lucid", "value")).toBe(0.4);
    expect(requireEffectNumber("lucid", "threshold")).toBe(80);
    expect(requireEffectNumber("pyromaniacs", "value")).toBe(0.5);
    expect(requireEffectNumber("vipers", "value")).toBe(0.5);
    expect(requireEffectNumber("vital", "value")).toBe(0.5);
    expect(requireEffectNumber("rapid", "value")).toBe(1.25);
    expect(requireEffectNumber("quad", "value")).toBe(4);
    expect(requireEffectNumber("explosive", "value")).toBe(0.2);
  });

  it("pins the Patch 66 armour numbers", () => {
    expect(requireEffectNumber("overeaters", "value")).toBe(40);
    expect(getEffectModel("overeaters")?.kind).toBe("max-hp");
    for (const slug of ["poisoners", "fireproof", "warming", "hazmat"]) {
      expect(requireEffectNumber(slug, "value")).toBe(50);
      expect(getEffectModel(slug)?.kind).toBe("flat-resist");
    }
    expect(requireEffectNumber("unyielding", "value")).toBe(3);
    expect(requireEffectNumber("powered", "value")).toBe(0.05);
  });

  it("throws on an unknown slug or a missing numeric field", () => {
    expect(() => requireEffectNumber("not-an-effect", "value")).toThrow(/no effect "not-an-effect"/);
    expect(() => requireEffectNumber("two-shot", "capAtMissingHealth")).toThrow(/no numeric/);
    expect(getEffectModel("not-an-effect")).toBeUndefined();
  });

  it("keys every entry by its own slug and carries a source", () => {
    for (const [slug, entry] of Object.entries(LEGENDARY_EFFECT_MODELS)) {
      expect(entry.slug).toBe(slug);
      expect(entry.source.length).toBeGreaterThan(0);
      expect(["verified", "datamined", "approximate"]).toContain(entry.confidence);
    }
  });

  it("only models slugs that exist in the fallback legendary catalog", () => {
    const catalogSlugs = new Set(FALLBACK_LEGENDARY_EFFECTS.map((row) => deriveSeedSlug(row)));
    const missing = LEGENDARY_EFFECT_SLUGS.filter((slug) => !catalogSlugs.has(slug));
    expect(missing).toEqual([]);
  });

  it("gives each entry the star rank the fallback catalog gives it", () => {
    const catalogStars = new Map(
      FALLBACK_LEGENDARY_EFFECTS.map((row) => [
        deriveSeedSlug(row),
        parseInt(row.tier.label.replace(/\D/g, ""), 10),
      ])
    );
    for (const [slug, entry] of Object.entries(LEGENDARY_EFFECT_MODELS)) {
      expect(catalogStars.get(slug)).toBe(entry.star);
    }
  });
});

describe("catalog effectMath derived from the truth pack", () => {
  it("deep-equals the literal SPECIAL_MATH_LOOKUP it replaced", () => {
    expect(getCatalogEffectMath()).toEqual(PREVIOUS_SPECIAL_MATH_LOOKUP);
  });

  it("seeds the builder catalog rows with those numbers", () => {
    const bySlug = new Map(EXTENDED_LEGENDARY_MOD_SEEDS.map((row) => [row.slug, row]));
    for (const [slug, math] of Object.entries(PREVIOUS_SPECIAL_MATH_LOOKUP)) {
      expect(bySlug.get(slug)?.effectMath, slug).toEqual(math);
    }
    // Effects with no catalogMath block still seed as an empty object.
    expect(bySlug.get("aristocrats")?.effectMath).toEqual({});
  });
});
