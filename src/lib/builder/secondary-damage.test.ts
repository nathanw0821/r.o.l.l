import { describe, it, expect } from "vitest";
import { calculateCombatFirepower, interpolateByInt, WEAPON_COMBAT_BASE_CATALOG, type CombatFirepowerCalculationInput } from "./combat-firepower-engine";
import truth from "@/data/truth/combat-conditions.json";

/**
 * Secondary damage (catalog `secondaryDamage`), rule in combat-conditions.json `secondaryDamage`:
 * a second base that takes the shared additive pool (with the INT damage-type perk of its own
 * type) and the Tenderizer debuff, no body-part multiplier, no crit bonus, no explosive fraction.
 */
type Stats = CombatFirepowerCalculationInput["playerStats"];
const STATS: Stats = { agility: 10, luck: 10, strength: 0, healthPct: 1 };
const input = (over: Partial<CombatFirepowerCalculationInput> = {}, stats: Partial<Stats> = {}): CombatFirepowerCalculationInput => ({
  weaponId: "cremator",
  equippedMods: [],
  equippedPerks: [],
  targetDummyId: "raw-unarmored",
  ...over,
  playerStats: { ...STATS, ...stats },
});
const run = (over: Partial<CombatFirepowerCalculationInput> = {}, stats: Partial<Stats> = {}) => calculateCombatFirepower(input(over, stats));
const CREMATOR = WEAPON_COMBAT_BASE_CATALOG.cremator;

describe("secondary damage", () => {
  it("the truth pack documents the rule and calls it approximate", () => {
    expect(truth.secondaryDamage.rule).toMatch(/second BASE/);
    expect(truth.secondaryDamage.rule).toMatch(/no body-part/);
    expect(truth.secondaryDamage.rule).toMatch(/no V\.A\.T\.S\. critical bonus/);
    expect(truth.secondaryDamage.confidence).toBe("approximate");
  });

  it("weapons without a secondary number report none and gain no line", () => {
    const fixer = run({ weaponId: "the-fixer" });
    expect(fixer.damagePerShot.secondary).toBeUndefined();
    expect("secondary" in fixer.damagePerShot).toBe(false);
    expect(fixer.damagePerShot.breakdown.some((b) => b.source.startsWith("Secondary"))).toBe(false);
  });

  it("Cremator: 80 fire impact + 140 fire burn add into the normal shot as their own line", () => {
    const r = run();
    expect(CREMATOR.secondaryDamage).toBe(140);
    expect(r.damagePerShot.secondary).toBe(140);
    expect(r.damagePerShot.normal).toBe(80 + 140);
    expect(r.damagePerShot.breakdown).toContainEqual({
      source: "Secondary fire damage (140 base, same additive pool, no body-part or crit multiplier)",
      value: "+140",
    });
  });

  it("the secondary takes the shared additive pool (Two Shot +75 %), each base rounded once", () => {
    const r = run({ equippedMods: [{ slug: "two-shot" }] });
    expect(r.damagePerShot.secondary).toBe(Math.round(140 * 1.75));
    expect(r.damagePerShot.normal).toBe(Math.round(80 * 1.75) + Math.round(140 * 1.75));
  });

  it("the crit bonus and the explosive fraction stay on the primary base", () => {
    const plain = run();
    const twoShot = run({ equippedMods: [{ slug: "two-shot" }] });
    for (const r of [plain, twoShot]) {
      // Base crit = +100 % of the primary base; nothing of the 140 burn is in it.
      expect(r.damagePerShot.critical - r.damagePerShot.normal - r.damagePerShot.explosiveBonus).toBe(80);
    }
    // Explosive Impact reads the primary base only (Cremator is inherently explosive).
    expect(plain.damagePerShot.explosiveBonus).toBe(Math.round(80 * 0.2));
  });

  it("the body-part multiplier scales the primary hit, not the secondary", () => {
    const r = run({}, { hitLocation: "weakSpot" });
    expect(r.weakSpot.multiplier).toBe(2);
    expect(r.damagePerShot.secondary).toBe(140);
    expect(r.damagePerShot.normal).toBe(80 * 2 + 140);
  });

  it("Tenderizer (a target debuff) multiplies both bases", () => {
    const r = run({ equippedPerks: [{ cardId: "tenderizer", rank: 1 }] }, { tenderizerStacks: 100 });
    expect(r.damagePerShot.secondary).toBe(Math.round(140 * 1.1));
    expect(r.damagePerShot.normal).toBe(Math.round(80 * 1.1) + Math.round(140 * 1.1));
  });

  it("Pyro-Technician scales both Cremator bases (both fire) and only the Shishkebab's fire half", () => {
    const pyro = [{ cardId: "pyro-technician", rank: 1 }];
    const v = interpolateByInt(truth.perks["pyro-technician"].byInt, 20);
    const cremator = run({ equippedPerks: pyro }, { intelligence: 20 });
    expect(cremator.damagePerShot.secondary).toBe(Math.round(140 * (1 + v)));
    expect(cremator.damagePerShot.normal).toBe(Math.round(80 * (1 + v)) + Math.round(140 * (1 + v)));
    const kebab = run({ weaponId: "shishkebab", equippedPerks: pyro }, { intelligence: 20 });
    expect(kebab.damagePerShot.secondary).toBe(Math.round(30 * (1 + v)));
    expect(kebab.damagePerShot.normal).toBe(45 + Math.round(30 * (1 + v)));
    // A class perk (Gladiator, one-handed melee) reaches both Shishkebab halves; Pyro only the fire half.
    const kebabGlad = run({ weaponId: "shishkebab", equippedPerks: [...pyro, { cardId: "gladiator", rank: 1 }] }, { intelligence: 20 });
    expect(kebabGlad.damagePerShot.normal).toBe(Math.round(45 * 1.1) + Math.round(30 * (1.1 + v)));
  });

  it("the landed numbers include the secondary through the same mitigation curve", () => {
    const sbq = run({ targetDummyId: "scorchbeast-queen" });
    const raw = run();
    expect(sbq.targetDummy.normalLanded).toBeLessThan(raw.targetDummy.normalLanded);
    expect(raw.targetDummy.normalLanded).toBe(Math.round((80 + 140 + raw.damagePerShot.explosiveBonus) * 0.99));
  });
});
