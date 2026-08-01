# ☢️ R.O.L.L. — Record Of Legendary Loadouts & Build Engine
> **Master Application Architecture, Feature Specifications, Security Audits, and Product Roadmap**

---

## 📌 1. Executive Summary & Application Overview

**R.O.L.L.** (*Record Of Legendary Loadouts*) is a high-performance, retro-futuristic, terminal-styled companion web application and Discord integration for **Fallout 76**. Built with modern web standards and high-signal UX aesthetics, R.O.L.L. enables players to track legendary mod crafting unlocks, run local-first OCR inventory scans, simulate character gear and perk loadouts in real-time, and share verified crafting resumes with the Wasteland community.

### Key Architectural Pillars
* **Vault-Tec Terminal Aesthetics**: Vibrant curated dark mode, glassmorphism, dynamic CRT scanlines, custom accent palettes (Ember, Cobalt, Rad-Green, Nuka-Violet), and accessible colorblind filters.
* **Zero-Friction Local-First Operations**: High-frequency user interactions (seeking toggles, owned counters, deck slot selection, theme updates) run instantly on the client with background DB synchronization and cross-tab `storage` event syncing.
* **Universal Access & Data Retention**: Full feature availability for both **Guest users** (local-first browser persistence) and **Authenticated Vault Dwellers** (cloud-synced multi-character records).

---

## 🏗️ 2. Core Architecture & Tech Stack Breakdown

### Frontend & Application Layer
* **Framework**: Next.js 16 (App Router + React Server Components + Server Actions)
* **Styling**: Vanilla CSS Design System (`index.css`) + HSL CSS Custom Properties + Tailwind Utilities + Radix UI Primitives
* **Icons**: `lucide-react`
* **OCR Scanner**: `tesseract.js` (Client-side WebWorker processing)
* **Image Export**: HTML Canvas + `html-to-image` (1080p and 4K high-density PNG renderers)

### Backend & Database Layer
* **Database**: PostgreSQL (Neon Serverless Cluster)
* **ORM**: Prisma ORM 7 (Typed client + automated migration pipelines)
* **Auth Engine**: NextAuth.js v5 (JWT HTTP-Only session cookies + Google OIDC + bcrypt password hashing)
* **Edge Runtime**: Cloudflare Workers via OpenNext (`opennextjs-cloudflare`)
* **Discord Integration**: Web Crypto Ed25519 signature verification + Discord Interactions API

---

## 🗃️ 3. Core Features Breakdown & Specifications

### 1. 🗃️ Legendary Crafting Matrix & Summary Tracker (`/summary` and `/`)
* **Catalog**: 148 total legendary crafting effect tiers (1★ to 4★).
* **Compact Single-Screen Grid**: 4-column holotape view matching the exported PNG layout.
* **Interactive Controls**:
  * `🎯` **Seeking Target Toggle**: Mark high-priority mod recipes with amber glow.
  * `📦` **Owned Counter**: Increment/decrement owned mod boxes directly in inventory.
  * **S.C.A.N. OCR Parser**: Drag-and-drop Pip-Boy inventory screenshots to auto-detect unlocked recipes locally.
  * **Export Engines**: Single-click 1080p and 4K PNG grid cards, Excel (`.xlsx`), CSV, and JSON dataset exports.

### 2. 🃏 P.E.R.K. Loadout Builder (`/perks`)
* **Catalog**: 268 total perk cards (242 S.P.E.C.I.A.L. cards + 26 Legendary Perk cards).
* **Validation Engine**:
  * Real-time S.P.E.C.I.A.L. capacity limit enforcement (max 15 per attribute).
  * Capacity overflow warning banners and red card highlight borders.
* **Punch Card Loadouts**:
  * 6 saveable loadout slots per character.
  * Auto-provisioning of default character ("Vault Dweller 1") for signed-in accounts.
  * Clear sign-in prompts for guest users.

### 3. 🛠️ B.U.I.L.D. Sandbox Engine (`/build`)
* **Simulation Capabilities**: Full gear set simulation covering Armor, Power Armor, Weapons, Underarmor, Mutations, and Legendary Perk Cards.
* **Real-time Stat Engine**: Live calculation of Damage Resistance (DR), Energy Resistance (ER), Radiation Resistance (RR), and SPECIAL stat deltas.
* **Ghoul Legendary Rules**: Enforces Ghoul-specific mutation downsides and Unyielding caps.
* **Presets Holotape Deck**: 10 saveable slot presets (`roll-builder-saves`) with 1-click loadout switching and PNG card exporting.

### 4. 📄 Verified Public Crafting Resumes (`/u/[username]`)
* **Public Profile Page**: Verified share links showcasing learned recipes without revealing private IGNs or character names.
* **Rank Badges**: Dynamic account badges based on completion percentage (*Wasteland Master*, *Expert Armorer*, *Veteran Craftsman*, *Wasteland Novice*).

