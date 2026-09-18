import { describe, expect, it } from "vitest";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/wiki/wiki-articles-data";
import {
  expandSearchQuery,
  normalizeSearchText,
  prepareWikiSearchIndex,
  SEARCH_SYNONYMS,
  searchWikiArticles,
  suggestWikiCategories,
  updateKeyword,
  updatePageMatchTerm,
} from "@/lib/wiki/search-wiki-articles";
import { getEntityLink } from "@/lib/links/entity-links";
import counts from "@/lib/wiki/wiki-category-counts.json";

const base = { snippet: "", content: "", url: "", archived: false, stub: false };
const FIXTURE = [
  { ...base, id: "a1", source: "NukaKnights", title: "Fixer build", category: "Weapons & Mods" },
  { ...base, id: "a2", source: "Fallout Wiki", title: "The Pitt expedition guide", category: "Events & Expeditions" },
  { ...base, id: "a3", source: "Fallout Wiki", title: "Pitt stub", category: "Events & Expeditions", stub: true },
  { ...base, id: "a4", source: "TheDuchessFlame", title: "Old Atomic Shop week", category: "Atomic Shop archive", archived: true },
  { ...base, id: "a5", source: "NukaKnights", title: "Snippet-only match", category: "Events & Expeditions", snippet: "Rewards from the Pitt" },
  { ...base, id: "a6", source: "Fallout Wiki", title: "Fixer", category: "Weapons & Mods", stub: true },
];

const ids = (r: { items: { id: number | string }[] }) => r.items.map((a) => a.id);

describe("searchWikiArticles", () => {
  it("keeps the route defaults: no archive, newest first, stubs last", () => {
    const r = searchWikiArticles(FIXTURE);
    expect(r.total).toBe(5);
    expect(ids(r)).toEqual(["a5", "a2", "a1", "a6", "a3"]);
  });

  it("includes the archive on request", () => {
    expect(searchWikiArticles(FIXTURE, { includeArchive: true }).total).toBe(6);
  });

  it("filters by source and hides stubs", () => {
    expect(ids(searchWikiArticles(FIXTURE, { source: "Fallout Wiki" }))).toEqual(["a2", "a6", "a3"]);
    expect(ids(searchWikiArticles(FIXTURE, { source: "Fallout Wiki", hideStubs: true }))).toEqual(["a2"]);
  });

  it("filters by category prefix and ranks title matches for a query", () => {
    expect(ids(searchWikiArticles(FIXTURE, { category: "Weapons & Mods" }))).toEqual(["a1", "a6"]);
    // exact title ranks above startsWith, but stubs still go last
    expect(ids(searchWikiArticles(FIXTURE, { q: "fixer" }))).toEqual(["a1", "a6"]);
  });

  it("update chips apply the route rule and the page's former title/category rule", () => {
    expect(updateKeyword("the-pitt")).toBe("pitt");
    expect(updatePageMatchTerm("the-pitt")).toBe("the pitt");
    expect(updatePageMatchTerm("burning-springs")).toBe("burning");
    // a5 matched only on the snippet, a3 says "Pitt" but not "the pitt": the page never showed them.
    expect(ids(searchWikiArticles(FIXTURE, { update: "the-pitt" }))).toEqual(["a2"]);
  });

  it("pages with offset/limit and reports the total before slicing", () => {
    const all = searchWikiArticles(FIXTURE, { includeArchive: true });
    const page2 = searchWikiArticles(FIXTURE, { includeArchive: true, offset: 2, limit: 2 });
    expect(page2.total).toBe(6);
    expect(ids(page2)).toEqual(ids(all).slice(2, 4));
    expect(searchWikiArticles(FIXTURE, { offset: 50, limit: 25 }).items).toEqual([]);
  });

  it("agrees with the committed category counts on the real corpus", () => {
    const r = searchWikiArticles(FALLBACK_WIKI_ARTICLES, { category: "Patch notes & news", limit: 25 });
    expect(r.total).toBe((counts as Record<string, number>)["Patch notes & news"]);
    expect(r.items).toHaveLength(25);
    expect(searchWikiArticles(FALLBACK_WIKI_ARTICLES, { includeArchive: true }).total).toBe(counts.all);
    expect(searchWikiArticles(FALLBACK_WIKI_ARTICLES, { includeArchive: true, hideStubs: true }).total).toBe(counts.all - counts.stub);
  });
});

// ---------------------------------------------------------------------------------------------
// Search quality (Guides UI/UX step c)
// ---------------------------------------------------------------------------------------------

const titles = (r: { items: { title: string }[] }) => r.items.map((a) => a.title);
const corpus = (q: string, extra: Parameters<typeof searchWikiArticles>[1] = {}) =>
  searchWikiArticles(FALLBACK_WIKI_ARTICLES, { q, sort: "newest", ...extra });
const topTitles = (q: string, n = 5) => titles(corpus(q, { limit: n }));

