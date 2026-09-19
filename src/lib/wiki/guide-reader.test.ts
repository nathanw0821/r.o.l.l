import { describe, expect, it } from "vitest";
import {
  MIN_TOC_ENTRIES,
  adjacentGuides,
  buildGuideToc,
  flattenPatchLabel,
  guideHeadingLevel,
  guideHeadingText,
  guideEntityKeys,
  titleWords,
  selectRelatedGuides,
  slugifyHeading,
  splitGuideBlocks,
  type RelatedGuideCandidate,
} from "@/lib/wiki/guide-reader";

describe("slugifyHeading", () => {
  it("lower-cases and joins words with single hyphens", () => {
    expect(slugifyHeading("Armor Parts")).toBe("armor-parts");
    expect(slugifyHeading("  Bug fixes & improvements!  ")).toBe("bug-fixes-improvements");
  });

  it("drops emphasis markers, apostrophes and accents", () => {
    expect(slugifyHeading("**Vault-Tec's** *Best*")).toBe("vault-tecs-best");
    expect(slugifyHeading("Café Übersicht")).toBe("cafe-ubersicht");
  });

  it("falls back to 'section' when nothing slug-worthy is left", () => {
    expect(slugifyHeading("★★★")).toBe("section");
    expect(slugifyHeading("")).toBe("section");
  });

  it("caps length without a trailing hyphen", () => {
    const slug = slugifyHeading(`${"word ".repeat(30)}end`);
    expect(slug.length).toBeLessThanOrEqual(64);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("buildGuideToc", () => {
  const body = [
    "Intro paragraph.",
    "# Overview",
    "Text.",
    "## Crafting",
    "### Plans",
    "#### Too deep",
    "## Crafting",
    "Source: Fallout Wiki",
    "| a | b |\n| 1 | 2 |",
    "## Crafting 2",
  ].join("\n\n");

  it("lists h2 ('# ') and h3 ('## ') headings in reading order, not h4 or deeper", () => {
    const toc = buildGuideToc(body);
    expect(toc.entries.map((e) => [e.level, e.text])).toEqual([
      [2, "Overview"],
      [3, "Crafting"],
      [3, "Crafting"],
      [3, "Crafting 2"],
    ]);
  });

  it("gives duplicate headings unique ids", () => {
    const slugs = buildGuideToc(body).entries.map((e) => e.slug);
    expect(slugs).toEqual(["overview", "crafting", "crafting-2", "crafting-2-2"]);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("keys ids by the parser's block index", () => {
    const blocks = splitGuideBlocks(body);
    const toc = buildGuideToc(body);
    for (const [idx, slug] of toc.slugByBlock) {
      expect(blocks[idx].trim().startsWith("#")).toBe(true);
      expect(toc.entries.some((e) => e.slug === slug)).toBe(true);
    }
    expect(toc.slugByBlock.get(1)).toBe("overview");
  });

  it("is stable across calls and empty for bodies without headings", () => {
    expect(buildGuideToc(body)).toEqual(buildGuideToc(body));
    expect(buildGuideToc("Just text.\n\nMore text.").entries).toEqual([]);
    expect(buildGuideToc("").entries).toEqual([]);
  });

  it("the reader shows a table of contents from three headings", () => {
    expect(MIN_TOC_ENTRIES).toBe(3);
  });

  it("keeps h4-h6 out of the contents and strips emphasis from entry text", () => {
    const toc = buildGuideToc(["# **Overview**", "#### **Step 2: Review the Graph**", "##### Event: Mothman Equinox", "## Crafting"].join("\n\n"));
    expect(toc.entries.map((e) => [e.level, e.text, e.slug])).toEqual([
      [2, "Overview", "overview"],
      [3, "Crafting", "crafting"],
    ]);
  });
});

describe("guideHeadingLevel / guideHeadingText", () => {
  it("maps one to six '#' to h2-h6 (the page title is the h1)", () => {
    expect(guideHeadingLevel("# Overview")).toBe(2);
    expect(guideHeadingLevel("## Crafting")).toBe(3);
    expect(guideHeadingLevel("### Plans")).toBe(4);
    // Real corpus headings that used to render as paragraphs with their "####" showing.
    expect(guideHeadingLevel("#### **Step 2: Review the Graph**")).toBe(5); // guide 149
    expect(guideHeadingLevel("#### Minerva Angebote für diesen Termin")).toBe(5); // guide 332
    expect(guideHeadingLevel("##### Treasure hunters and double mutations")).toBe(6); // guide 3578
    expect(guideHeadingLevel("###### **Forest**")).toBe(6); // guide 4638
  });

  it("accepts scrape artefacts with the marker glued on or on its own line", () => {
    expect(guideHeadingLevel("##Challenges")).toBe(3); // guide 3650
    expect(guideHeadingLevel("###Combat")).toBe(4); // guide 3743
    expect(guideHeadingLevel("##\n Bigfoot und die Partycrasher nach Events")).toBe(3); // guide 3581
  });

  it("rejects text that only starts with '#'", () => {
    expect(guideHeadingLevel("#5 Things the ghoul needs now")).toBeNull(); // guide 3809
    expect(guideHeadingLevel("####### Seven is too many")).toBeNull();
    expect(guideHeadingLevel("#")).toBeNull();
    expect(guideHeadingLevel("Plain text # not a heading")).toBeNull();
    expect(guideHeadingLevel("| # | Name |")).toBeNull();
  });

  it("shows the text without the marker, emphasis or stray whitespace", () => {
    expect(guideHeadingText("#### **Step 2: Review the Graph**")).toBe("Step 2: Review the Graph");
    expect(guideHeadingText("###### **Note:** keys only drop during *Invaders from Beyond*")).toBe(
      "Note: keys only drop during Invaders from Beyond",
    );
    expect(guideHeadingText("##\n Bigfoot und die Partycrasher")).toBe("Bigfoot und die Partycrasher");
    expect(guideHeadingText("## T-51b *Excavator* 2x")).toBe("T-51b Excavator 2x");
    expect(guideHeadingText("## 2 * 3 * 4")).toBe("2 * 3 * 4");
  });
});

describe("selectRelatedGuides", () => {
  const keys: Record<string, string[]> = {
    cur: ["bloodied", "severing"],
    a: [],
    b: ["bloodied"],
    c: ["bloodied", "severing"],
    d: ["bloodied"],
    e: [],
    f: ["severing"],
  };
  const entityKeys = (g: RelatedGuideCandidate) => new Set(keys[String(g.id)] ?? []);
  const current = { id: "cur", title: "Current", category: "Weapons & Mods" };

  it("ranks same category first, then other categories that share linked entities", () => {
    const candidates = [
      { id: "a", title: "A", category: "Weapons & Mods" },
      { id: "b", title: "B", category: "Events & Expeditions" },
      { id: "c", title: "C", category: "Weapons & Mods" },
      { id: "e", title: "E", category: "Events & Expeditions" },
      { id: "f", title: "F", category: "Perks & Mutations" },
    ];
    const ids = selectRelatedGuides(current, candidates, { entityKeys }).map((g) => g.id);
    // c (same, 2 shared), a (same, 0), then b and f (1 shared each, candidate order); e shares nothing.
    expect(ids).toEqual(["c", "a", "b", "f"]);
  });

  it("excludes the guide itself, archived guides and duplicates, and caps at 5", () => {
    const candidates = [
      { id: "cur", title: "Current", category: "Weapons & Mods" },
      { id: "d", title: "D", category: "Weapons & Mods", archived: true },
      ...Array.from({ length: 8 }, (_, i) => ({ id: `s${i}`, title: `S${i}`, category: "Weapons & Mods" })),
      { id: "s0", title: "S0 again", category: "Weapons & Mods" },
    ];
    const related = selectRelatedGuides(current, candidates, { entityKeys });
    expect(related).toHaveLength(5);
    expect(related.map((g) => g.id)).toEqual(["s0", "s1", "s2", "s3", "s4"]);
    expect(related.find((g) => g.title === "S0 again")).toBeUndefined();
  });

  it("breaks ties by shared title words, then keeps candidate order", () => {
    const none = () => new Set<string>();
    const related = selectRelatedGuides(
      { id: 0, title: "Raider Power Armor", category: "Armor & Power Armor" },
      [
        { id: 1, title: "The Dragon", category: "Armor & Power Armor" },
        { id: 2, title: "T-65 Power Armor", category: "Armor & Power Armor" },
        { id: 3, title: "Raider camp plans", category: "Armor & Power Armor" },
        { id: 4, title: "Excavator Power Armor", category: "Armor & Power Armor" },
      ],
      { entityKeys: none },
    );
    expect(related.map((g) => g.id)).toEqual([2, 4, 3, 1]);
  });

  it("returns nothing when no candidate is related", () => {
    const candidates = [{ id: "e", title: "E", category: "Events & Expeditions" }];
    expect(selectRelatedGuides(current, candidates, { entityKeys })).toEqual([]);
  });

  it("uses the site's entity link map by default", () => {
    expect(guideEntityKeys({ title: "Bloodied builds", snippet: "Severing and more" })).toEqual(
      new Set(["bloodied", "severing"]),
    );
    const related = selectRelatedGuides(
      { id: 1, title: "Bloodied commando", category: "Build Mechanics & Damage" },
      [
        { id: 2, title: "Minerva schedule", category: "Vendors & Minerva" },
        { id: 3, title: "Why Bloodied still wins", category: "Weapons & Mods" },
      ],
    );
    expect(related.map((g) => g.id)).toEqual([3]);
  });
});

describe("titleWords", () => {
  it("keeps distinctive words of four or more letters", () => {
    expect(titleWords("Fallout 76 Raider Power Armor guide")).toEqual(new Set(["raider", "power", "armor"]));
  });
});

describe("adjacentGuides", () => {
  const list = [{ id: 1 }, { id: "two" }, { id: 3 }];

  it("returns neighbours in list order and null at the ends", () => {
    expect(adjacentGuides(list, 1)).toEqual({ index: 0, prev: null, next: { id: "two" } });
    expect(adjacentGuides(list, "two")).toEqual({ index: 1, prev: { id: 1 }, next: { id: 3 } });
    expect(adjacentGuides(list, "3")).toEqual({ index: 2, prev: { id: "two" }, next: null });
  });

  it("disables both when the guide is not on the page", () => {
    expect(adjacentGuides(list, 99)).toEqual({ index: -1, prev: null, next: null });
    expect(adjacentGuides(list, null)).toEqual({ index: -1, prev: null, next: null });
  });
});

describe("flattenPatchLabel", () => {
  it("folds a trailing bracket into a comma", () => {
    expect(flattenPatchLabel("Patch 30 (Fallout Worlds)")).toBe("Patch 30, Fallout Worlds");
    expect(flattenPatchLabel("Patch 54")).toBe("Patch 54");
  });
});
