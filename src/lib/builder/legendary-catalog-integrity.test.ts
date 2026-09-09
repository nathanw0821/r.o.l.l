import { describe, it, expect } from "vitest";
import { getCachedBuilderModCatalog } from "./get-builder-mod-catalog";
import {
  collectEquippedLegendaryModIds,
  listEquippedModsInBenchOrder,
  filterModsForSlot
} from "./compatibility";
import type { BuilderPayload, BuilderModDTO } from "./types";
import { FALLBACK_LEGENDARY_EFFECTS } from "../static-fallback-catalog";

describe("Legendary Catalog Integrity & V.A.T.S. Optimized / Lucky Hit Verification", () => {
  it("should contain all 148 canonical effects in FALLBACK_LEGENDARY_EFFECTS", () => {
    expect(FALLBACK_LEGENDARY_EFFECTS.length).toBeGreaterThanOrEqual(148);
  });

  it("should have Lucky Hit as canonical 3-star weapon effect in FALLBACK_LEGENDARY_EFFECTS", () => {
    const luckyHit = FALLBACK_LEGENDARY_EFFECTS.find(
      (r) => r.id === "effect-3star-lucky-hit" || r.effectName === "Lucky Hit"
    );
    expect(luckyHit).toBeDefined();
    expect(luckyHit?.tierLabel).toBe("3 Star");
    expect(luckyHit?.categories).toContain("Weapon");
    expect(luckyHit?.description).toContain("15 bonus V.A.T.S. critical charge");
  });

  it("should have V.A.T.S. Optimized as 3-star weapon effect in FALLBACK_LEGENDARY_EFFECTS", () => {
    const vatsOpt = FALLBACK_LEGENDARY_EFFECTS.find(
      (r) => r.effectName === "V.A.T.S. Optimized"
    );
    expect(vatsOpt).toBeDefined();
    expect(vatsOpt?.tierLabel).toBe("3 Star");
    expect(vatsOpt?.categories).toContain("Weapon");
    expect(vatsOpt?.description).toContain("action point cost");
  });

  it("should load a complete builder mod catalog with V.A.T.S. Optimized at 3-star and Lucky Hit at 3-star", async () => {
    const catalog = await getCachedBuilderModCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(148);

    // Verify V.A.T.S. Optimized
    const vatsOpt = catalog.find(
      (m) => m.name === "V.A.T.S. Optimized" || m.slug.includes("vats-optimized")
    );
    expect(vatsOpt).toBeDefined();
    expect(vatsOpt?.starRank).toBe(3);
    expect(vatsOpt?.allowedOnWeapon).toBe(true);
    expect(vatsOpt?.description).toBeTruthy();

    // Verify Lucky Hit
    const luckyHit = catalog.find(
      (m) => m.name === "Lucky Hit" || m.slug === "lucky-hit"
    );
    expect(luckyHit).toBeDefined();
    expect(luckyHit?.starRank).toBe(3);
    expect(luckyHit?.allowedOnWeapon).toBe(true);
    expect(luckyHit?.name).toBe("Lucky Hit");

    // Verify Rapid is 2-star
    const rapid = catalog.find((m) => m.name === "Rapid" && m.starRank === 2);
    expect(rapid).toBeDefined();
    expect(rapid?.allowedOnWeapon).toBe(true);

    // Verify Vital is 2-star
    const vital = catalog.find((m) => m.name === "Vital" && m.starRank === 2);
    expect(vital).toBeDefined();
    expect(vital?.allowedOnWeapon).toBe(true);
  });

  it("filterModsForSlot correctly places V.A.T.S. Optimized in slot index 2 (3-star) and NOT in slot index 1 (2-star)", async () => {
    const catalog = await getCachedBuilderModCatalog();
    const dtos: BuilderModDTO[] = catalog.map((m) => ({
      ...m,
      effectMath: typeof m.effectMath === "object" && m.effectMath !== null ? (m.effectMath as Record<string, unknown>) : {},
      craftingCost: typeof m.craftingCost === "object" && m.craftingCost !== null ? (m.craftingCost as Record<string, unknown>) : {},
      trackerUnlock: "unlocked" as const
    }));

    const weaponPiece = {
      id: "the-fixer",
      name: "The Fixer",
      kind: "weapon" as const,
      label: "The Fixer",
      weaponSub: "ranged" as const
    };

    // Slot index 1 is 2-Star
    const star2Mods = filterModsForSlot(dtos, weaponPiece, 1);
    const vatsInStar2 = star2Mods.find((m) => m.name === "V.A.T.S. Optimized");
    expect(vatsInStar2).toBeUndefined();

    // Slot index 2 is 3-Star
    const star3Mods = filterModsForSlot(dtos, weaponPiece, 2);
    const vatsInStar3 = star3Mods.find((m) => m.name === "V.A.T.S. Optimized");
    expect(vatsInStar3).toBeDefined();
    expect(vatsInStar3?.starRank).toBe(3);

    const luckyInStar3 = star3Mods.find((m) => m.name === "Lucky Hit");
    expect(luckyInStar3).toBeDefined();
    expect(luckyInStar3?.starRank).toBe(3);
  });

  it("collectEquippedLegendaryModIds & listEquippedModsInBenchOrder collect BOTH weapon and armor mods", () => {
    const payload: BuilderPayload = {
      version: 5,
      basePieceId: "civil-engineer-torso",
      equipmentKind: "armor",
      weaponSub: null,
      legendaryModIds: ["seed-bloodied", "seed-rapid", "seed-vats-optimized", null],
      armorLegendaryModIds: [
        ["seed-unyielding", "seed-powered", "seed-sentinel", null],
        ["seed-overeaters", null, null, null],
        [null, null, null, null],
        [null, null, null, null],
        [null, null, null, null]
      ],
      armorPieceCrafting: [],
      powerArmorHelmetId: null,
      powerArmorHelmetCrafting: { materialModId: "", miscModId: "" },
      powerArmorPiecesEquipped: [true, true, true, true, true, true],
      ghoul: false,
      underarmor: { shellId: "", liningId: null, styleId: null },
      mutationIds: [],
      ignoreMutationPenalties: false,
      baseSpecial: {},
      legendaryPerkIds: [],
      hasStrangeInNumbers: false
    };

    const equippedIds = collectEquippedLegendaryModIds(payload);
    expect(equippedIds).toContain("seed-bloodied");
    expect(equippedIds).toContain("seed-rapid");
    expect(equippedIds).toContain("seed-vats-optimized");
    expect(equippedIds).toContain("seed-unyielding");
    expect(equippedIds).toContain("seed-powered");
    expect(equippedIds).toContain("seed-sentinel");
    expect(equippedIds).toContain("seed-overeaters");

    const mockMods: BuilderModDTO[] = [
      { id: "seed-bloodied", slug: "bloodied", name: "Bloodied", starRank: 1, category: "Weapon", subCategory: null, description: "+Damage", effectMath: {}, craftingCost: {}, allowedOnPowerArmor: false, allowedOnArmor: false, allowedOnWeapon: true, infestationOnly: false, fifthStarEligible: false, ghoulSpecialCap: null, trackerUnlock: "unlocked" },
      { id: "seed-rapid", slug: "rapid", name: "Rapid", starRank: 2, category: "Weapon", subCategory: null, description: "+Fire Rate", effectMath: {}, craftingCost: {}, allowedOnPowerArmor: false, allowedOnArmor: false, allowedOnWeapon: true, infestationOnly: false, fifthStarEligible: false, ghoulSpecialCap: null, trackerUnlock: "unlocked" },
      { id: "seed-vats-optimized", slug: "vats-optimized", name: "V.A.T.S. Optimized", starRank: 3, category: "Weapon", subCategory: null, description: "-35% AP", effectMath: {}, craftingCost: {}, allowedOnPowerArmor: false, allowedOnArmor: false, allowedOnWeapon: true, infestationOnly: false, fifthStarEligible: false, ghoulSpecialCap: null, trackerUnlock: "unlocked" },
      { id: "seed-unyielding", slug: "unyielding", name: "Unyielding", starRank: 1, category: "Armor", subCategory: null, description: "+SPECIAL", effectMath: {}, craftingCost: {}, allowedOnPowerArmor: false, allowedOnArmor: true, allowedOnWeapon: false, infestationOnly: false, fifthStarEligible: false, ghoulSpecialCap: null, trackerUnlock: "unlocked" },
      { id: "seed-powered", slug: "powered", name: "Powered", starRank: 2, category: "Armor", subCategory: null, description: "+AP Regen", effectMath: {}, craftingCost: {}, allowedOnPowerArmor: true, allowedOnArmor: true, allowedOnWeapon: false, infestationOnly: false, fifthStarEligible: false, ghoulSpecialCap: null, trackerUnlock: "unlocked" },
      { id: "seed-sentinel", slug: "sentinel", name: "Sentinel's", starRank: 3, category: "Armor", subCategory: null, description: "DR while standing", effectMath: {}, craftingCost: {}, allowedOnPowerArmor: true, allowedOnArmor: true, allowedOnWeapon: false, infestationOnly: false, fifthStarEligible: false, ghoulSpecialCap: null, trackerUnlock: "unlocked" },
      { id: "seed-overeaters", slug: "over-eaters", name: "Overeater's", starRank: 1, category: "Armor", subCategory: null, description: "DR while full", effectMath: {}, craftingCost: {}, allowedOnPowerArmor: true, allowedOnArmor: true, allowedOnWeapon: false, infestationOnly: false, fifthStarEligible: false, ghoulSpecialCap: null, trackerUnlock: "unlocked" }
    ];

    const benchOrdered = listEquippedModsInBenchOrder(payload, mockMods);
    const names = benchOrdered.map((m) => m.name);
    expect(names).toContain("Bloodied");
    expect(names).toContain("Rapid");
    expect(names).toContain("V.A.T.S. Optimized");
    expect(names).toContain("Unyielding");
    expect(names).toContain("Powered");
    expect(names).toContain("Sentinel's");
    expect(names).toContain("Overeater's");
  });

  it("filterModsForSlot for Elder's Mark (Ranged) returns exact authentic 2★, 3★, and 4★ pools with no melee or armor bleed", async () => {
    const catalog = await getCachedBuilderModCatalog();
    const dtos: BuilderModDTO[] = catalog.map((m) => ({
      ...m,
      effectMath: typeof m.effectMath === "object" && m.effectMath !== null ? (m.effectMath as Record<string, unknown>) : {},
      craftingCost: typeof m.craftingCost === "object" && m.craftingCost !== null ? (m.craftingCost as Record<string, unknown>) : {},
      trackerUnlock: "unlocked" as const
    }));

    const eldersMark = {
      id: "elders-mark",
      name: "Elder's Mark",
      kind: "weapon" as const,
      label: "Elder's Mark",
      weaponSub: "ranged" as const
    };

    // 1-star (Slot 0): 28 mods (all ranged + universal, no melee-only Feral's)
    const star1 = filterModsForSlot(dtos, eldersMark, 0);
    expect(star1.length).toBe(28);
    expect(star1.map(m => m.name)).toContain("Anti-armor");
    expect(star1.map(m => m.name)).toContain("Bloodied");
    expect(star1.map(m => m.name)).toContain("Quad");
    expect(star1.map(m => m.name)).toContain("Two Shot");
    expect(star1.map(m => m.name)).not.toContain("Feral's");
    expect(star1.some(m => m.category === "Armor")).toBe(false);

    // 2-star (Slot 1): 9 mods
    const star2 = filterModsForSlot(dtos, eldersMark, 1);
    expect(star2.length).toBe(9);
    const star2Names = star2.map(m => m.name);
    expect(star2Names).toContain("Rapid");
    expect(star2Names).toContain("Vital");
    expect(star2Names).toContain("Explosive");
    expect(star2Names).toContain("Hitman's");
    expect(star2Names).toContain("Crippling");
    expect(star2Names).toContain("Inertial");
    expect(star2Names).toContain("Last Shot");
    expect(star2Names).toContain("V.A.T.S. Enhanced");
    expect(star2Names).toContain("Basher's");
    // Melee-only effects must not appear
    expect(star2Names).not.toContain("Heavy Hitter's");
    expect(star2Names).not.toContain("Steady");
    expect(star2Names).not.toContain("Riposting");
    expect(star2Names).not.toContain("Pick Pocketer's");

    // 3-star (Slot 2): 17 mods
    const star3 = filterModsForSlot(dtos, eldersMark, 2);
    expect(star3.length).toBe(17);
    const star3Names = star3.map(m => m.name);
    expect(star3Names).toContain("V.A.T.S. Optimized");
    expect(star3Names).toContain("Swift");
    expect(star3Names).toContain("Lucky Hit");
    expect(star3Names).toContain("Durability");
    expect(star3Names).toContain("Lightweight");
    expect(star3Names).toContain("Ghost's");
    expect(star3Names).toContain("Nimble");
    expect(star3Names).toContain("Steadfast");
    expect(star3Names).toContain("Resilient");
    expect(star3Names).toContain("Agility");
    expect(star3Names).toContain("Strength");
    // Melee-only effects must not appear
    expect(star3Names).not.toContain("Defender's");
    expect(star3Names).not.toContain("Barbarian");
    expect(star3Names).not.toContain("Blocker");

    // 4-star (Slot 3): 13 mods
    const star4 = filterModsForSlot(dtos, eldersMark, 3);
    expect(star4.length).toBe(13);
    const star4Names = star4.map(m => m.name);
    expect(star4Names).toContain("Pin-Pointer's");
    expect(star4Names).toContain("Polished");
    expect(star4Names).toContain("Tarnished");
    expect(star4Names).toContain("Bully's");
    expect(star4Names).toContain("Conductor's");
    expect(star4Names).toContain("Electrician's");
    expect(star4Names).toContain("Encircler's");
    expect(star4Names).toContain("Fracturer's");
    expect(star4Names).toContain("Pyromaniac's");
    expect(star4Names).toContain("Satiated");
    expect(star4Names).toContain("Stabilizer's");
    expect(star4Names).toContain("Thrill-Seeker's");
    expect(star4Names).toContain("Viper's");
    // Melee-only effects must not appear
    expect(star4Names).not.toContain("Charged");
    expect(star4Names).not.toContain("Fencer's");
    expect(star4Names).not.toContain("Icemen's");
    expect(star4Names).not.toContain("Pounder's");
  });

  it("filterModsForSlot for Melee weapon includes melee-only and excludes ranged-only effects", async () => {
    const catalog = await getCachedBuilderModCatalog();
    const dtos: BuilderModDTO[] = catalog.map((m) => ({
      ...m,
      effectMath: typeof m.effectMath === "object" && m.effectMath !== null ? (m.effectMath as Record<string, unknown>) : {},
      craftingCost: typeof m.craftingCost === "object" && m.craftingCost !== null ? (m.craftingCost as Record<string, unknown>) : {},
      trackerUnlock: "unlocked" as const
    }));

    const meleePiece = {
      id: "auto-axe",
      name: "Auto-Axe",
      kind: "weapon" as const,
      label: "Auto-Axe",
      weaponSub: "melee" as const
    };

    // 1-star: includes Feral's, excludes Quad, Two Shot
    const star1 = filterModsForSlot(dtos, meleePiece, 0);
    expect(star1.map(m => m.name)).toContain("Feral's");
    expect(star1.map(m => m.name)).not.toContain("Quad");
    expect(star1.map(m => m.name)).not.toContain("Two Shot");

    // 2-star: includes Heavy Hitter's, Steady, Riposting; excludes Explosive, Hitman's
    const star2 = filterModsForSlot(dtos, meleePiece, 1);
    expect(star2.map(m => m.name)).toContain("Heavy Hitter's");
    expect(star2.map(m => m.name)).toContain("Steady");
    expect(star2.map(m => m.name)).toContain("Riposting");
    expect(star2.map(m => m.name)).not.toContain("Explosive");
    expect(star2.map(m => m.name)).not.toContain("Hitman's");
    expect(star2.map(m => m.name)).not.toContain("Last Shot");

    // 3-star: includes Defender's, Barbarian, Blocker; excludes Swift, Nimble, Steadfast
    const star3 = filterModsForSlot(dtos, meleePiece, 2);
    expect(star3.map(m => m.name)).toContain("Defender's");
    expect(star3.map(m => m.name)).toContain("Barbarian");
    expect(star3.map(m => m.name)).toContain("Blocker");
    expect(star3.map(m => m.name)).not.toContain("Swift");
    expect(star3.map(m => m.name)).not.toContain("Nimble");
    expect(star3.map(m => m.name)).not.toContain("Steadfast");

    // 4-star: includes Charged, Fencer's, Icemen's, Pounder's; excludes Pin-Pointer's, Stabilizer's
    const star4 = filterModsForSlot(dtos, meleePiece, 3);
    expect(star4.map(m => m.name)).toContain("Charged");
    expect(star4.map(m => m.name)).toContain("Fencer's");
    expect(star4.map(m => m.name)).toContain("Icemen's");
    expect(star4.map(m => m.name)).toContain("Pounder's");
    expect(star4.map(m => m.name)).not.toContain("Pin-Pointer's");
    expect(star4.map(m => m.name)).not.toContain("Stabilizer's");
    expect(star4.map(m => m.name)).not.toContain("Electrician's");
  });

  it("filterModsForSlot for Regular Armor includes Nocturnal and all dual-purpose effects", async () => {
    const catalog = await getCachedBuilderModCatalog();
    const dtos: BuilderModDTO[] = catalog.map((m) => ({
      ...m,
      effectMath: typeof m.effectMath === "object" && m.effectMath !== null ? (m.effectMath as Record<string, unknown>) : {},
      craftingCost: typeof m.craftingCost === "object" && m.craftingCost !== null ? (m.craftingCost as Record<string, unknown>) : {},
      trackerUnlock: "unlocked" as const
    }));

    const armorPiece = {
      id: "civil-engineer-torso",
      name: "Civil Engineer Armor Torso",
      kind: "armor" as const,
      label: "Civil Engineer Armor Torso"
    };

    // 1-star: exactly 22 authentic effects including Nocturnal & dual weapon/armor effects
    const star1 = filterModsForSlot(dtos, armorPiece, 0);
    const star1Names = star1.map(m => m.name);
    expect(star1.length).toBe(22);
    expect(star1Names).toContain("Nocturnal");
    expect(star1Names).toContain("Adrenal");
    expect(star1Names).toContain("Assassin's");
    expect(star1Names).toContain("Exterminator's");
    expect(star1Names).toContain("Ghoul Slayer's");
    expect(star1Names).toContain("Hunter's");
    expect(star1Names).toContain("Lucid");
    expect(star1Names).toContain("Mutant Slayer's");
    expect(star1Names).toContain("Mutant's");
    expect(star1Names).toContain("Troubleshooter's");
    expect(star1Names).toContain("Zealot's");
    expect(star1Names).toContain("Overeater's");
    expect(star1Names).toContain("Unyielding");
    expect(star1Names).toContain("Bolstering");
    expect(star1Names).toContain("Vanguard's");
    expect(star1Names).toContain("Heavyweight");
    expect(star1Names).toContain("Life Saving");

    // Weapon-only effects must NOT bleed into armor
    expect(star1Names).not.toContain("Bloodied");
    expect(star1Names).not.toContain("Anti-armor");
    expect(star1Names).not.toContain("Quad");
    expect(star1Names).not.toContain("Two Shot");
    expect(star1Names).not.toContain("Furious");
    expect(star1Names).not.toContain("Instigating");
  });

  it("filterModsForSlot for Power Armor includes Nocturnal, Unyielding, and excludes non-PA armor effects", async () => {
    const catalog = await getCachedBuilderModCatalog();
    const dtos: BuilderModDTO[] = catalog.map((m) => ({
      ...m,
      effectMath: typeof m.effectMath === "object" && m.effectMath !== null ? (m.effectMath as Record<string, unknown>) : {},
      craftingCost: typeof m.craftingCost === "object" && m.craftingCost !== null ? (m.craftingCost as Record<string, unknown>) : {},
      trackerUnlock: "unlocked" as const
    }));

    const paPiece = {
      id: "t65-torso",
      name: "T-65 Torso",
      kind: "powerArmor" as const,
      label: "T-65 Power Armor (full set)"
    };

    // 1-star: exactly 20 authentic effects
    const star1 = filterModsForSlot(dtos, paPiece, 0);
    const star1Names = star1.map(m => m.name);
    expect(star1.length).toBe(20);
    expect(star1Names).toContain("Nocturnal");
    expect(star1Names).toContain("Unyielding");
    expect(star1Names).toContain("Overeater's");
    expect(star1Names).toContain("Bolstering");
    expect(star1Names).toContain("Vanguard's");
    expect(star1Names).toContain("Assassin's");
    expect(star1Names).toContain("Mutant's");

    // Regular-armor-only and weapon-only must not appear on PA
    expect(star1Names).not.toContain("Heavyweight");
    expect(star1Names).not.toContain("Life Saving");
    expect(star1Names).not.toContain("Bloodied");
    expect(star1Names).not.toContain("Quad");
  });
});
