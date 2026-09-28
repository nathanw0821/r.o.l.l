import { describe, expect, it } from "vitest";
import costs from "@/data/truth/legendary-perk-costs.json";
import {
  LEGENDARY_MAX_RANK_TOTAL_COINS,
  legendaryPerkCoinsToRank,
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

  it("keeps the truth file sourced", () => {
    expect(costs.source).toMatch(/^https:\/\/fallout\.wiki\//);
    expect(costs.coinsPerLevelUp).toBeNull();
  });
});
