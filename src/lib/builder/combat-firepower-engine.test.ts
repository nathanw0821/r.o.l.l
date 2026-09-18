import { describe, it, expect } from "vitest";
import {
  calculateCombatFirepower,
  calculateVatsCritQualification,
  getWeaponCombatBaseStats,
  getWeaponMaxLevel,
  WEAPON_COMBAT_BASE_CATALOG,
} from "./combat-firepower-engine";
import { WEAPON_BASE_PIECES } from "./base-gear";

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
    // Commando (+60%) + Bloody Mess (+15%) + Nerd Rage (+20%) + Bloodied (+109% at 20% HP, cap +130%) + Psychotats (+25%) + Small Guns (+20%) + Adrenal Reaction (+63%) = +283%
    // Normal damage ~ 48 * (1 + 2.83) ≈ 184
    expect(result.damagePerShot.normal).toBeGreaterThan(150);

    // Critical damage includes Better Crits (+100%), Vital (+50%), Blight Soup (+125%), G&B 3 (+100%), Eagle Eyes (+62.5%) = ~437.5%
    expect(result.damagePerShot.critical).toBeGreaterThan(result.damagePerShot.normal * 2);

    // VATS AP cost: 25 * 0.65 = 16.25 -> 16 AP
    expect(result.vats.apCostPerShot).toBe(16);

    // Agility 25 -> Total AP = 100 + 250 = 350 AP -> 21 shots at 16 AP
    expect(result.vats.totalApPool).toBe(350);
    expect(result.vats.maxShotsInPool).toBe(21);

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

    // Base Railway magazine (Patch 70 "The Slasher": 10 -> 16) -> Quad: 64
    expect(result.magazineCapacity.base).toBe(16);
    expect(result.magazineCapacity.effective).toBe(64);
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

  it("calculates boss target dummy mitigation against Earle Williams (300 DR, 80% flat reduction)", () => {
    const withoutAA = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [],
      equippedPerks: [],
      targetDummyId: "earle-williams",
      playerStats: { strength: 1, agility: 15, luck: 15 },
    });

    expect(withoutAA.targetDummy.dummy.id).toBe("earle-williams");
    expect(withoutAA.targetDummy.effectiveDR).toBe(300);
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

    // 300 DR * (1 - 0.68) = 96 Effective DR
    expect(withAA.targetDummy.effectiveDR).toBe(96);
    // Landed damage with 68% AP must be substantially higher than without AP
    expect(withAA.targetDummy.normalLanded).toBeGreaterThan(withoutAA.targetDummy.normalLanded);
  });

  it("lands the 99% engine cap against the raw-unarmored target dummy", () => {
    const rawRes = calculateCombatFirepower({
      weaponId: "the-fixer",
      equippedMods: [],
      equippedPerks: [],
      targetDummyId: "raw-unarmored",
      playerStats: { strength: 1, agility: 15, luck: 15 },
    });

    expect(rawRes.targetDummy.effectiveDR).toBe(0);
    // Zero DR is the limit of the continuous curve: coefficient sits on the 0.99 cap.
    expect(rawRes.targetDummy.mitigationRatio).toBe(0.99);
    expect(rawRes.targetDummy.armorMitigationPct).toBe(1);
    expect(rawRes.targetDummy.normalLanded).toBe(Math.round(rawRes.damagePerShot.totalPerShot * 0.99));
    expect(rawRes.targetDummy.criticalLanded).toBe(Math.round(rawRes.damagePerShot.critical * 0.99));
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

    // Critical Savvy Rank 2: 43 Luck without Lucky, 33 Luck with Lucky (game integer meter rounding)
    const cs2NoLucky = calculateVatsCritQualification({ luck: 43, critSavvyRank: 2, hasLucky15Fill: false });
    expect(cs2NoLucky.requiredLuck).toBe(43);
    expect(cs2NoLucky.fillCostPct).toBe(70);
    expect(cs2NoLucky.everySecondShotReady).toBe(true);

    const cs2Lucky = calculateVatsCritQualification({ luck: 33, critSavvyRank: 2, hasLucky15Fill: true });
    expect(cs2Lucky.requiredLuck).toBe(33);
    expect(cs2Lucky.everySecondShotReady).toBe(true);

    // Critical Savvy Rank 1: 53 Luck without Lucky, 43 Luck with Lucky
    const cs1NoLucky = calculateVatsCritQualification({ luck: 53, critSavvyRank: 1, hasLucky15Fill: false });
    expect(cs1NoLucky.requiredLuck).toBe(53);
    expect(cs1NoLucky.fillCostPct).toBe(85);
    expect(cs1NoLucky.everySecondShotReady).toBe(true);

    const cs1Lucky = calculateVatsCritQualification({ luck: 43, critSavvyRank: 1, hasLucky15Fill: true });
    expect(cs1Lucky.requiredLuck).toBe(43);
    expect(cs1Lucky.everySecondShotReady).toBe(true);

    // Critical Savvy Rank 0: 63 Luck without Lucky, 53 Luck with Lucky
    const cs0NoLucky = calculateVatsCritQualification({ luck: 63, critSavvyRank: 0, hasLucky15Fill: false });
    expect(cs0NoLucky.requiredLuck).toBe(63);
    expect(cs0NoLucky.fillCostPct).toBe(100);
    expect(cs0NoLucky.everySecondShotReady).toBe(true);

    const cs0Lucky = calculateVatsCritQualification({ luck: 53, critSavvyRank: 0, hasLucky15Fill: true });
    expect(cs0Lucky.requiredLuck).toBe(53);
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

  it("guarantees 100% catalog coverage for all 114 weapons in WEAPON_BASE_PIECES with maxLevel 50 or 45", () => {
    expect(WEAPON_BASE_PIECES.length).toBe(114);

    for (const piece of WEAPON_BASE_PIECES) {
      const stats = getWeaponCombatBaseStats(piece.id);
      expect(stats, `Missing combat stats for weapon: ${piece.id}`).toBeDefined();
      expect(stats.baseDamage, `Zero/invalid baseDamage for ${piece.id}`).toBeGreaterThan(0);
      expect(stats.fireRate, `Zero/invalid fireRate for ${piece.id}`).toBeGreaterThan(0);
      expect(stats.baseVatsApCost, `Zero/invalid baseVatsApCost for ${piece.id}`).toBeGreaterThan(0);
      expect(stats.magazineSize, `Zero/invalid magazineSize for ${piece.id}`).toBeGreaterThan(0);
      expect([50, 45], `Invalid maxLevel for ${piece.id}`).toContain(stats.maxLevel);

      const maxLvl = getWeaponMaxLevel(piece.id);
      expect([50, 45]).toContain(maxLvl);
      expect(maxLvl).toBe(stats.maxLevel);
    }
  });

  it("verifies alias resolution between canonical base-gear keys and hyphenated aliases", () => {
    expect(getWeaponCombatBaseStats("fixer").baseDamage).toBe(48);
    expect(getWeaponCombatBaseStats("the-fixer").baseDamage).toBe(48);
    expect(getWeaponMaxLevel("fixer")).toBe(50);
    expect(getWeaponMaxLevel("the-fixer")).toBe(50);

    expect(getWeaponCombatBaseStats("handmade").baseDamage).toBe(45);
    expect(getWeaponCombatBaseStats("handmade-rifle").baseDamage).toBe(45);
    expect(getWeaponMaxLevel("handmade")).toBe(45);
    expect(getWeaponMaxLevel("handmade-rifle")).toBe(45);

    expect(getWeaponCombatBaseStats("railway").baseDamage).toBe(95);
    expect(getWeaponCombatBaseStats("railway-rifle").baseDamage).toBe(95);
    expect(getWeaponMaxLevel("railway")).toBe(50);
    expect(getWeaponMaxLevel("railway-rifle")).toBe(50);

    expect(getWeaponCombatBaseStats("the-dragon").baseDamage).toBe(225);
    expect(getWeaponMaxLevel("the-dragon")).toBe(45);
  });

  describe("Patch 62/66/70 Stack Mechanics & Target Impairments (WS-3)", () => {
    it("scales Bullet Storm with explicit stack counts and Bringing the Big Guns double cap", () => {
      // .50 Cal with Bullet Storm rank 3 (9% per 30 rounds / per stack)
      const baseInput = {
        weaponId: "50-cal-machine-gun",
        equippedMods: [],
        equippedPerks: [{ cardId: "bullet-storm", rank: 3 }],
        playerStats: { agility: 10, luck: 10, strength: 15 },
      };

      // 0 stacks -> 0% bonus
      const res0 = calculateCombatFirepower({
        ...baseInput,
        playerStats: { ...baseInput.playerStats, bulletStormStacks: 0 },
      });
      expect(res0.damagePerShot.breakdown.some((b) => b.source.includes("Bullet Storm (0 Stacks)"))).toBe(false);

      // 10 stacks -> 10 * 9% = +90%
      const res10 = calculateCombatFirepower({
        ...baseInput,
        playerStats: { ...baseInput.playerStats, bulletStormStacks: 10 },
      });
      const b10 = res10.damagePerShot.breakdown.find((b) => b.source.includes("Bullet Storm (10 Stacks)"));
      expect(b10).toBeDefined();
      expect(b10?.value).toBe("+90%");

      // 20 stacks with Bringing the Big Guns -> 20 * 9% = +180%
      const res20WithBigGuns = calculateCombatFirepower({
        ...baseInput,
        equippedPerks: [
          { cardId: "bullet-storm", rank: 3 },
          { cardId: "bringing-the-big-guns", rank: 1 },
        ],
        playerStats: { ...baseInput.playerStats, bulletStormStacks: 20 },
      });
      const b20 = res20WithBigGuns.damagePerShot.breakdown.find((b) => b.source.includes("Bullet Storm (20 Stacks)"));
      expect(b20).toBeDefined();
      expect(b20?.value).toBe("+180%");
    });

    it("enforces Resolute Veteran minimum 5 Bullet Storm stacks", () => {
      const resMin5 = calculateCombatFirepower({
        weaponId: "resolute-veteran",
        equippedMods: [],
        equippedPerks: [{ cardId: "bullet-storm", rank: 3 }],
        playerStats: { agility: 10, luck: 10, strength: 15, bulletStormStacks: 0 },
      });
      // Minimum 5 stacks enforced even when slider is 0: 5 * 9% = +45%
      const b5 = resMin5.damagePerShot.breakdown.find((b) => b.source.includes("Bullet Storm (5 Stacks)"));
      expect(b5).toBeDefined();
      expect(b5?.value).toBe("+45%");
    });

    it("spends Onslaught stacks only through Furious (+5%/stack, max 9) and Pounder's (melee +10%/stack, max 10)", () => {
      const noSpender = calculateCombatFirepower({
        weaponId: "the-fixer",
        equippedMods: [],
        equippedPerks: [],
        playerStats: { agility: 10, luck: 10, strength: 10, onslaughtStacks: 12 },
      });
      expect(noSpender.damagePerShot.breakdown.find((x) => x.source.includes("Onslaught"))).toBeUndefined();
      const furious = calculateCombatFirepower({
        weaponId: "the-fixer",
        equippedMods: [{ slug: "furious" }],
        equippedPerks: [],
        playerStats: { agility: 10, luck: 10, strength: 10, onslaughtStacks: 12 },
      });
      const f = furious.damagePerShot.breakdown.find((x) => x.source.startsWith("Furious"));
      expect(f?.value).toBe("+45%"); // capped at 9 stacks
    });

    it("gives +3% armor penetration per Onslaught stack on Ticket to Revenge and +2% crit per stack on Elder's Mark", () => {
      const ttr = calculateCombatFirepower({
        weaponId: "ticket-to-revenge",
        equippedMods: [],
        equippedPerks: [],
        playerStats: { agility: 10, luck: 10, strength: 10, onslaughtStacks: 4 },
      });
      expect(ttr.armorPenetration.breakdown.find((x) => x.source.startsWith("Ticket to Revenge"))?.value).toBe("12% Penetration");
      const em = calculateCombatFirepower({
        weaponId: "elders-mark",
        equippedMods: [],
        equippedPerks: [],
        playerStats: { agility: 10, luck: 10, strength: 10, onslaughtStacks: 4 },
      });
      expect(em.damagePerShot.breakdown.find((x) => x.source.startsWith("Elder's Mark"))?.value).toBe("+8% Crit");
    });

    it("gives Adrenaline +10% per kill on a Kill Streak, max 10, and nothing for a streak without the perk", () => {
      const withPerk = calculateCombatFirepower({
        weaponId: "the-fixer",
        equippedMods: [],
        equippedPerks: [{ cardId: "adrenaline", rank: 1 }],
        playerStats: { agility: 10, luck: 10, strength: 10, killStreak: 14 },
      });
      expect(withPerk.damagePerShot.breakdown.find((x) => x.source.startsWith("Adrenaline"))?.value).toBe("+100%");
      const noPerk = calculateCombatFirepower({
        weaponId: "the-fixer",
        equippedMods: [],
        equippedPerks: [],
        playerStats: { agility: 10, luck: 10, strength: 10, killStreak: 4 },
      });
      expect(noPerk.damagePerShot.breakdown.find((x) => x.source.includes("Kill Streak") || x.source.startsWith("Adrenaline"))).toBeUndefined();
    });

    it("applies Tenderizer as a multiplier on the total (+0.1% per hit, capped at +100%) only when the perk is equipped", () => {
      const base = calculateCombatFirepower({ weaponId: "the-fixer", equippedMods: [], equippedPerks: [], playerStats: { agility: 10, luck: 10, strength: 10 } });
      const tend = calculateCombatFirepower({
        weaponId: "the-fixer",
        equippedMods: [],
        equippedPerks: [{ cardId: "tenderizer", rank: 1 }],
        playerStats: { agility: 10, luck: 10, strength: 10, tenderizerStacks: 5000 },
      });
      expect(tend.damagePerShot.breakdown.find((x) => x.source.startsWith("Tenderizer"))?.value).toBe("×2.000 target debuff");
      expect(tend.damagePerShot.normal).toBe(base.damagePerShot.normal * 2);
      const noPerk = calculateCombatFirepower({ weaponId: "the-fixer", equippedMods: [], equippedPerks: [], playerStats: { agility: 10, luck: 10, strength: 10, tenderizerStacks: 5000 } });
      expect(noPerk.damagePerShot.normal).toBe(base.damagePerShot.normal);
    });

    it("triggers Severing 4★ (+50%) and Wound Salter on bleeding targets", () => {
      const resBleed = calculateCombatFirepower({
        weaponId: "the-fixer",
        equippedMods: [{ slug: "severing" }],
        equippedPerks: [{ cardId: "wound-salter", rank: 2 }],
        playerStats: { agility: 10, luck: 10, strength: 10, targetBleeding: true },
      });
      const bSevering = resBleed.damagePerShot.breakdown.find((x) => x.source.includes("Severing 4★"));
      expect(bSevering).toBeDefined();
      expect(bSevering?.value).toBe("+50%");

      const bWound = resBleed.damagePerShot.breakdown.find((x) => x.source.includes("Wound Salter (Rank 2"));
      expect(bWound).toBeDefined();
      expect(bWound?.value).toBe("+20%");
    });

    it("triggers Pyromaniac's 4★ (+50%) on burning targets and Viper's (+50%) on poisoned targets", () => {
      const resPyro = calculateCombatFirepower({
        weaponId: "the-fixer",
        equippedMods: [{ slug: "pyromaniacs" }],
        equippedPerks: [],
        playerStats: { agility: 10, luck: 10, strength: 10, targetBurning: true },
      });
      expect(resPyro.damagePerShot.breakdown.some((x) => x.source.includes("Pyromaniac's 4★"))).toBe(true);

      const resViper = calculateCombatFirepower({
        weaponId: "the-fixer",
        equippedMods: [{ slug: "vipers" }],
        equippedPerks: [],
        playerStats: { agility: 10, luck: 10, strength: 10, targetPoisoned: true },
      });
      expect(resViper.damagePerShot.breakdown.some((x) => x.source.includes("Viper's 4★"))).toBe(true);
    });

    it("scales Bully's 4★ (+25%/limb) and Crushing Blow (+10%/limb) on crippled targets", () => {
      const resBully = calculateCombatFirepower({
        weaponId: "the-fixer",
        equippedMods: [{ slug: "bullys" }],
        equippedPerks: [],
        playerStats: { agility: 10, luck: 10, strength: 10, targetCrippledLimbs: 3 },
      });
      const bBully = resBully.damagePerShot.breakdown.find((x) => x.source.includes("Bully's 4★ (3 Crippled"));
      expect(bBully).toBeDefined();
      expect(bBully?.value).toBe("+75%"); // 3 * 25% = 75%

      const resCrushing = calculateCombatFirepower({
        weaponId: "crushing-blow",
        equippedMods: [],
        equippedPerks: [],
        playerStats: { agility: 10, luck: 10, strength: 10, targetCrippledLimbs: 2 },
      });
      const bCrush = resCrushing.damagePerShot.breakdown.find((x) => x.source.includes("Crushing Blow Innate (2 Crippled"));
      expect(bCrush).toBeDefined();
      expect(bCrush?.value).toBe("+20%"); // 2 * 10% = 20%
    });

    it("scales Deal Sealer at +10% per active target impairment", () => {
      const resDeal = calculateCombatFirepower({
        weaponId: "the-fixer",
        equippedMods: [],
        equippedPerks: [{ cardId: "deal-sealer", rank: 1 }],
        playerStats: {
          agility: 10,
          luck: 10,
          strength: 10,
          targetBleeding: true,
          targetBurning: true,
          targetPoisoned: false,
          targetCrippledLimbs: 2,
        },
      });
      // 3 active impairments: bleeding, burning, crippled
      const bDeal = resDeal.damagePerShot.breakdown.find((x) => x.source.includes("Deal Sealer (3 Impairments)"));
      expect(bDeal).toBeDefined();
      expect(bDeal?.value).toBe("+30%"); // 3 * 10% = +30%
    });

    it("grants Demolition Expert rank 3 from The Guarantee innate effect", () => {
      const resGuarantee = calculateCombatFirepower({
        weaponId: "the-guarantee",
        equippedMods: [{ slug: "explosive" }],
        equippedPerks: [], // no demo expert equipped
        playerStats: { agility: 10, luck: 10, strength: 10 },
      });
      // With Demo Expert 3: +60% explosive damage (0.2 * 1.4 = 0.28 base)
      const bDemo = resGuarantee.damagePerShot.breakdown.find((x) => x.source.includes("The Guarantee: Demo Exp Rank 3"));
      expect(bDemo).toBeDefined();
    });

    it("clamps melee and unarmed swing speed to +100% (2.0x multiplier limit)", () => {
      // Combat knife with Rapid (+25%) and innate mods (+100%) would exceed 2.0x
      const resClamped = calculateCombatFirepower({
        weaponId: "combat-knife",
        equippedMods: [{ slug: "rapid" }],
        weaponCrafting: null,
        equippedPerks: [],
        playerStats: { agility: 10, luck: 10, strength: 10 },
      });
      // Base fire rate is 2.9. With rapid alone it's 2.9 * 1.25 = 3.625 (under 2.0x)
      expect(resClamped.fireRate.fireRateMultiplier).toBe(1.25);

      // Now with Disorderly Conduct (+20%) and extreme swing speed mock
      const resDisorderly = calculateCombatFirepower({
        weaponId: "disorderly-conduct",
        equippedMods: [{ slug: "rapid" }],
        equippedPerks: [],
        playerStats: { agility: 10, luck: 10, strength: 10 },
      });
      // 1.25 * 1.20 = 1.50 <= 2.0
      expect(resDisorderly.fireRate.fireRateMultiplier).toBe(1.5);
    });
  });
});

