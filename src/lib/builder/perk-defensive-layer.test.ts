import { describe, it, expect } from "vitest";
import { calculatePerkDeckDefensiveLayer } from "./perk-defensive-layer";

describe("calculatePerkDeckDefensiveLayer", () => {
  it("returns null when no perks are equipped", () => {
    expect(calculatePerkDeckDefensiveLayer([], { isPowerArmor: false })).toBeNull();
    expect(calculatePerkDeckDefensiveLayer(null, { isPowerArmor: false })).toBeNull();
  });

  it("calculates regular armor defensive cards properly", () => {
    const cards = [
      { cardId: "ironclad", rank: 5 },
      { cardId: "barbarian", rank: 3 },
      { cardId: "evasive", rank: 3 },
      { cardId: "refractor", rank: 4 },
      { cardId: "fireproof", rank: 3 },
      { cardId: "rad-resistant", rank: 4 },
    ];
    const result = calculatePerkDeckDefensiveLayer(cards, {
      isPowerArmor: false,
      strVal: 15,
      agiVal: 15,
    });
    expect(result).toBeDefined();
    // Ironclad 5: dr 50, er 50
    // Barbarian 3: min(80, 15 * 4 = 60) -> dr +60
    // Evasive 3: min(45, 15 * 3 = 45) -> dr +45, er +45
    // Refractor 4: er +40
    // Fireproof 3: fr +45
    // Rad-Resistant 4: rr +40
    expect(result?.dr).toBe(50 + 60 + 45); // 155
    expect(result?.er).toBe(50 + 45 + 40); // 135
    expect(result?.fr).toBe(45);
    expect(result?.rr).toBe(40);
  });

  it("suppresses non-PA cards when in Power Armor", () => {
    const cards = [
      { cardId: "ironclad", rank: 5 },
      { cardId: "barbarian", rank: 3 },
      { cardId: "evasive", rank: 3 },
      { cardId: "refractor", rank: 4 },
      { cardId: "fireproof", rank: 3 },
    ];
    const result = calculatePerkDeckDefensiveLayer(cards, {
      isPowerArmor: true,
      strVal: 15,
      agiVal: 15,
    });
    // Ironclad, Barbarian, Evasive suppressed in PA
    expect(result?.dr).toBe(0);
    expect(result?.er).toBe(40); // Refractor applies in PA
    expect(result?.fr).toBe(45); // Fireproof applies in PA
  });
});
