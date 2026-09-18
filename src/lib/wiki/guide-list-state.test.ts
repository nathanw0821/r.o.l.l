import { describe, expect, it } from "vitest";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/wiki/wiki-articles-data";
import {
  DEFAULT_GUIDE_LIST_STATE,
  WIKI_SOURCES,
  activeFilterChips,
  clampPage,
  clearAllFilters,
  firstSentence,
  countActiveFilters,
  pageCount,
  pageOffset,
  parseGuideListState,
  readPage,
  removeFilter,
  serializeGuideListState,
  type GuideListState,
} from "@/lib/wiki/guide-list-state";

const parse = (qs: string) => parseGuideListState(new URLSearchParams(qs));

describe("guide list URL state", () => {
  it("defaults when no params are present", () => {
    expect(parse("")).toEqual(DEFAULT_GUIDE_LIST_STATE);
    expect(parseGuideListState(null)).toEqual(DEFAULT_GUIDE_LIST_STATE);
    expect(serializeGuideListState(DEFAULT_GUIDE_LIST_STATE)).toBe("");
  });

  it("reads every param, including the ?query= alias", () => {
    expect(
      parse("query=fixer&category=Patch%20notes%20%26%20news&update=The-Pitt&archive=1&source=NukaKnights&stubs=hide&current=1&page=3"),
    ).toEqual({
      q: "fixer",
      category: "Patch notes & news",
      update: "the-pitt",
      archive: true,
      source: "NukaKnights",
      hideStubs: true,
      hideOutdated: true,
      page: 3,
    });
    expect(parse("q=a&query=b").q).toBe("a");
    expect(parse("q=&query=b").q).toBe("b");
  });

  it("ignores unknown or invalid values", () => {
    expect(parse("category=Nope&update=nope&source=Reddit&stubs=show&archive=yes&current=yes&page=-2")).toEqual(DEFAULT_GUIDE_LIST_STATE);
    for (const raw of ["0", "abc", "1.5", "", "99999999999999999999"]) expect(readPage(raw)).toBe(1);
    expect(readPage(" 7 ")).toBe(7);
  });

  it("round-trips through the query string and omits defaults", () => {
    const state: GuideListState = {
      q: "bloodied build",
      category: "Weapons & Mods",
      update: "skyline-valley",
      archive: true,
      source: "Fallout Wiki",
      hideStubs: true,
      hideOutdated: true,
      page: 2,
    };
    const qs = serializeGuideListState(state);
    expect(qs).toBe("q=bloodied+build&category=Weapons+%26+Mods&update=skyline-valley&archive=1&source=Fallout+Wiki&stubs=hide&current=1&page=2");
    expect(parse(qs)).toEqual(state);
    expect(serializeGuideListState({ ...DEFAULT_GUIDE_LIST_STATE, q: "   ", page: 1 })).toBe("");
  });

  it("builds removable chips and clears one filter back to page 1", () => {
    const state = parse("q=fixer&category=Weapons%20%26%20Mods&source=NukaKnights&update=the-pitt&archive=1&stubs=hide&current=1&page=4");
    expect(countActiveFilters(state)).toBe(6);
    const chips = activeFilterChips(state, (id) => (id === "Weapons & Mods" ? "Weapons & legendary mods" : id));
    expect(chips.map((c) => c.key)).toEqual(["q", "category", "source", "update", "archive", "stubs", "current"]);
    expect(chips[6].label).toBe("Hiding possibly outdated");
    expect(removeFilter(state, "current").hideOutdated).toBe(false);
    expect(chips[1].label).toBe("Category: Weapons & legendary mods");
    expect(chips[3].label).toBe("Update: The Pitt (Expedition 1)");
    const withoutSource = removeFilter(state, "source");
    expect(withoutSource.source).toBeNull();
    expect(withoutSource.page).toBe(1);
    expect(withoutSource.category).toBe("Weapons & Mods");
    expect(clearAllFilters()).toEqual(DEFAULT_GUIDE_LIST_STATE);
    expect(activeFilterChips(DEFAULT_GUIDE_LIST_STATE)).toEqual([]);
  });

  it("source list matches the corpus", () => {
    const corpusSources = new Set(FALLBACK_WIKI_ARTICLES.map((a) => a.source));
    expect(new Set(WIKI_SOURCES)).toEqual(corpusSources);
  });
});

describe("pagination math", () => {
  it("counts pages, clamps and offsets", () => {
    expect(pageCount(0)).toBe(1);
    expect(pageCount(1)).toBe(1);
    expect(pageCount(25)).toBe(1);
    expect(pageCount(26)).toBe(2);
    expect(pageCount(3165)).toBe(127);
    expect(pageCount(10, 3)).toBe(4);
    expect(clampPage(0, 100)).toBe(1);
    expect(clampPage(9, 100)).toBe(4);
    expect(clampPage(3, 100)).toBe(3);
    expect(clampPage(5, 0)).toBe(1);
    expect(pageOffset(1)).toBe(0);
    expect(pageOffset(3)).toBe(50);
    expect(pageOffset(0)).toBe(0);
  });
});

describe("firstSentence", () => {
  it("keeps the first real sentence and trims long text", () => {
    expect(firstSentence("Official patch notes for Version 1.7.11.12 featuring fixes. Second sentence here.")).toBe(
      "Official patch notes for Version 1.7.11.12 featuring fixes.",
    );
    expect(firstSentence("<b>Short.</b> Then a longer second sentence follows here.")).toBe("Short. Then a longer second sentence follows here.");
    const long = "word ".repeat(60).trim();
    const out = firstSentence(long, 50);
    expect(out.endsWith("…")).toBe(true);
    expect(out.length).toBeLessThanOrEqual(51);
    expect(firstSentence("")).toBe("");
  });
});
