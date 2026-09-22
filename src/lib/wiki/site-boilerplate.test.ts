import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  SITE_BOILERPLATE_MARKER,
  cleanBody,
  cleanSnippet,
  siteBoilerplateKinds,
  stripSiteBoilerplate,
} from "@/lib/wiki/clean-text";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/wiki/wiki-articles-data";

/**
 * Source-site boilerplate (text about the websites, not about Fallout 76). Every fixture
 * is copied from the corpus as it was before `stripSiteBoilerplate` existed (ids in the
 * test names), so the patterns stay pinned to the wording the sites really use.
 */
const DUCHESS_FOOTER_V1 = [
  "**Other Guides**",
  "",
  "I'm an Aussie data miner who creates guides for farming, events, and food buffs in Fallout 76.",
  "",
  "I firmly believe that knowledge should be accessible to everyone, so my guides will always be free. However, maintaining a website and using photo and video editing software can be costly.",
  "",
  "- __Follow Me on Social Media:__ Keep up with my latest updates by following me on social media.",
  "",
  "- __One-Time Donation:__ Buy me a coffee.",
  "",
  "- __Monthly Contribution:__ Become a regular supporter by subscribing to my Ko-fi page.",
  "",
  "Every bit of support helps cover the costs of creating these guides and maybe even gets me a cup of coffee or three;)",
].join("\n");

const DUCHESS_FOOTER_V2 = [
  "I'm an Australian data miner who writes farming, event, and food buff guides for Fallout 76.",
  "",
  "I believe that all knowledge and information should be free, which is why my guides will never be locked behind a paywall. However, running a website and photo and video editing software does not come cheaply.",
  "",
  "So, If you found my guides helpful, please consider buying me a ko-fi (coffee) using the link below.",
  "",
  "All monies go towards the tools for writing my guides and maybe for an actual cup of coffee or 3;)",
  "",
  "Alternatively, share my guides with your fellow vault dwellers and help them to survive the wasteland.",
].join("\n");

const BUFFS_N_BREW = [
  "Love food buffs?",
  "",
  "Join us at Buffs n Brew, a group dedicated to food buffs and food buff farming.",
  "",
  "Discord - __All Platforms__",
  "",
  "Facebook - __PC__",
  "",
  "Facebook - __XBOX__",
  "",
  "Facebook - __PlayStation__ (Opening July 2024)",
].join("\n");

