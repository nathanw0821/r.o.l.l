import { describe, expect, it, vi } from "vitest";
import { parseGuideListState } from "@/lib/wiki/guide-list-state";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/wiki/wiki-articles-data";
import { buildWikiClientIndex } from "@/lib/wiki/wiki-client-index";
import { findOfflineGuide, isNetworkFailure, loadWikiClientIndex, searchOfflineGuides } from "@/lib/wiki/offline-search";
import { searchWikiArticles, suggestWikiCategories } from "@/lib/wiki/search-wiki-articles";
import wikiCategoryCounts from "@/lib/wiki/wiki-category-counts.json";

const INDEX = buildWikiClientIndex(FALLBACK_WIKI_ARTICLES);
const state = (params: string) => parseGuideListState(new URLSearchParams(params));

describe("searchOfflineGuides", () => {
  it("returns the same guides, in the same order, as the server search over the full corpus", () => {
    for (const params of ["q=minerva", "q=bloodied&category=Weapons%20%26%20Mods", "sort=title-asc&stubs=hide", "q=ultracite%20pa&archive=1"]) {
      const s = state(params);
      const offline = searchOfflineGuides(INDEX, s, 0, 25);
      const server = searchWikiArticles(FALLBACK_WIKI_ARTICLES, {
        q: s.q,
        category: s.category,
        sort: s.sort,
        update: s.update,
        includeArchive: s.archive,
        source: s.source,
        hideStubs: s.hideStubs,
        hidePossiblyOutdated: s.hideOutdated,
        offset: 0,
        limit: 25,
      });
      expect(offline.total, params).toBe(server.total);
      expect(offline.items.map((a) => a.id), params).toEqual(server.items.map((a) => a.id));
      expect(offline.offline).toBe(true);
    }
  });

  it("pages like the server and suggests categories when nothing matches", () => {
    const page2 = searchOfflineGuides(INDEX, state("page=2"), 25, 25);
    expect(page2.items).toHaveLength(25);
    expect(page2.items[0].id).toBe(searchWikiArticles(FALLBACK_WIKI_ARTICLES, { offset: 25, limit: 25 }).items[0].id);

    const s = state("q=minerva&category=Patch%20notes%20%26%20news");
    const none = searchOfflineGuides(INDEX, s, 0, 25);
    const expected = suggestWikiCategories(
      FALLBACK_WIKI_ARTICLES,
      { q: s.q, category: s.category, includeArchive: false },
      Object.keys(wikiCategoryCounts).filter((k) => !["all", "archived", "stub"].includes(k)),
    );
    expect(none.total).toBe(0);
    expect(none.suggestions).toEqual(expected);
  });

  it("finds a guide by id and reports a miss", () => {
    const first = INDEX[0];
    expect(findOfflineGuide(INDEX, String(first.id))?.title).toBe(first.title);
    expect(findOfflineGuide(INDEX, "no-such-guide")).toBeNull();
  });
});

describe("isNetworkFailure", () => {
  it("is true for fetch's TypeError and false for aborts and HTTP-shaped errors", () => {
    expect(isNetworkFailure(new TypeError("Failed to fetch"))).toBe(true);
    expect(isNetworkFailure(new DOMException("aborted", "AbortError"))).toBe(false);
    expect(isNetworkFailure(new Error("HTTP 500"))).toBe(false);
  });
});

describe("loadWikiClientIndex", () => {
  it("fetches /data/wiki/index.json once and retries after a failure", async () => {
    const rows = INDEX.slice(0, 3);
    const failing = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(loadWikiClientIndex(failing as unknown as typeof fetch)).rejects.toThrow("Failed to fetch");
    const ok = vi.fn(async () => new Response(JSON.stringify(rows), { status: 200, headers: { "content-type": "application/json" } }));
    const first = await loadWikiClientIndex(ok as unknown as typeof fetch);
    const second = await loadWikiClientIndex(ok as unknown as typeof fetch);
    expect(first).toHaveLength(3);
    expect(second).toBe(first);
    expect(ok).toHaveBeenCalledTimes(1);
  });
});
