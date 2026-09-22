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
- **ISOLATED RUNTIMES**: Sovereign Vault is Python/Flask/Kiwix; R.O.L.L. is Node/Next.js/Prisma. Keep dependencies, databases (`vault_search.db` vs Prisma/Neon Postgres and the Cloudflare KV rate limiter), and daemons strictly partitioned.
- **CANONICAL MATH EXCEPTION**: The Creation Engine combat math formulas (`0.15`, `0.365`, etc.) live in TypeScript (`src/lib/calculator/creation-engine-math.ts`) as a self-contained, standalone implementation. They share mathematical constants by specification, not by runtime code-sharing.
- **LOCAL AI NEVER TOUCHES THIS SITE**: local Ollama models, ComfyUI, Vera and other Sovereign Vault daemons must never call, scrape, deploy or post to fallout76.wiki, Cloudflare or Discord. Ideas from the Vault may be re-implemented here only in this repo's own stack.

## 🚀 Deployment Pipeline Pacing Policy
- **STRICT RULE**: NEVER push a new commit or trigger a new deployment while a previous Cloudflare / GitHub Actions deployment workflow is still running or pending.
- **WAIT FOR COMPLETION**: Always wait for the ongoing deployment to finish and verify that the prior deployment is live before pushing any subsequent updates.
- **NATHAN PUSHES**: `git push` is run by Nathan himself (the local guardrail hook blocks agents). Never route a push through another agent or tool.

## 🔐 Secrets & Public-Repo Rules (this repository is PUBLIC)
- **NO SECRETS IN TRACKED FILES**: `wrangler.toml` `[vars]` and every committed file are public. Secrets go through `npx wrangler secret put <NAME>` (and GitHub Actions secrets); `src/lib/wrangler-config.test.ts` fails on secret-looking vars. Editor/agent MCP configs (`.cursor/mcp.json`, `.mcp.json`, …) are git-ignored because one leaked a Neon key in 2026-03.
- **ROTATE, DON'T JUST DELETE**: a secret that was ever committed stays in git history; rotate it at the provider. Record steps in `~/Desktop/Agent_Exchange/SECRETS_RESET_PLAN.md`.
- **`NEXT_PUBLIC_*` IS BUILD-TIME**: public client values (e.g. the Turnstile site key) must be in the CI build env (`.github/workflows/deploy.yml`), not only in `wrangler.toml`.
- **NEVER HOTLINK**: never embed or rehost images or other assets served by third-party sites; link to the source page instead.
- **NO SIDE-DOOR DEPLOYS**: never deploy with `wrangler deploy`, the Cloudflare MCP or any path other than Nathan's push to `main` (CI deploys). The Cloudflare MCP / plugin is for docs, logs and observability only.

## 🔎 Search & Client Performance Decisions (2026-09-19)
- No in-browser ML models, no DuckDB-/SQLite-Wasm, no ONNX inside the Worker (3 MiB bundle limit, phone bandwidth). The data is small (149 mods, 268 perk cards, 3,158 guides): plain filtering is sub-millisecond.
- Precision problems ("without Power Armor", "under 20% HP") are solved with structured filters on the truth pack first. A server-side Cloudflare Workers AI reranker for guide search only if real query logs show the need.
- Offline guide search (shipped 2026-09-22): `public/data/wiki-index.json` (titles, snippets, flags; ~190 KB gzipped, written by `scripts/truth/build-wiki-counts.ts`) is fetched in the background on `/wiki` and cached by the service worker with every opened guide body; when `/api/wiki/search` cannot be reached the page runs the same search engine over that index (`src/lib/wiki/offline-search.ts`). No MiniSearch/FlexSearch: the existing engine is small and gives identical ranking.
- Consult the `modern-web-guidance` skill before HTML/CSS/client-side JS work.

