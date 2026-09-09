import { describe, it, expect } from "vitest";
import {
  listWeaponInnateModOptions,
  listWeaponAvailableSlots,
  resolveWeaponArchetype,
  defaultWeaponInnateCrafting,
  getWeaponInnateModOption,
  calculateWeaponInnateAggregate,
} from "./weapon-piece-mods";
import { calculateCombatFirepower } from "./combat-firepower-engine";

describe("weapon-piece-mods - Archetype & Slot Resolution", () => {
  it("resolves authentic weapon archetypes correctly", () => {
    expect(resolveWeaponArchetype("fixer")).toBe("ballistic-rifle");
    expect(resolveWeaponArchetype("handmade")).toBe("ballistic-rifle");
    expect(resolveWeaponArchetype("railway")).toBe("railway");
    expect(resolveWeaponArchetype("ticket-to-revenge")).toBe("railway");
    expect(resolveWeaponArchetype("the-dragon")).toBe("black-powder");
    expect(resolveWeaponArchetype("holy-fire")).toBe("flamer");
    expect(resolveWeaponArchetype("flamer")).toBe("flamer");
    expect(resolveWeaponArchetype("cremator")).toBe("cremator");
    expect(resolveWeaponArchetype("tesla")).toBe("tesla");
    expect(resolveWeaponArchetype("v63-bertha")).toBe("tesla");
    expect(resolveWeaponArchetype("cold-shoulder")).toBe("double-barrel");
    expect(resolveWeaponArchetype("double-barrel")).toBe("double-barrel");
    expect(resolveWeaponArchetype("combat-shotgun")).toBe("combat-shotgun");
    expect(resolveWeaponArchetype("bow")).toBe("bow");
    expect(resolveWeaponArchetype("compound-bow")).toBe("bow");
    expect(resolveWeaponArchetype("chainsaw")).toBe("auto-melee");
    expect(resolveWeaponArchetype("auto-axe")).toBe("auto-melee");
    expect(resolveWeaponArchetype("dc-gauntlet")).toBe("unarmed");
    expect(resolveWeaponArchetype("power-fist")).toBe("unarmed");
    expect(resolveWeaponArchetype("super-sledge")).toBe("melee-blunt-blade");
    expect(resolveWeaponArchetype("plasma-gun")).toBe("plasma");
    expect(resolveWeaponArchetype("enclave-plasma")).toBe("plasma");
    expect(resolveWeaponArchetype("cal50")).toBe("heavy-ballistic");
    expect(resolveWeaponArchetype("minigun")).toBe("heavy-ballistic");
    expect(resolveWeaponArchetype("44-pistol")).toBe("revolver");
    expect(resolveWeaponArchetype("western-revolver")).toBe("revolver");
  });

  it("provides authentic slot lists per archetype (no invalid slots)", () => {
    // Railway Rifle: 5 slots, NO magazine, NO suppressor
    const railwaySlots = listWeaponAvailableSlots("railway");
    expect(railwaySlots.map((s) => s.key)).toEqual(["receiver", "barrel", "stock", "sight", "muzzle"]);
    expect(railwaySlots.some((s) => s.key === "magazine")).toBe(false);

    // Bow: exactly 2 slots (Arrow Frame and Sights)
    const bowSlots = listWeaponAvailableSlots("bow");
    expect(bowSlots.map((s) => s.key)).toEqual(["receiver", "sight"]);

    // Flamer / Holy Fire: 4 slots (Fuel Tank, Barrel, Propellant Tank, Flame Nozzle)
    const flamerSlots = listWeaponAvailableSlots("holy-fire");
    expect(flamerSlots.map((s) => s.key)).toEqual(["receiver", "barrel", "magazine", "muzzle"]);
    expect(flamerSlots.some((s) => s.key === "sight")).toBe(false);
    expect(flamerSlots.some((s) => s.key === "stock")).toBe(false);

    // Cremator: 3 slots (Combustion Tank, Barrel Manifold, Propellant Tank)
    const crematorSlots = listWeaponAvailableSlots("cremator");
    expect(crematorSlots.map((s) => s.key)).toEqual(["receiver", "barrel", "magazine"]);

    // Tesla Rifle: 3 slots (Charging Assembly, Stock, Sight)
    const teslaSlots = listWeaponAvailableSlots("tesla");
    expect(teslaSlots.map((s) => s.key)).toEqual(["receiver", "stock", "sight"]);

    // Double-Barrel / Cold Shoulder: 5 slots, NO magazine
    const dbSlots = listWeaponAvailableSlots("cold-shoulder");
    expect(dbSlots.map((s) => s.key)).toEqual(["receiver", "barrel", "stock", "sight", "muzzle"]);
    expect(dbSlots.some((s) => s.key === "magazine")).toBe(false);

    // Auto-Melee (Chainsaw): 2 slots (Bar and Elemental)
    const chainsawSlots = listWeaponAvailableSlots("chainsaw");
    expect(chainsawSlots.map((s) => s.key)).toEqual(["barrel", "receiver"]);

    // Unarmed (Deathclaw Gauntlet): 2 slots (Claw and Grip)
    const dcSlots = listWeaponAvailableSlots("dc-gauntlet");
    expect(dcSlots.map((s) => s.key)).toEqual(["barrel", "stock"]);

    // Ballistic Rifle (Fixer): full 6 slots
    const fixerSlots = listWeaponAvailableSlots("fixer");
    expect(fixerSlots.length).toBe(6);
  });
});

