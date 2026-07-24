# 📻 R.O.L.L. Master Executive & Technical Breakdown
**Record Of Legendary Loadouts** · [fallout76.wiki](https://fallout76.wiki)

---

## 🎯 1. Executive Summary & Vision

**R.O.L.L.** (*Record Of Legendary Loadouts*) is the premier, high-performance web platform and Discord companion for **Fallout 76** players. It provides an exhaustive, 1:1 database of all 167+ legendary mod effects, modular crafting scrip calculators, progress tracking matrices, and the flagship **B.U.I.L.D. Diagnostic Engine** for designing and sharing character loadouts.

- **Primary Domain**: `https://fallout76.wiki`
- **Brand Identity**: Retro-futuristic Pip-Boy dark aesthetic with Vault Boy 5-Star General custom branding.
- **Bot Endpoint**: `https://fallout76.wiki/api/discord/interactions`

---

## 🏗️ 2. Web Application Features & Architecture

### Stack Architecture
- **Framework**: Next.js (App Router), React, TypeScript.
- **Styling**: Vanilla CSS tokens, HSL curated palettes, glassmorphic dark mode, solid 100% opaque tooltips.
- **Database & ORM**: Prisma ORM with serverless Neon PostgreSQL.
- **Edge Deployment**: Cloudflare Workers / OpenNext Edge with sub-15ms response times.

### Core Page Hierarchy
1. **Central Matrix (`/` & `/summary`)**:
   - Interactive 1★–4★ Legendary Mod Progress Matrix.
   - Tracks unlocked, seeking, and locked mods with live percentage progress counters.
2. **Star Rank Focus (`/1-star`, `/2-star`, `/3-star`, `/4-star`)**:
   - Dedicated star-tier filterable lists for targeted crafting focus.
3. **All Effects Reference (`/all-effects`)**:
   - Complete 167+ legendary mod catalog with search filters, material component recipes, and acquisition paths.
4. **B.U.I.L.D. Loadout Sandbox (`/build`)**:
   - Flagship character sandbox allowing customization of:
     - 🛡️ **Armor & Power Armor Pieces**: Chest, Arms, Legs, Helmets, and Underarmors.
     - ⚔️ **Weapons**: Ranged, Melee, and Energy weapon configurations.
     - ⭐️ **Legendary Mod Slots**: 1★ to 4★ slots on every piece.
     - 🃏 **Legendary Perks**: 26 Legendary Perk Cards with live S.P.E.C.I.A.L. stat math.
     - 🧬 **Mutations**: 19 Mutation Serums with positive/negative resistance math.
     - 🧪 **Scrip Calculator**: Tinkerer's Bench modular scrip cost scaling.
     - 📸 **Card Exporter**: 1-click PNG image exporter (`html-to-image`).
5. **Public Transmissions (`/l/[slug]`)**:
   - Instant edge-cached public sharing links for saved character builds.
6. **Account & Settings (`/settings`)**:
   - Theme controls, color-blind accessibility modes, progress backups, and OAuth account linking (Google, Discord).
7. **Legal Compliance (`/terms` & `/privacy`)**:
   - Full compliance with Google API Services User Data Policy (Limited Use) and Discord Developer Terms of Service.

---

## 🛡️ 3. Security & Performance Infrastructure

- **Cloudflare Turnstile**: Anti-bot challenge verification protecting auth and loadout publication APIs.
- **Cloudflare Workers KV Rate Limiting**: Edge-level rate limiting preventing API abuse.
- **`sessionStorage` Catalog Caching**: 0ms network latency when revisiting `/build`.
- **`content-visibility: auto`**: DOM rendering optimization for 60fps smooth scrolling.
- **Web Crypto Security**: PBKDF2 Web Crypto password hashing with bcrypt upgrade support.

---

## 🤖 4. Discord Bot & Slash Command Suite (`R.O.L.L. Bot`)

### Architecture
- **Stateless HTTP Interaction Webhooks**: Runs on Cloudflare Workers edge nodes across 300+ global cities.
- **Web Crypto Signature Verification**: Verifies incoming Discord interactions using Ed25519 Web Crypto signatures against `DISCORD_PUBLIC_KEY`.
- **High Volume Capacity**: Handles millions of requests per day with zero RAM overhead or server crashes.

### Command Breakdown

| Command | Arguments | Description & Output |
| :--- | :--- | :--- |
| **`/effect`** | `query` | Searches 167+ effects via punctuation-agnostic fuzzy matching and trading acronym expansions (`vatsopt`, `wwr`, `fdc`, `25lvc`, `uny`, `oe`, `50c`, `25ffr`). Renders rich embeds with **Star Rank**, **Category**, **Stat Math**, **Crafting Recipes**, and **fallout76.wiki links**. |
| **`/compare`** | `first`, `second` | Compares any two legendary effects side-by-side in Discord chat (e.g. `/compare Bloodied Anti-Armor`). Details Star Ranks, Categories, Stat Math, and Crafting Costs. |
| **`/progress`** | `username` | Queries a user's public tracker progress by R.O.L.L. username. Displays total unlocked mods, completion percentage, and Account Rank Badges (e.g. **🏆 Wasteland Master**). |
| **`/random`** | `[category]` | Generates a random 3★ or 4★ Fallout 76 legendary god-roll item challenge card for weapons or armor. |
| **`/scrip`** | `mods` | Calculates modular crafting scrip costs and module scaling rules at the Tinkerer's Bench. |
| **`/build`** | `slug` | Fetches published build loadout payloads and embeds S.P.E.C.I.A.L. base stats, equipment kinds, mutation counts, and perk cards. |

---

## 🧪 5. Testing & Verification Status

- **Unit Test Suite**: All **24 unit tests across 5 test files** are 100% passing (`npm run test`).
- **Type Safety**: TypeScript & ESLint audit passed with **0 errors and 0 warnings** (`npm run typecheck && npm run lint`).
