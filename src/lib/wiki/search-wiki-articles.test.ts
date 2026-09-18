import { describe, expect, it } from "vitest";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/wiki/wiki-articles-data";
import { searchWikiArticles, updateKeyword, updatePageMatchTerm } from "@/lib/wiki/search-wiki-articles";
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
