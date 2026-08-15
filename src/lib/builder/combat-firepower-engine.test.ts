import { describe, it, expect } from "vitest";
import {
  calculateCombatFirepower,
  WEAPON_COMBAT_BASE_CATALOG,
} from "./combat-firepower-engine";

describe("combat-firepower-engine", () => {
  it("contains catalog entries for standard meta weapons", () => {
    expect(WEAPON_COMBAT_BASE_CATALOG["the-fixer"]).toBeDefined();
    expect(WEAPON_COMBAT_BASE_CATALOG["railway-rifle"]).toBeDefined();
    expect(WEAPON_COMBAT_BASE_CATALOG["holy-fire"]).toBeDefined();
    expect(WEAPON_COMBAT_BASE_CATALOG["elders-mark"]).toBeDefined();
    expect(WEAPON_COMBAT_BASE_CATALOG["cremator"]).toBeDefined();
  });

  it("calculates Bloodied Commando Fixer damage and criticals accurately", () => {
    const result = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [
        { slug: "bloodied" },
        { slug: "vital" },
        { slug: "vats-optimized" },
      ],
      equippedPerks: [
        { cardId: "commando", rank: 3 },
        { cardId: "expert-commando", rank: 3 },
        { cardId: "master-commando", rank: 3 },
        { cardId: "bloody-mess", rank: 3 },
        { cardId: "nerd-rage", rank: 3 },
        { cardId: "better-criticals", rank: 3 },
        { cardId: "critical-savvy", rank: 3 },
      ],
      activeBuffs: {
        activeDrug: "psychotats",
        activeFood: "blight-soup",
        activeBobblehead: "small-guns",
        activeMagazine: "guns-and-bullets-3",
        activeMutations: ["adrenal-reaction", "eagle-eyes"],
      },
      playerStats: {
        agility: 25,
        luck: 33,
        strength: 5,
        healthPct: 0.2,
        hasStrangeInNumbers: true,
      },
    });

    // Base: 48
    // Commando (+60%) + Bloody Mess (+15%) + Nerd Rage (+20%) + Bloodied (+80%) + Psychotats (+25%) + Small Guns (+20%) + Adrenal Reaction (+63%) = +283%
    // Normal damage ~ 48 * (1 + 2.83) ≈ 184
    expect(result.damagePerShot.normal).toBeGreaterThan(150);

    // Critical damage includes Better Crits (+100%), Vital (+50%), Blight Soup (+125%), G&B 3 (+100%), Eagle Eyes (+62.5%) = ~437.5%
    expect(result.damagePerShot.critical).toBeGreaterThan(result.damagePerShot.normal * 2);

    // VATS AP cost: 25 * 0.75 = 19 AP
    expect(result.vats.apCostPerShot).toBe(19);

    // Agility 25 -> Total AP = 100 + 250 = 350 AP -> ~18 shots
    expect(result.vats.totalApPool).toBe(350);
    expect(result.vats.maxShotsInPool).toBe(18);

    // Luck 33 + Critical Savvy 3 -> Every 2nd shot ready
    expect(result.critCycle.everySecondShotReady).toBe(true);
  });

  it("calculates Anti-Armor and Tank Killer compounding penetration", () => {
    const result = calculateCombatFirepower({
      weaponId: "handmade-rifle",
      equippedMods: [
        { slug: "anti-armor" },
      ],
      equippedPerks: [
        { cardId: "tank-killer", rank: 3 },
      ],
      playerStats: {
        agility: 15,
        luck: 15,
        strength: 5,
        isPowerArmor: false,
      },
    });

    // Anti-Armor 50% + Tank Killer 36% -> (1 - (0.5 * 0.64)) = 68% penetration
    expect(result.armorPenetration.effectiveArmorPenetrationPct).toBe(68);
  });

  it("validates 3★ Lucky 15% fill lowering Luck threshold to 23", () => {
    const withoutLucky = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [],
      equippedPerks: [{ cardId: "critical-savvy", rank: 3 }],
      playerStats: { agility: 10, luck: 25, strength: 5 },
    });
    expect(withoutLucky.critCycle.requiredLuck).toBe(33);
    expect(withoutLucky.critCycle.everySecondShotReady).toBe(false);

    const withLucky = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [{ slug: "lucky" }],
      equippedPerks: [{ cardId: "critical-savvy", rank: 3 }],
      playerStats: { agility: 10, luck: 25, strength: 5 },
    });
    expect(withLucky.critCycle.requiredLuck).toBe(23);
    expect(withLucky.critCycle.everySecondShotReady).toBe(true);
  });

  it("calculates Quad magazine and Rapid 2★ fire rate correctly", () => {
    const result = calculateCombatFirepower({
      weaponId: "railway-rifle",
      equippedMods: [
        { slug: "quad" },
        { slug: "rapid" },
      ],
      equippedPerks: [],
      playerStats: { agility: 10, luck: 10, strength: 5 },
    });

    // Base Railway magazine: 10 -> Quad: 40
    expect(result.magazineCapacity.base).toBe(10);
    expect(result.magazineCapacity.effective).toBe(40);
    expect(result.magazineCapacity.isQuad).toBe(true);

    // Base fire rate: 10.0 rps -> Rapid +25%: 12.5 rps
    expect(result.fireRate.rps).toBe(12.5);
    expect(result.fireRate.rpm).toBe(750);
  });
});
