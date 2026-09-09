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
});
