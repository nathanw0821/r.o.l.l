import { describe, it, expect } from "vitest";
import {
  listWeaponInnateModOptions,
  defaultWeaponInnateCrafting,
  getWeaponInnateModOption,
  calculateWeaponInnateAggregate,
} from "./weapon-piece-mods";
import { calculateCombatFirepower } from "./combat-firepower-engine";

describe("weapon-piece-mods", () => {
  it("provides complete mod lists for standard ranged rifles (Fixer, Handmade)", () => {
    const receivers = listWeaponInnateModOptions("the-fixer", "receiver");
    expect(receivers.length).toBeGreaterThan(5);
    expect(receivers.some((r) => r.id === "powerful-auto-receiver")).toBe(true);
    expect(receivers.some((r) => r.id === "prime-auto-receiver")).toBe(true);
    expect(receivers.some((r) => r.id === "tweaked-auto-receiver")).toBe(true);

    const barrels = listWeaponInnateModOptions("the-fixer", "barrel");
    expect(barrels.some((b) => b.id === "aligned-long-barrel")).toBe(true);

    const stocks = listWeaponInnateModOptions("the-fixer", "stock");
    expect(stocks.some((s) => s.id === "forceful-stock")).toBe(true);

    const mags = listWeaponInnateModOptions("the-fixer", "magazine");
    expect(mags.some((m) => m.id === "perforating-magazine")).toBe(true);
    expect(mags.some((m) => m.id === "stinging-magazine")).toBe(true);

    const sights = listWeaponInnateModOptions("the-fixer", "sight");
    expect(sights.some((s) => s.id === "reflex-sight-dot")).toBe(true);

    const muzzles = listWeaponInnateModOptions("the-fixer", "muzzle");
    expect(muzzles.some((m) => m.id === "suppressor")).toBe(true);
  });

  it("handles specialized The Dragon black powder mods", () => {
    const receivers = listWeaponInnateModOptions("the-dragon", "receiver");
    expect(receivers.some((r) => r.id === "prime-receiver")).toBe(true);

    const muzzles = listWeaponInnateModOptions("the-dragon", "muzzle");
    expect(muzzles.some((m) => m.id === "large-bayonet")).toBe(true);
  });

  it("handles specialized Melee mods", () => {
    const blades = listWeaponInnateModOptions("dc-gauntlet", "barrel");
    expect(blades.length).toBeGreaterThan(0);
    expect(blades.some((b) => b.id === "extra-claw")).toBe(true);

    const grips = listWeaponInnateModOptions("super-sledge", "stock");
    expect(grips.some((g) => g.id === "comfort-grip")).toBe(true);
  });

  it("computes innate aggregate modifiers accurately for meta commando loadout", () => {
    const crafting = {
      receiverId: "powerful-auto-receiver",
      barrelId: "aligned-long-barrel",
      stockId: "forceful-stock",
      magazineId: "perforating-magazine",
      sightId: "reflex-sight-dot",
      muzzleId: "suppressor",
    };

    const aggregate = calculateWeaponInnateAggregate("the-fixer", crafting);
    expect(aggregate.isAutomatic).toBe(true);
    expect(aggregate.isSuppressed).toBe(true);
    expect(aggregate.armorPenetrationPct).toBe(40); // Perforating magazine
    expect(aggregate.damagePct).toBe(-0.15); // Powerful auto trade-off (-15% per bullet)
    expect(aggregate.fireRatePct).toBe(0.40); // +40% automatic cycling speed
    // AP cost: powerful auto (-10%) + reflex (-15%) + aligned barrel (-5%) + forceful stock (-5%) = -35%
    expect(aggregate.apCostPct).toBeCloseTo(-0.35, 2);
    expect(aggregate.installedMods.length).toBe(6);
  });

  it("integrates weaponCrafting directly into combat-firepower-engine", () => {
    // 1. Base Fixer without attachments
    const bareResult = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [],
      equippedPerks: [],
      playerStats: { agility: 15, luck: 15, strength: 10 },
    });

    // 2. Fixer with Hardened Receiver (+25% single-shot damage)
    const hardenedResult = calculateCombatFirepower({
      weaponId: "the-fixer",
      weaponCrafting: {
        receiverId: "hardened-receiver",
      },
      equippedMods: [],
      equippedPerks: [],
      playerStats: { agility: 15, luck: 15, strength: 10 },
    });

    expect(hardenedResult.damagePerShot.normal).toBeGreaterThan(bareResult.damagePerShot.normal);

    // 3. Fixer with meta auto attachments (Reflex Sight, Aligned Barrel, Forceful Stock, Perforating 40% Pen, Suppressor)
    const autoResult = calculateCombatFirepower({
      weaponId: "the-fixer",
      weaponCrafting: {
        receiverId: "powerful-auto-receiver",
        barrelId: "aligned-long-barrel",
        stockId: "forceful-stock",
        magazineId: "perforating-magazine",
        sightId: "reflex-sight-dot",
        muzzleId: "suppressor",
      },
      equippedMods: [],
      equippedPerks: [],
      playerStats: { agility: 15, luck: 15, strength: 10 },
    });

    // Modded should have lower VATS AP cost due to -35% AP attachments
    expect(autoResult.vats.apCostPerShot).toBeLessThan(bareResult.vats.apCostPerShot);

    // Modded should have 40% armor penetration from Perforating magazine
    expect(autoResult.armorPenetration.effectiveArmorPenetrationPct).toBe(40);

    // Modded should have higher burst DPS due to high fire rate
    expect(autoResult.dps.burstDPS).toBeGreaterThan(bareResult.dps.burstDPS);

    // Modded should be recognized as automatic
    expect(autoResult.fireRate.isAutomatic).toBe(true);
  });
});