describe("stripSiteBoilerplate", () => {
  it("removes TheDuchessFlame's Ko-fi footer and the empty Other Guides heading (id 148)", () => {
    const guide = "Enter the saloon and face north. You’ll see The Ghoul directly ahead, against the back wall.";
    const raw = `${guide}\n\n${DUCHESS_FOOTER_V1}`;
    expect(stripSiteBoilerplate(raw)).toBe(guide);
    expect(siteBoilerplateKinds(raw)).toContain("duchess-footer-v1");
  });

  it("removes TheDuchessFlame's older footer and the Buffs n Brew plug (id 4441)", () => {
    const guide = "Enter that room and the vine is on the ground on the right-hand side of the door.";
    const raw = `${guide}\n\n${BUFFS_N_BREW}\n\n${DUCHESS_FOOTER_V2}`;
    expect(stripSiteBoilerplate(raw)).toBe(guide);
    expect(siteBoilerplateKinds(raw)).toEqual(expect.arrayContaining(["duchess-footer-v2", "buffs-n-brew"]));
  });

  it("removes a run-on NukaKnights byline, like counters and donation widget, keeping the source (id 4051)", () => {
    const raw =
      "Artikel DataminingDatamining: PTS Patch 47 Atom Shop (ATX) 29.09.2023Datamining skywalka 29.09.2023 4 0 0 Datamining Quelle: DSJ (Twitter / Fallout 76 Datamining Discord) Hat Dir dieser Artikel weitergeholfen? Dann unterstütze uns gern mit einer Spende oder einem Abonnement. Jetzt Spenden Jetzt Spenden";
    expect(stripSiteBoilerplate(raw)).toBe("Quelle: DSJ (Twitter / Fallout 76 Datamining Discord)");
    expect(siteBoilerplateKinds(raw)).toEqual(expect.arrayContaining(["nk-header", "nk-donation"]));
  });

  it("removes the English NukaKnights byline with a written date (id 4181)", () => {
    const raw =
      "Article Fallout 76 News, Game Board / SeasonAll rewards from Season 11: Nuka World (Game Board 11) November 22nd, 2022Fallout 76 NewsGame Board / Season skywalka November 22nd, 2022 2 0 0 Fallout 76 NewsGame Board / Season See also: https://fallout.bethesda.net/de/seasons";
    expect(stripSiteBoilerplate(raw)).toBe("See also: https://fallout.bethesda.net/de/seasons");
  });

  it("removes the English NukaKnights donation lines and commenter names (id 3840)", () => {
    const guide = "Due to the bugs, the counterfeit bottle press machine was removed from the atomic shop.";
    const raw = `${guide}\n\nSupport us\n\nWith your donation\n\nSupport us\n\nWith your donation\n\nDid this article help you? Then please support us with a donation or subscription.\n\ntortcat:skywalkaTeam:tortcat:`;
    expect(stripSiteBoilerplate(raw)).toBe(guide);
  });

  it("removes the German donation box (id 3534)", () => {
    const guide = "Army Paint (Gatling Plasma)";
    const raw = `${guide}\n\nUnterstütze uns\n\nMit Deiner Spende\n\n#### Unterstütze uns\n\nMit Deiner Spende\n\nHat Dir dieser Artikel weitergeholfen? Dann unterstütze uns gern mit einer Spende oder einem Abonnement.`;
    expect(stripSiteBoilerplate(raw)).toBe(guide);
  });

  it("cuts the reader-comment thread off a NukaKnights article (id 3556)", () => {
    const table = "| ↪ Beliebiger Winterfisch | 1 | |";
    const raw = `${table}\n\nLuise76:\nEin Angelcamp mit sämtlichen Fischen ausgestellt, ist kaum möglich. 0 am 29.05.2026 um 17:09:28 Uhr\n\nPixie:\n0 am 29.05.2026 um 21:23:38 Uhr\n\nskywalkaTeam:Pixie:Stevenator:`;
    expect(stripSiteBoilerplate(raw)).toBe(table);
    expect(siteBoilerplateKinds(raw)).toContain("nk-comments");
  });

  it("cuts a comment thread whose first comment spans several paragraphs (id 3599)", () => {
    const guide = "Quelle: bethesda.net";
    const raw = `${guide}\n\nSven:\nNot sure how to read the changes to explosive damage.\n\nThe fixes to durability need to be tested.\n\nA lot of fixes, but not too much that stands out for me. 0 am 21.04.2026 um 17:50:22 Uhr`;
    expect(stripSiteBoilerplate(raw)).toBe(guide);
  });

  it("cuts an English comment thread that has no commenter line above it (id 3738)", () => {
    const guide = "Iron Fist\n\nYour fists deal more damage based on your damage resistance.";
    const raw = `${guide}\n\nAm I correct that virtually all damage bonuses are thrown out? 0\non August 29, 2025 at 10:36:44 am\n\n@ME_Fire: Yes, that's the point.`;
    expect(stripSiteBoilerplate(raw)).toBe(guide);
  });

  it("drops an invitation to comment together with its lead-in questions (id 3636)", () => {
    const raw =
      "Here is a selection of currently known titles.\n\nWhat do you think of this new reward? Are you looking forward to adding titles to your CAMPs? Or will you not use them? Feel free to write in the comments.";
    expect(stripSiteBoilerplate(raw)).toBe("Here is a selection of currently known titles.");
    // Only the invitation goes; the fact on the same line stays (id 3950).
    expect(
      stripSiteBoilerplate(
        "I only have GamePass Ultimate and redeemed the code there. Feel free to write in the comments whether the method works like this.",
      ),
    ).toBe("I only have GamePass Ultimate and redeemed the code there.");
  });

  it("removes wiki maintenance templates (ids 675, 958, 2761)", () => {
    const lead = "The **Flatliner** is a weapon in *Fallout 76*, introduced in the *Gleaming Depths* update.";
    expect(
      stripSiteBoilerplate(`This content needs expanding. Please help us improve the article by adding missing information!\n\n${lead}`),
    ).toBe(lead);
    expect(stripSiteBoilerplate(`| | **Section Needed** Please help us improve the article! |\n\n${lead}`)).toBe(lead);
    expect(stripSiteBoilerplate(`| | **Section needed** You can help *Nukapedia* by writing it . |\n\n${lead}`)).toBe(lead);
  });

  it("removes site pointers and widgets but keeps game locations that 'can be found here' (id 1730)", () => {
    expect(stripSiteBoilerplate("Map can be found __here__.\n\nbottom of page")).toBe("");
    expect(stripSiteBoilerplate("*Click on map for high resolution version*")).toBe("");
    const location =
      "The Skeleton of a deceased Vault 76 dweller, clad in the remnants of a matching Vault 76 Jumpsuit, can be found here.";
    expect(stripSiteBoilerplate(location)).toBe(location);
  });

  it("leaves Fallout 76 text that says support, donate or comment in a game sense untouched", () => {
    const game = [
      "**Supply Drop** requests a Vertibird to deliver a supply crate.",
      "",
      "- Punch Card Machine and Donations Box",
      "",
      "| | Daily: Donations for the Clinic | Foundation | Aubrie Willem | | 003F2DC7 |",
      "",
      "Check the Flatwoods Tavern for an Automated Pantry you can donate to.",
      "",
      "Margaret comments that stylish outfits are in demand.",
      "",
      "The Supporter perk card lets you support your team.",
      "",
      "Materials: Requirements: Produces:",
      "",
      "**Rich:** Raven Wolf starts with:",
      "",
      "Quellen:",
      "",
      "- Nuka Knights Datamining",
      "",
      "Quelle: bethesda.net",
      "",
      "*****Subject to change pending porting to live servers*****",
      "",
      "Alpha:",
      "06818772",
    ].join("\n");
    expect(stripSiteBoilerplate(game)).toBe(game);
    expect(siteBoilerplateKinds(game)).toEqual([]);
  });

  it("is idempotent, also through cleanBody", () => {
    const raws = [
      `Guide text.\n\n${DUCHESS_FOOTER_V1}`,
      `Guide text.\n\n${BUFFS_N_BREW}\n\n${DUCHESS_FOOTER_V2}`,
      "Artikel Atom ShopAtom Shop Update 31.07.2026 Wochenend Angebote 31.07.2026Atom Shop skywalka 31.07.2026 2 0 1 Atom Shop Hat Dir dieser Artikel weitergeholfen? Dann unterstütze uns gern mit einer Spende oder einem Abonnement. Jetzt Spenden Jetzt Spenden",
    ];
    for (const raw of raws) {
      const once = stripSiteBoilerplate(raw);
      expect(stripSiteBoilerplate(once)).toBe(once);
      expect(cleanBody(cleanBody(raw))).toBe(cleanBody(raw));
    }
    expect(cleanBody(raws[2])).toBe("");
  });

  it("cleans snippets too, and flags snippet leftovers the exact patterns cannot reach", () => {
    expect(
      cleanSnippet(
        "Artikel Atom ShopAtom Shop Update 11.03.2025 11.03.2025Atom Shop skywalka 11.03.2025 4 0 0 Atom Shop Weekly Offers (Credit: SugarBombs.RADS on X)",
      ),
    ).toBe("Weekly Offers (Credit: SugarBombs.RADS on X)");
    expect(SITE_BOILERPLATE_MARKER.test("Atom Shop Unterstütze uns Mit Deiner…")).toBe(true);
    expect(SITE_BOILERPLATE_MARKER.test("The Flatliner is a variant of Gauss Rifle. Please help us improve the artic…")).toBe(true);
    expect(SITE_BOILERPLATE_MARKER.test("Swamp Tofu Soup is a consumable item in Fallout 76.")).toBe(false);
  });
});

describe("the committed corpus has no source-site boilerplate", () => {
  it("in any body (rerun scripts/truth/clean-wiki-corpus.ts if this fails)", () => {
    const dir = path.join(process.cwd(), "public/data/wiki");
    const dirty: string[] = [];
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const { content = "" } = JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8")) as { content?: string };
      if (siteBoilerplateKinds(content).length > 0) dirty.push(file);
    }
    expect(dirty).toEqual([]);
  });

  it("in any snippet", () => {
    const dirty = FALLBACK_WIKI_ARTICLES.filter((a) => SITE_BOILERPLATE_MARKER.test(a.snippet)).map((a) => a.id);
    expect(dirty).toEqual([]);
  });
});
