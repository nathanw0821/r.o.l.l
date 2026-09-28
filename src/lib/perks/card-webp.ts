/**
 * Display-sized WebP sibling of an in-game perk card PNG.
 *
 * `/images/in_game_cards/<name>.png` → `/images/in_game_cards_webp/<name>.webp`. The PNGs are the
 * canonical 1:1 assets (AGENTS.md perk card directive); the WebPs are generated from them by
 * `scripts/perks/build-card-webp.mjs` and offered first through `<picture>`. Anything that is not
 * an in-game card PNG returns null, so callers fall back to the original path.
 */
export function webpSiblingForCardImage(pngPath: string | null | undefined): string | null {
  if (!pngPath) return null;
  const m = /^\/images\/in_game_cards\/([^/]+)\.png$/i.exec(pngPath);
  if (!m) return null;
  return `/images/in_game_cards_webp/${m[1]}.webp`;
}