describe("unique innate effects (src/data/truth/unique-items.json)", () => {
  const basePlayer = { agility: 10, luck: 10, strength: 10 };
  const run = (
    weaponId: string,
    playerStats: Partial<Parameters<typeof calculateCombatFirepower>[0]["playerStats"]> = {},
    equippedMods: Parameters<typeof calculateCombatFirepower>[0]["equippedMods"] = [],
    equippedPerks: Parameters<typeof calculateCombatFirepower>[0]["equippedPerks"] = [],
  ) =>
    calculateCombatFirepower({
      weaponId,
      equippedMods,
      equippedPerks,
      playerStats: { ...basePlayer, ...playerStats },
    });

  const damageRow = (result: ReturnType<typeof calculateCombatFirepower>, prefix: string) =>
    result.damagePerShot.breakdown.find((row) => row.source.startsWith(prefix));
  const dpsRow = (result: ReturnType<typeof calculateCombatFirepower>, prefix: string) =>
    result.dps.breakdown.find((row) => row.source.startsWith(prefix));

  it("keeps the five pre-pack uniques on exactly the same numbers and labels", () => {
    const crushing = run("crushing-blow", { targetCrippledLimbs: 2 });
    expect(damageRow(crushing, "Crushing Blow Innate (2 Crippled Limbs)")?.value).toBe("+20%");
    expect(crushing.damagePerShot.normal).toBe(54);

    const ticket = run("ticket-to-revenge", { onslaughtStacks: 4 });
    expect(
      ticket.armorPenetration.breakdown.find((row) => row.source.startsWith("Ticket to Revenge (4 Onslaught stacks)"))?.value
    ).toBe("12% Penetration");
    expect(ticket.armorPenetration.effectiveArmorPenetrationPct).toBe(12);

    const elders = run("elders-mark", { onslaughtStacks: 4 });
    expect(damageRow(elders, "Elder's Mark (4 Onslaught stacks)")?.value).toBe("+8% Crit");
    expect(elders.damagePerShot.critical).toBe(79);

    const guarantee = run("the-guarantee", {}, [{ slug: "explosive" }]);
    expect(damageRow(guarantee, "Explosive Impact (The Guarantee: Demo Exp Rank 3)")?.value).toBe("+13");
    expect(guarantee.damagePerShot.totalPerShot).toBe(58);

    const disorderly = run("disorderly-conduct", {}, [{ slug: "rapid" }]);
    expect(dpsRow(disorderly, "Disorderly Conduct (+20% Attack Speed)")?.value).toBe("+20% Fire Rate");
    expect(disorderly.fireRate.fireRateMultiplier).toBe(1.5);

    // An equipped Demolition Expert 3 keeps the plain label (the grant adds nothing).
    const guaranteeWithPerk = run("the-guarantee", {}, [{ slug: "explosive" }], [{ cardId: "demolition-expert", rank: 3 }]);
    expect(damageRow(guaranteeWithPerk, "Explosive Impact (Demo Exp Rank 3)")?.value).toBe("+13");
  });

  it("adds Whacker Smacker power-attack damage per Onslaught stack, capped at 10", () => {
    const powerAttack = run("whacker-smacker", { onslaughtStacks: 4, isPowerAttacking: true });
    expect(damageRow(powerAttack, "Whacker Smacker (4 Onslaught stacks, Power Attack)")?.value).toBe("+20%");
    expect(powerAttack.damagePerShot.normal).toBe(187);

    const capped = run("whacker-smacker", { onslaughtStacks: 14, isPowerAttacking: true });
    expect(damageRow(capped, "Whacker Smacker (10 Onslaught stacks, Power Attack)")?.value).toBe("+50%");

    // No power attack, no row and no damage.
    const swinging = run("whacker-smacker", { onslaughtStacks: 4 });
    expect(damageRow(swinging, "Whacker Smacker")).toBeUndefined();
    expect(swinging.damagePerShot.normal).toBe(165);
  });

  it("adds The Quick Fix swing speed per addiction and holds it at the +100% cap", () => {
    const four = run("the-quick-fix", { addictionsCount: 4 });
    expect(dpsRow(four, "The Quick Fix (4 Addictions)")?.value).toBe("+20% Swing Speed");
    expect(four.fireRate.fireRateMultiplier).toBeCloseTo(1.2, 10);

    const capped = run("the-quick-fix", { addictionsCount: 30 });
    expect(dpsRow(capped, "The Quick Fix (30 Addictions)")?.value).toBe("+100% Swing Speed");
    expect(capped.fireRate.fireRateMultiplier).toBe(2);

    const clean = run("the-quick-fix", { addictionsCount: 0 });
    expect(dpsRow(clean, "The Quick Fix")).toBeUndefined();
    expect(clean.fireRate.fireRateMultiplier).toBe(1);
  });

  it("adds Civil Unrest's +50 action points to the V.A.T.S. pool", () => {
    const civil = run("civil-unrest");
    expect(civil.vats.totalApPool).toBe(250);
    expect(civil.vats.maxShotsInPool).toBe(10);
    expect(civil.vats.breakdown.find((row) => row.source === "Civil Unrest (Innate)")?.value).toBe("+50 AP");

    const plain = run("the-fixer");
    expect(plain.vats.totalApPool).toBe(200);
    expect(plain.vats.breakdown.some((row) => row.source.includes("Innate"))).toBe(false);
  });

  it("grants Foundation's Vengeance its five Bullet Storm stacks only under 25% health", () => {
    const wounded = run("foundations-vengeance", { healthPct: 0.2 });
    expect(damageRow(wounded, "Foundation's Vengeance (under 25% HP)")?.value).toBe("+5 Bullet Storm Stacks");

    const healthy = run("foundations-vengeance", { healthPct: 0.9 });
    expect(damageRow(healthy, "Foundation's Vengeance")).toBeUndefined();

    // The stacks reach the Bullet Storm maths: Resolute Veteran's floor of 5 still holds.
    const resolute = run("resolute-veteran", { bulletStormStacks: 0 }, [], [{ cardId: "bullet-storm", rank: 3 }]);
    expect(damageRow(resolute, "Bullet Storm (5 Stacks)")?.value).toBe("+45%");
  });

  it("ignores a reference-only unique and a shared chassis id", () => {
    // Molerat Bat is +50% damage to Molerats (model: null) and is built on the Baseball Bat.
    const molerat = run("molerat-bat", { onslaughtStacks: 10, targetCrippledLimbs: 4, isPowerAttacking: true });
    const plainBat = run("baseball-bat", { onslaughtStacks: 10, targetCrippledLimbs: 4, isPowerAttacking: true });
    expect(molerat.damagePerShot.breakdown.some((row) => row.source.includes("Molerat"))).toBe(false);
    expect(plainBat.damagePerShot.breakdown.some((row) => row.source.includes("Molerat"))).toBe(false);
  });
});
