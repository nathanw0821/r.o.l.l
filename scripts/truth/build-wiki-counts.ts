/**
 * Regenerates src/lib/wiki/wiki-category-counts.json from the article corpus so the
 * /wiki page can show real counts without shipping the 1.7 MB corpus to the client.
 * Uses the same prefix rule as /api/wiki/search. Pinned by wiki-category-counts.test.ts.
 * Run: npx tsx scripts/truth/build-wiki-counts.ts
 */
import fs from "node:fs";
import path from "node:path";
import { FALLBACK_WIKI_ARTICLES } from "../../src/lib/wiki/wiki-articles-data";
import { computeWikiCategoryCounts, WIKI_CATEGORY_IDS } from "../../src/lib/wiki/wiki-category-counts";

const counts = computeWikiCategoryCounts(FALLBACK_WIKI_ARTICLES, WIKI_CATEGORY_IDS);
const out = path.join(process.cwd(), "src/lib/wiki/wiki-category-counts.json");
fs.writeFileSync(out, JSON.stringify(counts, null, 2) + "\n");
console.log(`wrote ${out}`, counts);
