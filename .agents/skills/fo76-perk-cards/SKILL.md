---
name: fo76-perk-cards
description: >-
  Authoritative Standard Operating Procedure & Pipeline Engine for 1:1 Fallout 76 Flat Scaleform Vector Perk Cards in R.O.L.L.
  Enforces 1:1 unbaked Bethesda plaques, datamined vector SVG character art, live typography, multi-rank progression,
  Vault Boy / Vault Girl dynamic gender variants, and zero-breakage deployment rules.
---

# 🃏 Fallout 76 Master Pip-Boy Perk Card Skill & SOP

This skill governs the visual rendering, asset resolution, mechanical calibration, and vector architecture of all 268+ Fallout 76 perk cards in **R.O.L.L.** (`fallout76.wiki`).

---

## 🎨 1. Master Policy: 1:1 Flat Scaleform Vector Architecture

- **MASTER DIRECTIVE**: All perk cards rendered across the platform (**Perk Builder**, **Inspect Modal**, **Punch Card Rack**, **Truth Wiki**, and **Discord Bot**) MUST use the official 1:1 Flat Scaleform Vector Architecture:
  - Standard & Ghoul Cards: `<ScaleformSpecialVisual ... />`
  - Legendary Cards: `<ScaleformLegendaryVisual ... />`
- **Primary Resolver**: `getCleanPerkForeground(cardIdOrName, special, isFemale)` in `src/lib/perks/clean-perk-assets.ts` and `getPerkVectorArtUrl(cardIdOrName, special, isFemale)` in `src/lib/perks/perk-artwork.ts`.
- **Character Artwork**: 319 pure datamined vector SVGs in `public/images/perks_official/*.svg`.
- **Plaques & Textures**: Unbaked Bethesda plaques from `public/images/clean_perk_assets/plaques/` and textures from `public/images/clean_perk_assets/textures/`.
- **Live Browser Typography**: Rank, cost badges, and descriptions are rendered dynamically via browser typography over clean unbaked plaques, eliminating all pixel-baked text ghosting or double vision.
- **Display Frame**: Strict `aspect-[310/490]` container framing matching native Bethesda Pip-Boy screen geometry.
- **Rank Label Format**: `RK ${rank}/${maxRank}` on compact controls to prevent ellipsis truncation (`RA...`).

---

## ⚧ 2. Dynamic Gender Variants (Vault Boy <-> Vault Girl)

Fallout 76 includes gender-specific perk cards that dynamically swap between Vault Boy and Vault Girl profiles:

| Base Game ID | Vault Boy Variant (Male) | Vault Girl Variant (Female) | SPECIAL | Ranks |
| :--- | :--- | :--- | :---: | :---: |
| `action-boy` | **Action Boy** (`actionboy.svg`) | **Action Girl** (`actiongirl.svg`) | A | 3 |
| `aquaboy` | **Aquaboy** (`aquaticconcealment.svg`) | **Aquagirl** (`aquaticconcealmentgirl.svg`) | E | 1 |
| `party-boy` | **Party Boy** (`partyboy.svg`) | **Party Girl** (`partygirl.svg`) | C | 2 |
| `lady-killer` | **Lady Killer** (`ladykiller.svg`) | **Black Widow** (`blackwidow.svg`) | C | 3 |

### Implementation Rules:
1. **Asset Resolver**: `getPerkVectorArtUrl(cardId, special, isFemale)` dynamically resolves female vector SVGs when `isFemale === true` and male vector SVGs when `isFemale === false`.
2. **Title Resolver**: `getGenderedPerkName(name, isFemale)` dynamically converts names bidirectionally (e.g. "Action Boy" -> "Action Girl" and vice-versa).
3. **Inspector Modal**: Modal header and card `alt` tags display `displayName`, not raw `name`.

---

## 🚀 3. Verification & Deployment Rules

Before pushing changes to GitHub:
1. **Automated Unit Tests**: `npm run test` (must pass 100%, including `src/lib/perks/catalog.test.ts`).
2. **TypeScript Validation**: `npm run typecheck` (0 errors).
3. **ESLint Linting**: `npm run lint` (0 errors, 0 warnings).
4. **Production Build**: `npm run build` (0 compilation errors).
5. **Deployment Pacing Rule**: NEVER push a commit to `origin main` or trigger a new deployment while a previous Cloudflare or GitHub Actions workflow is still running or pending. Always verify completion before pushing subsequent updates.
