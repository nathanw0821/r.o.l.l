/**
 * Regenerates src/lib/wiki/wiki-category-counts.json from the article corpus so the
 * /wiki page can show real counts without shipping the 1.7 MB corpus to the client, and
 * public/data/wiki-index.json, the compact index the browser searches while offline.
 * Uses the same prefix rule as /api/wiki/search. Pinned by wiki-category-counts.test.ts.
 * Run: npx tsx scripts/truth/build-wiki-counts.ts
 */
import fs from "node:fs";
import path from "node:path";
import { FALLBACK_WIKI_ARTICLES } from "../../src/lib/wiki/wiki-articles-data";
import { computeWikiCategoryCounts, WIKI_CATEGORY_IDS } from "../../src/lib/wiki/wiki-category-counts";
import { buildWikiClientIndex, WIKI_CLIENT_INDEX_PATH } from "../../src/lib/wiki/wiki-client-index";

const counts = computeWikiCategoryCounts(FALLBACK_WIKI_ARTICLES, WIKI_CATEGORY_IDS);
const out = path.join(process.cwd(), "src/lib/wiki/wiki-category-counts.json");
fs.writeFileSync(out, JSON.stringify(counts, null, 2) + "\n");
console.log(`wrote ${out}`, counts);

// The compact client index for offline guide search (public/data/wiki-index.json): titles,
// snippets and flags only, one line, no bodies. Pinned by wiki-client-index.test.ts.
const indexOut = path.join(process.cwd(), "public", WIKI_CLIENT_INDEX_PATH);
const index = buildWikiClientIndex(FALLBACK_WIKI_ARTICLES);
fs.writeFileSync(indexOut, JSON.stringify(index));
console.log(`wrote ${indexOut}: ${index.length} guides, ${fs.statSync(indexOut).size} bytes`);
