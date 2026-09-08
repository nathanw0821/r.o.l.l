<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 📜 MANDATORY PROJECT RULES & DIRECTIVES

## 🎨 1:1 Primary In-Game Perk Card Policy
- **MASTER DIRECTIVE**: See [`docs/AGY_PERK_CARDS_DIRECTIVE.md`](file:///home/nathanw/Creative%20Direction/R.O.L.L/docs/AGY_PERK_CARDS_DIRECTIVE.md) for full architectural specifications, catalog totals, and component hierarchies.
- **STRICT RULE**: ALL perk cards rendered across the platform MUST use the 1:1 bitmapped Pip-Boy curved/slanted cards from `public/images/in_game_cards/*.png` resolved via `getInGamePerkCardImage()` in `src/lib/perks/clean-perk-assets.ts`.
- **DYNAMIC MULTI-RANK PROGRESSION**: Ensure cards dynamically cycle ranks (e.g. `bullet_storm_r1.png`, `bullet_storm_r2.png`, `bullet_storm_r3.png`) with working star ribbons and flawless in-place cost badges.
- **NO SYNTHETIC OVERLAY BOXES**: Never draw flat color rectangles over title banners or badges when native Bethesda assets exist.
- **NO WEB SCRAPING**: All 274 perk cards (578 rank tiers, 868 PNGs) are pre-compiled locally in `public/images/in_game_cards/` and `/home/nathanw/Desktop/Agent_Exchange/clean_perk_assets/in_game_cards/`.

## 🚀 Deployment Pipeline Pacing Policy
- **STRICT RULE**: NEVER push a new commit or trigger a new deployment while a previous Cloudflare / GitHub Actions deployment workflow is still running or pending.
- **WAIT FOR COMPLETION**: Always wait for the ongoing deployment to finish and verify that the prior deployment is live before pushing any subsequent updates.


