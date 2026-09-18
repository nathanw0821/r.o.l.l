/**
 * Regenerates src/lib/links/entity-link-index.json from the catalogs.
 * Run after changing perks, legendary effects, unique items or the update list:
 *   npx tsx scripts/truth/build-entity-links.ts
 */
import fs from "node:fs";
import path from "node:path";
import { buildEntityLinks } from "../../src/lib/links/entity-links-build";

const out = path.join(process.cwd(), "src/lib/links/entity-link-index.json");
const entries = buildEntityLinks();
// One compact entry per line: small to ship, still a readable diff.
fs.writeFileSync(out, "[\n" + entries.map((e) => JSON.stringify(e)).join(",\n") + "\n]\n");
console.log(`wrote ${out} (${entries.length} entries)`);
