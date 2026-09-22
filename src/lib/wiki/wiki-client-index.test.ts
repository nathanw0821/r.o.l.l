import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FALLBACK_WIKI_ARTICLES } from "@/lib/wiki/wiki-articles-data";
import { buildWikiClientIndex, WIKI_CLIENT_INDEX_PATH } from "@/lib/wiki/wiki-client-index";

describe("wiki client index (offline search)", () => {
  it("public/data/wiki-index.json matches the corpus (run scripts/truth/build-wiki-counts.ts to refresh)", () => {
    const committed = JSON.parse(readFileSync(join(process.cwd(), "public", WIKI_CLIENT_INDEX_PATH), "utf8"));
    expect(committed).toEqual(buildWikiClientIndex(FALLBACK_WIKI_ARTICLES));
    expect(committed).toHaveLength(FALLBACK_WIKI_ARTICLES.length);
  });

  it("carries no bodies and only the flags that are set", () => {
    const rows = buildWikiClientIndex([
      { id: 1, source: "Fallout Wiki", title: "A", url: "u", category: "General", snippet: "s", archived: false, stub: true },
    ]);
    expect(rows).toEqual([{ id: 1, source: "Fallout Wiki", title: "A", url: "u", category: "General", snippet: "s", stub: true }]);
    expect(Object.keys(rows[0])).not.toContain("content");
  });
});
