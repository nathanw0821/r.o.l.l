import { describe, it, expect } from "vitest";
import {
  calculateCombatFirepower,
  calculateVatsCritQualification,
  resolveVatsApCost,
  WEAPON_COMBAT_BASE_CATALOG
} from "./combat-firepower-engine";
import { calculateCritFrequency } from "@/lib/calculator/creation-engine-math";
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

  it("crit every-other-shot: engine Luck table vs calculator derivation (100% agreement)", () => {
    // Both engine and calculator agree at every rank (0-3) and Luck value (1-80) with
    // game-verified integer meter rounding (round half-up).
    const disagreements: Record<string, number[]> = {};
    for (const rank of [0, 1, 2, 3]) {
      for (const luckyHit of [false, true]) {
        for (let luck = 1; luck <= 80; luck++) {
          const engine = calculateVatsCritQualification({ luck, critSavvyRank: rank, hasLucky15Fill: luckyHit }).everySecondShotReady;
          const calc = calculateCritFrequency(luck, rank, luckyHit).everyOtherShot;
          if (engine !== calc) (disagreements[`rank${rank}:${luckyHit ? "luckyHit" : "plain"}`] ??= []).push(luck);
        }
      }
    }
    expect(disagreements).toEqual({});
  });

  it("VATS AP cost matches the frozen contract at every catalog base AP", () => {
    const baseAps = new Set(Object.values(WEAPON_COMBAT_BASE_CATALOG).map((w) => w.baseVatsApCost));
    const contract = apFuzz as Record<string, number>;
    const mismatches: string[] = [];
    for (const baseAp of baseAps) {
      for (const pct of AP_FUZZ_REDUCTIONS) {
        for (const lvc of [false, true]) {
          const key = `${baseAp}|${pct}|${lvc ? "lvc" : "none"}`;
          expect(contract[key], key).toBeTypeOf("number");
          const got = resolveVatsApCost(baseAp, pct, lvc);
          if (got !== contract[key]) mismatches.push(`${key}: expected ${contract[key]}, got ${got}`);
        }
      }
    }
    expect(mismatches).toEqual([]);
  });
});
