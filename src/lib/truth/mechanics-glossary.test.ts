import { describe, expect, it } from "vitest";
import {
  GLOSSARY_PATCH,
  GLOSSARY_TERMS,
  countSentences,
  glossaryHref,
  glossaryLetter,
  groupGlossaryByLetter,
  isInternalHref,
  seeAlsoLabel,
  validateGlossary,
  type GlossaryTerm
} from "@/lib/truth/mechanics-glossary";
import economy from "@/data/truth/crafting-economy.json";
import defensive from "@/data/truth/defensive-perks.json";
import gameVersion from "@/data/truth/game-version.json";
import { MAX_ARMOR_PENETRATION } from "@/lib/calculator/creation-engine-math";
import { getEffectModel } from "@/lib/truth/legendary-effect-model";

const bySlug = (slug: string) => {
  const t = GLOSSARY_TERMS.find((x) => x.slug === slug);
  if (!t) throw new Error(`missing glossary slug ${slug}`);
  return t.definition;
};

const good: GlossaryTerm = {
  term: "Test term",
  slug: "test-term",
  definition: "One sentence.",
  verifiedPatch: 70,
  source: "test",
  seeAlso: ["/wiki"]
};

describe("mechanics glossary data", () => {
  it("has 25 to 40 terms for the current patch", () => {
    expect(GLOSSARY_TERMS.length).toBeGreaterThanOrEqual(25);
    expect(GLOSSARY_TERMS.length).toBeLessThanOrEqual(40);
    expect(GLOSSARY_PATCH).toBe(gameVersion.patch);
    for (const t of GLOSSARY_TERMS) expect(t.verifiedPatch).toBeLessThanOrEqual(gameVersion.patch);
  });

  it("is sorted A-Z with digits first", () => {
    const names = GLOSSARY_TERMS.map((t) => t.term);
    expect(names[0]).toBe("4th star on uniques");
    const letters = names.slice(1).map((n) => n.toLowerCase());
    expect([...letters].sort((a, b) => a.localeCompare(b))).toEqual(letters);
  });

  it("repeats the truth pack's numbers, not its own", () => {
    const u = economy.uniqueCraftingByStar;
    expect(bySlug("vault-steel")).toContain(`${u["3"].vaultSteel} for a 3-star`);
    expect(bySlug("vault-steel")).toContain(`${u["4"].vaultSteel} for a 4-star`);
    expect(bySlug("fourth-star-on-uniques")).toContain(`${u["3"].legendaryModules} modules and ${u["3"].vaultSteel} Vault Steel`);
    expect(bySlug("mod-change-cost")).toContain(`flat ${economy.modChangeScripByStar["1"]} scrip`);
    expect(bySlug("mod-change-cost")).toContain(`${economy.modChangeScripByStar["4"]} for a 4-star`);
    const m = economy.moduleCraftingCostByStar;
    expect(bySlug("legendary-modules")).toContain(`${m["1"]}, ${m["2"]}, ${m["3"]} or ${m["4"]} modules`);
    expect(bySlug("legendary-modules")).toContain(`weighs ${economy.legendaryModuleWeight}`);
    const s = economy.scripSaleValueByStar;
    expect(bySlug("legendary-scrip")).toContain(`${s["1"]}, ${s["2"]}, ${s["3"]} or ${s["4"]} scrip`);
    expect(bySlug("armor-penetration")).toContain(`capped at ${MAX_ARMOR_PENETRATION * 100}%`);
    expect(bySlug("deflect")).toContain(`${defensive.evadeDeflect.deflectDamageTakenPct}%`);
    expect(bySlug("blocking")).toContain(`${defensive.perks.blocker.baseBlockPct}%`);
    expect(bySlug("onslaught")).toContain(`+${(getEffectModel("furious")?.perUnit ?? 0) * 100}% damage per stack up to ${getEffectModel("furious")?.maxStacks}`);
    expect(bySlug("bleeding")).toContain(`+${(getEffectModel("severing")?.value ?? 0) * 100}%`);
    expect(bySlug("unyielding-thresholds")).toContain("20, 40 and 60% HP");
    expect(bySlug("power-armor-innate-reduction")).toContain("unverified");
  });

  it("leaves out Glow and the ghoul feral meter (the pack has no meter numbers)", () => {
    const terms = GLOSSARY_TERMS.map((t) => t.term.toLowerCase());
    expect(terms.some((t) => t.includes("glow"))).toBe(false);
    expect(terms.some((t) => t.includes("feral"))).toBe(false);
  });
});

describe("glossary helpers", () => {
  it("counts sentences without splitting on decimals, abbreviations or 'Nerd Rage!'", () => {
    expect(countSentences("Stacks to +0.1% per hit. It does not work in PvP.")).toBe(2);
    expect(countSentences("Gives +3 to every S.P.E.C.I.A.L. stat except Endurance.")).toBe(1);
    expect(countSentences("Cards such as Nerd Rage! have a single rank.")).toBe(1);
    expect(countSentences("R.O.L.L.'s dummies use 300 DR. One. Two.")).toBe(3);
  });

  it("validation rejects bad entries", () => {
    const wrap = (t: Partial<GlossaryTerm>) => ({ patch: 70, verifiedAt: "x", terms: [{ ...good, ...t }] });
    expect(() => validateGlossary(wrap({}))).not.toThrow();
    expect(() => validateGlossary(wrap({ slug: "Bad Slug" }))).toThrow(/bad slug/);
    expect(() => validateGlossary(wrap({ definition: "One. Two. Three." }))).toThrow(/1 or 2 sentences/);
    expect(() => validateGlossary(wrap({ seeAlso: ["https://example.com"] }))).toThrow(/internal/);
    expect(() => validateGlossary(wrap({ source: " " }))).toThrow(/source/);
    expect(() => validateGlossary({ patch: 70, verifiedAt: "x", terms: [good, { ...good, term: "Other" }] })).toThrow(/duplicate slug/);
  });

  it("internal hrefs start with one slash", () => {
    expect(isInternalHref("/wiki/glossary#evade")).toBe(true);
    expect(isInternalHref("//cdn.example.com/x")).toBe(false);
    expect(isInternalHref("https://example.com")).toBe(false);
    expect(isInternalHref("wiki")).toBe(false);
  });

  it("groups by index letter with '#' first", () => {
    expect(glossaryLetter("4th star on uniques")).toBe("#");
    expect(glossaryLetter("evade")).toBe("E");
    const groups = groupGlossaryByLetter();
    expect(groups[0].letter).toBe("#");
    expect(groups.flatMap((g) => g.terms)).toHaveLength(GLOSSARY_TERMS.length);
    expect(glossaryHref("evade")).toBe("/wiki/glossary#evade");
  });
});

describe("seeAlsoLabel", () => {
  it("names each kind of link", () => {
    expect(seeAlsoLabel("/wiki/glossary#vault-steel")).toBe("Vault Steel");
    expect(seeAlsoLabel("/perks?q=Bullet%20Storm")).toBe("Bullet Storm perk");
    expect(seeAlsoLabel("/all-effects?q=Pounder's")).toBe("Pounder's in the tracker");
    expect(seeAlsoLabel("/build?tab=combat")).toBe("Builder: combat damage");
    expect(seeAlsoLabel("/build?tab=gear&piece=ticket-to-revenge")).toBe("Builder: ticket to revenge");
    expect(seeAlsoLabel("/4-star")).toBe("4-star mods");
    expect(seeAlsoLabel("/wiki?q=Infestation")).toBe("Guides about Infestation");
  });
});