describe("normalizeSearchText", () => {
  it("drops apostrophes and dots, turns other punctuation into spaces", () => {
    expect(normalizeSearchText("Overeater's")).toBe("overeaters");
    expect(normalizeSearchText("Overeater\u2019s")).toBe("overeaters");
    expect(normalizeSearchText("V.A.T.S. Optimized")).toBe("vats optimized");
    expect(normalizeSearchText("T-51b Power Armor")).toBe("t 51b power armor");
    expect(normalizeSearchText("Version 1.7.11.12")).toBe("version 1 7 11 12");
    expect(normalizeSearchText("  25% LVC ")).toBe("25 lvc");
  });
});

describe("searchWikiArticles relevance (fixtures)", () => {
  const F = [
    { ...base, id: "r1", source: "S", title: "Power armor guide", category: "Armor & Power Armor" },
    { ...base, id: "r2", source: "S", title: "Raider Power Armor", category: "Armor & Power Armor" },
    { ...base, id: "r3", source: "S", title: "Raider Power Armor plans and locations", category: "Armor & Power Armor" },
    { ...base, id: "r4", source: "S", title: "Where to find raider power armor", category: "Armor & Power Armor" },
    { ...base, id: "r5", source: "S", title: "Raider armor", category: "Armor & Power Armor", snippet: "A lighter set." },
    { ...base, id: "r6", source: "S", title: "Camp tips", category: "Crafting & Resources", snippet: "Raider power armor sits in the corner." },
    { ...base, id: "r7", source: "S", title: "Raider Power Armor stub", category: "Armor & Power Armor", stub: true },
    { ...base, id: "r8", source: "S", title: "Raider Power Armor", category: "Armor & Power Armor", archived: true },
  ];

  it("ranks exact title, then starts-with, then contains, then words in title, then snippet; stubs last", () => {
    expect(ids(searchWikiArticles(F, { q: "Raider Power Armor" }))).toEqual(["r2", "r3", "r4", "r6", "r7"]);
    // all words in the title (not contiguous) rank above a snippet-only hit
    // (r2-r4 tie on "all words in the title" and keep the default id-descending order)
    expect(ids(searchWikiArticles(F, { q: "raider armor" }))).toEqual(["r5", "r4", "r3", "r2", "r6", "r7"]);
  });

  it("keeps archived guides out unless asked", () => {
    expect(ids(searchWikiArticles(F, { q: "raider power armor" }))).not.toContain("r8");
    expect(ids(searchWikiArticles(F, { q: "raider power armor", includeArchive: true })).slice(0, 2)).toEqual(["r8", "r2"]);
  });

  it("respects an explicit sort over the same match set", () => {
    const relevance = searchWikiArticles(F, { q: "raider power armor" });
    const byTitle = searchWikiArticles(F, { q: "raider power armor", sort: "title-asc" });
    const oldest = searchWikiArticles(F, { q: "raider power armor", sort: "oldest" });
    expect(new Set(ids(byTitle))).toEqual(new Set(ids(relevance)));
    expect(titles(byTitle).slice(0, 4)).toEqual([
      "Camp tips",
      "Raider Power Armor",
      "Raider Power Armor plans and locations",
      "Where to find raider power armor",
    ]);
    expect(ids(oldest)).toEqual(["r2", "r3", "r4", "r6", "r7"]);
    expect(ids(searchWikiArticles(F, { q: "raider power armor", sort: "title-desc" }))[0]).toBe("r4");
  });

  it("leaves the order unchanged for an empty query", () => {
    expect(ids(searchWikiArticles(F, { q: "" }))).toEqual(ids(searchWikiArticles(F)));
    expect(ids(searchWikiArticles(F, { q: "   " }))).toEqual(["r6", "r5", "r4", "r3", "r2", "r1", "r7"]);
  });

  it("pins a guide titled with the entity a synonym names above a literal exact title", () => {
    const P = [
      { ...base, id: "p1", source: "S", title: "TS", category: "General" },
      { ...base, id: "p2", source: "S", title: "Two Shot", category: "Weapons & Mods" },
      { ...base, id: "p3", source: "S", title: "Two Shot explained", category: "Weapons & Mods" },
    ];
    expect(getEntityLink("Two Shot")).toBeDefined();
    expect(ids(searchWikiArticles(P, { q: "ts" }))).toEqual(["p2", "p1", "p3"]);
    expect(expandSearchQuery("ts").pinnedTitles.has("two shot")).toBe(true);
  });
});

