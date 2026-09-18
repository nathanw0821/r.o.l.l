import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { bodyHasImages, cleanBody, cleanSnippet, cleanTitle } from "@/lib/wiki/clean-text";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/wiki/wiki-articles-data";

/**
 * Every fixture below is the literal text that sat in the corpus before
 * `scripts/truth/clean-wiki-corpus.ts` was first run (recovered from git), one per
 * clutter class named in the cleanup brief.
 */
const RAW = {
  /** id 6 — Markdown images with an empty alt plus an upload path. */
  markdownImage:
    "Fallout 76 Event Calendar Dates Overview ![](https://nukaknights.com/uploads/minerva-location-foundation-750x300.jpg) Ends in 8 hours Minerva (List 21) ![](https://nukaknights.com/...",
  /** id 61 — the scraper cut the snippet inside an image, leaving a bare `![`. */
  bareImageFragment:
    "A comparison of weapons in Fallout 76. Weapons that can be configured as either rifles or pistols, depending on the grip/stock modification. Pistol/Rifle Name Form ID ![FO76 Enclav...",
  /** id 335 — a root-relative upload path with a doubled slash. */
  uploadPath:
    "![Angreifer aus dem All Event: Belohnungen 2026 inkl Fastnacht Masken](/uploads//tn_nukaknights_article_teaser_de_13.jpg) Event: Angreifer aus dem All Di, 18.08.2026 (18:00) - Di, ...",
  /** id 148 — author byline, read time and "Updated:" stamp. */
  byline:
    "Burning Springs: New Vendor Locations - Duchess Flame![Writer: Duchess Flame]() - Nov 25, 2025 - 5 min read Updated: Dec 3, 2025 ![](https://static.wixstatic.com/media/586626_7a33f...",
  /** id 74 — Fallout Wiki maintenance boilerplate. */
  maintenance:
    "Infobox too small You can help us improve the article by adding the data! For more information, please see our policies . The Anti-Scorched Training Pistol is an automatic pistol i...",
  /** id 226 — reference markers. */
  references:
    "Gold Bullion is a form of currency in Fallout 76, introduced in the Wastelanders update. Gold bullion consists of solid bars or ingots of pure gold. [1] [2] Once forming the backbo...",
  /** id 2000 — a hatnote ("For an overview of …, see …") ahead of the real prose. */
  hatnote:
    "![FO76 publicteam xpd.png](https://images.fallout.wiki/thumb/1/15/FO76_publicteam_xpd.png/30px-FO76_publicteam_xpd.png) For an overview of juice variants, see drinks. Blackberry Ju...",
  /** id 4847 — a "Main article:" navigation crumb. */
  mainArticle:
    "Main article: Fallout 76 patches The following is a transcription of official patch notes from Bethesda.net. Fallout 76 update notes – July 23, 2024[] Update version 1.7.13.12 & Si...",
  /** id 2222 — the title opens the sentence as its subject and must survive. */
  subjectTitle:
    "Nuka-Cola Dark is a consumable item in Fallout 76. Nuka-Cola Dark was the Nuka-Cola Corporation's attempt at entering the alcoholic beverage market and appealing to the adult demog...",
};

