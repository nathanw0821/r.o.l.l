/**
 * Fallout 76 Legendary Crafting & Bench Logistics Cost Calculator.
 *
 * Patch 70 "The Slasher" (2026-09-15) replaced the escalating per-slot scrip
 * progression with a flat fee: 50 scrip to change a 1–3★ legendary mod, 100
 * scrip for a 4★ mod. Unique (named) items pay 10× scrip and each craft also
 * consumes Legendary modules + Vault Steel. Raw numbers live in
 * `src/data/truth/crafting-economy.json`; keep the two in sync via the tests.
 */

import craftingEconomy from "@/data/truth/crafting-economy.json";

type StarKey = "1" | "2" | "3" | "4";

function byStar(table: Partial<Record<StarKey, number>>): Record<number, number> {
  const out: Record<number, number> = {};
  for (const [k, v] of Object.entries(table)) {
    if (typeof v === "number") out[Number(k)] = v;
  }
  return out;
}

/** Raw Patch 70 crafting-economy truth pack (re-exported for UI copy / embeds). */
export const CRAFTING_ECONOMY = craftingEconomy;

/** Patch number the constants below were last verified against. */
export const CRAFTING_ECONOMY_PATCH = craftingEconomy.patch;

/**
 * Base Legendary Roll Fees (Workbench initial random roll before applying specific mod boxes).
 * 1-Star Roll = 5 Modules, 2-Star Roll = 10 Modules, 3-Star/4-Star Roll = 15 Modules.
 */
export const BASE_RANDOMIZE_MODULE_COSTS: Record<number, number> = {
  ...byStar(craftingEconomy.randomRollModulesByStar),
  4: craftingEconomy.randomRollModulesByStar["3"],
};

export function getBaseRandomizeModuleCost(maxStarRank: number): number {
  if (maxStarRank <= 0) return 0;
  return BASE_RANDOMIZE_MODULE_COSTS[Math.min(4, Math.max(1, maxStarRank))] || 15;
}

/** Star Rank Mod Box Module Costs (crafting a legendary mod box: 15 / 30 / 60 / 120). */
export const STAR_MODULE_COSTS: Record<number, number> = byStar(craftingEconomy.moduleCraftingCostByStar);

/** Flat scrip fee to change a legendary mod, by star rank (50 / 50 / 50 / 100). */
export const SCRIP_MOD_CHANGE_COSTS: Record<number, number> = byStar(craftingEconomy.modChangeScripByStar);

/** Unique (named) items pay this multiple of the scrip fee (×10 → 500 / 1,000). */
export const UNIQUE_SCRIP_MULTIPLIER: number = craftingEconomy.uniqueScripMultiplier;

/** Extra per-craft cost when modding a unique item: modules + Vault Steel by star tier (3★ / 4★). */
export const UNIQUE_CRAFTING_COSTS: Record<3 | 4, { legendaryModules: number; vaultSteel: number }> = {
  3: craftingEconomy.uniqueCraftingByStar["3"],
  4: craftingEconomy.uniqueCraftingByStar["4"],
};

/** Legendary module carry weight (lbs). */
export const LEGENDARY_MODULE_WEIGHT: number = craftingEconomy.legendaryModuleWeight;

/** Scrip received when selling a legendary item to the exchange machine, by star. */
export const SCRIP_SALE_VALUES: Record<number, number> = byStar(craftingEconomy.scripSaleValueByStar);

/** Scrip received when scrapping a legendary item at a workbench, by star. */
export const SCRAPPING_SCRIP_VALUES: Record<number, number> = byStar(craftingEconomy.scrappingScripByStar);

/** Purveyor Murmrgh purchase price in caps, by star (all item types). */
export const PURVEYOR_PRICE_CAPS: Record<number, number> = byStar(craftingEconomy.purveyorPriceCapsByStar);

export type LegendaryScripCostOptions = {
  /** Star rank of the mod being applied (1–4). Defaults to 1–3★ pricing. */
  starRank?: number;
  /** Unique / named item: scrip fee is multiplied by `UNIQUE_SCRIP_MULTIPLIER`. */
  isUnique?: boolean;
};

function clampStar(starRank: number | undefined): 1 | 2 | 3 | 4 {
  const n = Math.round(starRank ?? 1);
  return (n < 1 ? 1 : n > 4 ? 4 : n) as 1 | 2 | 3 | 4;
}

/**
 * Scrip cost to apply / change one legendary mod.
 *
 * Since Patch 70 the fee is flat per star rank and no longer depends on how
 * many times the slot has been modified. A bare number argument is accepted
 * for backwards compatibility with the old `modificationIndex` signature and
 * is ignored (every modification costs the same).
 */
