import { describe, it, expect } from "vitest";
import {
  calculateCritFrequency,
  calculateEffectiveArmor,
  calculateMitigatedDamage,
  calculatePaperDamage,
  calculateVatsApCost
} from "./creation-engine-math";

/**
 * Golden benchmarks mirrored from `fo76_mechanics_calculator.py` `run_suite()`.
 * Expected values were produced by running the verified Python reference on 2026-09-13.
 */
describe("Creation Engine math — 6 golden benchmarks", () => {
  it("1. Symmetrical mitigation: 100 DMG vs 100 DR delivers ~50%", () => {
    const { finalDamage, damageCoefficientPct } = calculateMitigatedDamage(100, 100);

    expect(damageCoefficientPct).toBeGreaterThanOrEqual(49.9);
    expect(damageCoefficientPct).toBeLessThanOrEqual(50.1);
    expect(damageCoefficientPct).toBe(50.03);
    expect(finalDamage).toBe(50.03);
  });

  it("2. Multiplicative penetration: 300 DR + Anti-Armor 50% + Tank Killer 36% => 96 DR (68%)", () => {
    const { effectiveDr, totalPenetrationPct } = calculateEffectiveArmor(300, [50, 36]);

    // (1 - 0.50) * (1 - 0.36) = 0.32 remaining => 68% total penetration
    expect(totalPenetrationPct).toBe(68);
    expect(effectiveDr).toBe(96);
  });

  it("3. Additive/multiplicative hybrid: base 50, +160% additive, x1.40 x1.10 => 200.2", () => {
    // Commando 60 + Bloodied 80 + Nerd Rage 20 = +160% => 50 * 2.6 = 130
    // Follow Through 40% and Tenderizer 10% multiply => 130 * 1.4 * 1.1 = 200.2
    expect(calculatePaperDamage(50, 160, [40, 10])).toBe(200.2);
  });

  it("4. Luck 33 + Critical Savvy 3 => crit every other shot", () => {
    const result = calculateCritFrequency(33, 3);

    expect(result).toEqual({
      luck: 33,
      critSavvyRank: 3,
      fillPerShotPct: 54.5,
      meterPreservedPct: 55,
      shotsPerCritCycle: 2,
      everyOtherShot: true
    });
  });

  it("5. Earle Williams: 380 paper DMG vs 350 DR (Tank Killer 36%) with 80% flat reduction => 46.12", () => {
    const { effectiveDr, totalPenetrationPct } = calculateEffectiveArmor(350, [36]);
    expect(effectiveDr).toBe(224);
    expect(totalPenetrationPct).toBe(36);

    const { finalDamage, damageCoefficientPct } = calculateMitigatedDamage(380, effectiveDr, 80);
    expect(damageCoefficientPct).toBe(60.68);
    expect(finalDamage).toBe(46.12);
  });

  it("6. Monotonicity across the R >= 1 threshold (anti-cliff): 666 and 1000 DMG vs 100 DR", () => {
    const at666 = calculateMitigatedDamage(666, 100);
    const at1000 = calculateMitigatedDamage(1000, 100);

    // Continuous curve: both sit on the 99% engine cap, delivered damage keeps rising.
    expect(at666).toEqual({ finalDamage: 659.34, damageCoefficientPct: 99 });
    expect(at1000).toEqual({ finalDamage: 990, damageCoefficientPct: 99 });
    expect(at1000.finalDamage).toBeGreaterThan(at666.finalDamage);

    // No regression just below the old cliff either.
    expect(calculateMitigatedDamage(667, 100).finalDamage).toBeGreaterThan(at666.finalDamage);
  });
});

describe("Creation Engine math — reference parity edge cases", () => {
  it("VATS AP cost: 30 AP, -30% mods => 21.0; with 25 LVC => 15.8", () => {
    expect(calculateVatsApCost(30, 30)).toBe(21);
    expect(calculateVatsApCost(30, 30, true)).toBe(15.8);
  });

  it("caps total armor penetration at the 90% engine limit", () => {
    const { effectiveDr, totalPenetrationPct } = calculateEffectiveArmor(100, [50, 50, 50, 50, 50]);
    expect(totalPenetrationPct).toBe(90);
    expect(effectiveDr).toBe(10);
  });

  it("Luck 23 with the 15% crit fill star also reaches every-other-shot", () => {
    expect(calculateCritFrequency(23, 3, true).everyOtherShot).toBe(true);
    expect(calculateCritFrequency(20, 3).shotsPerCritCycle).toBe(3);
  });

  it("returns zero damage for non-positive input and 99% coefficient against zero DR", () => {
    expect(calculateMitigatedDamage(0, 100)).toEqual({ finalDamage: 0, damageCoefficientPct: 0 });
    expect(calculateMitigatedDamage(100, 0).damageCoefficientPct).toBe(99);
    expect(calculateEffectiveArmor(0, [50])).toEqual({ effectiveDr: 0, totalPenetrationPct: 100 });
  });
});
