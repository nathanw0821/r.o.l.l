import { describe, expect, it } from "vitest";
import { aggregateEffectMath } from "./compatibility";

/**
 * A transmission stores legendary perks as bare ids ("legendary-luck"); the perk-slot sync adds
 * "id:rank" entries. Both naming the same card must count once (+5), not twice.
 */
describe("legendary perk entries", () => {
  const totals = (legendaryPerkIds: string[]) =>
    aggregateEffectMath([], { ghoul: false, extraLayers: [], legendaryPerkIds });

  it("counts a card once when it appears bare and with a rank", () => {
    expect(totals(["legendary-luck"]).lck).toBe(5);
    expect(totals(["legendary-luck", "legendary-luck:4"]).lck).toBe(5);
    expect(totals(["legendary-luck:4", "legendary-luck"]).lck).toBe(5);
  });

  it("still sums different cards and honours a lower rank", () => {
    expect(totals(["legendary-luck", "legendary-perception:4"])).toMatchObject({ lck: 5, per: 5 });
    expect(totals(["legendary-luck:2"]).lck).toBe(2);
  });
});

describe("legendary perk card values (Patch 70 card texts, src/data/perk-cards.json)", () => {
  const totals = (legendaryPerkIds: string[], matchingSet = false) =>
    aggregateEffectMath([], { ghoul: false, extraLayers: [], legendaryPerkIds, matchingSet });

  it("keeps a ranked entry over a bare one whatever the order", () => {
    expect(totals(["legendary-luck:1", "legendary-luck"]).lck).toBe(1);
  });

  it("What Rads? gives +50 / 75 / 100 / 300 Rad Resist by rank", () => {
    expect([1, 2, 3, 4].map((r) => totals([`what-rads:${r}`]).rr)).toEqual([50, 75, 100, 300]);
  });

  it("Blood Sacrifice adds no Damage Resistance (card: V.A.T.S. AP is paid in HP)", () => {
    expect(totals(["blood-sacrifice:4"]).dr).toBe(0);
  });

  it("Funky Duds / Sizzling Style count only with a matching armor set, +50 / 100 / 150 / 200 by rank", () => {
    expect(totals(["funky-duds:4", "sizzling-style:4"])).toMatchObject({ pr: 0, fr: 0 });
    expect([1, 2, 3, 4].map((r) => totals([`funky-duds:${r}`], true).pr)).toEqual([50, 100, 150, 200]);
    expect(totals(["sizzling-style:2"], true).fr).toBe(100);
  });
});
