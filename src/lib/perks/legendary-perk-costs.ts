/**
 * Perk Coin cost of a legendary perk loadout. Every number comes from
 * `src/data/truth/legendary-perk-costs.json` (fallout.wiki quotes); nothing is hardcoded here.
 */
import costs from "@/data/truth/legendary-perk-costs.json";
import type { SpecialCategory } from "@/lib/perks/catalog";

const RANK_UP_COST: Record<string, number> = costs.rankUpCostCoins;
const RANK_UP_CONFIDENCE: Record<string, string> = costs.rankUpCostConfidence;

/** Verified Perk Coin price of reaching `rank` from the rank below; null when the wiki gives none (rank 1). */
export function legendaryRankUpCoins(rank: number): number | null {
  const key = String(rank);
  if (RANK_UP_CONFIDENCE[key] !== "verified") return null;
  const coins = RANK_UP_COST[key];
  return coins ? coins : null;
}

export type PerkCardCostBadge = {
  /** What the badge shows: SPECIAL points, or Perk Coins for a legendary rank. */
  label: string;
  unit: "SPECIAL" | "Perk Coins";
  /** Tooltip / inspector text, e.g. "2 A" or "50 Perk Coins (rank 2)". */
  text: string;
};

/**
 * The cost a perk card badge may show. `perk-cards.json` carries `cost: 0` on every legendary rank
 * (legendary perks have no SPECIAL cost), so for LEGENDARY cards the badge is the rank's verified
 * Perk Coin price, and null (hidden) for the unpriced rank 1.
 */
export function perkCardCostBadge(special: SpecialCategory, rank: number, cost: number): PerkCardCostBadge | null {
  if (special !== "LEGENDARY") {
    return { label: String(cost), unit: "SPECIAL", text: `${cost} ${special}` };
  }
  const coins = legendaryRankUpCoins(rank);
  if (coins === null) return null;
  return { label: String(coins), unit: "Perk Coins", text: `${coins} Perk Coins (rank ${rank})` };
}

/** One-line cost for a rank list: SPECIAL points, Perk Coins, or the unpriced legendary slot unlock. */
export function perkCardCostText(special: SpecialCategory, rank: number, cost: number): string {
  const badge = perkCardCostBadge(special, rank, cost);
  if (!badge) return "Slot unlock (no Perk Coin price)";
  if (badge.unit === "SPECIAL") return `${cost} SPECIAL Pt${cost > 1 ? "s" : ""}`;
  return `${badge.label} Perk Coins`;
}

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
