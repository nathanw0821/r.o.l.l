import { describe, expect, it } from "vitest";
import craftingEconomy from "@/data/truth/crafting-economy.json";
import {
  BASE_RANDOMIZE_MODULE_COSTS,
  CRAFTING_ECONOMY_PATCH,
  LEGENDARY_MODULE_WEIGHT,
  PURVEYOR_PRICE_CAPS,
  SCRAPPING_SCRIP_VALUES,
  SCRIP_MOD_CHANGE_COSTS,
  SCRIP_SALE_VALUES,
  STAR_MODULE_COSTS,
  UNIQUE_CRAFTING_COSTS,
  UNIQUE_SCRIP_MULTIPLIER,
  calculateCraftingLogistics,
  getBaseRandomizeModuleCost,
  getLegendaryScripCost,
  getUniqueCraftingCost,
} from "./crafting-costs";

describe("crafting-costs (Patch 70 The Slasher)", () => {
  it("is pinned to the Patch 70 truth pack", () => {
    expect(CRAFTING_ECONOMY_PATCH).toBe(70);
    expect(craftingEconomy.releaseDate).toBe("2026-09-15");
  });

  it("charges a flat 50 scrip for 1-3 star mods and 100 for 4 star, with no escalation", () => {
    expect(SCRIP_MOD_CHANGE_COSTS).toEqual({ 1: 50, 2: 50, 3: 50, 4: 100 });
    expect(getLegendaryScripCost()).toBe(50);
    expect(getLegendaryScripCost({ starRank: 1 })).toBe(50);
    expect(getLegendaryScripCost({ starRank: 3 })).toBe(50);
    expect(getLegendaryScripCost({ starRank: 4 })).toBe(100);
  });

  it("prices unique items at 10x scrip (500 / 1,000)", () => {
    expect(UNIQUE_SCRIP_MULTIPLIER).toBe(10);
    expect(getLegendaryScripCost({ starRank: 2, isUnique: true })).toBe(500);
    expect(getLegendaryScripCost({ starRank: 4, isUnique: true })).toBe(1000);
  });

  it("adds modules + Vault Steel when crafting onto a unique", () => {
    expect(UNIQUE_CRAFTING_COSTS[3]).toEqual({ legendaryModules: 30, vaultSteel: 40 });
    expect(UNIQUE_CRAFTING_COSTS[4]).toEqual({ legendaryModules: 65, vaultSteel: 80 });
    expect(getUniqueCraftingCost(3, false)).toEqual({ legendaryModules: 0, vaultSteel: 0 });
    expect(getUniqueCraftingCost(1, true)).toEqual({ legendaryModules: 30, vaultSteel: 40 });
    expect(getUniqueCraftingCost(4, true)).toEqual({ legendaryModules: 65, vaultSteel: 80 });
  });

  it("keeps module crafting, random roll, weight, sale, scrap and Purveyor values", () => {
    expect(STAR_MODULE_COSTS).toEqual({ 1: 15, 2: 30, 3: 60, 4: 120 });
    expect(BASE_RANDOMIZE_MODULE_COSTS).toEqual({ 1: 5, 2: 10, 3: 15, 4: 15 });
    expect(getBaseRandomizeModuleCost(0)).toBe(0);
    expect(getBaseRandomizeModuleCost(2)).toBe(10);
    expect(getBaseRandomizeModuleCost(4)).toBe(15);
    expect(LEGENDARY_MODULE_WEIGHT).toBe(0.05);
    expect(SCRIP_SALE_VALUES).toEqual({ 1: 15, 2: 25, 3: 50, 4: 150 });
    expect(SCRAPPING_SCRIP_VALUES).toEqual({ 1: 3, 2: 5, 3: 10, 4: 30 });
    expect(PURVEYOR_PRICE_CAPS).toEqual({ 1: 25, 2: 35, 3: 60 });
  });

  it("calculateCraftingLogistics: regular 3-star item", () => {
    const s = calculateCraftingLogistics(3, 15 + 30 + 60, { maxStarRank: 3 });
    expect(s.modBoxModules).toBe(105);
    expect(s.baseRandomizeModules).toBe(15);
    expect(s.legendaryModules).toBe(120);
    expect(s.legendaryScrip).toBe(150);
    expect(s.isUnique).toBe(false);
    expect(s.vaultSteel).toBe(0);
    expect(s.uniqueCraftingModules).toBe(0);
  });

  it("calculateCraftingLogistics: 4-star item prices exactly one mod at the 4-star fee", () => {
    const s = calculateCraftingLogistics(4, 15 + 30 + 60 + 120, { maxStarRank: 4 });
    expect(s.legendaryScrip).toBe(50 * 3 + 100);
    const explicit = calculateCraftingLogistics(4, 225, { maxStarRank: 4, starRanks: [1, 2, 3, 4] });
    expect(explicit.legendaryScrip).toBe(250);
  });

  it("calculateCraftingLogistics: unique 4-star item", () => {
    const s = calculateCraftingLogistics(4, 225, { maxStarRank: 4, isUnique: true });
    expect(s.isUnique).toBe(true);
    expect(s.legendaryScrip).toBe(500 * 3 + 1000);
    expect(s.vaultSteel).toBe(80);
    expect(s.uniqueCraftingModules).toBe(65);
    expect(s.legendaryModules).toBe(225 + 15 + 65);
  });

  it("calculateCraftingLogistics: multi-piece armor set multiplies per-piece fees", () => {
    const s = calculateCraftingLogistics(3, 105, { maxStarRank: 3, isMultiPiece: true, pieceCount: 5 });
    expect(s.baseRandomizeModules).toBe(75);
    expect(s.modBoxModules).toBe(105 * 5);
    expect(s.legendaryScrip).toBe(150 * 5);
    expect(s.legendaryModules).toBe(105 * 5 + 75);
    const none = calculateCraftingLogistics(0, 0, { maxStarRank: 3 });
    expect(none.legendaryScrip).toBe(0);
    expect(none.legendaryModules).toBe(0);
  });
});
