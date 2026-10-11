import { describe, expect, it } from "vitest";
import { BALLISTIC_MAGAZINE_MODS, SMG_MAGAZINE_MODS, listWeaponInnateModOptions, resolveWeaponArchetype } from "./weapon-piece-mods";
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

  it("gives the Thompson .45 platform its own four magazines and no armor-piercing ones", () => {
    for (const id of ["submachine-gun", "elders-mark", "love-tap"]) {
      expect(resolveWeaponArchetype(id)).toBe("smg");
      expect(listWeaponInnateModOptions(id, "magazine")).toBe(SMG_MAGAZINE_MODS);
    }
    expect(resolveWeaponArchetype("10mm-smg")).not.toBe("smg");
    expect(SMG_MAGAZINE_MODS.map((m) => m.id)).toEqual(["standard-magazine", "quick-magazine", "swift-magazine", "drum-magazine"]);
    expect(listWeaponInnateModOptions("elders-mark", "magazine").some((m) => m.id === "perforating-magazine")).toBe(false);
    // Other slots still come from the ballistic lists.
    expect(listWeaponInnateModOptions("elders-mark", "receiver").length).toBeGreaterThan(0);
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
    expect(mag("swift-magazine").effective).toBe(75); // Large Quick Eject Drum
    expect(mag("quick-magazine").effective).toBe(50); // Medium Quick Eject Drum
    expect(mag("stinging-magazine").effective).toBe(50); // not an SMG magazine: ignored
    expect(mag("perforating-magazine").effective).toBe(50);
  });
});
