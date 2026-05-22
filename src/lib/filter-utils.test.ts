import { describe, it, expect } from "vitest";
import { applyFilters, expandQueryTokens, FilterState, FilterableRow } from "./filter-utils";

describe("filter-utils acronym expansions", () => {
  it("should expand community abbreviations correctly", () => {
    const expansions = expandQueryTokens("uny");
    expect(expansions).toEqual([[
      { value: "uny", isOriginalShorthand: true },
      { value: "unyielding", isOriginalShorthand: false }
    ]]);
  });

  it("should expand multi-token abbreviations", () => {
    const expansions = expandQueryTokens("uny ap");
    expect(expansions).toEqual([
      [
        { value: "uny", isOriginalShorthand: true },
        { value: "unyielding", isOriginalShorthand: false }
      ],
      [
        { value: "ap", isOriginalShorthand: true },
        { value: "increases action point refresh", isOriginalShorthand: false },
        { value: "powered", isOriginalShorthand: false },
        { value: "ap refresh", isOriginalShorthand: false }
      ]
    ]);
  });

  it("should handle slashes and commas case-insensitively", () => {
    const expansions = expandQueryTokens("UNY/ap,wwr");
    expect(expansions).toEqual([
      [
        { value: "uny", isOriginalShorthand: true },
        { value: "unyielding", isOriginalShorthand: false }
      ],
      [
        { value: "ap", isOriginalShorthand: true },
        { value: "increases action point refresh", isOriginalShorthand: false },
        { value: "powered", isOriginalShorthand: false },
        { value: "ap refresh", isOriginalShorthand: false }
      ],
      [
        { value: "wwr", isOriginalShorthand: true },
        { value: "weapon weight reduced", isOriginalShorthand: false },
        { value: "arms keeper", isOriginalShorthand: false },
        { value: "arms keeper's", isOriginalShorthand: false }
      ]
    ]);
  });
});

describe("applyFilters with acronym matching", () => {
  const sampleRows: FilterableRow[] = [
    {
      effect: { name: "Unyielding" },
      tier: { label: "3 Star" },
      categories: [{ category: { name: "Armor Prefix" } }],
      description: "Gain up to +3 to all stats (except End) when low health.",
      unlocked: true,
      isSeeking: false,
      modCount: 1,
      origins: ["Armor"],
    },
    {
      effect: { name: "Anti-armor" },
      tier: { label: "1 Star" },
      categories: [{ category: { name: "Weapon Prefix" } }],
      description: "Ignores 50% of your target's armor.",
      unlocked: false,
      isSeeking: true,
      modCount: 0,
      origins: ["Weapon"],
    },
    {
      effect: { name: "Powered" },
      tier: { label: "2 Star" },
      categories: [{ category: { name: "Armor Major" } }],
      description: "Increases Action Point refresh speed.",
      unlocked: false,
      isSeeking: false,
      modCount: 0,
      origins: ["Armor"],
    },
  ];

  it("should filter rows by acronym expansion", () => {
    const state: FilterState = {
      query: "uny",
      sources: [],
      status: [],
      origins: [],
    };
    const results = applyFilters(sampleRows, state);
    expect(results).toHaveLength(1);
    expect(results[0].effect.name).toBe("Unyielding");
  });

  it("should filter rows matching multiple expanded tokens (AND logic)", () => {
    const state: FilterState = {
      query: "ap armor",
      sources: [],
      status: [],
      origins: [],
    };
    const results = applyFilters(sampleRows, state);
    expect(results).toHaveLength(1);
    expect(results[0].effect.name).toBe("Powered");
  });

  it("should return empty if any token fails to match", () => {
    const state: FilterState = {
      query: "uny aa",
      sources: [],
      status: [],
      origins: [],
    };
    const results = applyFilters(sampleRows, state);
    expect(results).toHaveLength(0);
  });
});
