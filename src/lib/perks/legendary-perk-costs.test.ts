import { describe, expect, it } from "vitest";
import costs from "@/data/truth/legendary-perk-costs.json";
import {
  LEGENDARY_MAX_RANK_TOTAL_COINS,
  legendaryPerkCoinsToRank,
  legendaryRankUpCoins,
  perkCardCostBadge,
  perkCardCostText,
  rank1CardsScrappedFor,
  totalLegendaryPerkCoins,
} from "./legendary-perk-costs";

describe("legendary perk Perk Coin costs (fallout.wiki)", () => {
  it("prices ranks 2-4 at 50/100/150 coins cumulatively and rank 1 at no coins", () => {
    expect(legendaryPerkCoinsToRank(1)).toBe(0);
    expect(legendaryPerkCoinsToRank(2)).toBe(50);
    expect(legendaryPerkCoinsToRank(3)).toBe(150);
    expect(legendaryPerkCoinsToRank(4)).toBe(300);
    expect(legendaryPerkCoinsToRank(4)).toBe(LEGENDARY_MAX_RANK_TOTAL_COINS);
  });

  it("sums a loadout", () => {
    expect(totalLegendaryPerkCoins([])).toBe(0);
    expect(totalLegendaryPerkCoins([{ rank: 4 }, { rank: 2 }, { rank: 1 }])).toBe(350);
  });

  it("converts coins to scrapped rank-1 cards at 2 coins per card rank", () => {
    expect(costs.coinsPerScrappedCardRank).toBe(2);
    expect(rank1CardsScrappedFor(0)).toBe(0);
    expect(rank1CardsScrappedFor(300)).toBe(150);
    expect(rank1CardsScrappedFor(51)).toBe(26);
  });

  it("hides the SPECIAL cost badge on legendary cards and shows the verified coin price instead", () => {
    expect(legendaryRankUpCoins(1)).toBeNull();
    expect(legendaryRankUpCoins(2)).toBe(50);
    expect(legendaryRankUpCoins(4)).toBe(150);
    expect(legendaryRankUpCoins(5)).toBeNull();
    // perk-cards.json gives legendary ranks cost 0: never a "0" badge.
    expect(perkCardCostBadge("LEGENDARY", 1, 0)).toBeNull();
    expect(perkCardCostBadge("LEGENDARY", 2, 0)).toEqual({ label: "50", unit: "Perk Coins", text: "50 Perk Coins (rank 2)" });
    expect(perkCardCostBadge("LEGENDARY", 3, 0)?.label).toBe("100");
    expect(perkCardCostText("LEGENDARY", 1, 0)).toBe("Slot unlock (no Perk Coin price)");
    expect(perkCardCostText("LEGENDARY", 4, 0)).toBe("150 Perk Coins");
    // SPECIAL cards keep their point cost.
    expect(perkCardCostBadge("A", 1, 1)).toEqual({ label: "1", unit: "SPECIAL", text: "1 A" });
    expect(perkCardCostText("S", 3, 3)).toBe("3 SPECIAL Pts");
    expect(perkCardCostText("E", 1, 1)).toBe("1 SPECIAL Pt");
  });

  it("keeps the truth file sourced", () => {
    expect(costs.source).toMatch(/^https:\/\/fallout\.wiki\//);
    expect(costs.coinsPerLevelUp).toBeNull();
  });
});
