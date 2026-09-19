import { describe, expect, it } from "vitest";
import {
  MIN_TOC_ENTRIES,
  adjacentGuides,
  buildGuideToc,
  externalSourceUrl,
  flattenPatchLabel,
  guideHeadingLevel,
  guideHeadingText,
  guideEntityKeys,
  parseGuideTable,
  pickActiveSection,
  READING_BAND,
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

// Snippets are the first rows of real corpus tables (public/data/wiki/<id>.json). The corpus has no
// markdown separator rows, and some header rows were lost in the scrape, so the header is inferred.
describe("parseGuideTable", () => {
  it("guide 102: a title row above the columns becomes the caption, the next row the header", () => {
    const table = parseGuideTable(
      [
        "| Strength | | | | | |",
        "| Perk | Req | Description | Effects | Form ID | Editor ID |",
        "| Barbarian | 1 | *Channel your inner Grognak!* | Every point of Strength adds +4 Damage Resist (max 60). (No Power Armor) | 00479B21 | Babylon_Barbarian03 |",
        "| Bear Arms | 1 | *Your bear-like arms help you bear bigger arms.* | Heavy Guns weigh 90% less. | 00479B22 | Babylon_BearArms03 |",
      ].join("\n"),
    );
    expect(table.caption).toBe("Strength");
    expect(table.header).toEqual(["Perk", "Req", "Description", "Effects", "Form ID", "Editor ID"]);
    expect(table.rows.map((r) => r.cells[0])).toEqual(["Barbarian", "Bear Arms"]);
    expect(table.columns).toBe(6);
  });

  it("guide 1018: 'Quest Stages' is the caption and Stage/Status/Description/Log Entry the header", () => {
    const table = parseGuideTable(
      [
        "| Quest Stages | | | |",
        "| Stage | Status | Description | Log Entry |",
        "| ? | | Track and Eliminate Enemies | |",
        "| ? | | Eliminate Carrier to Obtain First Code | |",
      ].join("\n"),
    );
    expect(table.caption).toBe("Quest Stages");
    expect(table.header).toEqual(["Stage", "Status", "Description", "Log Entry"]);
    expect(table.rows).toHaveLength(2);
    expect(table.rows[0].cells).toEqual(["?", "", "Track and Eliminate Enemies", ""]);
  });

  it("guide 193: armor stat rows have no header, so the first row stays data", () => {
    const table = parseGuideTable(
      [
        "| | Raider Power Helmet | 51 | 51 | 51 | 10 | 41 |",
        "| | Raider Power Torso | 86 | 86 | 86 | 14 | 81 |",
        "| | Raider Power Left Arm | 51 | 51 | 51 | 10 | 61 |",
      ].join("\n"),
    );
    expect(table.header).toBeNull();
    expect(table.caption).toBeNull();
    expect(table.rows.map((r) => r.cells[1])).toEqual(["Raider Power Helmet", "Raider Power Torso", "Raider Power Left Arm"]);
    expect(table.rows[0].cells[0]).toBe("");
  });

  it("guide 211: weapon stat rows (x0.13, 1.5, 42.9) have no header", () => {
    const table = parseGuideTable(
      [
        "| Assault Rifle | 8 | 64 | 8 | x0.13 | 8 | 3 | 23 | 1 | 1.5 | 24 | 1250 | 7 | 300 | 42.9 |",
        "| Infiltrator | 7 | 56 | 8 | x0.13 | 10 | 3 | 23 | 0.9 | 1.5 | 24 | 1429 | 7 | 400 | 57.1 |",
      ].join("\n"),
    );
    expect(table.header).toBeNull();
    expect(table.rows).toHaveLength(2);
  });

  it("guide 3650: challenge lists (sentence + count) have no header", () => {
    const table = parseGuideTable(
      [
        "| Collect a **Chlorine Bag** while wearing the Tough But Hearty Helmet. | 8 |",
        "| Collect a Med-X while wearing the Tough But Kind Helmet. | 10 |",
      ].join("\n"),
    );
    expect(table.header).toBeNull();
    expect(table.rows[0].cells).toEqual(["Collect a **Chlorine Bag** while wearing the Tough But Hearty Helmet.", "8"]);
  });

  it("guide 1118: a one-row notice box is data, not a header", () => {
    const table = parseGuideTable("| | This page is about the location as it appeared before the release of *Steel Dawn* . |");
    expect(table.header).toBeNull();
    expect(table.rows).toHaveLength(1);
  });

  it("guides 148 and 1003: a row of labels (bold or plain) is still the header", () => {
    const drops = parseGuideTable(["| **Name** | **Drop Rates** |", "| Addictol | - |", "| Antibiotics | - |"].join("\n"));
    expect(drops.header).toEqual(["**Name**", "**Drop Rates**"]);
    expect(drops.rows.map((r) => r.cells)).toEqual([
      ["Addictol", "-"],
      ["Antibiotics", "-"],
    ]);

    const quests = parseGuideTable(
      [
        "| Icon | Name | Location(s) | Given by | Reward | Form ID | Editor ID |",
        "| | Into the Mystery | Riverside Manor | Young Woman (corpse) | Worn Veil Tattered Dress | 00345D50 | MoM00 |",
      ].join("\n"),
    );
    expect(quests.header?.[0]).toBe("Icon");
    expect(quests.caption).toBeNull();
    expect(quests.rows).toHaveLength(1);
  });

  it("guide 81: a one-cell star row inside the table is a group label spanning every column", () => {
    const table = parseGuideTable(
      [
        "| Name | Description | Notes | Update Added |",
        "| **★★★★** |",
        "| Blazing Block | 25% chance to deal 50 Fire damage on a successful block | – | | 00527F6D |",
      ].join("\n"),
    );
    expect(table.header).toEqual(["Name", "Description", "Notes", "Update Added"]);
    expect(table.rows[0]).toEqual({ cells: ["**★★★★**"], group: true });
    expect(table.rows[1].group).toBe(false);
    expect(table.columns).toBe(5);
  });

  it("keeps a cell after a missing closing pipe (guide 3609) and drops padding columns", () => {
    expect(parseGuideTable("| S Strength").header).toEqual(["S Strength"]);
    const list = parseGuideTable(["| Daily Ops: Decryption | | | | | |", "| Track and Eliminate Enemies | | | | | |"].join("\n"));
    expect(list.columns).toBe(1);
    expect(list.header).toEqual(["Daily Ops: Decryption"]);
    expect(list.rows.map((r) => r.cells)).toEqual([["Track and Eliminate Enemies"]]);
  });

  it("honours a markdown separator row when one is present", () => {
    const table = parseGuideTable(["| Level | 10 | 20 |", "| --- | :---: | ---: |", "| DR | 51 | 86 |"].join("\n"));
    expect(table.header).toEqual(["Level", "10", "20"]);
    expect(table.rows.map((r) => r.cells)).toEqual([["DR", "51", "86"]]);
    // A "- | -" data row is not a separator.
    expect(parseGuideTable(["| Name | Rate |", "| - | - |"].join("\n")).rows).toHaveLength(1);
  });

  it("returns nothing to render for an empty table", () => {
    expect(parseGuideTable("| | |\n|  |  |")).toEqual({ caption: null, header: null, rows: [], columns: 0 });
  });
});

describe("pickActiveSection", () => {
  const slugs = ["overview", "crafting", "plans", "notes"];

  it("is empty before the first heading reaches the reading band", () => {
    expect(pickActiveSection(slugs, ["below", "below", "below", "below"])).toBeNull();
    expect(pickActiveSection([], [])).toBeNull();
  });

  it("picks the first heading inside the band", () => {
    expect(pickActiveSection(slugs, ["above", "in", "in", "below"])).toBe("crafting");
    expect(pickActiveSection(slugs, ["in", "below", "below", "below"])).toBe("overview");
  });

  it("keeps the last heading scrolled past while its section fills the screen", () => {
    expect(pickActiveSection(slugs, ["above", "above", "below", "below"])).toBe("crafting");
    expect(pickActiveSection(slugs, ["above", "above", "above", "above"])).toBe("notes");
  });

  it("reads a band that covers the top 40% of the viewport", () => {
    expect(READING_BAND).toBe(0.4);
  });
});

describe("externalSourceUrl", () => {
  it("passes absolute http(s) source links through", () => {
    expect(externalSourceUrl("https://fallout.wiki/wiki/Raider_Power_Armor")).toBe("https://fallout.wiki/wiki/Raider_Power_Armor");
    expect(externalSourceUrl(" https://nukaknights.com/events-kalender.html ")).toBe("https://nukaknights.com/events-kalender.html");
    expect(externalSourceUrl("http://example.com/a b")).toBe("http://example.com/a%20b");
  });

  it("refuses anything that is not an absolute http(s) URL", () => {
    for (const url of [null, undefined, "", "javascript:alert(1)", "data:text/html,x", "/wiki?id=1", "//evil.example", "not a url"]) {
      expect(externalSourceUrl(url)).toBeNull();
    }
  });
});

describe("flattenPatchLabel", () => {
  it("folds a trailing bracket into a comma", () => {
    expect(flattenPatchLabel("Patch 30 (Fallout Worlds)")).toBe("Patch 30, Fallout Worlds");
    expect(flattenPatchLabel("Patch 54")).toBe("Patch 54");
  });
});