describe("weapon-piece-mods - Weapon-Specific Mod Pools", () => {
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

  it("provides authentic Railway Rifle mods (Automatic Piston, Recoil Stock, Bayonet)", () => {
    const receivers = listWeaponInnateModOptions("railway", "receiver");
    expect(receivers.some((r) => r.id === "auto-piston-receiver")).toBe(true);

    const stocks = listWeaponInnateModOptions("railway", "stock");
    expect(stocks.some((s) => s.id === "railway-recoil-stock")).toBe(true);

    const muzzles = listWeaponInnateModOptions("railway", "muzzle");
    expect(muzzles.some((m) => m.id === "railway-large-bayonet")).toBe(true);

    // Railway has no magazine options
    const mags = listWeaponInnateModOptions("railway", "magazine");
    expect(mags.length).toBe(0);
  });

  it("provides authentic Flamer & Holy Fire mods (Napalm Tank, Huge Propellant, Vaporization Nozzle)", () => {
    const receivers = listWeaponInnateModOptions("holy-fire", "receiver");
    expect(receivers.some((r) => r.id === "flamer-napalm-tank")).toBe(true);

    const mags = listWeaponInnateModOptions("holy-fire", "magazine");
    expect(mags.some((m) => m.id === "flamer-huge-tank")).toBe(true);

    const muzzles = listWeaponInnateModOptions("holy-fire", "muzzle");
    expect(muzzles.some((m) => m.id === "flamer-vaporization-nozzle")).toBe(true);

    // Flamer has no sight options
    const sights = listWeaponInnateModOptions("holy-fire", "sight");
    expect(sights.length).toBe(0);
  });

  it("provides authentic Cremator mods (Slow-Burning Tank, Quad Barrel, Huge Propellant)", () => {
    const receivers = listWeaponInnateModOptions("cremator", "receiver");
    expect(receivers.some((r) => r.id === "cremator-slow-burn-tank")).toBe(true);

    const barrels = listWeaponInnateModOptions("cremator", "barrel");
    expect(barrels.some((b) => b.id === "cremator-quad-barrel")).toBe(true);

    const mags = listWeaponInnateModOptions("cremator", "magazine");
    expect(mags.some((m) => m.id === "cremator-huge-tank")).toBe(true);
  });

  it("provides authentic Archery mods (Plasma, Explosive, Cryo, Flaming Arrow Frames)", () => {
    const frames = listWeaponInnateModOptions("bow", "receiver");
    expect(frames.some((f) => f.id === "bow-plasma-arrows")).toBe(true);
    expect(frames.some((f) => f.id === "bow-explosive-arrows")).toBe(true);
    expect(frames.some((f) => f.id === "bow-cryo-arrows")).toBe(true);
    expect(frames.some((f) => f.id === "bow-flaming-arrows")).toBe(true);

    const sights = listWeaponInnateModOptions("bow", "sight");
    expect(sights.some((s) => s.id === "bow-glow-sights")).toBe(true);

    // Bows have no barrel, stock, mag, or muzzle
    expect(listWeaponInnateModOptions("bow", "barrel").length).toBe(0);
    expect(listWeaponInnateModOptions("bow", "stock").length).toBe(0);
    expect(listWeaponInnateModOptions("bow", "magazine").length).toBe(0);
    expect(listWeaponInnateModOptions("bow", "muzzle").length).toBe(0);
  });

  it("provides authentic Auto-Melee mods (Dual Bar, Bow Bar, Flamer, Electrified)", () => {
    const bars = listWeaponInnateModOptions("chainsaw", "barrel");
    expect(bars.some((b) => b.id === "chainsaw-dual-bar")).toBe(true);
    expect(bars.some((b) => b.id === "chainsaw-bow-bar")).toBe(true);

    const elementals = listWeaponInnateModOptions("chainsaw", "receiver");
    expect(elementals.some((e) => e.id === "chainsaw-flamer")).toBe(true);
    expect(elementals.some((e) => e.id === "auto-axe-electrified")).toBe(true);
  });

  it("provides authentic Unarmed mods (Extra Claw, Power Fist Puncturing)", () => {
    const claws = listWeaponInnateModOptions("dc-gauntlet", "barrel");
    expect(claws.some((c) => c.id === "extra-claw")).toBe(true);

    const fistMods = listWeaponInnateModOptions("power-fist", "barrel");
    expect(fistMods.some((f) => f.id === "power-fist-puncturing")).toBe(true);
    expect(fistMods.some((f) => f.id === "power-fist-heating-coil")).toBe(true);
  });
});

