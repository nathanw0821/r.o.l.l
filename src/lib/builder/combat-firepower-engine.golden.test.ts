import { describe, it, expect } from "vitest";
import { calculateCombatFirepower, WEAPON_COMBAT_BASE_CATALOG } from "./combat-firepower-engine";
import { AP_FUZZ_REDUCTIONS, GOLDEN_BUILDS, GOLDEN_DUMMY_IDS } from "./__fixtures__/firepower/builds";
import goldens from "./__fixtures__/firepower/goldens.json";
import apFuzz from "./__fixtures__/firepower/ap-fuzz.json";

/**
 * Golden snapshot net for the combat firepower engine.
 * Every build × dummy result must match the stored fixture exactly. A failure here
 * means a numeric behavior change: regenerate with scripts/gen-firepower-goldens.ts
 * only when the change is intended, and describe it in the commit body.
 */
describe("combat-firepower-engine goldens", () => {
  for (const build of GOLDEN_BUILDS) {
    for (const dummyId of GOLDEN_DUMMY_IDS) {
      it(`${build.id} vs ${dummyId}`, () => {
        const result = calculateCombatFirepower({ ...build.input, targetDummyId: dummyId });
        const expected = (goldens as Record<string, Record<string, unknown>>)[build.id]?.[dummyId];
        expect(expected, "fixture missing: run scripts/gen-firepower-goldens.ts").toBeDefined();
        expect(result).toEqual(expected);
      });
    }
  }

  it("covers the over-cap penetration edge case", () => {
    const result = calculateCombatFirepower({
      ...GOLDEN_BUILDS.find((b) => b.id === "melee-chainsaw-over-cap-penetration")!.input,
      targetDummyId: "earle-williams"
    });
    // Anti-Armor 50% × Incisor 75% × bow bar 35% would be ~92%; the engine cap holds it at 90%.
    expect(result.armorPenetration.effectiveArmorPenetrationPct).toBe(90);
    expect(result.targetDummy.effectiveDR).toBe(40); // 400 DR × (1 − 0.90)
  });

  it("VATS AP cost contract covers every catalog base AP", () => {
    const baseAps = new Set(Object.values(WEAPON_COMBAT_BASE_CATALOG).map((w) => w.baseVatsApCost));
    const contract = apFuzz as Record<string, number>;
    for (const baseAp of baseAps) {
      for (const pct of AP_FUZZ_REDUCTIONS) {
        expect(contract[`${baseAp}|${pct}|none`]).toBeTypeOf("number");
        expect(contract[`${baseAp}|${pct}|lvc`]).toBeTypeOf("number");
      }
    }
  });
});
