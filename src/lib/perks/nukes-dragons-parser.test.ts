import { describe, it, expect } from "vitest";
import {
  parseNukesDragonsBuild,
  isNukesDragonsUrl,
  ND_PERK_CODE_MAP,
  ND_LEGENDARY_PERK_MAP,
  ND_MUTATION_MAP,
} from "./nukes-dragons-parser";

describe("nukes-dragons-parser", () => {
  it("has complete dictionary mappings", () => {
    expect(Object.keys(ND_PERK_CODE_MAP).length).toBe(268);
    expect(Object.keys(ND_LEGENDARY_PERK_MAP).length).toBe(26);
    expect(Object.keys(ND_MUTATION_MAP).length).toBe(19);
  });

  it("identifies valid Nukes & Dragons URLs correctly", () => {
    expect(isNukesDragonsUrl("https://nukesdragons.com/fallout-76/character?p=sd3&s=aa547aa")).toBe(true);
    expect(isNukesDragonsUrl("https://nukesdragons.com/fallout76/perks?v=1&s=f334f5b&d=sq2s32sr2")).toBe(true);
    expect(isNukesDragonsUrl("p=sd3su1&s=aa547aa&lp=x94")).toBe(true);
    expect(isNukesDragonsUrl("https://google.com")).toBe(false);
    expect(isNukesDragonsUrl("")).toBe(false);
  });

  it("parses the complete 37-card golden URL accurately", () => {
    const goldenUrl =
      "https://nukesdragons.com/fallout-76/character?cd=kk0131000k10&ef=MgM0M5MhMaM1McM9MeMfM7M2MbMiM6M4MdM8M3&s=aa547aa&p=sd3su1sq3sx1sp10B1p03pd3pg3pu1pp2li1eo1es10l3ee1cu1ce1lb2ic3lq1au30H3ak1af1a52ai1ab3ad3lv3lk3lg10v30j10n3e31ej2&lp=x94x64x74x44x84xa4&v=2";

    const result = parseNukesDragonsBuild(goldenUrl);

    // SPECIAL: s=aa547aa (10, 10, 5, 4, 7, 10, 10)
    expect(result.specials).toEqual({
      str: 10,
      per: 10,
      end: 5,
      cha: 4,
      int: 7,
      agi: 10,
      lck: 10,
    });

    // 37 equipped perk cards
    expect(result.equippedCards.length).toBe(37);
    expect(result.unknownTokens.length).toBe(0);

    // Specific card checks
    expect(result.equippedCards).toContainEqual({ cardId: "concentrated-fire", rank: 3 });
    expect(result.equippedCards).toContainEqual({ cardId: "tank-killer", rank: 2 });
    expect(result.equippedCards).toContainEqual({ cardId: "tenderizer", rank: 1 });
    expect(result.equippedCards).toContainEqual({ cardId: "strange-in-numbers", rank: 1 });
    expect(result.equippedCards).toContainEqual({ cardId: "better-criticals", rank: 3 });
    expect(result.equippedCards).toContainEqual({ cardId: "critical-savvy", rank: 3 });

    // Ghoul cards check
    expect(result.isGhoul).toBe(true);
    expect(result.equippedCards).toContainEqual({ cardId: "glowing-gut", rank: 3 });
    expect(result.equippedCards).toContainEqual({ cardId: "glowing-criticals", rank: 3 });
    expect(result.equippedCards).toContainEqual({ cardId: "brick-wall", rank: 1 });

    // Legendary Perks: lp=x94x64x74x44x84xa4
    expect(result.legendaryPerks.length).toBe(6);
    expect(result.legendaryPerks).toContainEqual({ id: "legendary-perception", rank: 4 });
    expect(result.legendaryPerks).toContainEqual({ id: "legendary-endurance", rank: 4 });
    expect(result.legendaryPerks).toContainEqual({ id: "legendary-intelligence", rank: 4 });
    expect(result.legendaryPerks).toContainEqual({ id: "legendary-agility", rank: 4 });
    expect(result.legendaryPerks).toContainEqual({ id: "legendary-luck", rank: 4 });
    expect(result.legendaryPerks).toContainEqual({ id: "legendary-strength", rank: 4 });

    // Mutations: all 19 parsed
    expect(result.mutations.length).toBe(19);
    expect(result.mutations).toContain("marsupial");
    expect(result.mutations).toContain("speed-demon");
    expect(result.mutations).toContain("adrenal-reaction");
    expect(result.mutations).toContain("egg-head");
    expect(result.mutations).toContain("eagle-eyes");
  });

  it("handles empty or malformed strings gracefully", () => {
    const emptyResult = parseNukesDragonsBuild("");
    expect(emptyResult.equippedCards).toEqual([]);
    expect(emptyResult.legendaryPerks).toEqual([]);
    expect(emptyResult.mutations).toEqual([]);
    expect(emptyResult.specials.str).toBe(1);

    const malformedResult = parseNukesDragonsBuild("https://nukesdragons.com/fallout-76/character?s=xyz&p=zz9");
    expect(malformedResult.specials.str).toBe(1);
    expect(malformedResult.warnings.length).toBeGreaterThan(0);
    expect(malformedResult.unknownTokens).toContain("zz9");
  });
});