describe("weapon-piece-mods - Calculations & Combat Math", () => {
  it("calculates aggregate modifiers accurately for Railway Rifle auto piston", () => {
    const railwayCrafting = defaultWeaponInnateCrafting("railway");
    const agg = calculateWeaponInnateAggregate("railway", railwayCrafting);

    expect(agg.isAutomatic).toBe(true);
    expect(agg.fireRatePct).toBeGreaterThan(0);
    expect(agg.apCostPct).toBeLessThan(0); // Reflex sight & piston reduce AP
    expect(agg.durabilityPct).toBeGreaterThan(0); // Recoil stock boosts durability
  });

  it("calculates aggregate modifiers accurately for Bows without bleeding invalid slots", () => {
    const bowCrafting = {
      receiverId: "bow-plasma-arrows",
      sightId: "bow-glow-sights",
      // Even if invalid keys were left over from another weapon:
      magazineId: "perforating-magazine",
      muzzleId: "suppressor"
    };

    const agg = calculateWeaponInnateAggregate("bow", bowCrafting);
    expect(agg.damagePct).toBe(0.30); // From plasma arrows
    expect(agg.apCostPct).toBe(-0.10); // From glow sights
    expect(agg.armorPenetrationPct).toBe(0); // Inapplicable perforating magazine must NOT be counted!
    expect(agg.isSuppressed).toBe(false); // Inapplicable suppressor must NOT be counted!
  });

  it("integrates authentic weapon crafting into Combat Firepower Engine", () => {
    // Railway Rifle automatic DPS calculation
    const railwayCrafting = defaultWeaponInnateCrafting("railway");
    const fpAutoRailway = calculateCombatFirepower({
      weaponId: "railway",
      weaponCrafting: railwayCrafting,
      equippedMods: [],
      equippedPerks: [],
      playerStats: {
        agility: 15,
        luck: 15,
        strength: 15,
      },
    });

    expect(fpAutoRailway.fireRate.isAutomatic).toBe(true);
    expect(fpAutoRailway.fireRate.rps).toBeGreaterThan(5);

    // Holy Fire Flamer
    const flamerCrafting = defaultWeaponInnateCrafting("holy-fire");
    const fpFlamer = calculateCombatFirepower({
      weaponId: "holy-fire",
      weaponCrafting: flamerCrafting,
      equippedMods: [],
      equippedPerks: [],
      playerStats: {
        agility: 15,
        luck: 15,
        strength: 15,
      },
    });

    expect(fpFlamer.magazineCapacity.effective).toBe(400); // Huge Propellant Tank (+100% on Holy Fire 200 base)
  });
});
