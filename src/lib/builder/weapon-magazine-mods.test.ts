import { describe, expect, it } from "vitest";
import { BALLISTIC_MAGAZINE_MODS, SMG_MAGAZINE_MODS, listWeaponInnateModOptions, resolveWeaponArchetype } from "./weapon-piece-mods";
import { calculateCombatFirepower } from "./combat-firepower-engine";

/**
 * The Thompson .45 platform (Elder's Mark, Love Tap, submachine gun) has its own four magazines
 * read from the Patch 70 client: Large Drum +100% (50 -> 100), Large Quick Eject Drum +50%.
 * The shared rifle family stays at its shipped values by Nathan's decision (2026-10-11).
 */
describe("ballistic magazine mods", () => {
  const byId = Object.fromEntries(BALLISTIC_MAGAZINE_MODS.map((m) => [m.id, m.effectMath]));

  it("leaves the shared rifle family at the values the site shipped with (Nathan, 2026-10-11)", () => {
    expect(byId["drum-magazine"]?.magCapacityPct).toBe(0.5);
    expect(byId["perforating-magazine"]).toMatchObject({ armorPenetrationPct: 40 });
    expect(byId["quick-magazine"]).toBeUndefined();
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
