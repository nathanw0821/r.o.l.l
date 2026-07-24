import { describe, expect, it } from "vitest";
import { getPerkCardById, searchPerkCards, filterPerksBySpecial, calculateSpecialCapacity } from "./catalog";

describe("Perk Catalog Utilities", () => {
  it("should fetch perk card by ID", () => {
    const card = getPerkCardById("heavy-gunner");
    expect(card).toBeDefined();
    expect(card?.name).toBe("Heavy Gunner");
    expect(card?.special).toBe("S");
    expect(card?.maxRank).toBe(3);
  });

  it("should search perk cards fuzzy matching query", () => {
    const results = searchPerkCards("commando");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((c) => c.name.includes("Commando"))).toBe(true);
  });

  it("should filter perk cards by SPECIAL category", () => {
    const luckPerks = filterPerksBySpecial("L");
    expect(luckPerks.length).toBeGreaterThan(0);
    expect(luckPerks.every((c) => c.special === "L")).toBe(true);
  });

  it("should calculate equipped SPECIAL capacity cost accurately", () => {
    const equipped = [
      { cardId: "heavy-gunner", rank: 3 },
      { cardId: "bandolier", rank: 2 },
      { cardId: "commando", rank: 1 }
    ];
    const capacity = calculateSpecialCapacity(equipped);
    expect(capacity.S).toBe(5); // 3 (Heavy Gunner rank 3) + 2 (Bandolier rank 2)
    expect(capacity.P).toBe(1); // 1 (Commando rank 1)
  });
});
