/**
 * Fallout 76 Legendary Crafting & Bench Logistics Cost Calculator
 * Fully modular and tunable for future Bethesda patch adjustments.
 */

/**
 * Base Legendary Roll Fees (Workbench initial random roll before applying specific mod boxes).
 * 1-Star Roll = 5 Modules, 2-Star Roll = 10 Modules, 3-Star/4-Star Roll = 15 Modules.
 */
export const BASE_RANDOMIZE_MODULE_COSTS: Record<number, number> = {
  1: 5,
  2: 10,
  3: 15,
  4: 15,
};

export function getBaseRandomizeModuleCost(maxStarRank: number): number {
  if (maxStarRank <= 0) return 0;
  return BASE_RANDOMIZE_MODULE_COSTS[Math.min(4, Math.max(1, maxStarRank))] || 15;
}

/** Star Rank Mod Box Module Costs. */
export const STAR_MODULE_COSTS: Record<number, number> = {
  1: 15,
  2: 30,
  3: 60,
  4: 120,
};

/**
 * Scrip Cost Escalation Progression Table per slot modification count.
 * [Index 0 = 1st change (10 Scrip), Index 1 = 2nd change (15 Scrip), etc.]
 */
export const SCRIP_COST_PROGRESSION: number[] = [
  10,  // 1st Mod Application on slot
  15,  // 2nd Mod Application
  25,  // 3rd Mod Application
  45,  // 4th Mod Application
  70,  // 5th Mod Application
  100, // 6th Mod Application
  140, // 7th Mod Application
  190, // 8th Mod Application
  250, // 9th Mod Application
  320, // 10th Mod Application
];

/**
 * Calculates Scrip cost for applying a mod to a slot based on modification count (0-indexed).
 * Easily adjustable when Bethesda changes to a fixed scrip cost in a future patch.
 */
export function getLegendaryScripCost(modificationIndex: number = 0): number {
  if (modificationIndex < 0) return 10;
  if (modificationIndex < SCRIP_COST_PROGRESSION.length) {
    return SCRIP_COST_PROGRESSION[modificationIndex]!;
  }
  // Cap escalation at 1,000 Scrip
  return Math.min(1000, 320 + (modificationIndex - 9) * 80);
}

export type CraftingCostSummary = {
  legendaryModules: number; // Total Modules (Mod Boxes + Base Randomizing)
  baseRandomizeModules: number; // Base fee (5/10/15 Modules per piece)
  modBoxModules: number; // Modules for specific mod boxes
  legendaryScrip: number; // Total Scrip cost
};

/**
 * Calculates complete crafting logistics summary.
 */
export function calculateCraftingLogistics(
  equippedStarCount: number,
  modBoxModules: number,
  opts?: {
    isMultiPiece?: boolean;
    pieceCount?: number;
    maxStarRank?: number;
    modificationIndex?: number;
  }
): CraftingCostSummary {
  const pieces = opts?.isMultiPiece ? (opts.pieceCount || 5) : 1;
  const maxStarRank = opts?.maxStarRank || 1;
  
  // Base randomizing fee: 5/10/15 Modules per piece depending on max star rank
  const perPieceBaseFee = getBaseRandomizeModuleCost(maxStarRank);
  const baseRandomizeModules = equippedStarCount > 0 ? pieces * perPieceBaseFee : 0;
  const totalModules = modBoxModules + baseRandomizeModules;

  // Scrip cost: 1st modification baseline (10 Scrip per mod box attached)
  const scripPerMod = getLegendaryScripCost(opts?.modificationIndex ?? 0);
  const totalScrip = equippedStarCount * scripPerMod;

  return {
    legendaryModules: totalModules,
    baseRandomizeModules,
    modBoxModules,
    legendaryScrip: totalScrip,
  };
}
