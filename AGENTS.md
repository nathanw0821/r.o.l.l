<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 📜 MANDATORY PROJECT RULES & DIRECTIVES

## 🎨 1:1 Primary In-Game Perk Card Policy
- **MASTER DIRECTIVE**: See [`docs/AGY_PERK_CARDS_DIRECTIVE.md`](/docs/AGY_PERK_CARDS_DIRECTIVE.md) for full architectural specifications, catalog totals, and component hierarchies.
- **STRICT RULE**: ALL perk cards rendered across the platform MUST use the 1:1 bitmapped Pip-Boy curved/slanted cards from `public/images/in_game_cards/*.png` resolved via `getInGamePerkCardImage()` in `src/lib/perks/clean-perk-assets.ts`.
- **DYNAMIC MULTI-RANK PROGRESSION**: Ensure cards dynamically cycle ranks (e.g. `bullet_storm_r1.png`, `bullet_storm_r2.png`, `bullet_storm_r3.png`) with working star ribbons and flawless in-place cost badges.
- **NO SYNTHETIC OVERLAY BOXES**: Never draw flat color rectangles over title banners or badges when native Bethesda assets exist.
- **NO WEB SCRAPING**: All 274 perk cards (578 rank tiers, 868 PNGs) are pre-compiled locally in `public/images/in_game_cards/` and `<local Agent_Exchange mirror, outside this repo>/clean_perk_assets/in_game_cards/`.
- **WEBP DELIVERY (2026-09-28)**: the PNGs stay the canonical, untouched 1:1 assets. `scripts/perks/build-card-webp.mjs` writes a same-pixels 320 px WebP for each into `public/images/in_game_cards_webp/` (301 MB → 22 MB), and `InGamePerkCard` / the perk picker offer it first through `<picture>` with the PNG as the fallback `src`. Re-run the script after adding or changing a card PNG; `src/lib/perks/card-webp.test.ts` fails when a sibling is missing.

## 🚫 Sovereign Vault Development Firewall & Isolation Policy
- **MASTER DIRECTIVE**: Under NO circumstances during development may any code, schema, data, dependency, runtime service, or asset from R.O.L.L. be overlapped, imported, bridged, or merged into the Sovereign Vault (a separate private repository), nor may anything from the Sovereign Vault be injected into R.O.L.L.
- **ZERO CROSS-REPO IMPORTS**: Never write `import` statements or cross-project relative paths pointing into `sovereign_vault_ui`.
- **INDEPENDENT REPOSITORIES**: Commits to R.O.L.L. remain 100% strictly within this repository. Never stage omnibus diffs touching Sovereign Vault.
- **ISOLATED RUNTIMES**: Sovereign Vault is Python/Flask/Kiwix; R.O.L.L. is Node/Next.js/Prisma. Keep dependencies, databases (`vault_search.db` vs Prisma/Neon Postgres and the Cloudflare KV rate limiter), and daemons strictly partitioned.
- **CANONICAL MATH EXCEPTION**: The Creation Engine combat math formulas (`0.15`, `0.365`, etc.) live in TypeScript (`src/lib/calculator/creation-engine-math.ts`) as a self-contained, standalone implementation. They share mathematical constants by specification, not by runtime code-sharing.
- **LOCAL AI NEVER TOUCHES THIS SITE**: local Ollama models, ComfyUI, Vera and other Sovereign Vault daemons must never call, scrape, deploy or post to fallout76.wiki, Cloudflare or Discord. Ideas from the Vault may be re-implemented here only in this repo's own stack.

## 🚀 Live Deployment Pipeline Policy (nathanw0821)
- **CANONICAL PIPELINE**: All live production deployments to Cloudflare Workers are triggered via `git push origin main`, executing the GitHub Actions CI/CD deployment pipeline (`.github/workflows/deploy.yml`) which runs `opennextjs-cloudflare build` and deploys via `cloudflare/wrangler-action@v3`.
- **COMMIT & PUSH IDENTITY**: Every commit and push must be authored and committed under Nathan's identity: `nathanw0821` (`nathanw <nathanw0821@gmail.com>`). Never include co-author, agent, or tool trailers (`Co-Authored-By`, `Claude-Session`, `Made-with`), strictly enforced by `.git/hooks/commit-msg` and `.git/hooks/pre-push`.
- **DEPLOYMENT PACING**: NEVER push or trigger a deployment while a previous Cloudflare / GitHub Actions workflow is running or pending. Verify with `gh run list -R nathanw0821/r.o.l.l --limit 1` before pushing.
- **PRE-FLIGHT GATE**: `npm run release:check` (lint → prisma validate → test → build → typecheck) must pass 100% locally before staging and pushing.
- **NO DIRECT WRANGLER DEPLOYS**: Production deployments route exclusively through the verified GitHub Actions pipeline on `main`. Do not run `wrangler deploy` out-of-band.

## 🔎 Search & Client Performance Decisions (2026-09-19)
- No in-browser ML models, no DuckDB-/SQLite-Wasm, no ONNX inside the Worker (3 MiB bundle limit, phone bandwidth). The data is small (149 mods, 268 perk cards, 3,158 guides): plain filtering is sub-millisecond.
- Precision problems ("without Power Armor", "under 20% HP") are solved with structured filters on the truth pack first. A server-side Cloudflare Workers AI reranker for guide search only if real query logs show the need.
- Offline guide search (shipped 2026-09-22): `public/data/wiki-index.json` (titles, snippets, flags; ~190 KB gzipped, written by `scripts/truth/build-wiki-counts.ts`) is fetched in the background on `/wiki` and cached by the service worker with every opened guide body; when `/api/wiki/search` cannot be reached the page runs the same search engine over that index (`src/lib/wiki/offline-search.ts`). No MiniSearch/FlexSearch: the existing engine is small and gives identical ranking.
- Consult the `modern-web-guidance` skill before HTML/CSS/client-side JS work.

