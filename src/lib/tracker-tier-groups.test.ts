import { describe, it, expect } from "vitest";
import {
  formatLearnedOf,
  formatMatchCount,
  groupRowsByTier,
  learnedPercent,
  OTHER_TIER_KEY,
  parseCollapsedTiers,
  serializeCollapsedTiers,
  shouldGroupByTier,
  tierSectionTitle
} from "./tracker-tier-groups";
import { FALLBACK_LEGENDARY_EFFECTS } from "./static-fallback-catalog";

type Row = { id: string; unlocked: boolean; tier: { label?: string } | null };
const row = (id: string, label: string | null, unlocked = false): Row => ({
  id,
  unlocked,
  tier: label === null ? null : { label }
});

describe("tracker tier grouping", () => {
  it("groups in 1-star..4-star order and keeps the incoming order inside a tier", () => {
    const all = [row("a", "3 Star"), row("b", "1 Star", true), row("c", "3 Star", true), row("d", "1 Star"), row("e", "4 Star")];
    const groups = groupRowsByTier(all, all);
    expect(groups.map((g) => g.key)).toEqual(["1 Star", "3 Star", "4 Star"]);
    expect(groups.map((g) => g.title)).toEqual(["1-star", "3-star", "4-star"]);
    expect(groups[0].rows.map((r) => r.id)).toEqual(["b", "d"]);
    expect(groups[1].rows.map((r) => r.id)).toEqual(["a", "c"]);
    expect(groups.map((g) => [g.learned, g.total])).toEqual([[1, 2], [1, 2], [0, 1]]);
  });

  it("counts totals from all rows while rows come from the filtered list", () => {
    const all = [row("a", "1 Star", true), row("b", "1 Star"), row("c", "2 Star")];
    const groups = groupRowsByTier([all[1]], all);
    expect(groups.map((g) => [g.key, g.rows.length, g.learned, g.total])).toEqual([
      ["1 Star", 1, 1, 2],
      ["2 Star", 0, 0, 1]
    ]);
  });

  it("never drops a row without a known tier", () => {
    const all = [row("a", "1 Star"), row("b", null), row("c", "5 Star")];
    const groups = groupRowsByTier(all, all);
    expect(groups.at(-1)?.key).toBe(OTHER_TIER_KEY);
    expect(groups.at(-1)?.title).toBe("Other");
    expect(groups.flatMap((g) => g.rows).length).toBe(all.length);
  });

  it("only groups the 'All' view of a multi-tier table", () => {
    const multi = [row("a", "1 Star"), row("b", "2 Star")];
    const single = [row("a", "4 Star"), row("b", "4 Star")];
    expect(shouldGroupByTier(multi, "ALL")).toBe(true);
    expect(shouldGroupByTier(multi, "2 Star")).toBe(false);
    expect(shouldGroupByTier(single, "ALL")).toBe(false);
    expect(shouldGroupByTier([], "ALL")).toBe(false);
  });

  it("matches the catalog's tier sizes (149 effects: 39/32/40/38)", () => {
    const rows = FALLBACK_LEGENDARY_EFFECTS.map((r) => ({ unlocked: false, tier: r.tier }));
    const groups = groupRowsByTier(rows, rows);
    expect(groups.map((g) => g.total)).toEqual([39, 32, 40, 38]);
    expect(groups.reduce((sum, g) => sum + g.total, 0)).toBe(149);
  });

  it("formats header text and progress", () => {
    expect(tierSectionTitle("2 Star")).toBe("2-star");
    expect(formatLearnedOf(3, 39)).toBe("3 of 39 learned");
    expect(formatMatchCount(1)).toBe("1 match");
    expect(formatMatchCount(0)).toBe("0 matches");
    expect(formatMatchCount(12)).toBe("12 matches");
    expect(learnedPercent(1, 3)).toBe(33);
    expect(learnedPercent(0, 0)).toBe(0);
  });

  it("round-trips the collapsed state and ignores junk", () => {
    const collapsed = new Set(["4 Star", "1 Star"]);
    const raw = serializeCollapsedTiers(collapsed);
    expect(raw).toBe('["1 Star","4 Star"]');
    expect([...parseCollapsedTiers(raw)].sort()).toEqual(["1 Star", "4 Star"]);
    expect(parseCollapsedTiers(null).size).toBe(0);
    expect(parseCollapsedTiers("not json").size).toBe(0);
    expect(parseCollapsedTiers('{"a":1}').size).toBe(0);
    expect([...parseCollapsedTiers('["2 Star", 3, "9 Star", "other"]')]).toEqual(["2 Star", "other"]);
  });
});
