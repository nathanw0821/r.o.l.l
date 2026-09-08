<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 📜 MANDATORY PROJECT RULES & DIRECTIVES

## 🎨 1:1 Primary In-Game Perk Card Policy
- **MASTER DIRECTIVE**: See [`docs/AGY_PERK_CARDS_DIRECTIVE.md`](file:///home/nathanw/Creative%20Direction/R.O.L.L/docs/AGY_PERK_CARDS_DIRECTIVE.md) for full architectural specifications, catalog totals, and component hierarchies.
- **CANONICAL ARCHITECTURE**: ALL perk cards rendered across the platform MUST use the 1:1 Flat Scaleform Vector Architecture (`ScaleformSpecialVisual` for standard/ghoul, `ScaleformLegendaryVisual` for legendary) composed of authentic datamined vector SVGs from `public/images/perks_official/*.svg` and unbaked plaques from `public/images/clean_perk_assets/plaques/`.
- **RESOLVER**: Resolved via `getCleanPerkForeground()` / `getPerkVectorArtUrl()` in `src/lib/perks/clean-perk-assets.ts` and `src/lib/perks/perk-artwork.ts`.
- **DYNAMIC MULTI-RANK PROGRESSION**: Cards dynamically cycle ranks, star ribbons, and in-place cost badges via crisp browser typography and vector graphics with zero baked raster text ghosting.
- **DYNAMIC GENDER VARIANTS**: Vault Boy and Vault Girl variants swap bidirectionally via `isFemale` flag (`getGenderedPerkName`, `getPerkVectorArtUrl`).
- **NO SYNTHETIC OVERLAY BOXES**: Never draw flat color rectangles over title banners or badges.
- **ASSET EFFICIENCY**: All 268 perk cards are powered by resolution-independent SVGs in `public/images/perks_official/` with legacy raster directories retired.

## 🚀 Deployment Pipeline Pacing Policy
- **STRICT RULE**: NEVER push a new commit or trigger a new deployment while a previous Cloudflare / GitHub Actions deployment workflow is still running or pending.
- **WAIT FOR COMPLETION**: Always wait for the ongoing deployment to finish and verify that the prior deployment is live before pushing any subsequent updates.


