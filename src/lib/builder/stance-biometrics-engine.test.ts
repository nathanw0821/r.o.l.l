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

  const baseSwitchboard = (extra: Partial<CombatSwitchboardState>): CombatSwitchboardState => ({
    healthPct: 100,
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
    ...extra,
  });

  it("Cavalier's tag states -10% damage taken while sprinting (Patch 66 value; the old -75% chance roll is gone)", () => {
    const res = calculateStanceAndBiometricModifiers({
      switchboard: baseSwitchboard({
        combatStance: { isSneaking: false, isSprinting: true, isAiming: false, isPowerAttacking: false },
      }),
      equippedMods: [createMockMod("cavaliers", "Cavalier's")],
      isGhoul: false,
    });
    expect(res.activeTacticalTags).toContain("Cavalier's (-10% damage taken · sprinting)");
    expect(res.layer.dr).toBe(0);
  });

  it("Sentinel's tag states -5% damage taken while standing still (current datamine text; was 15% per piece)", () => {
    const res = calculateStanceAndBiometricModifiers({
      switchboard: baseSwitchboard({
        combatStance: { isSneaking: false, isSprinting: false, isAiming: false, isPowerAttacking: false, isStationary: true },
      }),
      equippedMods: [createMockMod("sentinels", "Sentinel's"), createMockMod("sentinels", "Sentinel's")],
      isGhoul: false,
    });
    expect(res.activeTacticalTags).toContain("Sentinel's (-5% damage taken · standing still)");
  });

  it("Bolstering no longer adds flat DR/ER: Patch 66 made it a reducer that is full (-10%) at 5% HP", () => {
    const mods = [createMockMod("bolstering", "Bolstering"), createMockMod("bolstering", "Bolstering")];
    const low = calculateStanceAndBiometricModifiers({
      switchboard: baseSwitchboard({ healthPct: 5 }),
      equippedMods: mods,
      isGhoul: false,
    });
    expect(low.layer.dr).toBe(0);
    expect(low.layer.er).toBe(0);
    expect(low.resistanceBreakdowns).toHaveLength(0);
    expect(low.activeTacticalTags).toContain("Bolstering (approx.) (-10% damage taken · 5% HP)");

    const full = calculateStanceAndBiometricModifiers({
      switchboard: baseSwitchboard({ healthPct: 100 }),
      equippedMods: mods,
      isGhoul: false,
    });
    expect(full.activeTacticalTags.some((t) => t.startsWith("Bolstering"))).toBe(false);
  });

  it("Vanguard's no longer adds flat DR/ER: Patch 66 made it a reducer that is full (-10%) at full HP", () => {
    const res = calculateStanceAndBiometricModifiers({
      switchboard: baseSwitchboard({ healthPct: 100 }),
      equippedMods: [createMockMod("vanguards", "Vanguard's")],
      isGhoul: false,
    });
    expect(res.layer.dr).toBe(0);
    expect(res.activeTacticalTags).toContain("Vanguard's (approx.) (-10% damage taken · 100% HP)");
    const half = calculateStanceAndBiometricModifiers({
      switchboard: baseSwitchboard({ healthPct: 50 }),
      equippedMods: [createMockMod("vanguards", "Vanguard's")],
      isGhoul: false,
    });
    expect(half.activeTacticalTags).toContain("Vanguard's (approx.) (-5% damage taken · 50% HP)");
  });

  it("Mutant's no longer adds +10 DR/ER per piece: it is 1% damage taken per mutation, capped at 5%", () => {
    const res = calculateStanceAndBiometricModifiers({
      switchboard: baseSwitchboard({}),
      equippedMods: [createMockMod("mutants", "Mutant's")],
      isGhoul: false,
      activeMutations: ["marsupial", "speed-demon", "eagle-eyes", "bird-bones", "herbivore", "egg-head", "adrenal-reaction"],
    });
    expect(res.layer.dr).toBe(0);
    expect(res.activeTacticalTags).toContain("Mutant's (-5% damage taken · 7 mutations)");
    const none = calculateStanceAndBiometricModifiers({
      switchboard: baseSwitchboard({}),
      equippedMods: [createMockMod("mutants", "Mutant's")],
      isGhoul: false,
      activeMutations: [],
    });
    expect(none.activeTacticalTags.some((t) => t.startsWith("Mutant's"))).toBe(false);
  });
});
