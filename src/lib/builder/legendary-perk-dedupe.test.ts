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
