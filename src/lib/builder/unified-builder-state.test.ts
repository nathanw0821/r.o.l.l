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
});
