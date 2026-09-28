import { describe, it, expect } from "vitest";
import { PERK_CATALOG, getPerkCardById } from "./catalog";
import { countPerkEffectTags, perkEffectTags, PERK_EFFECT_TAG_ORDER } from "./perk-effect-categories";

function tagsOf(id: string) {
  const card = getPerkCardById(id);
  if (!card) throw new Error(`no card ${id}`);
  return perkEffectTags(card);
}

describe("perkEffectTags", () => {
  it("reads the card's own effect text", () => {
    expect(tagsOf("tank-killer")).toContain("ranged");
    expect(tagsOf("ironclad")).toContain("resist");
    expect(tagsOf("bullet-storm")).toContain("stacks");
    expect(tagsOf("strong-back")).toEqual(expect.arrayContaining(["weight", "special"]));
    expect(tagsOf("chemist")).toEqual(expect.arrayContaining(["craft", "consumables"]));
    expect(tagsOf("night-person")).toContain("special");
    expect(tagsOf("lone-wanderer")).toEqual(expect.arrayContaining(["team", "resist", "ap"]));
    expect(tagsOf("demolition-expert")).toContain("explosive");
    expect(tagsOf("sneak")).toContain("stealth");
  });

  it("tags every catalog card at least once and 'misc' stays a small remainder", () => {
    const counts = countPerkEffectTags(PERK_CATALOG);
    for (const card of PERK_CATALOG) expect(perkEffectTags(card).length).toBeGreaterThan(0);
    const total = PERK_CATALOG.length;
    expect(counts.misc ?? 0).toBeLessThan(total * 0.15);
    for (const tag of Object.keys(counts)) expect(PERK_EFFECT_TAG_ORDER).toContain(tag);
  });
});
