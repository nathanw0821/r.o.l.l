import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import excluded from "@/data/truth/guides-excluded.json";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/wiki/wiki-articles-data";

/**
 * `src/data/truth/guides-excluded.json` lists the guides that carry no Fallout 76
 * information (pages about the source sites, navigation shells, other games). They must
 * stay out of the corpus: scripts/truth/clean-wiki-corpus.ts drops them on every run.
 */
describe("excluded guides", () => {
  const ids = excluded.guides.map((g) => String(g.id));

  it("are listed once each, with a known reason and the page they came from", () => {
    expect(new Set(ids).size).toBe(ids.length);
    const reasons = new Set(Object.keys(excluded.reasons));
    for (const g of excluded.guides) {
      expect(reasons.has(g.reason), `${g.id}: unknown reason ${g.reason}`).toBe(true);
      expect(g.url).toMatch(/^https?:\/\//);
      expect(g.title.length).toBeGreaterThan(0);
    }
  });

  it("are not in the guide index", () => {
    const listed = new Set(ids);
    expect(FALLBACK_WIKI_ARTICLES.filter((a) => listed.has(String(a.id))).map((a) => a.id)).toEqual([]);
  });

  it("have no body file", () => {
    const dir = path.join(process.cwd(), "public/data/wiki");
    expect(ids.filter((id) => fs.existsSync(path.join(dir, `${id}.json`)))).toEqual([]);
  });

  it("include the Nuka Knights site Q&A page (guide 9) but keep its real FAQ guide (8)", () => {
    expect(ids).toContain("9");
    expect(ids).not.toContain("8");
    expect(FALLBACK_WIKI_ARTICLES.some((a) => String(a.id) === "8")).toBe(true);
  });
});