describe("cleanSnippet", () => {
  it("strips Markdown images and upload paths", () => {
    const out = cleanSnippet(RAW.markdownImage, "Events Calendar");
    expect(out).toBe("Fallout 76 Event Calendar Dates Overview Ends in 8 hours Minerva (List 21)");
    expect(out).not.toContain("![");
    expect(out).not.toContain("/uploads/");
  });

  it("strips a bare `![` fragment left by the scraper's own truncation", () => {
    const out = cleanSnippet(RAW.bareImageFragment, "Fallout 76 Weapons Comparison");
    expect(out).not.toContain("![");
    expect(out).toContain("A comparison of weapons in Fallout 76.");
    expect(out.endsWith("…")).toBe(true);
  });

  it("strips root-relative upload paths", () => {
    const out = cleanSnippet(RAW.uploadPath, "Event Angreifer Aus Dem All");
    expect(out).not.toContain("/uploads");
    expect(out).not.toContain(".jpg");
    expect(out).not.toContain("![");
    // What is left is the event window; the heading repeat in front of it is dropped.
    expect(out).toBe("Di, 18.08.2026 (18:00) - Di…");
    // Without the title, the same snippet keeps its heading.
    expect(cleanSnippet(RAW.uploadPath)).toContain("Event: Angreifer aus dem All");
  });

  it("strips bylines, read times and update stamps", () => {
    const out = cleanSnippet(RAW.byline, "Burning Springs New Vendor Locations");
    expect(out).not.toMatch(/Duchess Flame|Writer:|min read|Updated:/);
    // The snippet was nothing but the heading plus chrome, so nothing is left; the
    // corpus script rebuilds these from the article body.
    expect(out).toBe("");
  });

  it("removes Fallout Wiki maintenance boilerplate", () => {
    const out = cleanSnippet(RAW.maintenance, "Anti-Scorched Training Pistol");
    expect(out).not.toContain("Infobox too small");
    expect(out).not.toContain("You can help us improve");
    expect(out).not.toContain("please see our policies");
    expect(out.startsWith("The Anti-Scorched Training Pistol is an automatic pistol")).toBe(true);
  });

  it("removes reference markers", () => {
    const out = cleanSnippet(RAW.references, "Gold Bullion");
    expect(out).not.toMatch(/\[\d+\]/);
    expect(out).toContain("solid bars or ingots of pure gold. Once forming");
  });

  it("removes hatnotes and navigation crumbs", () => {
    expect(cleanSnippet(RAW.hatnote, "Blackberry Juice")).not.toContain("For an overview of");
    expect(cleanSnippet(RAW.mainArticle, "Fallout 76 patch 1.7.13.12")).not.toContain("Main article:");
  });

  it("drops a leading heading repeat but keeps the title when it is the subject", () => {
    expect(cleanSnippet("Events Calendar - Sep 1, 2026 The next window opens on Monday.", "Events Calendar"))
      .toBe("The next window opens on Monday.");
    const subject = cleanSnippet(RAW.subjectTitle, "Nuka-Cola Dark");
    expect(subject.startsWith("Nuka-Cola Dark is a consumable item in Fallout 76.")).toBe(true);
  });

  it("ends on a sentence boundary within 240 characters", () => {
    const long =
      "Stingwings are creatures found in Appalachia. Stingwings are fast and erratic fliers which often attack in swarms of three or five. They also use hit-and-run tactics which can make them frustrating to fight without a fast-swinging weapon. Bring a shotgun.";
    const out = cleanSnippet(long, "Stingwing");
    expect(out.length).toBeLessThanOrEqual(240);
    expect(out.endsWith(".")).toBe(true);
    expect(out.endsWith("…")).toBe(false);
  });

  it("adds an ellipsis only when the cut lands mid-sentence", () => {
    const midSentence = `${"word ".repeat(60)}and then some more text that never ends`;
    const out = cleanSnippet(midSentence, "Something");
    expect(out.length).toBeLessThanOrEqual(240);
    expect(out.endsWith("…")).toBe(true);
    expect(cleanSnippet("A short, finished sentence.", "Something").endsWith("…")).toBe(false);
  });

  it("is idempotent", () => {
    for (const raw of Object.values(RAW)) {
      const once = cleanSnippet(raw, "Events Calendar");
      expect(cleanSnippet(once, "Events Calendar")).toBe(once);
    }
  });
});

