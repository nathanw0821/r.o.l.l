import { describe, it, expect } from "vitest";
import {
  encodeUnifiedBuildHash,
  decodeUnifiedBuildHash,
  DEFAULT_UNIFIED_MASTER_BUILD,
  type UnifiedMasterBuildState,
} from "./unified-builder-state";

describe("unified-builder-state", () => {
  it("encodes and decodes default build state flawlessly", () => {
    const hash = encodeUnifiedBuildHash(DEFAULT_UNIFIED_MASTER_BUILD);
    expect(hash.length).toBeGreaterThan(20);

    const decoded = decodeUnifiedBuildHash(hash);
    expect(decoded).not.toBeNull();
    expect(decoded?.basePieceId).toBe(DEFAULT_UNIFIED_MASTER_BUILD.basePieceId);
    expect(decoded?.specials).toEqual(DEFAULT_UNIFIED_MASTER_BUILD.specials);
    expect(decoded?.characterState.healthPct).toBe(100);
  });

  it("preserves custom biometrics, stances, and perk deck", () => {
    const customBuild: UnifiedMasterBuildState = {
      ...DEFAULT_UNIFIED_MASTER_BUILD,
      basePieceId: "railway-rifle",
      isGhoul: true,
      specials: { S: 15, P: 15, E: 5, C: 4, I: 7, A: 10, L: 10 },
      equippedPerkCards: [
        { cardId: "commando", rank: 3 },
        { cardId: "tank-killer", rank: 3 },
      ],
      characterState: {
        ...DEFAULT_UNIFIED_MASTER_BUILD.characterState,
        healthPct: 20,
        glowPct: 60,
        feralPct: 75,
        foodState: "well_fed",
        timeOfDay: "night",
        combatStance: {
          isSneaking: true,
          isSprinting: false,
          isAiming: true,
          isPowerAttacking: false,
        },
        caps: 38500,
      },
    };

    const hash = encodeUnifiedBuildHash(customBuild);
    const decoded = decodeUnifiedBuildHash(hash);

    expect(decoded?.basePieceId).toBe("railway-rifle");
    expect(decoded?.isGhoul).toBe(true);
    expect(decoded?.characterState.healthPct).toBe(20);
    expect(decoded?.characterState.glowPct).toBe(60);
    expect(decoded?.characterState.feralPct).toBe(75);
    expect(decoded?.characterState.combatStance.isSneaking).toBe(true);
    expect(decoded?.characterState.combatStance.isAiming).toBe(true);
    expect(decoded?.characterState.caps).toBe(38500);
    expect(decoded?.equippedPerkCards.length).toBe(2);
  });

  it("handles malformed hash strings gracefully", () => {
    expect(decodeUnifiedBuildHash("")).toBeNull();
    expect(decodeUnifiedBuildHash("xyz123_invalid")).toBeNull();
  });

  it("normalizes and preserves multi-tab loadout properties (activeWeaponPieceId, equippedPerkCards, switchboardState)", async () => {
    const { normalizeBuilderPayload } = await import("./normalize-builder-payload");
    const rawPayload = {
      version: 5,
      basePieceId: "combat-armor",
      equipmentKind: "armor",
      legendaryModIds: [null, null, null, null],
      activeWeaponPieceId: "fixer",
      equippedPerkCards: [
        { cardId: "commando", rank: 3 },
        { cardId: "expert-commando", rank: 3 }
      ],
      switchboardState: {
        healthPct: 20,
        teamState: "casual",
        combatStance: { isSneaking: true }
      }
    };

    const normalized = normalizeBuilderPayload(rawPayload);
    expect(normalized).not.toBeNull();
    expect(normalized?.basePieceId).toBe("combat-armor");
    expect(normalized?.activeWeaponPieceId).toBe("fixer");
    expect(normalized?.equippedPerkCards).toHaveLength(2);
    expect(normalized?.equippedPerkCards?.[0].cardId).toBe("commando");
    expect((normalized?.switchboardState as Record<string, unknown>)?.healthPct).toBe(20);
  });

  it("verifies Chally's Feed buff configuration and Herbivore scaling stats", async () => {
    const { ALL_PLANT_FOODS } = await import("./all-fallout76-buffs");
    const chally = ALL_PLANT_FOODS.find((b) => b.id === "plant-challys-feed");
    expect(chally).toBeDefined();
    expect(chally?.label).toBe("Chally's Feed");
    expect(chally?.category).toBe("food_plant");
    expect(chally?.specialBonus).toEqual({ lck: 5, cha: 5 });
    expect(chally?.damageMultiplier).toBe(1.20);
  });
});
