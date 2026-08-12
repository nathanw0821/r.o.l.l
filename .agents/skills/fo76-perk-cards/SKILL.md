---
name: fo76-perk-cards
description: >-
  Standard Operating Procedure & Asset Pipeline for Fallout 76 Perk Cards in R.O.L.L.
  Enforces 1:1 official datamined Vault Boy & Vault Girl SVG artwork rendering, Pip-Boy card frame
  layout standards, middleware asset routing, and strict zero-breakage deployment rules.
---

# 🃏 Fallout 76 Perk Card Master Skill & Pipeline Guide

This skill governs the visual rendering, asset resolution, and data integrity of all 268+ Fallout 76 perk cards in the **R.O.L.L.** platform.

---

## 🎨 1. Official Datamined Asset Resolution Rule
- **Directory**: `public/images/perks_official/`
- **Total Datamined Vectors**: 319 official Vault Boy & Vault Girl SVG files (`actionboy.svg`, `starchedgenes.svg`, `classfreak.svg`, `adrenaline.svg`, etc.) extracted directly from `SeventySix.esm` game files.
- **Card Art Resolver**: `getPerkCardArtworkUrl(cardId, special, isFemale)` in `src/lib/perks/perk-artwork.ts`.
- **STRICT RULE**: NEVER attempt to web-scrape third-party wiki images, replace game assets, or delete files from `public/images/perks_official/`.

---

## 🖼️ 2. Pip-Boy Perk Card Frame Layout Standard
- **Components**: `src/components/perks/in-game-perk-card.tsx` & `src/components/perks/pipboy-card-art.tsx`.
- **Uniform Frame Structure**:
  1. **Header Stamp Bar**: Top Cost Badge (`1`), Card Name (`ACTION BOY`), S.P.E.C.I.A.L. Stamp (`AGILITY`).
  2. **Central Graphic Container (`<PipBoyCardArt />`)**: Renders the official datamined Vault Boy SVG artwork (`/images/perks_official/*.svg`) over the Pip-Boy terminal radar grid background.
  3. **Description Box**: Font-mono description text ("*Action Points regenerate 45% faster.*").
  4. **Rank Indicator & Buttons**: `RANK 1 / 3` indicator with `EQUIP` / `UNEQUIP` controls.
- **STRICT RULE**: NEVER replace card graphics with generic Lucide outline icons, circular badge overlays, or orange star fallbacks.

---

## 🌐 3. Middleware & Asset Routing Rule
- **File**: `src/middleware.ts`
- **Matcher Rule**: Exclude `/images/`, `_next/static`, and `favicon.ico` from middleware redirects.
- **Localhost Rule**: Bypass HTTPS redirects on `http://localhost:3000` and `http://127.0.0.1:3000` so static assets return `HTTP 200 OK` directly.

---

## 🚀 4. Deployment Pipeline Pacing Policy
- **Pacing Rule**: NEVER push a commit to `origin preview` while a prior Cloudflare / GitHub Actions build is still running or pending.
- **Permission Rule**: Do NOT run `git push` without explicit user request.
