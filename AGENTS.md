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

## 🚫 Sovereign Vault Development Firewall & Isolation Policy
- **MASTER DIRECTIVE**: Under NO circumstances during development may any code, schema, data, dependency, runtime service, or asset from R.O.L.L. be overlapped, imported, bridged, or merged into the Sovereign Vault (`/home/nathanw/sovereign_vault_ui`), nor may anything from the Sovereign Vault be injected into R.O.L.L.
- **ZERO CROSS-REPO IMPORTS**: Never write `import` statements or cross-project relative paths pointing into `sovereign_vault_ui`.
- **INDEPENDENT REPOSITORIES**: Commits to R.O.L.L. remain 100% strictly within `/home/nathanw/Creative Direction/R.O.L.L`. Never stage omnibus diffs touching Sovereign Vault.
- **ISOLATED RUNTIMES**: Sovereign Vault is Python/Flask/Kiwix; R.O.L.L. is Node/Next.js/Prisma. Keep dependencies, databases (`vault_search.db` vs Prisma/Neon/D1), and daemons strictly partitioned.
- **CANONICAL MATH EXCEPTION**: The Creation Engine combat math formulas (`0.15`, `0.365`, etc.) live in TypeScript (`src/lib/calculator/creation-engine-math.ts`) as a self-contained, standalone implementation. They share mathematical constants by specification, not by runtime code-sharing.