export function getLegendaryScripCost(arg?: number | LegendaryScripCostOptions): number {
  const opts: LegendaryScripCostOptions = typeof arg === "object" && arg !== null ? arg : {};
  const star = clampStar(opts.starRank);
  const base = SCRIP_MOD_CHANGE_COSTS[star] ?? SCRIP_MOD_CHANGE_COSTS[1] ?? 50;
  return opts.isUnique ? base * UNIQUE_SCRIP_MULTIPLIER : base;
}

/** Modules + Vault Steel consumed per craft on a unique item (0 for regular gear). */
export function getUniqueCraftingCost(maxStarRank: number, isUnique: boolean): { legendaryModules: number; vaultSteel: number } {
  if (!isUnique || maxStarRank <= 0) return { legendaryModules: 0, vaultSteel: 0 };
  return maxStarRank >= 4 ? UNIQUE_CRAFTING_COSTS[4] : UNIQUE_CRAFTING_COSTS[3];
}

export type CraftingCostSummary = {
  legendaryModules: number; // Total Modules (Mod Boxes + Base Randomizing + unique surcharge)
  baseRandomizeModules: number; // Base fee (5/10/15 Modules per piece)
  modBoxModules: number; // Modules for specific mod boxes
  legendaryScrip: number; // Total Scrip cost (flat 50 per 1–3★ mod, 100 per 4★; ×10 on uniques)
  isUnique: boolean; // Whether unique-item pricing was applied
  vaultSteel: number; // Vault Steel consumed (uniques only: 40 for ≤3★, 80 for 4★, per piece)
  uniqueCraftingModules: number; // Extra modules consumed on uniques (30 for ≤3★, 65 for 4★, per piece)
};

/**
 * Calculates complete crafting logistics summary.
 *
 * `equippedStarCount` is the number of legendary mods being applied. An item
 * has at most one 4★ slot, so when `maxStarRank` is 4 exactly one of those
 * mods is priced at the 4★ fee and the rest at the 1–3★ fee. Pass `starRanks`
 * to price each mod explicitly instead.
 */
export function calculateCraftingLogistics(
  equippedStarCount: number,
  modBoxModules: number,
  opts?: {
    isMultiPiece?: boolean;
    pieceCount?: number;
    maxStarRank?: number;
    /** @deprecated Ignored since Patch 70 (flat scrip fee). Kept so older callers compile. */
    modificationIndex?: number;
    /** Explicit star rank per equipped mod; overrides the `maxStarRank` heuristic for scrip. */
    starRanks?: number[];
    /** Unique / named item: scrip ×10 plus modules + Vault Steel per craft. */
    isUnique?: boolean;
  }
): CraftingCostSummary {
  const pieces = opts?.isMultiPiece ? (opts.pieceCount || 5) : 1;
  const maxStarRank = opts?.maxStarRank || 1;
  const isUnique = Boolean(opts?.isUnique);

  // Base randomizing fee: 5/10/15 Modules per piece depending on max star rank
  const perPieceBaseFee = getBaseRandomizeModuleCost(maxStarRank);
  const baseRandomizeModules = equippedStarCount > 0 ? pieces * perPieceBaseFee : 0;

  // Unique surcharge: modules + Vault Steel per crafted piece
  const uniqueCost = equippedStarCount > 0 ? getUniqueCraftingCost(maxStarRank, isUnique) : { legendaryModules: 0, vaultSteel: 0 };
  const uniqueCraftingModules = pieces * uniqueCost.legendaryModules;
  const vaultSteel = pieces * uniqueCost.vaultSteel;

  const totalModules = modBoxModules + baseRandomizeModules + uniqueCraftingModules;

  // Scrip: flat fee per mod (50 for 1–3★, 100 for 4★), ×10 on uniques
  let totalScrip = 0;
  if (opts?.starRanks && opts.starRanks.length > 0) {
    for (const star of opts.starRanks) totalScrip += getLegendaryScripCost({ starRank: star, isUnique });
  } else if (equippedStarCount > 0) {
    const fourStarMods = maxStarRank >= 4 ? 1 : 0;
    const lowerMods = Math.max(0, equippedStarCount - fourStarMods);
    totalScrip =
      fourStarMods * getLegendaryScripCost({ starRank: 4, isUnique }) +
      lowerMods * getLegendaryScripCost({ starRank: 1, isUnique });
  }

  return {
    legendaryModules: totalModules,
    baseRandomizeModules,
    modBoxModules,
    legendaryScrip: totalScrip,
    isUnique,
    vaultSteel,
    uniqueCraftingModules,
  };
}
