import { describe, expect, it } from "vitest";
import { getPerkCardById, searchPerkCards, filterPerksBySpecial, calculateSpecialCapacity } from "./catalog";

describe("Perk Catalog Utilities", () => {
  it("should fetch perk card by ID", () => {
    const card = getPerkCardById("blocker");
    expect(card).toBeDefined();
    expect(card?.name).toBe("Blocker");
    expect(card?.special).toBe("S");
    expect(card?.maxRank).toBe(3);
  });

  it("should search perk cards fuzzy matching query", () => {
    const results = searchPerkCards("action");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((c) => c.name.toLowerCase().includes("action"))).toBe(true);
  });

  it("should filter perk cards by SPECIAL category", () => {
    const luckPerks = filterPerksBySpecial("L");
    expect(luckPerks.length).toBeGreaterThan(0);
    expect(luckPerks.every((c) => c.special === "L")).toBe(true);
  });

  it("should calculate equipped SPECIAL capacity cost accurately", () => {
    const equipped = [
      { cardId: "blocker", rank: 3 },
      { cardId: "bandolier", rank: 2 },
      { cardId: "action-boy", rank: 1 }
    ];
    const capacity = calculateSpecialCapacity(equipped);
    expect(capacity.S).toBe(5); // 3 (Blocker rank 3) + 2 (Bandolier rank 2)
    expect(capacity.A).toBe(1); // 1 (Action Boy rank 1)
  });
});
