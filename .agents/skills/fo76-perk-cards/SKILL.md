---
name: fo76-perk-cards
description: >-
  Standard Operating Procedure & Asset Pipeline for Fallout 76 Perk Cards in R.O.L.L.
  Enforces 1:1 official static WebP in-game perk card texture rendering, zero outer box borders,
  zero animated GIFs, middleware asset routing, and strict zero-breakage deployment rules.
---

# 🃏 Fallout 76 Perk Card Master Skill & Pipeline Guide

This skill governs the visual rendering, asset resolution, and data integrity of all 268+ Fallout 76 perk cards in the **R.O.L.L.** platform.

---

## 🎨 1. 1:1 Static WebP In-Game Perk Card Texture Policy
- **Primary Asset Directory**: `public/images/perks_official_wiki/`
- **Mapping Registry**: `src/lib/perks/wiki-268-art-map.json`
- **Resolver Function**: `getPerkCardArtworkUrl(cardId, special, isFemale)` in `src/lib/perks/perk-artwork.ts`.
- **STRICT RULES**:
  1. **NO ANIMATED GIFS**: NEVER use `.gif` files or animated variants (e.g. `fo76-perk-contractor.gif` is FORBIDDEN). ALWAYS use static 1:1 `.webp` textures.
  2. **NO OUTER BOX BORDERS**: Perk cards MUST render as purely `<img src={artworkUrl} />` without any outer container box borders, dark backgrounds, or outer rings in `in-game-perk-card.tsx`.
  3. **LATEST PATCH DATA & 1:1 FIDELITY**: All 268 perk cards (including all 26 Legendary cards and Guerrilla/Ground Pounder/Friendly Fire/Contractor) must use the most current static 1:1 in-game card art from latest game patches.

---

## 📌 2. Verified Target File Links (Saved Registry)
- **Contractor**: [`public/images/perks_official_wiki/fo76-perk-contractor.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-contractor.webp)
- **Guerrilla**: [`public/images/perks_official_wiki/fo76-perk-guerrilla.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-guerrilla.webp)
- **Expert Guerrilla**: [`public/images/perks_official_wiki/fo76-perk-expert-guerrilla.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-expert-guerrilla.webp)
- **Master Guerrilla**: [`public/images/perks_official_wiki/fo76-perk-master-guerrilla.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-master-guerrilla.webp)
- **Ground Pounder**: [`public/images/perks_official_wiki/fo76-perk-ground-pounder.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-ground-pounder.webp)
- **Friendly Fire**: [`public/images/perks_official_wiki/fo76-perk-friendly-fire.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-friendly-fire.webp)
- **Legendary Strength**: [`public/images/perks_official_wiki/fo76-perk-legendary-strength.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-legendary-strength.webp)
- **Legendary Perception**: [`public/images/perks_official_wiki/fo76-perk-legendary-perception.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-legendary-perception.webp)
- **Legendary Endurance**: [`public/images/perks_official_wiki/fo76-perk-legendary-endurance.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-legendary-endurance.webp)
- **Legendary Charisma**: [`public/images/perks_official_wiki/fo76-perk-legendary-charisma.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-legendary-charisma.webp)
- **Legendary Intelligence**: [`public/images/perks_official_wiki/fo76-perk-legendary-intelligence.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-legendary-intelligence.webp)
- **Legendary Agility**: [`public/images/perks_official_wiki/fo76-perk-legendary-agility.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-legendary-agility.webp)
- **Legendary Luck**: [`public/images/perks_official_wiki/fo76-perk-legendary-luck.webp`](file:///home/nathanw/Creative%20Direction/R.O.L.L/public/images/perks_official_wiki/fo76-perk-legendary-luck.webp)

---

## 🌐 3. Middleware & Asset Routing Rule
- **File**: `src/middleware.ts`
- **Matcher Rule**: Exclude `/images/`, `_next/static`, and `favicon.ico` from middleware redirects.
- **Localhost Rule**: Bypass HTTPS redirects on `http://localhost:3000` and `http://127.0.0.1:3000` so static assets return `HTTP 200 OK` directly.

---

## 🚀 4. Deployment Pipeline Pacing Policy
- **Pacing Rule**: NEVER push a commit to `origin preview` while a prior Cloudflare / GitHub Actions build is still running or pending.
- **Permission Rule**: Do NOT run `git push` without explicit user request.