describe("cleanBody", () => {
  const RAW_BODY = [
    "# Burning Springs: New Vendor Locations",
    "",
    "- Duchess Flame![Writer: Duchess Flame]()",
    "- Nov 25, 2025",
    "- 5 min read",
    "",
    "Updated: Dec 3, 2025",
    "",
    "![](https://static.wixstatic.com/media/586626_7a33f2d558a841b2ac8f7681d99252a7~mv2.jpg)",
    "",
    "Image Credit: Bethesda",
    "",
    "Mac is on the ground floor [1], along the southern wall. See the [vendor map](https://example.com/map).",
    "",
    "| **Name** | **Drop Rates** |",
    "| Addictol | - |",
    "",
    "## Comments:",
    "",
    "## Delete comment",
  ].join("\n");

  const HERO_IMAGE =
    "![](https://static.wixstatic.com/media/586626_7a33f2d558a841b2ac8f7681d99252a7~mv2.jpg)";

  it("removes bylines, credits, reference markers and comment chrome", () => {
    const out = cleanBody(RAW_BODY);
    expect(out).not.toContain("![Writer:");
    expect(out).not.toContain("Writer:");
    expect(out).not.toContain("min read");
    expect(out).not.toContain("Image Credit");
    expect(out).not.toMatch(/\[\d+\]/);
    expect(out).not.toContain("## Comments:");
    expect(out).not.toContain("## Delete comment");
  });

  it("turns [text](url) into text and keeps the Markdown structure the reader renders", () => {
    const out = cleanBody(RAW_BODY);
    expect(out).toContain("See the vendor map.");
    expect(out).not.toContain("https://example.com/map");
    expect(out).toContain("# Burning Springs: New Vendor Locations");
    expect(out).toContain("| **Name** | **Drop Rates** |");
    expect(out).not.toMatch(/\n{3,}/);
  });

  it("removes every image, even a standalone one, so nothing is hotlinked from another site", () => {
    const out = cleanBody(RAW_BODY);
    expect(out).not.toContain("![");
    expect(out).not.toContain("wixstatic");
    // Removing the image leaves the prose around it readable.
    expect(out).toContain("Mac is on the ground floor");
  });

  it("keeps the Player Title text when its badge image is removed", () => {
    const raw = [
      '"Psycho" Player Title Prefix: Psycho',
      "",
      "![Psycho title](https://static.wixstatic.com/media/586626_title~mv2.png)",
      "",
      "Earned at rank 40.",
    ].join("\n");
    expect(cleanBody(raw)).toBe('"Psycho" Player Title Prefix: Psycho\n\nEarned at rank 40.');
  });

  it("bodyHasImages reports whether the source page had pictures", () => {
    expect(bodyHasImages(RAW_BODY)).toBe(true);
    expect(bodyHasImages(cleanBody(RAW_BODY))).toBe(false);
    expect(bodyHasImages("Plain prose, no pictures.")).toBe(false);
  });

  it("drops images the reader cannot render and bare fragments", () => {
    const raw = [
      "| ![Mistress of Mystery.png](https://images.fallout.wiki/thumb/0/03/Mistress_of_Mystery.png/32px-Mistress_of_Mystery.png) | The Mistress of Mystery |",
      "",
      "![PC](https://images.fallout.wiki/thumb/e/e3/Icon_pc.png/14px-Icon_pc.png)",
      "",
      "![](data:image/gif;base64,R0lGODlhAQABAAAAACw=)",
      "",
      "![Writer: Duchess Flame]()",
      "",
      "The loop can be escaped. ![FO76 Enclav",
    ].join("\n");
    const out = cleanBody(raw);
    expect(out).not.toContain("![");
    expect(out).not.toContain("Icon_pc");
    expect(out).not.toContain("data:image");
    expect(out).toContain("| The Mistress of Mystery |");
    expect(out).toContain("The loop can be escaped.");
  });

  it("is idempotent", () => {
    const once = cleanBody(RAW_BODY);
    expect(cleanBody(once)).toBe(once);
    const withImages = `Intro text here.\n\n${HERO_IMAGE}\n\n![Alt [with] brackets](/uploads//tn_teaser_1.jpg)\n\nOutro.`;
    const first = cleanBody(withImages);
    expect(first).toBe("Intro text here.\n\nOutro.");
    expect(cleanBody(first)).toBe(first);
  });
});

