/**
 * Perk Coin cost of a legendary perk loadout. Every number comes from
 * `src/data/truth/legendary-perk-costs.json` (fallout.wiki quotes); nothing is hardcoded here.
 */
import costs from "@/data/truth/legendary-perk-costs.json";

const RANK_UP_COST: Record<string, number> = costs.rankUpCostCoins;

/** Coins spent to bring one legendary perk from unslotted to `rank` (cumulative). */
export function legendaryPerkCoinsToRank(rank: number): number {
  let total = 0;
  for (let r = 1; r <= rank; r++) total += RANK_UP_COST[String(r)] ?? 0;
  return total;
}

/** Cumulative coins for every equipped legendary perk at its current rank. */
export function totalLegendaryPerkCoins(equipped: ReadonlyArray<{ rank: number }>): number {
  return equipped.reduce((sum, item) => sum + legendaryPerkCoinsToRank(item.rank), 0);
}

/** How many rank-1 perk cards scrapping yields `coins` (2 coins per card rank; rounded up). */
export function rank1CardsScrappedFor(coins: number): number {
  return Math.ceil(coins / costs.coinsPerScrappedCardRank);
}

export const LEGENDARY_PERK_COSTS_SOURCE = costs.source;
export const LEGENDARY_MAX_RANK_TOTAL_COINS = costs.maxRankTotalCoins;
