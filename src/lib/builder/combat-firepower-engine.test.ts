import { describe, it, expect } from "vitest";
import {
  calculateCombatFirepower,
  calculateVatsCritQualification,
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

  it("calculates Melee weapon damage with Incisor armor penetration and Heavy Hitter", () => {
    const result = calculateCombatFirepower({
      weaponId: "v63-shock-baton",
      equippedMods: [],
      equippedPerks: [
        { cardId: "incisor", rank: 3 },
        { cardId: "heavy-hitter", rank: 1 },
        { cardId: "slugger", rank: 3 },
      ],
      playerStats: {
        strength: 20, // +100% melee damage
        agility: 10,
        luck: 15,
        healthPct: 1.0,
      },
    });

    // Incisor 3 provides 75% armor penetration
    expect(result.armorPenetration.effectiveArmorPenetrationPct).toBe(75);
    expect(result.damagePerShot.breakdown.some((b) => b.source.includes("Incisor"))).toBe(false); // in armor penetration
    expect(result.armorPenetration.breakdown.some((b) => b.source.includes("Incisor"))).toBe(true);
    // Breakdown includes Heavy Hitter and Strength
    expect(result.damagePerShot.breakdown.some((b) => b.source.includes("Heavy Hitter"))).toBe(true);
    expect(result.damagePerShot.breakdown.some((b) => b.source.includes("Strength (20)"))).toBe(true);
  });

  it("calculates Pistol damage and Tank Killer 36% armor penetration", () => {
    const result = calculateCombatFirepower({
      weaponId: "alien-blaster",
      equippedMods: [],
      equippedPerks: [
        { cardId: "gunslinger", rank: 3 },
        { cardId: "expert-gunslinger", rank: 3 },
        { cardId: "master-gunslinger", rank: 3 },
        { cardId: "tank-killer", rank: 3 },
      ],
      playerStats: { strength: 5, agility: 15, luck: 15 },
    });

    // Base: 32 -> +60% Gunslinger -> 32 * 1.6 = 51.2 -> 51
    expect(result.damagePerShot.normal).toBe(51);
    // Tank Killer on Pistols provides 36% armor penetration
    expect(result.armorPenetration.effectiveArmorPenetrationPct).toBe(36);
  });

  it("calculates Bow damage and Bow Before Me 36% armor penetration", () => {
    const result = calculateCombatFirepower({
      weaponId: "compound-bow",
      equippedMods: [],
      equippedPerks: [
        { cardId: "archer", rank: 3 },
        { cardId: "expert-archer", rank: 3 },
        { cardId: "master-archer", rank: 3 },
        { cardId: "bow-before-me", rank: 3 },
      ],
      playerStats: { strength: 5, agility: 15, luck: 15 },
    });

    // Base: 110 -> +60% Archer -> 110 * 1.6 = 176
    expect(result.damagePerShot.normal).toBe(176);
    expect(result.armorPenetration.effectiveArmorPenetrationPct).toBe(36);
  });

  it("calculates Unarmed weapon 10% Strength scaling and Iron Fist", () => {
    const result = calculateCombatFirepower({
      weaponId: "power-fist",
      equippedMods: [],
      equippedPerks: [
        { cardId: "iron-fist", rank: 3 },
        { cardId: "incisor", rank: 3 },
      ],
      playerStats: { strength: 20, agility: 10, luck: 15 },
    });

    // Base: 58
    // Iron Fist 3 (+20%) + 20 STR * 10% (+200%) = +220%
    // 58 * (1 + 2.20) = 185.6 -> 186
    expect(result.damagePerShot.normal).toBe(186);
    expect(result.armorPenetration.effectiveArmorPenetrationPct).toBe(75);
    expect(result.damagePerShot.breakdown.some((b) => b.source.includes("Unarmed Strength 10% (20)"))).toBe(true);
  });

  it("applies Carnivore + SiN scaling to melee food and 0 to Herbivores", () => {
    // With Carnivore + SiN, Glowing Meat Steak gives +50% melee damage
    const carnivoreRes = calculateCombatFirepower({
      weaponId: "power-fist",
      equippedMods: [],
      equippedPerks: [],
      activeBuffs: {
        activeFoods: ["meat-glowing-steak"],
        activeMutations: ["carnivore"],
      },
      playerStats: { strength: 1, agility: 10, luck: 15, hasStrangeInNumbers: true },
    });
    // Base 58 + 10% STR (1 STR = 0.10) + 50% Glowing Meat = +60% -> 58 * 1.6 = 92.8 -> 93
    expect(carnivoreRes.damagePerShot.normal).toBe(93);
    expect(carnivoreRes.damagePerShot.breakdown.some((b) => b.source.includes("Carnivore + SiN"))).toBe(true);

    // With Herbivore, meat gives 0 benefit
    const herbivoreRes = calculateCombatFirepower({
      weaponId: "power-fist",
      equippedMods: [],
      equippedPerks: [],
      activeBuffs: {
        activeFoods: ["meat-glowing-steak"],
        activeMutations: ["herbivore"],
      },
      playerStats: { strength: 1, agility: 10, luck: 15, hasStrangeInNumbers: true },
    });
    // Base 58 + 10% STR = +10% -> 58 * 1.1 = 63.8 -> 64
    expect(herbivoreRes.damagePerShot.normal).toBe(64);
    expect(herbivoreRes.damagePerShot.breakdown.some((b) => b.source.includes("Melee Food"))).toBe(false);
  });

  it("applies Herbivore + SiN scaling to Blight Soup crits and 0 to Carnivores", () => {
    // Herbivore + SiN Blight Soup: +125% crit bonus
    const herbivoreRes = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [],
      equippedPerks: [],
      activeBuffs: {
        activeFoods: ["plant-blight-soup"],
        activeMutations: ["herbivore"],
      },
      playerStats: { strength: 1, agility: 15, luck: 15, hasStrangeInNumbers: true },
    });
    // Base Fixer: 48. Base crit: +100%. Blight Soup Herbivore+SiN: +125%. Total crit bonus = +225% -> 48 * 2.25 = 108. Total crit = normal (48) + 108 = 156
    expect(herbivoreRes.damagePerShot.critical).toBe(156);

    // Carnivore Blight Soup: 0% crit bonus
    const carnivoreRes = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [],
      equippedPerks: [],
      activeBuffs: {
        activeFoods: ["plant-blight-soup"],
        activeMutations: ["carnivore"],
      },
      playerStats: { strength: 1, agility: 15, luck: 15, hasStrangeInNumbers: true },
    });
    // Base crit only: +100% -> 48 * 1 = 48. Total crit = 48 + 48 = 96
    expect(carnivoreRes.damagePerShot.critical).toBe(96);
  });

  it("calculates boss target dummy mitigation against Earle Williams (400 DR, 80% flat reduction)", () => {
    const withoutAA = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [],
      equippedPerks: [],
      targetDummyId: "earle-williams",
      playerStats: { strength: 1, agility: 15, luck: 15 },
    });

    expect(withoutAA.targetDummy.dummy.id).toBe("earle-williams");
    expect(withoutAA.targetDummy.effectiveDR).toBe(400);
    // 80% flat reduction means landed damage is heavily suppressed compared to sheet damage
    expect(withoutAA.targetDummy.normalLanded).toBeLessThan(withoutAA.damagePerShot.normal * 0.15);

    // Now test with Anti-Armor mod + Tank Killer rank 3:
    // Anti-Armor 50% + Tank Killer 36% -> 68% total armor penetration
    const withAA = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [{ slug: "anti-armor" }],
      equippedPerks: [{ cardId: "tank-killer", rank: 3 }],
      targetDummyId: "earle-williams",
      playerStats: { strength: 1, agility: 15, luck: 15 },
    });

    // 400 DR * (1 - 0.68) = 128 Effective DR
    expect(withAA.targetDummy.effectiveDR).toBe(128);
    // Landed damage with 68% AP must be substantially higher than without AP
    expect(withAA.targetDummy.normalLanded).toBeGreaterThan(withoutAA.targetDummy.normalLanded);
  });

  it("returns 100% passthrough for raw-unarmored target dummy", () => {
    const rawRes = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [],
      equippedPerks: [],
      targetDummyId: "raw-unarmored",
      playerStats: { strength: 1, agility: 15, luck: 15 },
    });

    expect(rawRes.targetDummy.effectiveDR).toBe(0);
    expect(rawRes.targetDummy.normalLanded).toBe(rawRes.damagePerShot.totalPerShot);
    expect(rawRes.targetDummy.criticalLanded).toBe(rawRes.damagePerShot.critical);
  });

  it("evaluates the authoritative Fallout 76 Luck & Critical Savvy chart across all tiers", () => {
    // Critical Savvy Rank 3: 33 Luck without Lucky, 23 Luck with Lucky
    const cs3NoLucky = calculateVatsCritQualification({ luck: 33, critSavvyRank: 3, hasLucky15Fill: false });
    expect(cs3NoLucky.requiredLuck).toBe(33);
    expect(cs3NoLucky.fillCostPct).toBe(55);
    expect(cs3NoLucky.everySecondShotReady).toBe(true);

    const cs3Short = calculateVatsCritQualification({ luck: 32, critSavvyRank: 3, hasLucky15Fill: false });
    expect(cs3Short.everySecondShotReady).toBe(false);
    expect(cs3Short.missingLuck).toBe(1);

    const cs3Lucky = calculateVatsCritQualification({ luck: 23, critSavvyRank: 3, hasLucky15Fill: true });
    expect(cs3Lucky.requiredLuck).toBe(23);
    expect(cs3Lucky.everySecondShotReady).toBe(true);

    // Critical Savvy Rank 2: 44 Luck without Lucky, 34 Luck with Lucky
    const cs2NoLucky = calculateVatsCritQualification({ luck: 44, critSavvyRank: 2, hasLucky15Fill: false });
    expect(cs2NoLucky.requiredLuck).toBe(44);
    expect(cs2NoLucky.fillCostPct).toBe(70);
    expect(cs2NoLucky.everySecondShotReady).toBe(true);

    const cs2Lucky = calculateVatsCritQualification({ luck: 34, critSavvyRank: 2, hasLucky15Fill: true });
    expect(cs2Lucky.requiredLuck).toBe(34);
    expect(cs2Lucky.everySecondShotReady).toBe(true);

    // Critical Savvy Rank 1: 54 Luck without Lucky, 44 Luck with Lucky
    const cs1NoLucky = calculateVatsCritQualification({ luck: 54, critSavvyRank: 1, hasLucky15Fill: false });
    expect(cs1NoLucky.requiredLuck).toBe(54);
    expect(cs1NoLucky.fillCostPct).toBe(85);
    expect(cs1NoLucky.everySecondShotReady).toBe(true);

    const cs1Lucky = calculateVatsCritQualification({ luck: 44, critSavvyRank: 1, hasLucky15Fill: true });
    expect(cs1Lucky.requiredLuck).toBe(44);
    expect(cs1Lucky.everySecondShotReady).toBe(true);

    // Critical Savvy Rank 0: 64 Luck without Lucky, 54 Luck with Lucky
    const cs0NoLucky = calculateVatsCritQualification({ luck: 64, critSavvyRank: 0, hasLucky15Fill: false });
    expect(cs0NoLucky.requiredLuck).toBe(64);
    expect(cs0NoLucky.fillCostPct).toBe(100);
    expect(cs0NoLucky.everySecondShotReady).toBe(true);

    const cs0Lucky = calculateVatsCritQualification({ luck: 54, critSavvyRank: 0, hasLucky15Fill: true });
    expect(cs0Lucky.requiredLuck).toBe(54);
    expect(cs0Lucky.everySecondShotReady).toBe(true);
  });

  it("suppresses Hitman's (+25% Aiming) when in V.A.T.S. even if isAiming was flagged", () => {
    // 1. Aiming outside VATS: Hitman's applies
    const aimingOutsideVats = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [{ slug: "hitmans" }],
      equippedPerks: [],
      playerStats: {
        agility: 15,
        luck: 15,
        strength: 5,
        isAiming: true,
        isInVats: false,
      },
    });
    expect(aimingOutsideVats.firingMode).toBe("aiming_ads");
    expect(aimingOutsideVats.damagePerShot.breakdown.some((b) => b.source.includes("Hitman's"))).toBe(true);

    // 2. In VATS: Hitman's is SUPPRESSED
    const aimingInVats = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [{ slug: "hitmans" }],
      equippedPerks: [],
      playerStats: {
        agility: 15,
        luck: 15,
        strength: 5,
        isAiming: true,
        isInVats: true,
      },
    });
    expect(aimingInVats.firingMode).toBe("vats_standard");
    expect(aimingInVats.damagePerShot.breakdown.some((b) => b.source.includes("Hitman's"))).toBe(false);
  });

  it("activates 1:1 V.A.T.S. Crit Cycle when qualified and switches active DPS", () => {
    const critCycleResult = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [{ slug: "vats-optimized" }],
      equippedPerks: [{ cardId: "critical-savvy", rank: 3 }],
      playerStats: {
        agility: 20,
        luck: 33, // Exactly meets 33 Luck threshold with Crit Savvy 3
        strength: 5,
        isInVats: true,
        vatsCritEveryOtherShot: true,
      },
    });

    expect(critCycleResult.firingMode).toBe("vats_crit_cycle");
    expect(critCycleResult.critCycle.everySecondShotReady).toBe(true);
    // Active DPS matches 2nd-shot critical cycle DPS
    expect(critCycleResult.dps.activeDPS).toBe(critCycleResult.dps.criticalCycleDPS);
    // Target dummy active landed DPS matches critical cycle landed DPS
    expect(critCycleResult.targetDummy.activeDPSLanded).toBe(critCycleResult.targetDummy.criticalCycleDPSLanded);
  });
});
