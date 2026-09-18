/**
 * Regenerates src/lib/wiki/supersede-index.json: which guides get a "May be out of date" note,
 * from the reviewed rules in src/data/truth/supersede-rules.json. Scans every guide body once
 * (public/data/wiki/<id>.json) so /wiki and /api/wiki/search never run the regexes per request.
 * Pinned by src/lib/wiki/supersede.test.ts.
 *
 *   npx tsx scripts/truth/build-supersede-index.ts            # write the index
 *   npx tsx scripts/truth/build-supersede-index.ts --review   # also print, per rule, the match
 *                                                              # count, sample titles and the
 *                                                              # matched wording (precision review)
 *
 * Run it after changing the rules or the corpus (clean-wiki-corpus.ts).
 */
import fs from "node:fs";
import path from "node:path";
import { FALLBACK_WIKI_ARTICLES } from "../../src/lib/wiki/wiki-articles-data";
import { SUPERSEDE_RULES, buildSupersedeIndex, supersedeEvidence } from "../../src/lib/wiki/supersede";

const ROOT = process.cwd();
const BODY_DIR = path.join(ROOT, "public/data/wiki");
const OUT = path.join(ROOT, "src/lib/wiki/supersede-index.json");
const REVIEW = process.argv.includes("--review");

function readBody(id: string | number): string {
  const file = path.join(BODY_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return "";
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as { content?: string };
  return data.content ?? "";
}

const index = buildSupersedeIndex(FALLBACK_WIKI_ARTICLES, readBody);
// One entry per line: small, and a readable diff when a rule changes.
const entries = Object.entries(index);
fs.writeFileSync(OUT, "{\n" + entries.map(([id, rules]) => `  ${JSON.stringify(id)}: ${JSON.stringify(rules)}`).join(",\n") + "\n}\n");
console.log(`wrote ${OUT} (${entries.length} guides flagged)`);

const byId = new Map(FALLBACK_WIKI_ARTICLES.map((a) => [String(a.id), a]));
for (const rule of SUPERSEDE_RULES) {
  const ids = entries.filter(([, rules]) => rules.includes(rule.id)).map(([id]) => id);
  console.log(`\n${rule.id} (Patch ${rule.patch}): ${ids.length} guides`);
  const shown = REVIEW ? ids : ids.slice(0, 5);
  for (const id of shown) {
    const article = byId.get(id)!;
    console.log(`  [${id}] ${article.title} (${article.source}${article.archived ? ", archived" : ""})`);
    if (REVIEW) {
      for (const ev of supersedeEvidence(rule.id, article, readBody(id))) console.log(`      … ${ev} …`);
    }
  }
}
