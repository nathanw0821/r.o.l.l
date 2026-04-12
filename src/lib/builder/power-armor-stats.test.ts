import { describe, expect, it } from "vitest";
import {
  getPowerArmorEquippedFlatStats,
  powerArmorAttachedPieceCount,
  powerArmorFrameIntrinsicEffectMath,
  powerArmorInherentDamageReductionPercent,
  powerArmorInherentRadReductionPercent,
  sanitizePowerArmorPiecesEquipped
} from "@/lib/builder/power-armor-stats";
import { DEFAULT_POWER_ARMOR_PIECES_EQUIPPED } from "@/lib/builder/types";

describe("powerArmorPiecesEquipped", () => {
  it("defaults invalid payloads to a full suit mask", () => {
    expect(sanitizePowerArmorPiecesEquipped(undefined)).toEqual(DEFAULT_POWER_ARMOR_PIECES_EQUIPPED);
    expect(sanitizePowerArmorPiecesEquipped([true, false])).toEqual(DEFAULT_POWER_ARMOR_PIECES_EQUIPPED);
  });

  it("counts attached pieces for inherent % caps", () => {
    const none = [false, false, false, false, false, false] as const;
    expect(powerArmorAttachedPieceCount(none)).toBe(0);
    expect(powerArmorInherentDamageReductionPercent(none)).toBe(0);
    expect(powerArmorInherentRadReductionPercent(none)).toBe(0);

    expect(powerArmorInherentDamageReductionPercent(DEFAULT_POWER_ARMOR_PIECES_EQUIPPED)).toBe(42);
    expect(powerArmorInherentRadReductionPercent(DEFAULT_POWER_ARMOR_PIECES_EQUIPPED)).toBe(90);
  });

  it("sums chassis + toggled pieces (T-45 level 45 table + 60 chassis DR)", () => {
    const full = getPowerArmorEquippedFlatStats("t45-torso", "t45-helm", DEFAULT_POWER_ARMOR_PIECES_EQUIPPED);
    const naked = getPowerArmorEquippedFlatStats("t45-torso", "t45-helm", [
      false,
      false,
      false,
      false,
      false,
      false
    ]);
    // Chassis 60 + six pieces 54*5+90 = 420 (wiki armor-only total 360 + chassis 60).
    expect(full!.dr).toBe(420);
    expect(naked!.dr).toBe(60);
  });

  it("exposes frame STR/carry for aggregateEffectMath layers", () => {
    expect(powerArmorFrameIntrinsicEffectMath()).toEqual({ str: 10, carryWeight: 50 });
  });
});
