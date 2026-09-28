// Derived WebP siblings for the 1:1 in-game perk cards.
//
// The PNGs in public/images/in_game_cards/ stay the canonical, untouched assets (see the perk
// card directive in AGENTS.md). This script writes a same-pixels, display-sized WebP for each one
// into public/images/in_game_cards_webp/, which <InGamePerkCard> offers first through <picture>;
// browsers that cannot decode WebP (none in practice) still get the PNG. A 350–470 KB PNG becomes
// a ~20–30 KB WebP at 320 px wide, which is wider than any card is ever drawn on the site.
//
// Usage: node scripts/perks/build-card-webp.mjs  (idempotent; skips up-to-date outputs)
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC = path.resolve("public/images/in_game_cards");
const OUT = path.resolve("public/images/in_game_cards_webp");
const WIDTH = 320;
const QUALITY = 82;

await fs.mkdir(OUT, { recursive: true });
const names = (await fs.readdir(SRC)).filter((n) => n.toLowerCase().endsWith(".png")).sort();
let written = 0;
let skipped = 0;
let bytesIn = 0;
let bytesOut = 0;
for (const name of names) {
  const src = path.join(SRC, name);
  const out = path.join(OUT, name.replace(/\.png$/i, ".webp"));
  const srcStat = await fs.stat(src);
  bytesIn += srcStat.size;
  try {
    const outStat = await fs.stat(out);
    if (outStat.mtimeMs >= srcStat.mtimeMs) {
      skipped += 1;
      bytesOut += outStat.size;
      continue;
    }
  } catch {
    // no output yet
  }
  const buf = await sharp(src)
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 5 })
    .toBuffer();
  await fs.writeFile(out, buf);
  bytesOut += buf.length;
  written += 1;
}
const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`${names.length} cards: ${written} written, ${skipped} up to date. PNG ${mb(bytesIn)} MB → WebP ${mb(bytesOut)} MB`);