describe("cleanTitle", () => {
  it("turns a date slug into a readable date, day-first for NukaKnights", () => {
    expect(
      cleanTitle("Atom Shop Update 12 08 2025", "NukaKnights", "Atom Shop Update 12.08.2025 weekly offers"),
    ).toBe("Atomic Shop update, 12 Aug 2025");
    // 31 cannot be a month, so the order is unambiguous even without a snippet date.
    expect(cleanTitle("Atom Shop Update 31 07 2026", "NukaKnights", "")).toBe(
      "Atomic Shop update, 31 Jul 2026",
    );
  });

  it("reads the day/month order from a slash-formatted snippet date", () => {
    expect(cleanTitle("Weekly Recap 08 09 2026", "TheDuchessFlame", "Posted 08/09/2026 by the team")).toBe(
      "Weekly Recap, 9 Aug 2026",
    );
  });

  it("turns SEO Title Case into sentence case, keeping proper nouns", () => {
    expect(
      cleanTitle(
        "Where To Find And How To Farm For Stingwings And Stingwing Meat In Fallout 76",
        "TheDuchessFlame",
        "Where to find and how to farm for Stingwings and Stingwing Meat in Fallout 76",
      ),
    ).toBe("Where to find and how to farm for Stingwings and Stingwing Meat");
  });

  it("keeps spaced acronyms but lowercases the article 'A'", () => {
    expect(cleanTitle("Once In A Blue Moon Random Encounters", "TheDuchessFlame", "")).toBe(
      "Once in a blue moon random encounters",
    );
    // With evidence in the snippet, the season name keeps its capitals.
    expect(
      cleanTitle(
        "Once In A Blue Moon Random Encounters",
        "TheDuchessFlame",
        "New random encounters arrived with the Once in a Blue Moon update.",
      ),
    ).toBe("Once in a Blue Moon random encounters");
    expect(
      cleanTitle(
        "Datamining New C A M P Items Burning Springs Pts",
        "NukaKnights",
        "New C.A.M.P. items found on the Burning Springs test server.",
      ),
    ).toBe("Datamining new C A M P items Burning Springs pts");
  });

  it("leaves wiki page names alone, because Title Case is their real name", () => {
    expect(cleanTitle("Ally: The Woman Who Fell To Earth", "Fallout Wiki", "")).toBe(
      "Ally: The Woman Who Fell To Earth",
    );
    expect(cleanTitle("Iguana On A Stick", "Fallout Wiki", "")).toBe("Iguana On A Stick");
  });

  it("never mistakes a build number for a date", () => {
    expect(cleanTitle("Fallout 76 patch 1.7.22.12", "Bethesda Official", "")).toBe(
      "Fallout 76 patch 1.7.22.12",
    );
  });

  it("is idempotent", () => {
    const cases: Array<[string, string, string]> = [
      ["Atom Shop Update 12 08 2025", "NukaKnights", "Atom Shop Update 12.08.2025"],
      ["Datamining New C A M P Items Burning Springs Pts 06 10 2025", "NukaKnights", ""],
      ["Where To Find A Wendigo In Fallout 76", "TheDuchessFlame", "Where to find a Wendigo"],
      ["Ally: The Woman Who Fell To Earth", "Fallout Wiki", ""],
      ["Fallout 76 patch 1.7.22.12", "Bethesda Official", ""],
    ];
    for (const [title, source, snippet] of cases) {
      const once = cleanTitle(title, source, snippet);
      expect(cleanTitle(once, source, snippet)).toBe(once);
    }
  });
});

describe("the committed corpus is clean", () => {
  it("has no scraped markup left in any snippet", () => {
    const dirty = FALLBACK_WIKI_ARTICLES.filter(
      (a) =>
        a.snippet.includes("![") ||
        a.snippet.includes("/uploads/") ||
        a.snippet.includes("Infobox too small") ||
        /\bmin read\b/.test(a.snippet) ||
        /\[\d+\]/.test(a.snippet),
    ).map((a) => a.id);
    expect(dirty).toEqual([]);
  });

  it("has no date-slug titles left", () => {
    const slugged = FALLBACK_WIKI_ARTICLES.filter((a) =>
      /(?:^|[^\d.])\d{1,2}[ ._/-]\d{1,2}[ ._/-]\d{4}(?![\d.])/.test(a.title),
    ).map((a) => a.title);
    expect(slugged).toEqual([]);
  });

  it("keeps every snippet inside the 240 character budget", () => {
    const tooLong = FALLBACK_WIKI_ARTICLES.filter((a) => a.snippet.length > 240).map((a) => a.id);
    expect(tooLong).toEqual([]);
  });

  it("has no images (no hotlinking), boilerplate or read times in any body", () => {
    const dir = path.join(process.cwd(), "public/data/wiki");
    // Any image or image fragment. Third-party images are linked from the reader instead.
    const brokenImage = /!\[/;
    const dirty: string[] = [];
    let bodies = 0;
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const { content = "" } = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8")) as {
        content?: string;
      };
      bodies += 1;
      if (brokenImage.test(content) || content.includes("Infobox too small") || /\bmin read\b/.test(content)) {
        dirty.push(file);
      }
    }
    expect(bodies).toBe(FALLBACK_WIKI_ARTICLES.length);
    expect(dirty).toEqual([]);
  });

  it("is a fixed point of the cleaners (rerun scripts/truth/clean-wiki-corpus.ts if this fails)", () => {
    const changed = FALLBACK_WIKI_ARTICLES.filter(
      (a) =>
        cleanSnippet(a.snippet, a.title) !== a.snippet ||
        cleanTitle(a.title, a.source, a.snippet) !== a.title,
    ).map((a) => a.id);
    expect(changed).toEqual([]);
  });
});

describe("sourceImages flag", () => {
  it("marks the guides whose original page has pictures, so the reader can link out", () => {
    const flagged = FALLBACK_WIKI_ARTICLES.filter((a) => a.sourceImages === true);
    expect(flagged.length).toBeGreaterThan(1000);
    for (const a of flagged) expect(a.url).toMatch(/^https?:\/\//);
  });
});
