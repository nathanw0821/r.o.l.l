import { describe, expect, it } from "vitest";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/wiki/wiki-articles-data";
import { computeWikiCategoryCounts, WIKI_CATEGORY_IDS } from "@/lib/wiki/wiki-category-counts";
import committed from "@/lib/wiki/wiki-category-counts.json";

describe("wiki category counts", () => {
  it("committed counts match the article corpus (run scripts/truth/build-wiki-counts.ts to refresh)", () => {
    const live = computeWikiCategoryCounts(FALLBACK_WIKI_ARTICLES, WIKI_CATEGORY_IDS);
    expect(committed).toEqual(live);
    expect(live.all).toBe(FALLBACK_WIKI_ARTICLES.length);
  });
});
