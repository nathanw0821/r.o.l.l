# 📜 MANDATORY PROJECT RULES & DIRECTIVES FOR AGY (ANTIGRAVITY CLI)

## 🎨 1:1 Static WebP In-Game Perk Card Policy
- **STRICT RULE**: ALWAYS render 1:1 static colored WebP Fallout 76 perk card textures from `public/images/perks_official_wiki/*.webp` mapped via `src/lib/perks/wiki-268-art-map.json`.
- **NO ANIMATED GIFS**: NEVER use `.gif` files or animated variants (e.g. `fo76-perk-contractor.gif` is FORBIDDEN). ALWAYS use static 1:1 `.webp` textures.
- **NO OUTER BOX BORDERS**: Perk cards MUST render as purely `<img src={artworkUrl} />` without any outer container box borders, dark backgrounds, or outer rings in `in-game-perk-card.tsx`.
- **NO WEB SCRAPING**: Do NOT run web scrapers. All 500+ static 1:1 perk card textures and 319 Vault Boy SVGs are stored locally in `public/images/`.
- **TARGET CARD VERIFICATION**:
  - `Guerrilla`: [`public/images/perks_official_wiki/fo76-perk-guerrilla.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-guerrilla.webp)
  - `Expert Guerrilla`: [`public/images/perks_official_wiki/fo76-perk-expert-guerrilla.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-expert-guerrilla.webp)
  - `Master Guerrilla`: [`public/images/perks_official_wiki/fo76-perk-master-guerrilla.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-master-guerrilla.webp)
  - `Ground Pounder`: [`public/images/perks_official_wiki/fo76-perk-ground-pounder.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-ground-pounder.webp)
  - `Friendly Fire`: [`public/images/perks_official_wiki/fo76-perk-friendly-fire.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-friendly-fire.webp)
  - `Contractor`: [`public/images/perks_official_wiki/fo76-perk-contractor.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-contractor.webp)

## 🚀 Deployment Pipeline Pacing Policy
- **STRICT RULE**: NEVER push a new commit or trigger a new deployment while a previous Cloudflare / GitHub Actions deployment workflow is still running or pending.
- **WAIT FOR COMPLETION**: Always wait for the ongoing deployment to finish and verify that the prior deployment is live before pushing any subsequent updates.
- **NO AUTOMATIC PUSHES**: Do NOT execute `git push` unless explicitly asked by the user.
