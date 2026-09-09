import { describe, it, expect } from "vitest";
import { calculateStanceAndBiometricModifiers } from "./stance-biometrics-engine";
import type { BuilderModDTO } from "./types";
import type { CombatSwitchboardState } from "@/components/builder/builder-combat-switchboard";

function createMockMod(slug: string, name: string, category: "Armor" | "Weapon" = "Armor"): BuilderModDTO {
  return {
    id: `mod-${slug}`,
    slug,
    name,
    starRank: 1,
    category,
    subCategory: null,
    description: name,
    effectMath: {},
    craftingCost: {},
    allowedOnArmor: category === "Armor",
    allowedOnPowerArmor: category === "Armor",
    allowedOnWeapon: category === "Weapon",
    infestationOnly: false,
    fifthStarEligible: false,
    ghoulSpecialCap: null,
    trackerUnlock: "unlocked",
  };
}

describe("stance-biometrics-engine", () => {
  it("applies Nocturnal +4 PER and +4 AGI per armor piece when crouched/stealthed", () => {
    const mods = [
      createMockMod("nocturnal-armor", "Nocturnal"),
      createMockMod("nocturnal-armor", "Nocturnal"),
      createMockMod("nocturnal-armor", "Nocturnal"),
      createMockMod("nocturnal-armor", "Nocturnal"),
      createMockMod("nocturnal-armor", "Nocturnal"),
    ];

    const switchboard: CombatSwitchboardState = {
      healthPct: 100,
      timeOfDay: "day",
      combatStance: {
        isCrouched: true,
        isSneaking: true,
        isAiming: false,
        isPowerAttacking: false,
        isSprinting: false,
      },
      inPowerArmor: false,
      activeFood: null,
      activeFoods: {},
      activeDrug: null,
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeCampBuffs: [],
      targetEnemy: "superMutant",
    };

    const res = calculateStanceAndBiometricModifiers({
      switchboard,
      equippedMods: mods,
      isGhoul: false,
    });

    expect(res.layer.per).toBe(20);
    expect(res.layer.agi).toBe(20);
    expect(res.specialBreakdowns.some((b) => b.stat === "per" && b.val === 20)).toBe(true);
    expect(res.specialBreakdowns.some((b) => b.stat === "agi" && b.val === 20)).toBe(true);
    expect(res.activeTacticalTags).toContain("Nocturnal (+20 PER, +20 AGI)");
    expect(res.activeTacticalTags).toContain("Sneak Attack Multiplier (2.0×–2.5×)");
  });

  it("does not apply Nocturnal SPECIAL bonuses during daytime when standing upright", () => {
    const mods = [
      createMockMod("nocturnal-armor", "Nocturnal"),
      createMockMod("nocturnal-armor", "Nocturnal"),
    ];

    const switchboard: CombatSwitchboardState = {
      healthPct: 100,
      timeOfDay: "day",
      combatStance: {
        isCrouched: false,
        isSneaking: false,
        isAiming: false,
        isPowerAttacking: false,
        isSprinting: false,
      },
      inPowerArmor: false,
      activeFood: null,
      activeFoods: {},
      activeDrug: null,
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeCampBuffs: [],
      targetEnemy: "superMutant",
    };

    const res = calculateStanceAndBiometricModifiers({
      switchboard,
      equippedMods: mods,
      isGhoul: false,
    });

    expect(res.layer.per).toBe(0);
    expect(res.layer.agi).toBe(0);
  });

  it("applies Nocturnal SPECIAL bonuses at night even if standing upright", () => {
    const mods = [
      createMockMod("nocturnal-armor", "Nocturnal"),
      createMockMod("nocturnal-armor", "Nocturnal"),
    ];

    const switchboard: CombatSwitchboardState = {
      healthPct: 100,
      timeOfDay: "night",
      combatStance: {
        isCrouched: false,
        isSneaking: false,
        isAiming: false,
        isPowerAttacking: false,
        isSprinting: false,
      },
      inPowerArmor: false,
      activeFood: null,
      activeFoods: {},
      activeDrug: null,
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeCampBuffs: [],
      targetEnemy: "superMutant",
    };

    const res = calculateStanceAndBiometricModifiers({
      switchboard,
      equippedMods: mods,
      isGhoul: false,
    });

    expect(res.layer.per).toBe(8);
    expect(res.layer.agi).toBe(8);
  });

  it("applies Chameleon +2 AGI per piece when crouched/stealthed", () => {
    const mods = [
      createMockMod("chameleon-armor", "Chameleon"),
      createMockMod("chameleon-armor", "Chameleon"),
    ];

    const switchboard: CombatSwitchboardState = {
      healthPct: 100,
      combatStance: {
        isCrouched: true,
        isSneaking: true,
        isAiming: false,
        isPowerAttacking: false,
        isSprinting: false,
      },
      inPowerArmor: false,
      activeFood: null,
      activeFoods: {},
      activeDrug: null,
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeCampBuffs: [],
      targetEnemy: "superMutant",
    };

    const res = calculateStanceAndBiometricModifiers({
      switchboard,
      equippedMods: mods,
      isGhoul: false,
    });

    expect(res.layer.agi).toBe(4);
    expect(res.activeTacticalTags).toContain("Chameleon (+4 AGI, Stealth Field)");
  });

  it("applies Unyielding +3 all SPECIALs (except END) on low health (<=20%) for humans", () => {
    const mods = [
      createMockMod("unyielding", "Unyielding"),
      createMockMod("unyielding", "Unyielding"),
      createMockMod("unyielding", "Unyielding"),
      createMockMod("unyielding", "Unyielding"),
      createMockMod("unyielding", "Unyielding"),
    ];

    const switchboard: CombatSwitchboardState = {
      healthPct: 20,
      inPowerArmor: false,
      activeFood: null,
      activeFoods: {},
      activeDrug: null,
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeCampBuffs: [],
      targetEnemy: "superMutant",
    };

    const res = calculateStanceAndBiometricModifiers({
      switchboard,
      equippedMods: mods,
      isGhoul: false,
    });

    expect(res.layer.str).toBe(15);
    expect(res.layer.per).toBe(15);
    expect(res.layer.end).toBe(0); // END is explicitly excluded per game rules
    expect(res.layer.cha).toBe(15);
    expect(res.layer.int).toBe(15);
    expect(res.layer.agi).toBe(15);
    expect(res.layer.lck).toBe(15);
  });

  it("suppresses Unyielding bonuses when Ghoul biology is active", () => {
    const mods = [
      createMockMod("unyielding", "Unyielding"),
      createMockMod("unyielding", "Unyielding"),
    ];

    const switchboard: CombatSwitchboardState = {
      healthPct: 20,
      inPowerArmor: false,
      activeFood: null,
      activeFoods: {},
      activeDrug: null,
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeCampBuffs: [],
      targetEnemy: "superMutant",
    };

    const res = calculateStanceAndBiometricModifiers({
      switchboard,
      equippedMods: mods,
      isGhoul: true,
    });

    expect(res.layer.str).toBe(0);
    expect(res.layer.per).toBe(0);
    expect(res.layer.agi).toBe(0);
  });

  it("applies Steadfast +50 DR per piece while aiming down sights", () => {
    const mods = [
      createMockMod("steadfast", "Steadfast"),
      createMockMod("steadfast", "Steadfast"),
    ];

    const switchboard: CombatSwitchboardState = {
      healthPct: 100,
      combatStance: {
        isAiming: true,
        isSneaking: false,
        isSprinting: false,
        isPowerAttacking: false,
      },
      inPowerArmor: false,
      activeFood: null,
      activeFoods: {},
      activeDrug: null,
      activeBobblehead: null,
      activeMagazine: null,
      activeAlcohol: null,
      activeNukaCola: null,
      activeCompanion: null,
      activeCampBuffs: [],
      targetEnemy: "superMutant",
    };

    const res = calculateStanceAndBiometricModifiers({
      switchboard,
      equippedMods: mods,
      isGhoul: false,
    });

    expect(res.layer.dr).toBe(100);
    expect(res.resistanceBreakdowns.some((r) => r.res === "dr" && r.val === 100)).toBe(true);
  });
});