### 5. 🤖 Discord Bot Integration (`/api/discord/interactions`)
* **Slash Commands**:
  * `/progress [username]` — Returns verified crafting completion progress and profile link.
  * `/perk [name]` — Looks up perk card ranks, costs, and artwork.
  * `/mod [name]` — Queries legendary effect details, crafting scrip cost, and component recipes.
  * `/build` — Generates a sandbox build simulation link.
  * `/random [category]` — Roll random legendary effects for challenge builds.

### 6. 🎨 Real-Time Theme & Multi-Window Sync Engine
* **Themes**: Dark / Light / System modes.
* **Accents**: Ember, Cobalt, Rad-Green, Nuka-Violet.
* **Accessibility**: Protanopia, Deuteranopia, Tritanopia, and High-Contrast filters.
* **Inter-Tab Sync**: Native `window.addEventListener("storage")` integration syncing state across multiple active browser windows instantly without overwriting local storage.

---

## 🔒 4. Data Integrity & Security Specification

### Retained User Data Safeguards
* **Dual-Layer Progress Architecture**:
  * `UserImportBaseline`: Preserves OCR and holotape imported recipe lists.
  * `UserProgress`: Preserves manual UI checks and overrides.
  * Combined queries ensure 0 loss of recipe unlocks across updates.
* **Guest User Fallbacks**: LocalStorage keys (`roll-builder-payload`, `roll-builder-saves`, `roll-accent`, etc.) are protected with `isMounted` guards to prevent accidental overwrites during hydration.

### Security Hardening Measures
* **Dependency Patching**: Regular `npm audit fix` updates addressing vulnerabilities in `undici`, `ws`, `vitest`, `wrangler`, and `valibot`.
* **HTTP Security Headers**: Enforces `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and `Referrer-Policy`.
* **API Route Protection**: Session validation via NextAuth `requireUser()` and parameters sanitization.

---

## 💡 5. Proposed Quality of Life (QoL) Features (Verified Unique)

*The following 5 features have been checked against the existing codebase to ensure zero duplication:*

1. **🧪 Module & Scrip Crafting Cost Calculator**:
   * *Concept*: An interactive shopping list calculator embedded on `/summary` or `/build` that sums the exact total Legendary Modules, Legendary Scrip, and rare crafting materials (e.g. Vault Steel, Fluorite, Cobalt Flux) required to craft all tagged "Seeking" (`🎯`) mods or complete a custom loadout.

2. **⚔️ Trade Match & Wishlist Finder (Peer-to-Peer Crafting Exchange)**:
   * *Concept*: A privacy-preserving market exchanger on `/summary` that lets players mark which legendary mod boxes/crafting services they can craft for others vs what they are seeking (`🎯`), generating a clean, copyable Market76/Discord trade listing string (e.g. `[H] 3★ Arms Keeper's, 2★ Explosive [W] 2★ Powered`).

3. **⚖️ Loadout Comparison & Differential Matrix**:
   * *Concept*: A side-by-side comparison view in the B.U.I.L.D. sandbox allowing players to compare 2 saved Holotape Deck slots simultaneously, highlighting exact net deltas in DR/ER/RR, SPECIAL stats, AP refresh rates, and total scrip cost.

4. **📋 One-Click Pip-Boy Text/JSON Import Sync**:
   * *Concept*: In addition to S.C.A.N. OCR image parsing, a lightweight text/JSON import parser that accepts inventory dumps from popular PC companion tools (or copied clipboard text) to auto-update owned mod counts (`📦`) and unlocked statuses in 1 click.

5. **🔔 Daily Vendor & Public Event Reminder Widgets**:
   * *Concept*: A customizable notification widget on the user dashboard tracking daily Scrip limit resets (20:00 UTC), Minerva sale schedules, and Gold Bullion limits, with 1-click reminders for daily Vault points and event tracking.

---

## 🗓️ 6. Revision History & Maintenance Log

| Date | Version | Summary of Changes | Author |
| :--- | :--- | :--- | :--- |
| 2026-07-29 | `v0.1.0` | Fixed `Detonation Contagion` category duplication & auto-character loadout provisioning. | R.O.L.L. Engine |
| 2026-07-29 | `v0.1.1` | Added 4-column compact view density with Seeking target and Owned counter. | R.O.L.L. Engine |
| 2026-07-29 | `v0.1.2` | Added cross-window storage event syncing and browser back-navigation caching. | R.O.L.L. Engine |
| 2026-08-01 | `v0.1.3` | Audited security vulnerabilities, updated app architecture doc & QoL roadmap. | R.O.L.L. Engine |