describe("searchWikiArticles on the real corpus", () => {
  it("exact title first", () => {
    expect(topTitles("Raider Power Armor", 1)).toEqual(["Raider Power Armor"]);
    expect(topTitles("raider power armor", 1)).toEqual(["Raider Power Armor"]);
  });

  it("entity pin: a query naming an entity puts the guide with that exact title first", () => {
    expect(getEntityLink("Critical Savvy")).toBeDefined();
    expect(topTitles("critical savvy", 1)).toEqual(["Critical Savvy"]);
    // "bloody" -> Bloodied (entity) outranks the literal "Bloody Mess" / "Bloody spacesuit"
    expect(topTitles("bloody", 1)).toEqual(["Bloodied"]);
  });

  it.each([
    ["aa", "Anti-armor Legendary mod"],
    ["25lvc", "V.A.T.S. Optimized Legendary mod"],
    ["25 lvc", "V.A.T.S. Optimized Legendary mod"],
    ["lvc", "V.A.T.S. Optimized Legendary mod"],
    ["vats opt", "V.A.T.S. Optimized Legendary mod"],
    ["sbq", "Scorchbeast Queen"],
    ["uny", "Unyielding Legendary mod"],
    ["oe", "Overeater's Legendary mod"],
    ["cs3", "Critical Savvy"],
    ["ss armor", "Secret Service Armor"],
    ["ce armor", "Civil Engineer Armor"],
    ["ultracite pa", "Ultracite power armor"],
  ])("synonym %s finds %s in the top 3", (q, title) => {
    expect(topTitles(q, 3)).toContain(title);
  });

  it("wwr expands to Arms Keeper's / weapon weight reduced (no Arms Keeper's guide exists; the perk is not a target)", () => {
    const e = expandSearchQuery("wwr");
    expect(e.variants.map((v) => v.norm)).toEqual(["wwr", "arms keepers", "weapon weight reduced"]);
    const r = corpus("wwr");
    expect(titles(r)).not.toContain("Arms Keeper");
    for (const a of r.items) expect(`${a.title} ${a.snippet}`.toLowerCase()).toMatch(/weapon weight reduced|reduced weight|arms keeper's/);
  });

  it("punctuation and apostrophes: overeaters, vats, t51b / t 51b", () => {
    expect(topTitles("overeaters", 3)).toContain("Overeater's Legendary mod");
    expect(titles(corpus("vats"))).toEqual(expect.arrayContaining(["V.A.T.S. Optimized Legendary mod", "Fallout 76 V.A.T.S."]));
    expect(topTitles("t51b", 1)).toEqual(["T-51b Power Armor"]);
    expect(topTitles("t 51b", 1)).toEqual(["T-51b Power Armor"]);
  });

  it("the literal query still matches when a synonym exists", () => {
    // every guide the old raw-substring rule found for "pa" and "bloody" is still in the result set
    for (const q of ["pa", "bloody", "aa", "ffr"]) {
      const got = new Set(ids(corpus(q)));
      const old = FALLBACK_WIKI_ARTICLES.filter(
        (a) => !a.archived && (a.title.toLowerCase().includes(q) || a.snippet.toLowerCase().includes(q)),
      );
      for (const a of old) expect(got.has(a.id)).toBe(true);
    }
    expect(topTitles("bloody", 5)).toContain("Bloody Mess");
  });

  it("stubs rank last and archived guides stay out on a real query", () => {
    const r = corpus("secret service");
    const firstStub = r.items.findIndex((a) => a.stub);
    expect(firstStub).toBeGreaterThan(0);
    expect(r.items.slice(firstStub).every((a) => a.stub)).toBe(true);
    expect(r.items.some((a) => a.archived)).toBe(false);
  });

  it("suggests up to 3 categories for a query with no matches", () => {
    const ids3 = Object.keys(counts).filter((k) => !["all", "archived", "stub"].includes(k));
    expect(corpus("zzqx plasma").total).toBe(0);
    const s = suggestWikiCategories(FALLBACK_WIKI_ARTICLES, { q: "zzqx plasma" }, ids3);
    expect(s.length).toBeGreaterThan(0);
    expect(s.length).toBeLessThanOrEqual(3);
    for (const id of s) expect(ids3).toContain(id);
    expect(suggestWikiCategories(FALLBACK_WIKI_ARTICLES, { q: "zzqx" }, ids3)).toEqual([]);
    expect(suggestWikiCategories(FALLBACK_WIKI_ARTICLES, { q: "zzqx plasma", category: s[0] }, ids3)).not.toContain(s[0]);
  });

  it("every synonym entry is well formed", () => {
    for (const e of SEARCH_SYNONYMS) {
      expect(e.terms.length).toBeGreaterThan(0);
      expect(e.expandsTo.length).toBeGreaterThan(0);
      expect(e.note.length).toBeGreaterThan(0);
      for (const t of e.terms) expect(normalizeSearchText(t)).not.toBe("");
    }
  });

  it("stays fast: 50 queries over the corpus well under 200 ms", () => {
    prepareWikiSearchIndex(FALLBACK_WIKI_ARTICLES);
    const queries = ["aa", "25lvc", "wwr", "sbq", "overeaters", "vats", "t51b", "raider power armor", "fixer", "the pitt"];
    const start = performance.now();
    for (let i = 0; i < 50; i++) corpus(queries[i % queries.length]);
    expect(performance.now() - start).toBeLessThan(200);
  });
});
