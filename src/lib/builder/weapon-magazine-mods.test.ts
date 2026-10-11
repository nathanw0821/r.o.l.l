import { describe, expect, it } from "vitest";
import { BALLISTIC_MAGAZINE_MODS } from "./weapon-piece-mods";
import { calculateCombatFirepower } from "./combat-firepower-engine";

/**
 * Magazine numbers read from the Patch 70 client (SeventySix.esm 2026-09-16, OMOD parents
 * AmmoCapacity_Tier1 = +50%, Tier2 = +100%, ArmorPiercing Solo/Dual = 25). Nathan's report:
 * Elder's Mark 50 rounds must become 100 with the large drum, not 75.
 */
describe("ballistic magazine mods", () => {
  const byId = Object.fromEntries(BALLISTIC_MAGAZINE_MODS.map((m) => [m.id, m.effectMath]));

  it("carries the Patch 70 capacity and armor penetration values", () => {
    expect(byId["drum-magazine"]?.magCapacityPct).toBe(1.0);
    expect(byId["swift-magazine"]?.magCapacityPct).toBe(0.5);
    expect(byId["stinging-magazine"]).toMatchObject({ magCapacityPct: 0.5, armorPenetrationPct: 25 });
    expect(byId["perforating-magazine"]).toMatchObject({ armorPenetrationPct: 25 });
    expect(byId["perforating-magazine"]?.magCapacityPct).toBeUndefined();
    expect(byId["piercing-magazine"]).toMatchObject({ armorPenetrationPct: 25 });
    expect(byId["piercing-magazine"]?.magCapacityPct).toBeUndefined();
    expect(byId["quick-magazine"]?.magCapacityPct).toBeUndefined();
  });

  it("takes Elder's Mark from 50 to 100 rounds with the large drum", () => {
    const mag = (magazineId?: string) =>
      calculateCombatFirepower({
        weaponId: "elders-mark",
        equippedMods: [],
        equippedPerks: [],
        playerStats: { agility: 10, luck: 10, strength: 10 },
        weaponCrafting: magazineId ? { magazineId } : undefined,
      }).magazineCapacity;
    expect(mag()).toMatchObject({ base: 50, effective: 50 });
    expect(mag("drum-magazine")).toMatchObject({ base: 50, effective: 100 });
    expect(mag("swift-magazine").effective).toBe(75);
    expect(mag("stinging-magazine").effective).toBe(75);
    expect(mag("quick-magazine").effective).toBe(50);
  });
});
